import time
from datetime import datetime, timezone
from fastapi import APIRouter
from ..config import VIDEO_DIR, INSTANCE_NAME
from ..models.video import HealthResponse
from ..services.video_catalog import catalog_service

router = APIRouter(prefix="/api/health", tags=["Health"])

START_TIME = time.time()

@router.get("", response_model=HealthResponse)
def get_health():
    """Real health check endpoint validating backend and media storage status."""
    uptime = time.time() - START_TIME
    dir_exists = VIDEO_DIR.exists() and VIDEO_DIR.is_dir()
    video_count = len(catalog_service.get_video_files()) if dir_exists else 0

    status_str = "healthy" if dir_exists else "degraded"

    return HealthResponse(
        status=status_str,
        service="StreamOps Video Streaming Backend",
        version="1.0.0",
        uptime_seconds=round(uptime, 2),
        video_count=video_count,
        media_dir=str(VIDEO_DIR),
        media_dir_exists=dir_exists,
        timestamp=datetime.now(timezone.utc).isoformat(),
        instance_name=INSTANCE_NAME
    )


@router.get("/live")
def get_liveness():
    """Liveness probe indicating the ASGI process is running and responding."""
    uptime = time.time() - START_TIME
    return {
        "status": "live",
        "service": "StreamOps Video Streaming Backend",
        "uptime_seconds": round(uptime, 2),
        "instance_name": INSTANCE_NAME
    }


@router.get("/ready")
def get_readiness():
    """Readiness probe verifying core request-serving prerequisites (media storage accessibility)."""
    dir_exists = VIDEO_DIR.exists() and VIDEO_DIR.is_dir()
    if not dir_exists:
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=503,
            content={
                "status": "not_ready",
                "detail": "Media directory is inaccessible",
                "instance_name": INSTANCE_NAME
            }
        )
    return {
        "status": "ready",
        "service": "StreamOps Video Streaming Backend",
        "media_accessible": True,
        "instance_name": INSTANCE_NAME
    }

