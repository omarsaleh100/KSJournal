import feedparser
import google.generativeai as genai
import os
import sys
import json
import urllib.parse
from dotenv import load_dotenv
from firebase_admin import firestore
from bs4 import BeautifulSoup

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.db import db

load_dotenv()

GEN_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEN_KEY)
model = genai.GenerativeModel('gemini-flash-latest')

RSS_URLS = [
    "https://www.yorku.ca/yfile/feed/",
    "https://news.yorku.ca/feed/",
]

def generate_ai_image_url(title):
    """Generates an image URL using Pollinations.ai"""
    try:
        print(f"         🎨 Generating AI illustration for: '{title[:20]}...'")
        prompt = f"Write a 5-word visual description for an image representing this news headline: '{title}'. Use keywords like 'photorealistic', '4k', 'cinematic', 'university'. Output ONLY the 5-10 words."
        res = model.generate_content(prompt)
        image_prompt = res.text.strip()
        encoded_prompt = urllib.parse.quote(image_prompt)
        return f"https://image.pollinations.ai/prompt/{encoded_prompt}?nologo=true&width=1024&height=600&seed=42"
    except:
        return "https://www.yorku.ca/brand/wp-content/uploads/sites/18/2020/09/YorkU-VariHall-Summer.jpg"

def get_real_image(entry):
    """Tries to find a real image in the RSS feed."""
    try:
        if 'media_content' in entry: return entry.media_content[0]['url']
        if 'media_thumbnail' in entry: return entry.media_thumbnail[0]['url']
        if 'links' in entry:
            for link in entry.links:
                if link.get('rel') == 'enclosure' and 'image' in link.get('type', ''): return link.href
        
        content_html = ""
        if 'content' in entry: content_html = entry.content[0].value
        elif 'summary' in entry: content_html = entry.summary

        if content_html:
            soup = BeautifulSoup(content_html, 'html.parser')
            img = soup.find('img')
            if img and img.get('src') and 'pixel' not in img['src']:
                return img['src']
    except:
        pass
    return None

def fetch_and_curate():
    print("   📡 Scanning York U Feeds...")
    USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)..."
    
    # 1. Fetch ALL raw candidates first
    candidates = []
    for url in RSS_URLS:
        try:
            feed = feedparser.parse(url, agent=USER_AGENT)
            for entry in feed.entries[:6]: # Check top 6
                
                # Get real image if it exists, otherwise leave None
                real_img = get_real_image(entry)
                
                # Get Author
                author = getattr(entry, 'author', 'Staff')
                if "(" in author: author = author.split("(")[1].replace(")", "")
                
                candidates.append({
                    "title": entry.title,
                    "link": entry.link,
                    "summary": entry.summary[:200],
                    "image": real_img, # Might be None
                    "author": author
                })
        except Exception as e:
            print(f"      ❌ Feed error: {e}")
            
    # 2. Ask AI to pick the Top 4
    print("   🧠 AI Editor is selecting the best 4 stories...")
    candidates_str = json.dumps(candidates)
    
    prompt = f"""
    You are the Campus Editor.
    Raw Articles: {candidates_str}
    
    TASK:
    1. Select the best 4 stories for students.
    2. Keep all fields (link, image, author) exactly as is.
    3. If 'image' is null, keep it null (we will fix it later).
    
    OUTPUT JSON Array: [ {{ ... }} ]
    """
    
    selected_stories = []
    try:
        res = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        selected_stories = json.loads(res.text)
    except:
        print("❌ AI Selection Failed")
        return

    # 3. NOW generate images ONLY for the 4 winners (if missing)
    final_items = []
    for story in selected_stories[:4]:
        if not story.get("image"):
            # Only generate if we don't have a real photo
            story["image"] = generate_ai_image_url(story["title"])
        else:
            print(f"         ✅ Using real photo for: {story['title'][:20]}")
            
        final_items.append(story)
        
    # 4. Save
    if final_items:
        db.collection("daily_edition").document("campus_news").set({
            "lastUpdated": firestore.SERVER_TIMESTAMP,
            "items": final_items
        })
        print("💾 Campus News Published.")

if __name__ == "__main__":
    fetch_and_curate()

# python tasks/update_campus_news.py