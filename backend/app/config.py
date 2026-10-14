import os
from pathlib import Path
from typing import List

# Base directory for the backend
BASE_DIR = Path(__file__).resolve().parent.parent

# Video directory: default to backend/media or environment override
raw_video_dir = os.getenv("VIDEO_DIR", str(BASE_DIR / "media"))
VIDEO_DIR = Path(raw_video_dir).resolve()

HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "8000"))
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
INSTANCE_NAME = os.getenv("INSTANCE_NAME", os.getenv("HOSTNAME", "backend-local"))

# Parse allowed CORS origins
raw_origins = os.getenv(
    "FRONTEND_ORIGINS",
    "http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
)
FRONTEND_ORIGINS: List[str] = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

def validate_config() -> dict:
    """Validate runtime configuration and return status diagnostics."""
    status = {
        "video_dir": str(VIDEO_DIR),
        "video_dir_exists": VIDEO_DIR.exists() and VIDEO_DIR.is_dir(),
        "host": HOST,
        "port": PORT,
        "cors_origins": FRONTEND_ORIGINS,
    }
    return status
