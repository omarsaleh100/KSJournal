import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()

# 1. Get the absolute path to the 'backend' folder
# (Goes up one level from 'app/db.py' to 'backend')
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 2. Construct the full path to the key file
# Ensure your file in the folder is named "service_account.json" (underscore)
KEY_PATH = os.path.join(BASE_DIR, "service_account.json")

if not firebase_admin._apps:
    if os.path.exists(KEY_PATH):
        cred = credentials.Certificate(KEY_PATH)
        firebase_admin.initialize_app(cred)
        print(f"✅ Firebase initialized using key at: {KEY_PATH}")
    else:
        print(f"⚠️ Key not found at: {KEY_PATH}")
        print("   Attempting to use Default Credentials (Production Mode)...")
        firebase_admin.initialize_app()

db = firestore.client()