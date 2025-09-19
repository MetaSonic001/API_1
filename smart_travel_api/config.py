from dotenv import load_dotenv
import os

load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL")
HF_TOKEN = os.getenv("HF_TOKEN")
OPEN_TRIPMAP_API_KEY = os.getenv("OPEN_TRIPMAP_API_KEY", "")  # Optional