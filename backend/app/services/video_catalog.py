import os
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional, Tuple, Dict
from ..config import VIDEO_DIR
from ..models.video import VideoMetadata, VideoCatalogResponse

SUPPORTED_EXTENSIONS = {".mp4", ".webm", ".mkv", ".mov"}

CONTENT_TYPES: Dict[str, str] = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mkv": "video/x-matroska",
    ".mov": "video/quicktime",
}

def format_file_size(size_bytes: int) -> str:
    """Format file size in bytes to human-readable format."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    elif size_bytes < 1024 * 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
    else:
        return f"{size_bytes / (1024 * 1024 * 1024):.2f} GB"

def sanitize_id(filename: str) -> str:
    """Create a URL-safe video identifier from filename."""
    stem = Path(filename).stem
    # Replace non-alphanumeric chars with hyphens
    slug = re.sub(r"[^a-zA-Z0-9_-]", "-", stem).strip("-").lower()
    return slug or "video"

def humanize_title(filename: str) -> str:
    """Derive a clean, human-readable title from a video filename."""
    stem = Path(filename).stem
    words = re.split(r"[-_.\s]+", stem)
    title = " ".join(word.capitalize() for word in words if word)
    return title or "Untitled Video"

class VideoCatalogService:
    def __init__(self, media_dir: Optional[Path] = None):
        self.media_dir = media_dir or VIDEO_DIR

    def ensure_media_dir(self) -> bool:
        """Ensure the media directory exists."""
        try:
            self.media_dir.mkdir(parents=True, exist_ok=True)
            return True
        except Exception:
            return False

    def get_video_files(self) -> List[Path]:
        """Discover valid video files within the media directory."""
        if not self.media_dir.exists() or not self.media_dir.is_dir():
            return []

        discovered = []
        for file_path in sorted(self.media_dir.iterdir()):
            if file_path.is_file() and file_path.suffix.lower() in SUPPORTED_EXTENSIONS:
                discovered.append(file_path)
        return discovered

    def get_catalog(self) -> VideoCatalogResponse:
        """Scan directory and return complete video catalogue."""
        files = self.get_video_files()
        videos: List[VideoMetadata] = []
        used_ids = set()

        for file_path in files:
            base_id = sanitize_id(file_path.name)
            # Ensure unique IDs even if files have similar names
            video_id = base_id
            counter = 2
            while video_id in used_ids:
                video_id = f"{base_id}-{counter}"
                counter += 1
            used_ids.add(video_id)

            metadata = self._build_metadata(file_path, video_id)
            if metadata:
                videos.append(metadata)

        return VideoCatalogResponse(
            total=len(videos),
            videos=videos,
            media_dir=str(self.media_dir)
        )

    def find_video_by_id(self, video_id: str) -> Optional[Tuple[VideoMetadata, Path]]:
        """Look up a video by its unique ID, safely resolving path."""
        catalog = self.get_catalog()
        for meta in catalog.videos:
            if meta.id == video_id:
                file_path = (self.media_dir / meta.filename).resolve()
                # Verify path security (must stay within media_dir)
                if self._is_safe_path(file_path):
                    return meta, file_path
        return None

    def _build_metadata(self, file_path: Path, video_id: str) -> Optional[VideoMetadata]:
        try:
            stat = file_path.stat()
            ext = file_path.suffix.lower()
            size_bytes = stat.st_size
            mod_time = datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat()

            return VideoMetadata(
                id=video_id,
                filename=file_path.name,
                title=humanize_title(file_path.name),
                file_size_bytes=size_bytes,
                file_size_formatted=format_file_size(size_bytes),
                format=ext.lstrip(".").upper(),
                content_type=CONTENT_TYPES.get(ext, "application/octet-stream"),
                modified_at=mod_time,
                stream_url=f"/api/videos/{video_id}/stream"
            )
        except Exception:
            return None

    def _is_safe_path(self, target_path: Path) -> bool:
        """Ensure resolved path resides strictly inside media_dir."""
        try:
            resolved_target = target_path.resolve()
            resolved_media = self.media_dir.resolve()
            return resolved_target.is_relative_to(resolved_media) and resolved_target.exists()
        except (ValueError, AttributeError):
            # Fallback for Python versions or edge cases
            try:
                resolved_target.relative_to(resolved_media)
                return resolved_target.exists()
            except Exception:
                return False

catalog_service = VideoCatalogService()
