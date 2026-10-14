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


def test_single_backend_failover_and_continuity(require_gateway, gateway_url):
    """
    Controlled failover test: Stops backend1, verifies gateway continues routing
    traffic to backend2, and ensures backend1 is restored in a finally block.
    """
    if not is_docker_daemon_running():
        pytest.skip("Docker daemon is not running. Failover container execution requires an active Docker daemon.")

    # 1. Baseline check: verify gateway is healthy
    req = urllib.request.Request(f"{gateway_url}/api/health")
    with urllib.request.urlopen(req, timeout=3.0) as resp:
        assert resp.status == 200

    target = "backend1"
    try:
        # 2. Stop backend1
        res = subprocess.run(["docker", "compose", "stop", target], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=15)
        assert res.returncode == 0, f"Failed to stop {target}"

        # Allow brief moment for NGINX upstream failure detection
        time.sleep(1.0)

        # 3. Probe gateway - should be served by backend2
        failover_success = 0
        for _ in range(5):
            try:
                probe_req = urllib.request.Request(f"{gateway_url}/api/health")
                with urllib.request.urlopen(probe_req, timeout=3.0) as p_resp:
                    if p_resp.status == 200:
                        failover_success += 1
                        inst = p_resp.headers.get("X-Backend-Instance")
                        # Must be handled by backend2 while backend1 is stopped
                        assert inst == "backend2"
            except Exception:
                pass
            time.sleep(0.5)

        assert failover_success >= 3, "Gateway must maintain availability via backend2 during backend1 downtime"

    finally:
        # 4. Guaranteed cleanup: restart backend1
        subprocess.run(["docker", "compose", "start", target], stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=15)
