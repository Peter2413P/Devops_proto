import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.config import INSTANCE_NAME


def test_metrics_endpoint_returns_prometheus_format(client: TestClient):
    """Verify /metrics returns 200 OK with Prometheus exposition content type."""
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "text/plain" in response.headers["content-type"]
    assert "charset=utf-8" in response.headers["content-type"]
    
    content = response.text
    assert "streamops_http_requests_total" in content
    assert "streamops_http_request_duration_seconds" in content
    assert "streamops_http_requests_in_progress" in content
    assert "streamops_build_info" in content


def test_request_increments_counter_and_records_labels(client: TestClient):
    """Verify application request increments streamops_http_requests_total with correct labels."""
    # Send request to /api/health
    resp = client.get("/api/health")
    assert resp.status_code == 200

    metrics_resp = client.get("/metrics")
    assert metrics_resp.status_code == 200
    content = metrics_resp.text

    # Expected metric label combination
    expected_metric_pattern = (
        f'streamops_http_requests_total{{instance="{INSTANCE_NAME}",'
        f'method="GET",route="/api/health",status_code="200"}}'
    )
    assert expected_metric_pattern in content


def test_route_normalization_prevents_cardinality_explosion(client: TestClient):
    """
    Verify route normalization uses path templates (e.g., /api/videos/{video_id})
    and never raw video IDs or dynamic params.
    """
    # Request video details with dynamic ID
    resp = client.get("/api/videos/sample")
    assert resp.status_code in (200, 404)

    metrics_resp = client.get("/metrics")
    content = metrics_resp.text

    # Must contain normalized template /api/videos/{video_id}
    assert 'route="/api/videos/{video_id}"' in content
    # Must NOT have raw path with ID as route label
    assert 'route="/api/videos/sample"' not in content


def test_video_stream_route_normalization(client: TestClient):
    """Verify video streaming endpoint is normalized to /api/videos/{video_id}/stream."""
    resp = client.get(
        "/api/videos/sample/stream",
        headers={"Range": "bytes=0-100"}
    )
    assert resp.status_code == 206

    metrics_resp = client.get("/metrics")
    content = metrics_resp.text

    assert 'route="/api/videos/{video_id}/stream"' in content
    assert 'status_code="206"' in content
    assert 'route="/api/videos/sample/stream"' not in content


def test_metrics_endpoint_excluded_from_request_counter(client: TestClient):
    """Verify /metrics itself does not generate recursive metric counters."""
    # Scrape metrics multiple times
    client.get("/metrics")
    client.get("/metrics")
    
    resp = client.get("/metrics")
    content = resp.text

    # Route should not have /metrics counter entry
    assert 'route="/metrics"' not in content


def test_unmatched_route_recorded_safely(client: TestClient):
    """Verify 404 on unmapped route is categorized as 'unmatched' without unbounded labels."""
    resp = client.get("/nonexistent-arbitrary-url-999")
    assert resp.status_code == 404

    metrics_resp = client.get("/metrics")
    content = metrics_resp.text

    assert 'route="unmatched"' in content
    assert 'nonexistent-arbitrary-url-999' not in content


def test_in_progress_gauge_returns_to_zero(client: TestClient):
    """Verify in-progress requests gauge returns to 0 when requests are complete."""
    client.get("/api/health")
    
    metrics_resp = client.get("/metrics")
    content = metrics_resp.text
    
    expected_gauge = f'streamops_http_requests_in_progress{{instance="{INSTANCE_NAME}"}} 0.0'
    assert expected_gauge in content


def test_build_info_metric_present(client: TestClient):
    """Verify build_info metric exposes instance and version info."""
    metrics_resp = client.get("/metrics")
    content = metrics_resp.text
    
    assert f'streamops_build_info{{instance="{INSTANCE_NAME}",service="streamops-backend",version="1.0.0"}} 1.0' in content
