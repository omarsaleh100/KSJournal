#!/usr/bin/env python3
"""
KSJournal Daily Edition Publisher
Runs all content generation tasks in sequence.
Usage: python tasks/run_daily.py
"""
import subprocess
import sys
import os
import time
from datetime import datetime

TASKS_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(TASKS_DIR)

TASKS = [
    ("Market Ticker",       "update_ticker.py"),
    ("What's News",         "update_whats_news.py"),
    ("Hero Story",          "update_hero_story.py"),
    ("Featured Stories",    "update_featured_stories.py"),
    ("Opinions",            "update_opinions.py"),
    ("Deep Dive",           "update_deep_dive.py"),
    ("Global Briefing",     "update_global_briefing.py"),
    ("Campus News",         "update_campus_news.py"),
]


def run_all():
    print(f"{'='*60}")
    print(f"  THE KEELE STREET JOURNAL - Daily Edition")
    print(f"  {datetime.now().strftime('%A, %B %d, %Y at %I:%M %p')}")
    print(f"{'='*60}\n")

    results = []
    for name, script in TASKS:
        script_path = os.path.join(TASKS_DIR, script)
        if not os.path.exists(script_path):
            print(f"\n--- Skipping: {name} ({script}) — file not found ---")
            results.append((name, False, 0))
            continue

        print(f"\n--- Running: {name} ({script}) ---")
        start = time.time()
        try:
            result = subprocess.run(
                [sys.executable, script_path],
                cwd=BACKEND_DIR,
                capture_output=True,
                text=True,
                timeout=120
            )
            elapsed = time.time() - start
            success = result.returncode == 0
            results.append((name, success, elapsed))

            if result.stdout:
                print(result.stdout.strip())
            if result.stderr:
                print(result.stderr.strip())

            status = "OK" if success else "FAIL"
            print(f"--- {name}: {status} ({elapsed:.1f}s) ---")
        except subprocess.TimeoutExpired:
            results.append((name, False, 120))
            print(f"--- {name}: TIMEOUT (120s) ---")
        except Exception as e:
            results.append((name, False, 0))
            print(f"--- {name}: ERROR ({e}) ---")

    # Summary
    print(f"\n{'='*60}")
    print("  PUBLISH REPORT")
    print(f"{'='*60}")
    for name, success, elapsed in results:
        icon = "PASS" if success else "FAIL"
        print(f"  [{icon}] {name} ({elapsed:.1f}s)")

    failed = sum(1 for _, s, _ in results if not s)
    total = len(TASKS)
    if failed:
        print(f"\n  WARNING: {failed}/{total} task(s) failed.")
        sys.exit(1)
    else:
        print(f"\n  All {total} tasks completed successfully.")


if __name__ == "__main__":
    run_all()
