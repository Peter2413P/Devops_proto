from typing import Optional
from fastapi import APIRouter, Header, HTTPException, status, Request
from fastapi.responses import Response
from ..models.video import VideoCatalogResponse, VideoMetadata
from ..services.video_catalog import catalog_service
from ..services.video_stream import create_video_streaming_response

router = APIRouter(prefix="/api/videos", tags=["Videos"])

@router.get("", response_model=VideoCatalogResponse)
def list_videos():
    """Discover and return all video files found in the configured media directory."""
    return catalog_service.get_catalog()

@router.get("/{video_id}", response_model=VideoMetadata)
def get_video_details(video_id: str):
    """Retrieve metadata for a specific video by ID."""
    result = catalog_service.find_video_by_id(video_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Video with ID '{video_id}' was not found in the catalog."
        )
    meta, _ = result
    return meta

@router.get("/{video_id}/stream")
def stream_video(
    video_id: str,
    range: Optional[str] = Header(None, alias="Range")
):
    """
    Stream video file with support for HTTP Range requests (seeking, partial content).
    Returns 206 Partial Content when Range header is provided, or 200 OK for full stream.
    """
    result = catalog_service.find_video_by_id(video_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Video with ID '{video_id}' was not found for playback."
        )
    meta, file_path = result
    return create_video_streaming_response(
        file_path=file_path,
        content_type=meta.content_type,
        range_header=range
    )

@router.head("/{video_id}/stream")
def stream_video_head(video_id: str):
    """Allow players and browsers to probe headers prior to streaming."""
    result = catalog_service.find_video_by_id(video_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Video with ID '{video_id}' was not found."
        )
    meta, file_path = result
    file_size = file_path.stat().st_size
    headers = {
        "Accept-Ranges": "bytes",
        "Content-Length": str(file_size),
        "Content-Type": meta.content_type,
        "Cache-Control": "no-cache",
    }
    return Response(content=b"", headers=headers)
