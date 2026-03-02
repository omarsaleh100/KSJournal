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

# Financial Post (Good for both Lead and Featured stories)
RSS_URL = "https://financialpost.com/feed"

def update_hero_and_featured():
    print("📰 Starting 'Hero & Featured' production...")
    
    USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
    feed = feedparser.parse(RSS_URL, agent=USER_AGENT)
    
    if not feed.entries:
        print("❌ Could not fetch RSS feed.")
        return

    # --- 1. PROCESS HERO (Story #1) ---
    hero_entry = feed.entries[0]
    print(f"   ⭐️ Hero found: {hero_entry.title[:30]}...")
    
    hero_prompt = f"""
    You are the Editor-in-Chief.
    Task: Write a "Special Report" based on this news.
    Headline: {hero_entry.title}
    Summary: {hero_entry.summary}
    
    Output JSON: {{ "title": "...", "subtitle": "...", "content": ["para1", "para2", "para3"], "keyPoints": ["pt1", "pt2"] }}
    """
    
    try:
        # Generate Hero
        hero_res = model.generate_content(hero_prompt, generation_config={"response_mime_type": "application/json"})
        hero_data = json.loads(hero_res.text)
        
        # Save Hero
        db.collection("daily_edition").document("hero_story").set({
            "lastUpdated": firestore.SERVER_TIMESTAMP,
            "type": "hero",
            "imageUrl": get_image_with_fallback(hero_entry, hero_data.get("title", hero_entry.title), validate=True),
            **hero_data,
            "author": "The Editorial Board"
        })
        print("   💾 Saved Hero Story.")
        
    except Exception as e:
        print(f"   ❌ Hero Generation Failed: {e}")

if __name__ == "__main__":
    update_hero_and_featured()

# python tasks/update_hero_story.py