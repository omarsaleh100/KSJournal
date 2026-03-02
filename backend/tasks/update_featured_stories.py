import os
import sys
import json
import datetime
from firebase_admin import firestore

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.db import db
from app.genai_engine import generate_json
from app.scraper import fetch_feed
from app.image_utils import get_image_with_fallback

# Multiple RSS sources for diverse featured stories
FEEDS = [
    "https://financialpost.com/feed",
    "https://www.cbc.ca/webfeed/rss/rss-business",
    "https://feeds.bbci.co.uk/news/business/rss.xml",
    "https://www.cnbc.com/id/100003114/device/rss/rss.html",
]


def update_featured_stories():
    print("📰 Starting 'Featured Stories' production...")

    # 1. Gather candidates from all feeds
    candidates = []
    raw_entries = []  # Keep raw entries for image extraction
    for url in FEEDS:
        entries = fetch_feed(url, limit=3)
        for entry in entries:
            candidates.append({
                "title": entry.get("title", ""),
                "summary": getattr(entry, "summary", ""),
                "source": url.split("/")[2],
            })
            raw_entries.append(entry)

    if not candidates:
        print("   ❌ No RSS candidates found.")
        return

    print(f"   📡 Collected {len(candidates)} candidates from {len(FEEDS)} feeds.")

    # 2. Build candidate text for AI
    candidates_text = "\n".join(
        f"{i+1}. [{c['source']}] {c['title']} — {c['summary'][:120]}"
        for i, c in enumerate(candidates)
    )

    today = datetime.date.today().strftime("%b %d, %Y")

    prompt = f"""
    You are the Managing Editor of 'The Keele Street Journal', a financial newspaper for university economics students.

    Raw Candidate Stories:
    {candidates_text}

    TASK:
    1. Select the 4 most diverse and impactful stories. Avoid picking two stories about the same topic.
    2. Assign each a category from: "Markets", "Economy", "Policy", "Tech", "Global Trade", "Energy", "Banking".
    3. Write a punchy, short title (max 12 words) and a one-sentence summary for each.
    4. Write 3 paragraphs of article content for each story (informative, suitable for economics students).
    5. Write 2-3 key takeaway points for each story.

    OUTPUT FORMAT (JSON array):
    [
        {{
            "id": "featured-0",
            "category": "Markets",
            "title": "Short Punchy Title Here",
            "summary": "One clear sentence summarizing the story.",
            "content": ["First paragraph...", "Second paragraph...", "Third paragraph..."],
            "keyPoints": ["Key takeaway 1", "Key takeaway 2"],
            "date": "{today}",
            "author": "Staff"
        }},
        ... (4 items total, ids: featured-0, featured-1, featured-2, featured-3)
    ]
    """

    result = generate_json(prompt)

    if not result or not isinstance(result, list):
        print("   ❌ AI failed to generate featured stories.")
        return

    # Ensure correct IDs and resolve images
    # Build lookup from candidate title to raw entry for image extraction
    entry_lookup = {c["title"]: raw_entries[i] for i, c in enumerate(candidates) if i < len(raw_entries)}

    for i, item in enumerate(result[:4]):
        item["id"] = f"featured-{i}"
        # Find matching entry by title similarity
        matching_entry = entry_lookup.get(item.get("title"))
        item["imageUrl"] = get_image_with_fallback(matching_entry, item["title"], category=item.get("category"), validate=True)

    # 3. Save to Firestore
    try:
        db.collection("daily_edition").document("featured_stories").set({
            "lastUpdated": firestore.SERVER_TIMESTAMP,
            "items": result[:4]
        })
        print(f"   💾 Saved {len(result[:4])} featured stories to Firestore.")
    except Exception as e:
        print(f"   ❌ Database Error: {e}")


if __name__ == "__main__":
    update_featured_stories()

# python tasks/update_featured_stories.py
