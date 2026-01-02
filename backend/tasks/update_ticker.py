import yfinance as yf
import firebase_admin
from firebase_admin import firestore
import sys
import os

# Add the parent directory to path so we can import 'app.db'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db import db  # Imports your authenticated Firestore client

def update_market_data():
    print("📈 Fetching market data...")

    # Tickers: TSX, S&P 500, Crude Oil, CAD/USD, BTC
    tickers = {
        "S&P/TSX": "^GSPTSE",
        "S&P 500": "^GSPC",
        "WTI Crude": "CL=F",
        "CAD/USD": "CADUSD=X",
        "Bitcoin": "BTC-USD"
    }

    market_data = []

    try:
        # Fetch all data at once
        data = yf.download(list(tickers.values()), period="1d", progress=False)

        # ... inside update_market_data function ...
        
        # Use a more reliable ticker for Oil if CL=F fails often: "CL=F" (Future) or "USO" (ETF)
        # For now, we will stick with CL=F but handle the error gracefully.
        
        for name, symbol in tickers.items():
            try:
                ticker_obj = yf.Ticker(symbol)
                
                # Fast fetch using 'fast_info' (newer yfinance feature, more reliable)
                price = ticker_obj.fast_info.last_price
                prev_close = ticker_obj.fast_info.previous_close
                
                if price and prev_close:
                    change = price - prev_close
                    percent_change = (change / prev_close) * 100
                    is_up = change >= 0
                    
                    market_data.append({
                        "symbol": name,
                        "price": f"{price:,.2f}",
                        "change": f"{change:+.2f} ({percent_change:+.2f}%)",
                        "isUp": is_up
                    })
                    print(f"   ✅ {name}: {price:.2f}")
                else:
                    print(f"   ⚠️ No data found for {name}")

            except Exception as e:
                print(f"   ❌ Error fetching {name}: {e}")

        # Save to Firestore
        # We store this in a 'system' collection, document 'market_data'
        if market_data:
            db.collection("system").document("market_ticker").set({
                "lastUpdated": firestore.SERVER_TIMESTAMP,
                "items": market_data
            })
            print("💾 Successfully updated Firestore 'system/market_ticker'")
        else:
            print("⚠️ No data collected to save.")

    except Exception as e:
        print(f"❌ Critical Error: {e}")

if __name__ == "__main__":
    update_market_data()