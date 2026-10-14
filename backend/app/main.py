import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import FRONTEND_ORIGINS, VIDEO_DIR, validate_config, LOG_LEVEL, INSTANCE_NAME
from .metrics import (
    prometheus_metrics_middleware,
    generate_latest,
    REGISTRY,
    CONTENT_TYPE_LATEST
)
from .routes.health import router as health_router
from .routes.videos import router as videos_router
from .services.video_catalog import catalog_service

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("streamops")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup validation
    diagnostics = validate_config()
    logger.info("Initializing StreamOps Backend (%s)...", INSTANCE_NAME)
    logger.info("Configured media directory: %s", diagnostics["video_dir"])

    if not diagnostics["video_dir_exists"]:
        logger.warning(
            "Media directory does not exist! Creating: %s",
            diagnostics["video_dir"]
        )
        catalog_service.ensure_media_dir()
    else:
        video_count = len(catalog_service.get_video_files())
        logger.info(
            "Media directory verified. Discovered %d video(s).",
            video_count
        )

    logger.info("Allowed CORS origins: %s", FRONTEND_ORIGINS)
    yield
    logger.info("Shutting down StreamOps Backend...")

app = FastAPI(
    title="StreamOps Video Streaming Platform API",
    description="Real video streaming backend featuring catalogue discovery, metadata extraction, and HTTP Range streaming.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Range", "Accept-Ranges", "Content-Length", "Content-Type", "X-Backend-Instance"]
)

@app.middleware("http")
async def add_backend_instance_header(request: Request, call_next):
    """Attach the container instance identifier header to track load balancing."""
    response = await call_next(request)
    response.headers["X-Backend-Instance"] = INSTANCE_NAME
    return response

# Register Prometheus HTTP request metrics middleware
app.middleware("http")(prometheus_metrics_middleware)

# Register routes
app.include_router(health_router)
app.include_router(videos_router)

@app.get("/metrics", tags=["Monitoring"], include_in_schema=False)
def metrics_endpoint():
    """Prometheus exposition endpoint for scraping application metrics."""
    return Response(
        content=generate_latest(REGISTRY),
        media_type=CONTENT_TYPE_LATEST
    )


@app.get("/", tags=["Root"])
def root_status():
    """Root endpoint verifying API availability."""
    return {
        "service": "StreamOps Video Streaming Platform API",
        "version": "1.0.0",
        "status": "online",
        "endpoints": {
            "health": "/api/health",
            "videos": "/api/videos",
            "docs": "/docs"
        }
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global catch-all error handler ensuring consistent JSON error responses."""
    logger.error("Unhandled server exception at %s: %s", request.url, str(exc), exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "detail": "An unexpected server error occurred during request processing."
        }
    )
