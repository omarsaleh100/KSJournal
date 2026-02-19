import feedparser
import google.generativeai as genai
import os
import sys
import json
import random
from dotenv import load_dotenv
from firebase_admin import firestore

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.db import db

load_dotenv()

GEN_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEN_KEY)
model = genai.GenerativeModel('gemini-flash-latest')

# Financial Post (Good for both Lead and Featured stories)
RSS_URL = "https://financialpost.com/feed"

FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1611974765270-ca12586343bb?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1920&auto=format&fit=crop",
]

def get_image_from_entry(entry):
    if 'media_content' in entry: return entry.media_content[0]['url']
    if 'media_thumbnail' in entry: return entry.media_thumbnail[0]['url']
    if 'links' in entry:
        for link in entry.links:
            if 'image' in link.type: return link.href
    return random.choice(FALLBACK_IMAGES)

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
            "imageUrl": get_image_from_entry(hero_entry),
            **hero_data,
            "author": "The Editorial Board"
        })
        print("   💾 Saved Hero Story.")
        
    except Exception as e:
        print(f"   ❌ Hero Generation Failed: {e}")

if __name__ == "__main__":
    update_hero_and_featured()

# python tasks/update_hero_story.py