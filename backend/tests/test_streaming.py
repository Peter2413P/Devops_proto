def test_stream_full_video_no_range(client, sample_video_id):
    """Test standard video stream request without Range header returns 200 OK."""
    response = client.get(f"/api/videos/{sample_video_id}/stream")
    assert response.status_code == 200
    assert response.headers["accept-ranges"] == "bytes"
    assert "content-length" in response.headers
    assert response.headers["content-type"] == "video/mp4"

    content = response.content
    assert len(content) == int(response.headers["content-length"])
    assert len(content) > 0

def test_stream_video_head_request(client, sample_video_id):
    """Test HEAD request returns streaming headers with empty body."""
    response = client.head(f"/api/videos/{sample_video_id}/stream")
    assert response.status_code == 200
    assert response.headers["accept-ranges"] == "bytes"
    assert "content-length" in response.headers
    assert response.content == b""

def test_stream_video_initial_range_request(client, sample_video_id):
    """Test HTTP Range request from start: Range: bytes=0-1023 returns 206 Partial Content."""
    headers = {"Range": "bytes=0-1023"}
    response = client.get(f"/api/videos/{sample_video_id}/stream", headers=headers)

    assert response.status_code == 206
    assert response.headers["accept-ranges"] == "bytes"
    assert response.headers["content-length"] == "1024"
    assert response.headers["content-range"].startswith("bytes 0-1023/")

    content = response.content
    assert len(content) == 1024

def test_stream_video_mid_range_request(client, sample_video_id):
    """Test seeking: Range: bytes=500-1499 returns exact 1000 bytes."""
    headers = {"Range": "bytes=500-1499"}
    response = client.get(f"/api/videos/{sample_video_id}/stream", headers=headers)

    assert response.status_code == 206
    assert response.headers["content-length"] == "1000"
    assert response.headers["content-range"].startswith("bytes 500-1499/")
    assert len(response.content) == 1000

def test_stream_video_open_ended_range_request(client, sample_video_id):
    """Test open ended range: Range: bytes=1000- returns partial content from offset 1000 to end."""
    headers = {"Range": "bytes=1000-"}
    response = client.get(f"/api/videos/{sample_video_id}/stream", headers=headers)

    assert response.status_code == 206
    assert response.headers["content-range"].startswith("bytes 1000-")
    assert int(response.headers["content-length"]) > 0

def test_stream_video_invalid_range_exceeds_filesize(client, sample_video_id):
    """Test out-of-bounds Range header returns 416 Range Not Satisfiable."""
    headers = {"Range": "bytes=99999999-999999999"}
    response = client.get(f"/api/videos/{sample_video_id}/stream", headers=headers)

    assert response.status_code == 416
    assert "content-range" in response.headers
    assert response.headers["content-range"].startswith("bytes */")

def test_stream_video_malformed_range(client, sample_video_id):
    """Test malformed Range header returns 416 Range Not Satisfiable."""
    headers = {"Range": "bytes=malformed-data"}
    response = client.get(f"/api/videos/{sample_video_id}/stream", headers=headers)

    assert response.status_code == 416

def test_stream_non_existent_video_returns_404(client):
    """Test streaming non-existent video ID returns 404 Not Found."""
    response = client.get("/api/videos/non_existent_id_000/stream")
    assert response.status_code == 404
