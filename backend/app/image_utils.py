import hashlib
import requests
from bs4 import BeautifulSoup
from app.genai_engine import generate_json

# Curated, verified Unsplash photos by category (all confirmed 200 OK)
STOCK_IMAGES = {
    "markets": [
        "photo-1611974789855-9c2a0a7236a3",  # stock chart
        "photo-1535320903710-d993d3d77d29",  # trading floor
        "photo-1460925895917-afdab827c52f",  # dashboard analytics
    ],
    "economy": [
        "photo-1526304640581-d334cdbbf45e",  # currency
        "photo-1554224155-6726b3ff858f",  # charts on paper
        "photo-1444653614773-995cb1ef9efa",  # city aerial
    ],
    "policy": [
        "photo-1541339907198-e08756dedf3f",  # parliament
        "photo-1559136555-9303baea8ebd",  # globe
        "photo-1486406146926-c627a92ad1ab",  # skyscrapers
    ],
    "campus": [
        "photo-1562774053-701939374585",  # campus building
        "photo-1434030216411-0b793f4b4173",  # library study
        "photo-1523240795612-9a054b0db644",  # university lecture
    ],
    "default": [
        "photo-1486406146926-c627a92ad1ab",  # skyscrapers
        "photo-1460925895917-afdab827c52f",  # analytics
        "photo-1559136555-9303baea8ebd",  # globe
        "photo-1554224155-6726b3ff858f",  # charts
        "photo-1526304640581-d334cdbbf45e",  # currency
    ],
}

UNSPLASH_BASE = "https://images.unsplash.com"


def _pick_stock_image(title, category=None):
    """Pick a deterministic stock image based on title hash and optional category."""
    key = (category or "default").lower()
    # Map common keywords to categories
    if not category:
        lower = title.lower()
        if any(w in lower for w in ["market", "stock", "trade", "investor", "rally", "dow", "tsx"]):
            key = "markets"
        elif any(w in lower for w in ["economy", "gdp", "inflation", "rate", "bank", "currency"]):
            key = "economy"
        elif any(w in lower for w in ["policy", "government", "tariff", "regulation", "global", "summit"]):
            key = "policy"
        elif any(w in lower for w in ["campus", "university", "student", "york", "professor", "research"]):
            key = "campus"
        else:
            key = "default"

    pool = STOCK_IMAGES.get(key, STOCK_IMAGES["default"])
    idx = int(hashlib.md5(title.encode()).hexdigest(), 16) % len(pool)
    photo_id = pool[idx]
    return f"{UNSPLASH_BASE}/{photo_id}?w=1024&h=600&fit=crop&auto=format&q=80"


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


def validate_image_url(url):
    """Check if a URL actually resolves to an image (HEAD request)."""
    if not url:
        return False
    try:
        resp = requests.head(url, timeout=5, allow_redirects=True)
        content_type = resp.headers.get("content-type", "")
        return resp.status_code == 200 and ("image" in content_type or "octet-stream" in content_type)
    except Exception:
        return False


def get_image_with_fallback(entry, title, category=None, validate=False):
    """Orchestrate: try RSS image -> validate -> stock photo fallback."""
    url = get_image_from_entry(entry) if entry else None

    if url:
        if validate and not validate_image_url(url):
            print(f"         ⚠️ Image URL failed validation for: '{title[:30]}...'")
            url = None
        else:
            print(f"         ✅ Using real image for: '{title[:30]}...'")
            return url

    # Fallback to curated stock photo (always works, no external API dependency)
    print(f"         🖼️ Using stock photo for: '{title[:30]}...'")
    return _pick_stock_image(title, category)
