def test_health_check_endpoint(client):
    """Test that /api/health returns 200 with accurate operational diagnostics."""
    response = client.get("/api/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert data["service"] == "StreamOps Video Streaming Backend"
    assert data["version"] == "1.0.0"
    assert isinstance(data["uptime_seconds"], (int, float))
    assert data["uptime_seconds"] >= 0
    assert isinstance(data["video_count"], int)
    assert data["video_count"] >= 1
    assert data["media_dir_exists"] is True
    assert "timestamp" in data
    assert "instance_name" in data
    assert "x-backend-instance" in response.headers

def test_root_endpoint(client):
    """Test that / returns 200 with service information and endpoint links."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "endpoints" in data


def test_liveness_endpoint(client):
    """Test that /api/health/live returns 200 with process liveness state."""
    response = client.get("/api/health/live")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "live"
    assert "uptime_seconds" in data
    assert "instance_name" in data


def test_readiness_endpoint(client):
    """Test that /api/health/ready returns 200 when media directory is accessible."""
    response = client.get("/api/health/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["media_accessible"] is True
    assert "instance_name" in data

