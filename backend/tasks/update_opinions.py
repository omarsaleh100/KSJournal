import os
import sys
from firebase_admin import firestore

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.db import db
from app.genai_engine import generate_json
from app.scraper import fetch_headlines

# Reuse the same news sources as whats_news for context
HEADLINE_FEEDS = [
    "https://financialpost.com/feed",
    "https://www.cbc.ca/webfeed/rss/rss-business",
    "https://feeds.bbci.co.uk/news/world/rss.xml",
]


def update_opinions():
    print("📝 Starting 'Opinion Column' production...")

    # 1. Fetch today's headlines for context
    headlines = fetch_headlines(HEADLINE_FEEDS, limit_per_feed=4)

    if not headlines:
        print("   ⚠️ No headlines found. Using generic prompt.")
        headlines = "Global markets, trade policy, student economics, and technology trends."

    # 2. Ask Gemini to generate 3 opinion teasers
    prompt = f"""
    You are the Opinion Editor of 'The Keele Street Journal', an economics newspaper for York University students.

    Today's top news headlines:
    {headlines}

    TASK:
    Generate 3 provocative opinion column teasers inspired by today's news.
    Each must take a clear editorial stance — be bold, not neutral.

    Voices (generate a realistic fictional name for each):
    1. A university economics professor (academic perspective)
    2. A student association president (student/young perspective)
    3. A financial analyst (market/industry perspective)

    OUTPUT FORMAT (JSON array):
    [
        {{
            "title": "Provocative Opinion Title (max 10 words)",
            "author": "Dr. Full Name",
            "role": "Prof. of Macroeconomics",
            "snippet": "Two punchy sentences summarizing the opinion's argument."
        }},
        ... (3 items total)
    ]
    """

    result = generate_json(prompt)

    if not result or not isinstance(result, list):
        print("   ❌ AI failed to generate opinions.")
        return

    # 3. Save to Firestore
    try:
        db.collection("daily_edition").document("opinions").set({
            "lastUpdated": firestore.SERVER_TIMESTAMP,
            "items": result[:3]
        })
        print(f"   💾 Saved {len(result[:3])} opinion pieces to Firestore.")
    except Exception as e:
        print(f"   ❌ Database Error: {e}")


if __name__ == "__main__":
    update_opinions()

# python tasks/update_opinions.py
