import yfinance as yf
import google.generativeai as genai
import os
import sys
import json
from dotenv import load_dotenv
from firebase_admin import firestore

# Setup path to import 'app.db'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.db import db

load_dotenv()

# Configure Gemini
GEN_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEN_KEY)
model = genai.GenerativeModel('gemini-flash-latest')

def fetch_macro_data():
    """Fetches key economic indicators for analysis."""
    print("   📊 Fetching macro indicators...")
    
    tickers = {
        "US 10Y Bond": "^TNX",
        "VIX (Fear Index)": "^VIX",
        "CAD/USD": "CADUSD=X",
        "Crude Oil": "CL=F",
        "TSX Composite": "^GSPTSE"
    }
    
    data_summary = []
    
    try:
        # Fetch all at once
        data = yf.download(list(tickers.values()), period="5d", progress=False)
        
        for name, symbol in tickers.items():
            try:
                # Get latest close
                ticker = yf.Ticker(symbol)
                info = ticker.fast_info
                price = info.last_price
                prev = info.previous_close
                
                if price and prev:
                    change_pct = ((price - prev) / prev) * 100
                    data_summary.append(f"{name}: {price:,.2f} (Change: {change_pct:+.2f}%)")
            except:
                continue
                
        return "\n".join(data_summary)
    except Exception as e:
        print(f"      ⚠️ Data fetch error: {e}")
        return ""

def generate_analysis(macro_text):
    """Uses AI to interpret the numbers for students."""
    print("   🧠 AI Economist is writing the Deep Dive...")
    
    prompt = f"""
    You are the Chief Economist of 'The Keele Street Journal'.
    
    Current Market Data:
    {macro_text}
    
    TASK:
    1. Analyze the data above.
    2. Generate content for the "Market Deep Dive" section.
    3. Specifically, create 3 Analysis Cards and 1 Highlight Stat.
    4. Each card needs a short summary AND full article content (2-3 paragraphs) for students who want to read more.
    5. Each card also needs 2-3 key takeaway points.

    OUTPUT FORMAT (JSON):
    {{
        "cards": [
            {{
                "title": "Short Analysis Title (e.g. 'Bond Yields Spike')",
                "analysis": "Two sentences explaining what this means for Canadian students/investors.",
                "content": ["First paragraph with detailed analysis...", "Second paragraph with implications...", "Third paragraph with outlook..."],
                "keyPoints": ["Key takeaway 1", "Key takeaway 2"]
            }},
            {{
                "title": "Title 2",
                "analysis": "Analysis 2",
                "content": ["...", "...", "..."],
                "keyPoints": ["...", "..."]
            }},
            {{
                "title": "Title 3",
                "analysis": "Analysis 3",
                "content": ["...", "...", "..."],
                "keyPoints": ["...", "..."]
            }}
        ],
        "stat": {{
            "value": "e.g. 4.2%",
            "label": "Current 10Y Yield",
            "source": "Yahoo Finance Data"
        }}
    }}
    """
    
    try:
        response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        return response.text
    except Exception as e:
        print(f"      ❌ AI Error: {e}")
        return None

def update_deep_dive():
    print("📉 Starting 'Deep Dive' production...")
    
    # 1. Fetch Real Data
    macro_data = fetch_macro_data()
    if not macro_data:
        print("❌ Failed to fetch macro data.")
        return

    # 2. Analyze with AI
    json_str = generate_analysis(macro_data)
    
    # 3. Save to Firestore
    if json_str:
        try:
            data = json.loads(json_str)
            
            db.collection("daily_edition").document("deep_dive").set({
                "lastUpdated": firestore.SERVER_TIMESTAMP,
                "cards": data.get("cards", []),
                "stat": data.get("stat", {})
            })
            print("💾 Deep Dive Published: Saved to 'daily_edition/deep_dive'")
            
        except json.JSONDecodeError:
            print("❌ AI returned invalid JSON.")
    else:
        print("❌ AI failed to generate analysis.")

if __name__ == "__main__":
    update_deep_dive()

# python tasks/update_deep_dive.py