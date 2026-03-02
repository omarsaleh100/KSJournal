import urllib.parse
import requests
from bs4 import BeautifulSoup
from app.genai_engine import generate_text

YORK_FALLBACK = "https://www.yorku.ca/brand/wp-content/uploads/sites/18/2020/09/YorkU-VariHall-Summer.jpg"


def _extract_best_img_from_html(html):
    """Extract the best image from HTML content. Prefers <figure> featured images."""
    if not html:
        return None
    soup = BeautifulSoup(html, "html.parser")
    # 1. Prefer image inside a <figure> (typically the featured/primary image)
    figure = soup.find("figure")
    if figure:
        img = figure.find("img")
        if img:
            # Prefer srcset's largest resolution, fall back to src
            src = img.get("src", "")
            srcset = img.get("srcset", "")
            if srcset:
                # srcset format: "url 300w, url 768w, url 1024w" — pick the largest
                parts = [p.strip().split() for p in srcset.split(",") if p.strip()]
                parts = [(p[0], int(p[1].replace("w", ""))) for p in parts if len(p) == 2 and p[1].endswith("w")]
                if parts:
                    parts.sort(key=lambda x: x[1], reverse=True)
                    src = parts[0][0]
            if src and "pixel" not in src:
                return src
    # 2. Fallback: first <img> tag that isn't a tracking pixel
    img = soup.find("img")
    if img and img.get("src") and "pixel" not in img["src"]:
        return img["src"]
    return None


def get_image_from_entry(entry):
    """Try to extract a real image URL from an RSS feed entry."""
    try:
        # 1. Standard RSS media extensions
        if "media_content" in entry:
            return entry.media_content[0]["url"]
        if "media_thumbnail" in entry:
            return entry.media_thumbnail[0]["url"]
        if "links" in entry:
            for link in entry.links:
                if link.get("rel") == "enclosure" and "image" in link.get("type", ""):
                    return link.href
        # 2. Parse full content HTML first (has featured images in <figure>)
        if "content" in entry:
            url = _extract_best_img_from_html(entry.content[0].value)
            if url:
                return url
        # 3. Fallback to summary HTML
        if "summary" in entry:
            url = _extract_best_img_from_html(entry.summary)
            if url:
                return url
    except Exception:
        pass
    return None


def generate_ai_image(title):
    """Generate an image URL using Pollinations.ai with a Gemini-crafted prompt."""
    try:
        prompt = (
            f"Write a 5-word visual description for an image representing this news headline: "
            f"'{title}'. Use keywords like 'photorealistic', '4k', 'cinematic'. "
            f"Output ONLY the 5-10 words."
        )
        image_prompt = generate_text(prompt)
        if not image_prompt:
            image_prompt = title[:50]
        encoded = urllib.parse.quote(image_prompt)
        return f"https://image.pollinations.ai/prompt/{encoded}?nologo=true&width=1024&height=600&seed=42"
    except Exception:
        return None


def validate_image_url(url):
    """Check if a URL actually resolves to an image (HEAD request)."""
    if not url:
        return False
    try:
        resp = requests.head(url, timeout=5, allow_redirects=True)
        content_type = resp.headers.get("content-type", "")
        return resp.status_code == 200 and "image" in content_type
    except Exception:
        return False


def get_image_with_fallback(entry, title, validate=False):
    """Orchestrate: try RSS image -> optionally validate -> AI generate if missing/invalid."""
    url = get_image_from_entry(entry) if entry else None

    if url and validate and not validate_image_url(url):
        print(f"         ⚠️ Invalid image URL, generating AI image for: '{title[:30]}...'")
        url = None

    if not url:
        print(f"         🎨 Generating AI illustration for: '{title[:30]}...'")
        url = generate_ai_image(title)

    if url:
        return url

    return YORK_FALLBACK
