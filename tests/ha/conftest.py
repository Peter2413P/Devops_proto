import pytest
import os
import urllib.request

GATEWAY_URL = os.getenv("GATEWAY_URL", "http://localhost:8080")

@pytest.fixture(scope="session")
def gateway_url():
    return GATEWAY_URL

@pytest.fixture
def require_gateway(gateway_url):
    """Skip test if the live NGINX gateway is not accessible."""
    try:
        req = urllib.request.Request(f"{gateway_url}/healthz", headers={"User-Agent": "HATest/1.0"})
        with urllib.request.urlopen(req, timeout=1.5) as resp:
            if resp.status == 200:
                return True
    except Exception as e:
        pytest.skip(f"Live StreamOps gateway not reachable at {gateway_url} ({e}). Start Docker with 'docker compose up -d'.")
