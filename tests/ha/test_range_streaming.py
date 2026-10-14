import urllib.request
import json
import pytest

def get_active_video_id(gateway_url: str) -> str:
    """Dynamically discover a valid video ID from the live catalogue."""
    req = urllib.request.Request(f"{gateway_url}/api/videos")
    with urllib.request.urlopen(req, timeout=3.0) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        if data.get("videos") and len(data["videos"]) > 0:
            return data["videos"][0]["id"]
    return "sample"


def test_range_streaming_initial_chunk(require_gateway, gateway_url):
    """Verify HTTP Range partial content streaming delivers exact 1024 bytes with status 206."""
    video_id = get_active_video_id(gateway_url)
    req = urllib.request.Request(
        f"{gateway_url}/api/videos/{video_id}/stream",
        headers={"Range": "bytes=0-1023"}
    )
    with urllib.request.urlopen(req, timeout=5.0) as resp:
        assert resp.status == 206
        cr = resp.headers.get("Content-Range", "")
        assert cr.startswith("bytes 0-1023/")
        body = resp.read()
        assert len(body) == 1024
        assert "video/" in resp.headers.get("Content-Type", "")


def test_range_streaming_seeking_chunk(require_gateway, gateway_url):
    """Verify HTTP Range seeking chunk delivers exact requested byte window."""
    video_id = get_active_video_id(gateway_url)
    req = urllib.request.Request(
        f"{gateway_url}/api/videos/{video_id}/stream",
        headers={"Range": "bytes=2048-4095"}
    )
    with urllib.request.urlopen(req, timeout=5.0) as resp:
        assert resp.status == 206
        cr = resp.headers.get("Content-Range", "")
        assert cr.startswith("bytes 2048-4095/")
        body = resp.read()
        assert len(body) == 2048


def test_range_streaming_invalid_range_returns_416(require_gateway, gateway_url):
    """Verify out-of-bounds byte range returns 416 Range Not Satisfiable."""
    video_id = get_active_video_id(gateway_url)
    req = urllib.request.Request(
        f"{gateway_url}/api/videos/{video_id}/stream",
        headers={"Range": "bytes=999999999-"}
    )
    try:
        urllib.request.urlopen(req, timeout=5.0)
        pytest.fail("Expected HTTP 416 error for out-of-bounds byte range")
    except urllib.error.HTTPError as e:
        assert e.code == 416
        cr = e.headers.get("Content-Range", "")
        assert cr.startswith("bytes */")
