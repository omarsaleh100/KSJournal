import feedparser
import google.generativeai as genai
import os
import sys
import json
from dotenv import load_dotenv
from firebase_admin import firestore

# Setup path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.db import db

load_dotenv()

# Configure Gemini
GEN_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEN_KEY)

# ---------------------------------------------------------
# CRITICAL UPDATE: Using the correct model name you verified
# ---------------------------------------------------------
model = genai.GenerativeModel('gemini-flash-latest')

# Global Macro Sources
RSS_URLS = [
    "https://www.aljazeera.com/xml/rss/all.xml", # Excellent global coverage
    "https://feeds.bbci.co.uk/news/world/rss.xml",
    "https://www.cnbc.com/id/100003114/device/rss/rss.html" # Top Global News
]

def fetch_global_raw():
    print("   📡 Scanning global feeds...")
    USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0"
    
    combined_headlines = []
    
    for url in RSS_URLS:
        try:
            feed = feedparser.parse(url, agent=USER_AGENT)
            # Take top 3 from each to get a mix
            for entry in feed.entries[:3]:
                combined_headlines.append(f"Title: {entry.title}\nSummary: {entry.summary[:200]}...")
        except Exception as e:
            print(f"      ⚠️ Failed to read {url}: {e}")
            
    return "\n\n".join(combined_headlines)

def analyze_briefing(raw_text):
    print("   🧠 AI Editor is curating the Global Briefing...")
    
    prompt = f"""
    You are the Foreign Editor of 'The Keele Street Journal'.
    
    Raw Global News:
    {raw_text}
    
    TASK:
    1. Select the top 3 most critical geopolitical/economic stories.
    2. Ignore sports, celebrity news, or local crime. Focus on MACRO impact (trade, war, policy).
    3. Output a valid JSON array.
    
    OUTPUT FORMAT (JSON):
    [
        {{
            "headline": "Punchy, serif-style headline (max 10 words)",
            "context": "Two sentences explaining why this matters to the global economy."
        }},
        ... (3 items total)
    ]
    """
    
    try:
        response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        return response.text
    except Exception as e:
        print(f"      ❌ AI Error: {e}")
        return "[]"

def update_global():
    print("🌍 Starting 'Global Briefing' production...")
    
    # 1. Fetch
    raw_text = fetch_global_raw()
    if not raw_text:
        print("❌ No data found.")
        return

    # 2. Analyze
    json_str = analyze_briefing(raw_text)
    
    # 3. Save
    try:
        data = json.loads(json_str)
        if len(data) > 0:
            db.collection("daily_edition").document("global_briefing").set({
                "lastUpdated": firestore.SERVER_TIMESTAMP,
                "items": data
            })
            print("💾 Global Briefing Published: Saved to 'daily_edition/global_briefing'")
        else:
            print("⚠️ AI returned empty list.")
            
    except json.JSONDecodeError:
        print("❌ AI returned invalid JSON.")

if __name__ == "__main__":
    update_global()

# python tasks/update_global_briefing.py