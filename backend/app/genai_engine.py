import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEN_KEY = os.getenv("GEMINI_API_KEY")
if not GEN_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment")

genai.configure(api_key=GEN_KEY)

MODEL_NAME = "gemini-flash-latest"
model = genai.GenerativeModel(MODEL_NAME)


def generate_json(prompt: str):
    """Generate content with JSON response mode. Returns parsed dict/list or None."""
    try:
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"   ❌ AI JSON Error: {e}")
        return None


def generate_text(prompt: str):
    """Generate content as plain text. Returns cleaned string or None."""
    try:
        response = model.generate_content(prompt)
        return response.text.replace("*", "").strip()
    except Exception as e:
        print(f"   ❌ AI Text Error: {e}")
        return None
