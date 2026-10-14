def test_list_videos_catalog(client):
    """Test discovering and listing video files from the media directory."""
    response = client.get("/api/videos")
    assert response.status_code == 200

    data = response.json()
    assert "total" in data
    assert "videos" in data
    assert data["total"] >= 1
    assert len(data["videos"]) == data["total"]

    for video in data["videos"]:
        assert "id" in video
        assert "filename" in video
        assert "title" in video
        assert "file_size_bytes" in video
        assert video["file_size_bytes"] > 0
        assert "file_size_formatted" in video
        assert "format" in video
        assert "content_type" in video
        assert "modified_at" in video
        assert "stream_url" in video
        assert video["stream_url"].startswith("/api/videos/")

def test_get_video_details_success(client, sample_video_id):
    """Test retrieving metadata for an existing video ID."""
    response = client.get(f"/api/videos/{sample_video_id}")
    assert response.status_code == 200

    data = response.json()
    assert data["id"] == sample_video_id
    assert data["file_size_bytes"] > 0
    assert data["content_type"] == "video/mp4"

def test_get_video_details_not_found(client):
    """Test that requesting a non-existent video ID returns 404."""
    response = client.get("/api/videos/non_existent_video_99999")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
