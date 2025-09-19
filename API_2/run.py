import uvicorn
import os
from dotenv import load_dotenv

if __name__ == "__main__":
    # Load environment variables from .env if present
    load_dotenv()

    # Default host/port from env or fallback
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("RELOAD", "true").lower() == "true"

    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=reload
    )
