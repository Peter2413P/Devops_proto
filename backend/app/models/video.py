from pydantic import BaseModel
from typing import List, Optional

class VideoMetadata(BaseModel):
    id: str
    filename: str
    title: str
    file_size_bytes: int
    file_size_formatted: str
    format: str
    content_type: str
    modified_at: str
    stream_url: str

class VideoCatalogResponse(BaseModel):
    total: int
    videos: List[VideoMetadata]
    media_dir: str

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    uptime_seconds: float
    video_count: int
    media_dir: str
    media_dir_exists: bool
    timestamp: str
    instance_name: Optional[str] = None

class ErrorResponse(BaseModel):
    error: str
    detail: str
