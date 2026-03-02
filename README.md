# The Keele Street Journal

An AI-powered daily financial newspaper built for York University's Economics enthusiasts. Every morning, automated pipelines fetch live market data and global news, process them through Google's Gemini AI, and publish a fresh digital edition — no manual work required.

## How It Works

```
RSS Feeds + Yahoo Finance
        ↓
  Python Task Scripts
        ↓
   Gemini AI (summarize, curate, analyze)
        ↓
   Google Firestore (store daily edition)
        ↓
   Next.js Frontend (render newspaper)
        ↓
   Readers (web browser)
```

Every day at 9:35 AM EST (after US market open), a GitHub Actions workflow runs 8 task scripts that:

1. **Market Ticker** — Fetches live prices for S&P/TSX, S&P 500, Oil, CAD/USD, Bitcoin
2. **What's News** — Summarizes top business & world headlines into WSJ-style bullets
3. **Hero Story** — Generates a featured "Special Report" from the top financial headline
4. **Featured Stories** — Curates 4 diverse stories from multiple news sources
5. **Opinions** — Generates 3 editorial opinion teasers from different perspectives
6. **Market Deep Dive** — Analyzes macro indicators (10Y yield, VIX, CAD/USD, Oil, TSX)
7. **Global Briefing** — Selects top 3 geopolitical stories with economic impact analysis
8. **Campus News** — Aggregates York University news with AI-generated images for missing photos

## Tech Stack

### Frontend
- **Next.js 16** with React 19 and React Server Components
- **TypeScript** with strict mode
- **Tailwind CSS 4** with custom serif newspaper typography
- **Framer Motion** for animations
- **Firebase SDK** for real-time Firestore reads

### Backend
- **Python 3.11+** task scripts (no server required for daily updates)
- **FastAPI** for manual trigger endpoint and health checks
- **Google Gemini AI** (`gemini-flash-latest`) for content generation
- **yfinance** for real-time market data
- **feedparser** for RSS feed parsing
- **Firebase Admin SDK** for authenticated Firestore writes

### Infrastructure
- **Google Cloud Firestore** — Document database for all content
- **GitHub Actions** — Scheduled daily automation (cron)
- **Vercel** — Frontend deployment (recommended)

## Project Structure

```
KSJournal/
├── .github/workflows/
│   └── daily-update.yml        # Cron job: runs all tasks daily at 9:35 AM EST
├── backend/
│   ├── app/
│   │   ├── db.py               # Firebase Admin initialization
│   │   ├── genai_engine.py     # Shared Gemini AI helpers
│   │   ├── scraper.py          # Shared RSS feed fetching
│   │   └── main.py             # FastAPI app (health check + manual trigger)
│   ├── tasks/
│   │   ├── run_daily.py        # Master orchestrator (runs all tasks)
│   │   ├── update_ticker.py    # Market ticker data
│   │   ├── update_whats_news.py
│   │   ├── update_hero_story.py
│   │   ├── update_featured_stories.py
│   │   ├── update_opinions.py
│   │   ├── update_deep_dive.py
│   │   ├── update_global_briefing.py
│   │   └── update_campus_news.py
│   ├── requirements.txt
│   └── .env                    # GEMINI_API_KEY, FIREBASE_PROJECT_ID
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx        # Homepage (fetches all Firestore data)
│   │   │   └── article/[id]/page.tsx
│   │   ├── components/
│   │   │   ├── header.tsx
│   │   │   ├── ticker.tsx
│   │   │   ├── news-card.tsx
│   │   │   ├── whats-news.tsx
│   │   │   ├── opinion-column.tsx
│   │   │   ├── newsletter-form.tsx
│   │   │   ├── current-date.tsx
│   │   │   └── ui/             # shadcn/ui components
│   │   └── lib/
│   │       ├── firebase.ts     # Firebase client SDK init
│   │       └── utils.ts        # cn() class utility
│   ├── package.json
│   └── .env.local              # Firebase client config
├── firebase.rules              # Firestore security rules
└── README.md
```

## Setup

### Prerequisites
- Node.js 20+
- Python 3.11+
- A Firebase project with Firestore enabled
- A Google AI Studio API key (Gemini)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:
```
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_project_id
```

Place your Firebase service account JSON at `backend/service_account.json`.

Run a single daily update:
```bash
python tasks/run_daily.py
```

Or run individual tasks:
```bash
python tasks/update_ticker.py
python tasks/update_whats_news.py
```

Start the API server (optional):
```bash
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Daily Automation

The project uses GitHub Actions for automated daily publishing. To enable it:

1. Go to your repo **Settings > Secrets and variables > Actions**
2. Add these secrets:
   - `FIREBASE_SERVICE_ACCOUNT` — Full contents of your `service_account.json`
   - `GEMINI_API_KEY` — Your Google AI Studio API key
3. The workflow runs automatically at 9:35 AM EST every day
4. You can also trigger it manually from the **Actions** tab

## Firestore Collections

| Collection | Document | Description |
|-----------|----------|-------------|
| `system` | `market_ticker` | Live stock prices and changes |
| `daily_edition` | `whats_news` | Business & world news bullets |
| `daily_edition` | `hero_story` | Main featured article |
| `daily_edition` | `featured_stories` | 4 curated story cards |
| `daily_edition` | `opinions` | 3 editorial opinion teasers |
| `daily_edition` | `deep_dive` | Macro economic analysis cards |
| `daily_edition` | `global_briefing` | Top 3 geopolitical stories |
| `daily_edition` | `campus_news` | York University campus news |
| `subscribers` | `{auto-id}` | Newsletter email subscriptions |

