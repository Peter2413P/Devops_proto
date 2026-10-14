import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

def test_full_catalog_and_stream_workflow(client):
    """
    End-to-end integration test:
    1. Check backend health.
    2. Discover catalogue.
    3. Retrieve individual video metadata.
    4. Request partial stream via HTTP Range.
    5. Verify seeking across multiple byte boundaries.
    """
    # 1. Health check
    health_res = client.get("/api/health")
    assert health_res.status_code == 200
    health = health_res.json()
    assert health["status"] == "healthy"
    assert health["video_count"] >= 1

    # 2. Catalog listing
    catalog_res = client.get("/api/videos")
    assert catalog_res.status_code == 200
    catalog = catalog_res.json()
    assert catalog["total"] >= 1

    first_video = catalog["videos"][0]
    vid_id = first_video["id"]

    # 3. Video metadata check
    meta_res = client.get(f"/api/videos/{vid_id}")
    assert meta_res.status_code == 200
    meta = meta_res.json()
    assert meta["filename"] == first_video["filename"]
    assert meta["file_size_bytes"] == first_video["file_size_bytes"]

    # 4. Stream initial chunk (0-2047)
    range_res1 = client.get(f"/api/videos/{vid_id}/stream", headers={"Range": "bytes=0-2047"})
    assert range_res1.status_code == 206
    assert len(range_res1.content) == 2048
    assert range_res1.headers["content-range"].startswith("bytes 0-2047/")

    # 5. Stream seek chunk (100000-104095)
    range_res2 = client.get(f"/api/videos/{vid_id}/stream", headers={"Range": "bytes=100000-104095"})
    assert range_res2.status_code == 206
    assert len(range_res2.content) == 4096
    assert range_res2.headers["content-range"].startswith("bytes 100000-104095/")

    # 6. Stream last 1024 bytes (suffix range)
    range_res3 = client.get(f"/api/videos/{vid_id}/stream", headers={"Range": "bytes=-1024"})
    assert range_res3.status_code == 206
    assert len(range_res3.content) == 1024
