import re
from pathlib import Path
from typing import Generator, Optional, Tuple
from fastapi import HTTPException, status
from fastapi.responses import StreamingResponse

CHUNK_SIZE = 256 * 1024  # 256 KB streaming chunks

def parse_range_header(range_header: Optional[str], file_size: int) -> Optional[Tuple[int, int]]:
    """
    Parse standard HTTP Range header.
    Format: 'bytes=start-end', 'bytes=start-', or 'bytes=-suffix'
    Returns (start, end) or None if no range header provided.
    Raises HTTPException(416) if range is invalid or unsatisfiable.
    """
    if not range_header or not range_header.startswith("bytes="):
        return None

    range_val = range_header[len("bytes="):].strip()
    match = re.match(r"^(\d*)-(\d*)$", range_val)

    if not match:
        raise HTTPException(
            status_code=status.HTTP_416_RANGE_NOT_SATISFIABLE,
            detail="Invalid Range header format.",
            headers={"Content-Range": f"bytes */{file_size}"}
        )

    start_str, end_str = match.groups()

    if not start_str and not end_str:
        raise HTTPException(
            status_code=status.HTTP_416_RANGE_NOT_SATISFIABLE,
            detail="Range header must contain start or end offset.",
            headers={"Content-Range": f"bytes */{file_size}"}
        )

    if start_str and end_str:
        start = int(start_str)
        end = int(end_str)
    elif start_str:
        start = int(start_str)
        end = file_size - 1
    else:
        # Suffix range: bytes=-500 (last 500 bytes)
        suffix_length = int(end_str)
        start = max(0, file_size - suffix_length)
        end = file_size - 1

    # Validation: range out of bounds
    if start < 0 or start >= file_size or start > end:
        raise HTTPException(
            status_code=status.HTTP_416_RANGE_NOT_SATISFIABLE,
            detail="Requested range not satisfiable.",
            headers={"Content-Range": f"bytes */{file_size}"}
        )

    # Clamp end to last byte of file
    end = min(end, file_size - 1)
    return start, end

def chunk_generator(file_path: Path, start: int, end: int, chunk_size: int = CHUNK_SIZE) -> Generator[bytes, None, None]:
    """Yield chunks of binary data from file between start and end inclusive."""
    bytes_remaining = (end - start) + 1
    with open(file_path, "rb") as f:
        f.seek(start)
        while bytes_remaining > 0:
            read_size = min(chunk_size, bytes_remaining)
            data = f.read(read_size)
            if not data:
                break
            bytes_remaining -= len(data)
            yield data

def create_video_streaming_response(
    file_path: Path,
    content_type: str,
    range_header: Optional[str] = None
) -> StreamingResponse:
    """Create a FastAPI StreamingResponse supporting HTTP Range requests."""
    file_size = file_path.stat().st_size

    if range_header:
        parsed_range = parse_range_header(range_header, file_size)
    else:
        parsed_range = None

    if parsed_range is not None:
        start, end = parsed_range
        content_length = (end - start) + 1
        headers = {
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(content_length),
            "Content-Type": content_type,
            "Cache-Control": "no-cache",
        }
        return StreamingResponse(
            chunk_generator(file_path, start, end),
            status_code=status.HTTP_206_PARTIAL_CONTENT,
            headers=headers
        )
    else:
        # Full content response
        headers = {
            "Accept-Ranges": "bytes",
            "Content-Length": str(file_size),
            "Content-Type": content_type,
            "Cache-Control": "no-cache",
        }
        return StreamingResponse(
            chunk_generator(file_path, 0, file_size - 1),
            status_code=status.HTTP_200_OK,
            headers=headers
        )
