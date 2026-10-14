import pytest
from pathlib import Path
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.video_catalog import catalog_service

@pytest.fixture(scope="session")
def client():
    """Shared FastAPI TestClient instance."""
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture(scope="session")
def sample_video_id(client):
    """Retrieve an actual discovered video ID from the running catalog."""
    res = client.get("/api/videos")
    data = res.json()
    assert data["total"] > 0, "At least one video must exist in media/ for testing"
    return data["videos"][0]["id"]
