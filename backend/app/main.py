from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import sys
import os

app = FastAPI(title="KSJournal API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

TASKS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tasks")


def _run_daily():
    """Background worker that runs the daily update."""
    subprocess.run(
        [sys.executable, os.path.join(TASKS_DIR, "run_daily.py")],
        cwd=os.path.dirname(TASKS_DIR)
    )


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "ksjournal-api"}


@app.post("/api/run-daily")
def trigger_daily(background_tasks: BackgroundTasks):
    background_tasks.add_task(_run_daily)
    return {"status": "started", "message": "Daily update triggered in background."}
