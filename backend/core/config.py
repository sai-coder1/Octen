import os
from dotenv import load_dotenv

load_dotenv()
OCTEN_API_KEY = os.getenv("OCTEN_API_KEY")

if not OCTEN_API_KEY:
    raise RuntimeError("OCTEN_API_KEY is missing, check your .env file!")
