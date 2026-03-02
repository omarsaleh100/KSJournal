import feedparser
import google.generativeai as genai
import os
import sys
import json
from dotenv import load_dotenv
from firebase_admin import firestore

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.db import db
from app.image_utils import get_image_with_fallback

load_dotenv()

GEN_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEN_KEY)
model = genai.GenerativeModel('gemini-flash-latest')

RSS_URLS = [
    "https://www.yorku.ca/yfile/feed/",
    "https://news.yorku.ca/feed/",
]

def fetch_and_curate():
    print("   📡 Scanning York U Feeds...")
    USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)..."
    
    # 1. Fetch ALL raw candidates first
    candidates = []
    for url in RSS_URLS:
        try:
            feed = feedparser.parse(url, agent=USER_AGENT)
            for entry in feed.entries[:6]: # Check top 6
                # Get Author
                author = getattr(entry, 'author', 'Staff')
                if "(" in author: author = author.split("(")[1].replace(")", "")
                
                candidates.append({
                    "title": entry.title,
                    "link": entry.link,
                    "summary": entry.summary[:200],
                    "image": None,  # Will be resolved after AI selection
                    "author": author,
                    "_entry": entry,  # Keep entry for image extraction later
                })
        except Exception as e:
            print(f"      ❌ Feed error: {e}")
            
    # 2. Ask AI to pick the Top 4
    print("   🧠 AI Editor is selecting the best 4 stories...")
    # Strip non-serializable _entry before passing to AI
    candidates_for_ai = [{k: v for k, v in c.items() if k != "_entry"} for c in candidates]
    candidates_str = json.dumps(candidates_for_ai)
    
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

    # 3. Resolve images for the 4 winners using shared image utils
    # Build a lookup from title to original entry for image extraction
    entry_lookup = {c["title"]: c.get("_entry") for c in candidates}

    final_items = []
    for story in selected_stories[:4]:
        entry = entry_lookup.get(story.get("title"))
        story["image"] = get_image_with_fallback(entry, story["title"])
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