from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import sys
import os

app = FastAPI(title="KSJournal API", version="1.0.0")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "https://ksjournal.vercel.app").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

TASKS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tasks")


def _run_daily():
    """Background worker that runs the daily update."""
    result = subprocess.run(
        [sys.executable, os.path.join(TASKS_DIR, "run_daily.py")],
        cwd=os.path.dirname(TASKS_DIR),
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"Daily update failed (exit {result.returncode}):\n{result.stderr}")
    else:
        print("Daily update completed successfully.")


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "ksjournal-api"}


@app.post("/api/run-daily")
def trigger_daily(background_tasks: BackgroundTasks):
    background_tasks.add_task(_run_daily)
    return {"status": "started", "message": "Daily update triggered in background."}
