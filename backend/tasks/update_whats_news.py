import feedparser
import google.generativeai as genai
import os
import sys
import datetime
from dotenv import load_dotenv
from firebase_admin import firestore

# Setup path to import 'app.db'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.db import db

load_dotenv()

# Configure Gemini
GEN_KEY = os.getenv("GEMINI_API_KEY")
if not GEN_KEY:
    print("❌ Error: GEMINI_API_KEY not found in .env")
    sys.exit(1)

genai.configure(api_key=GEN_KEY)

# Use the latest experimental Flash model (Gemini 2.0)
# If this fails, fallback to 'gemini-1.5-flash-latest'
MODEL_NAME = 'gemini-flash-latest' 
model = genai.GenerativeModel(MODEL_NAME)

# Define our News Sources (RSS)
FEEDS = {
    "business": [
        "https://financialpost.com/feed",
        "https://www.cbc.ca/webfeed/rss/rss-business"
    ],
    "world": [
        "https://feeds.bbci.co.uk/news/world/rss.xml",
        "https://www.cbc.ca/webfeed/rss/rss-world"
    ]
}

def fetch_headlines(category):
    """Parses RSS feeds and returns a simple list of strings."""
    print(f"   📡 Fetching {category} news...")
    headlines = []
    
    # Fake a browser User-Agent to prevent blocking (Fixes CBC error)
    USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    
    for url in FEEDS[category]:
        try:
            # Pass the agent to feedparser
            feed = feedparser.parse(url, agent=USER_AGENT)
            
            if feed.bozo and feed.bozo_exception:
                print(f"      ⚠️ Feed warning for {url}: {feed.bozo_exception}")

            # Take top 5 from each feed
            for entry in feed.entries[:5]:
                headlines.append(f"- {entry.title}")
                
        except Exception as e:
            print(f"      ⚠️ Error reading feed {url}: {e}")
            
    return "\n".join(headlines)

def summarize_with_ai(headlines, category):
    """Asks Gemini to write the WSJ-style bullets."""
    print(f"   🧠 AI Editor ({MODEL_NAME}) is summarizing {category}...")
    
    prompt = f"""
    You are the Senior Editor of 'The Keele Street Journal'.
    
    Raw Headlines:
    {headlines}
    
    Task:
    1. Select the 4 most important stories.
    2. Rewrite them into a single, punchy sentence each.
    3. Style: Professional, dense, "Wall Street Journal" style.
    4. Start each bullet with "- ".
    5. Output ONLY the 4 bullets.
    """
    
    try:
        response = model.generate_content(prompt)
        clean_text = response.text.replace("*", "").strip()
        bullets = [line.strip() for line in clean_text.split('\n') if line.strip().startswith("-")]
        
        if not bullets:
            bullets = [line.strip() for line in clean_text.split('\n') if line.strip()]
            
        return bullets[:4]
        
    except Exception as e:
        print(f"      ❌ AI Error: {e}")
        # Return fallback dummy data so the app doesn't break if AI fails
        return [
            "- AI Generation failed. Please check API quota.",
            "- Ensure your Google AI Studio key has access to Gemini 2.0.",
            "- Fallback: Markets open mixed as investors digest new data.",
            "- Fallback: Global trade tensions remain high."
        ]

def update_news():
    print("📰 Starting 'What's News' aggregation...")
    
    # 1. Fetch & Summarize Business
    raw_business = fetch_headlines("business")
    if not raw_business:
        print("   ⚠️ No business headlines found.")
        business_bullets = []
    else:
        business_bullets = summarize_with_ai(raw_business, "Business & Finance")
    
    # 2. Fetch & Summarize World
    raw_world = fetch_headlines("world")
    if not raw_world:
        print("   ⚠️ No world headlines found.")
        world_bullets = []
    else:
        world_bullets = summarize_with_ai(raw_world, "Global Politics")

    # 3. Save to Firestore
    if business_bullets and world_bullets:
        data = {
            "lastUpdated": firestore.SERVER_TIMESTAMP,
            "business": business_bullets,
            "world": world_bullets
        }
        
        try:
            db.collection("daily_edition").document("whats_news").set(data)
            print("💾 Edition Published: Saved to Firestore 'daily_edition/whats_news'")
        except Exception as e:
             print(f"❌ Database Error: {e}")
    else:
        print("⚠️ Skipped saving due to empty data.")

if __name__ == "__main__":
    update_news()

# python tasks/update_whats_news.py