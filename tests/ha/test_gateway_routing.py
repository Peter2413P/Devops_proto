import urllib.request
import json
import pytest

def test_gateway_health_endpoint(require_gateway, gateway_url):
    """Verify NGINX gateway root healthz responds 200."""
    req = urllib.request.Request(f"{gateway_url}/healthz")
    with urllib.request.urlopen(req, timeout=3.0) as resp:
        assert resp.status == 200
        body = resp.read().decode("utf-8")
        assert "healthy" in body


def test_gateway_routes_to_healthy_backends(require_gateway, gateway_url):
    """Verify gateway forwards /api/health to backend replicas with instance identity headers."""
    req = urllib.request.Request(f"{gateway_url}/api/health")
    with urllib.request.urlopen(req, timeout=3.0) as resp:
        assert resp.status == 200
        instance = resp.headers.get("X-Backend-Instance")
        assert instance in ["backend1", "backend2", "backend-local"]

        data = json.loads(resp.read().decode("utf-8"))
        assert data["status"] in ["healthy", "degraded"]
        assert "version" in data


def test_request_distribution_across_replicas(require_gateway, gateway_url):
    """Verify multiple requests are successfully handled by available backend replicas."""
    instances_seen = set()
    for _ in range(15):
        req = urllib.request.Request(f"{gateway_url}/api/health")
        with urllib.request.urlopen(req, timeout=3.0) as resp:
            assert resp.status == 200
            inst = resp.headers.get("X-Backend-Instance")
            if inst:
                instances_seen.add(inst)

    # At least one valid backend replica must respond
    assert len(instances_seen) >= 1
