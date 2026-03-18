#!/usr/bin/env python3
"""
KSJ Daily Newsletter — sends the morning edition to all subscribers.
Reads today's content from Firestore, builds an HTML email, sends via Resend.
"""
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import resend
from app.db import db

SITE_URL = "https://theksj.com"


def slugify(text: str) -> str:
    import re
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:60]


def get_subscribers() -> list[str]:
    """Fetch all subscriber emails from Firestore."""
    docs = db.collection("subscribers").stream()
    emails = [doc.to_dict().get("email") for doc in docs]
    return [e for e in emails if e]


def get_daily_content() -> dict:
    """Fetch all daily edition content from Firestore."""
    collections = {
        "ticker": ("system", "market_ticker"),
        "whats_news": ("daily_edition", "whats_news"),
        "hero": ("daily_edition", "hero_story"),
        "featured": ("daily_edition", "featured_stories"),
        "opinions": ("daily_edition", "opinions"),
        "deep_dive": ("daily_edition", "deep_dive"),
        "global_briefing": ("daily_edition", "global_briefing"),
        "campus": ("daily_edition", "campus_news"),
    }
    data = {}
    for key, (collection, doc_id) in collections.items():
        snap = db.collection(collection).document(doc_id).get()
        data[key] = snap.to_dict() if snap.exists else None
    return data


def build_email_html(content: dict) -> str:
    """Build a newspaper-style HTML email from daily content."""
    today = datetime.now().strftime("%A, %B %d, %Y")

    # --- Market Ticker ---
    ticker_html = ""
    if content.get("ticker") and content["ticker"].get("items"):
        ticker_items = []
        for item in content["ticker"]["items"]:
            bg = "#dcfce7" if item.get("isUp") else "#fee2e2"
            text_color = "#166534" if item.get("isUp") else "#991b1b"
            arrow = "▲" if item.get("isUp") else "▼"
            ticker_items.append(
                f'<td style="padding:8px 4px;text-align:center;font-size:11px;font-family:Arial,sans-serif;">'
                f'<div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:4px;padding:8px 6px;">'
                f'<span style="color:#18181b;font-weight:bold;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;">{item["symbol"]}</span><br>'
                f'<span style="color:#18181b;font-size:14px;font-weight:bold;">{item["price"]}</span><br>'
                f'<span style="background:{bg};color:{text_color};font-size:10px;font-weight:bold;padding:2px 6px;border-radius:3px;display:inline-block;margin-top:2px;">{arrow} {item.get("change","")}</span>'
                f'</div></td>'
            )
        ticker_html = f"""
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:8px 4px;border-bottom:1px solid #e4e4e7;">
          <tr>{"".join(ticker_items)}</tr>
        </table>"""

    # --- What's News ---
    whats_news_html = ""
    if content.get("whats_news"):
        wn = content["whats_news"]
        biz_bullets = "".join(
            f'<li style="margin-bottom:6px;font-size:13px;color:#3f3f46;line-height:1.5;">{b.lstrip("- •")}</li>'
            for b in (wn.get("business") or [])
        )
        world_bullets = "".join(
            f'<li style="margin-bottom:6px;font-size:13px;color:#3f3f46;line-height:1.5;">{b.lstrip("- •")}</li>'
            for b in (wn.get("world") or [])
        )
        whats_news_html = f"""
        <div style="margin-bottom:32px;">
          <h2 style="font-family:Georgia,serif;font-size:16px;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #18181b;padding-bottom:6px;margin-bottom:12px;">What's News</h2>
          <h3 style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#991b1b;margin-bottom:8px;">Business & Finance</h3>
          <ul style="padding-left:16px;margin:0 0 16px 0;">{biz_bullets}</ul>
          <h3 style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#991b1b;margin-bottom:8px;">World</h3>
          <ul style="padding-left:16px;margin:0;">{world_bullets}</ul>
        </div>"""

    # --- Hero Story ---
    hero_html = ""
    if content.get("hero"):
        h = content["hero"]
        hero_slug = f"hero-{slugify(h.get('title', ''))}"
        hero_html = f"""
        <div style="margin-bottom:32px;border-bottom:1px solid #e4e4e7;padding-bottom:24px;">
          <span style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#991b1b;font-weight:bold;">Special Report</span>
          <h1 style="font-family:Georgia,serif;font-size:26px;margin:8px 0;line-height:1.2;">
            <a href="{SITE_URL}/article/{hero_slug}" style="color:#18181b;text-decoration:none;">{h.get("title","")}</a>
          </h1>
          <p style="font-family:Georgia,serif;font-size:15px;color:#52525b;line-height:1.6;margin:0 0 8px 0;">{h.get("subtitle","")}</p>
          <span style="font-size:10px;color:#a1a1aa;text-transform:uppercase;">By {h.get("author","Staff")}</span>
        </div>"""

    # --- Featured Stories ---
    featured_html = ""
    if content.get("featured") and content["featured"].get("items"):
        cards = []
        for i, story in enumerate(content["featured"]["items"][:4]):
            slug = f"featured-{i}-{slugify(story.get('title', ''))}"
            cards.append(f"""
            <div style="padding:16px 0;border-bottom:1px solid #f4f4f5;">
              <span style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#991b1b;font-weight:bold;">{story.get("category","")}</span>
              <h3 style="font-family:Georgia,serif;font-size:16px;margin:4px 0;">
                <a href="{SITE_URL}/article/{slug}" style="color:#18181b;text-decoration:none;">{story.get("title","")}</a>
              </h3>
              <p style="font-size:13px;color:#71717a;margin:4px 0 0 0;line-height:1.5;">{story.get("summary","")}</p>
            </div>""")
        featured_html = f"""
        <div style="margin-bottom:32px;">
          <h2 style="font-family:Georgia,serif;font-size:14px;text-transform:uppercase;letter-spacing:2px;border-bottom:1px solid #e4e4e7;padding-bottom:6px;margin-bottom:4px;">Featured Stories</h2>
          {"".join(cards)}
        </div>"""

    # --- Deep Dive ---
    deep_dive_html = ""
    if content.get("deep_dive"):
        dd = content["deep_dive"]
        dd_cards = []
        for i, card in enumerate(dd.get("cards") or []):
            dd_cards.append(f"""
            <div style="padding:12px 0;border-bottom:1px solid #3f3f46;">
              <h3 style="font-family:Georgia,serif;font-size:14px;color:#ffffff;margin:0 0 4px 0;">{card.get("title","")}</h3>
              <p style="font-size:12px;color:#a1a1aa;line-height:1.5;margin:0;">{card.get("analysis","")}</p>
            </div>""")
        stat = dd.get("stat") or {}
        deep_dive_html = f"""
        <div style="background:#18181b;padding:24px;margin:0 -24px 32px -24px;">
          <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:2px;color:#ffffff;border-bottom:1px solid #3f3f46;padding-bottom:8px;margin-bottom:12px;">📊 Market Deep Dive</h2>
          {"".join(dd_cards)}
          <div style="text-align:center;padding:16px 0 0 0;">
            <span style="font-size:28px;font-weight:bold;color:#ffffff;">{stat.get("value","")}</span><br>
            <span style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#a1a1aa;">{stat.get("label","")}</span>
          </div>
        </div>"""

    # --- Global Briefing ---
    global_html = ""
    if content.get("global_briefing") and content["global_briefing"].get("items"):
        items = []
        for i, item in enumerate(content["global_briefing"]["items"][:3]):
            items.append(f"""
            <div style="padding:12px 0;border-bottom:1px solid #f4f4f5;">
              <span style="font-family:Georgia,serif;font-size:20px;color:#e4e4e7;font-weight:bold;margin-right:8px;">0{i+1}</span>
              <strong style="font-family:Georgia,serif;font-size:15px;color:#18181b;">{item.get("headline","")}</strong>
              <p style="font-size:13px;color:#71717a;margin:4px 0 0 0;line-height:1.5;">{item.get("context","")}</p>
            </div>""")
        global_html = f"""
        <div style="margin-bottom:32px;">
          <h2 style="font-family:Georgia,serif;font-size:14px;text-transform:uppercase;letter-spacing:2px;border-bottom:1px solid #e4e4e7;padding-bottom:6px;margin-bottom:8px;">Global Briefing</h2>
          {"".join(items)}
        </div>"""

    # --- Opinions ---
    opinions_html = ""
    if content.get("opinions") and content["opinions"].get("items"):
        op_items = []
        for op in content["opinions"]["items"][:3]:
            op_items.append(f"""
            <div style="padding:10px 0;border-bottom:1px solid #f4f4f5;">
              <h4 style="font-family:Georgia,serif;font-size:14px;color:#18181b;margin:0 0 2px 0;">{op.get("title","")}</h4>
              <span style="font-size:10px;color:#991b1b;text-transform:uppercase;">{op.get("author","")} — {op.get("role","")}</span>
              <p style="font-size:12px;color:#71717a;margin:4px 0 0 0;line-height:1.4;">{op.get("snippet","")}</p>
            </div>""")
        opinions_html = f"""
        <div style="margin-bottom:32px;">
          <h2 style="font-family:Georgia,serif;font-size:14px;text-transform:uppercase;letter-spacing:2px;border-bottom:1px solid #e4e4e7;padding-bottom:6px;margin-bottom:8px;">Opinion</h2>
          {"".join(op_items)}
        </div>"""

    # --- Campus News ---
    campus_html = ""
    if content.get("campus") and content["campus"].get("items"):
        c_items = []
        for item in content["campus"]["items"][:3]:
            c_items.append(f"""
            <div style="padding:10px 0;border-bottom:1px solid #f4f4f5;">
              <span style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#991b1b;font-weight:bold;">{item.get("category","Campus")}</span>
              <h4 style="font-family:Georgia,serif;font-size:14px;color:#18181b;margin:2px 0;">
                <a href="{item.get('link','#')}" style="color:#18181b;text-decoration:none;">{item.get("title","")}</a>
              </h4>
              <p style="font-size:12px;color:#71717a;margin:2px 0 0 0;line-height:1.4;">{item.get("summary","")[:120]}...</p>
            </div>""")
        campus_html = f"""
        <div style="margin-bottom:32px;">
          <h2 style="font-family:Georgia,serif;font-size:14px;text-transform:uppercase;letter-spacing:2px;border-bottom:1px solid #e4e4e7;padding-bottom:6px;margin-bottom:8px;">Campus & Career</h2>
          {"".join(c_items)}
        </div>"""

    # --- Full Email ---
    return f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">

    <!-- HEADER -->
    <div style="text-align:center;padding:24px 24px 16px 24px;border-bottom:3px double #18181b;">
      <h1 style="font-family:Georgia,serif;font-size:28px;margin:0;letter-spacing:-0.5px;">The Keele Street Journal</h1>
      <p style="font-size:11px;color:#71717a;margin:4px 0 0 0;font-style:italic;">{today} — Morning Edition</p>
    </div>

    {ticker_html}

    <!-- BODY -->
    <div style="padding:24px;">
      {whats_news_html}
      {hero_html}
      {featured_html}
      {deep_dive_html}
      {global_html}
      {opinions_html}
      {campus_html}

      <!-- CTA -->
      <div style="text-align:center;padding:24px 0;border-top:2px solid #18181b;">
        <a href="{SITE_URL}" style="display:inline-block;background:#18181b;color:#ffffff;padding:12px 32px;font-size:13px;font-weight:bold;text-decoration:none;text-transform:uppercase;letter-spacing:1px;">Read Full Edition →</a>
      </div>
    </div>

    <!-- FOOTER -->
    <div style="background:#18181b;padding:24px;text-align:center;">
      <p style="font-family:Georgia,serif;font-size:14px;color:#ffffff;margin:0 0 8px 0;">The Keele Street Journal</p>
      <p style="font-size:11px;color:#71717a;margin:0 0 12px 0;">AI-powered financial news for Economics students</p>
      <p style="font-size:10px;color:#52525b;margin:0;">
        You're receiving this because you subscribed at theksj.com<br>
        &copy; {datetime.now().year} The Keele Street Journal
      </p>
    </div>

  </div>
</body>
</html>"""


def send_newsletter():
    api_key = os.getenv("RESEND_API_KEY")
    if not api_key:
        print("❌ RESEND_API_KEY not set — skipping newsletter send")
        sys.exit(1)

    resend.api_key = api_key

    # 1. Get subscribers
    subscribers = get_subscribers()
    if not subscribers:
        print("⚠️ No subscribers found — skipping")
        return

    print(f"📬 Found {len(subscribers)} subscriber(s)")

    # 2. Get today's content
    content = get_daily_content()
    print("📰 Fetched daily content from Firestore")

    # 3. Build email
    html = build_email_html(content)
    today = datetime.now().strftime("%B %d, %Y")

    # 4. Send via Resend (batch — up to 100 per call)
    # Send individually to keep subscriber emails private (no CC/BCC exposure)
    success = 0
    failed = 0
    for email in subscribers:
        try:
            resend.Emails.send({
                "from": "The Keele Street Journal <newsletter@theksj.com>",
                "to": [email],
                "subject": f"KSJ Morning Edition — {today}",
                "html": html,
            })
            success += 1
        except Exception as e:
            print(f"  ❌ Failed to send to {email}: {e}")
            failed += 1

    print(f"✅ Newsletter sent: {success} delivered, {failed} failed")


if __name__ == "__main__":
    send_newsletter()
