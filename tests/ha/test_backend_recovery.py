import subprocess
import time
import urllib.request
import pytest

def is_docker_daemon_running():
    try:
        res = subprocess.run(["docker", "info"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=4)
        return res.returncode == 0
    except Exception:
        return False


def test_backend_recovery_verification(require_gateway, gateway_url):
    """
    Verifies that a restarted backend instance recovers readiness and resumes
    serving traffic without lingering failure state.
    """
    if not is_docker_daemon_running():
        pytest.skip("Docker daemon is not running. Live recovery verification requires active Docker daemon.")

    target = "backend1"
    try:
        # Stop and restart
        subprocess.run(["docker", "compose", "stop", target], check=True, timeout=15)
        time.sleep(1.0)
    finally:
        subprocess.run(["docker", "compose", "start", target], check=True, timeout=15)

    # Poll gateway until both replicas are seen or bounded timeout (15s)
    instances_seen = set()
    deadline = time.time() + 15.0
    while time.time() < deadline:
        try:
            req = urllib.request.Request(f"{gateway_url}/api/health")
            with urllib.request.urlopen(req, timeout=2.0) as resp:
                if resp.status == 200:
                    inst = resp.headers.get("X-Backend-Instance")
                    if inst:
                        instances_seen.add(inst)
                    if "backend1" in instances_seen:
                        break
        except Exception:
            pass
        time.sleep(0.5)

    assert "backend1" in instances_seen, "Restarted backend1 must re-join upstream pool and serve requests"
