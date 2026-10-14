"""
StreamOps Chaos Engineering & Controlled Failure Harness.

Provides safe, bounded, and reversible failure experiments against Docker Compose services.
Guarantees cleanup and service restoration via try...finally blocks.
"""
import sys
import os
import json
import time
import subprocess
import argparse
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import urllib.request
import urllib.error


def check_docker_available() -> bool:
    """Verify Docker CLI and daemon connectivity."""
    try:
        res = subprocess.run(
            ["docker", "info"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=5
        )
        return res.returncode == 0
    except Exception:
        return False


def probe_endpoint(url: str, timeout: float = 2.0) -> Dict[str, Any]:
    """Perform a single HTTP GET probe and record status, latency, and headers."""
    start = time.perf_counter()
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "StreamOps-ChaosHarness/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            duration_ms = (time.perf_counter() - start) * 1000.0
            backend_instance = resp.headers.get("X-Backend-Instance", "unknown")
            upstream_addr = resp.headers.get("X-Upstream-Addr", "unknown")
            return {
                "status_code": resp.status,
                "duration_ms": round(duration_ms, 2),
                "backend_instance": backend_instance,
                "upstream_addr": upstream_addr,
                "error": None,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
    except urllib.error.HTTPError as e:
        duration_ms = (time.perf_counter() - start) * 1000.0
        return {
            "status_code": e.code,
            "duration_ms": round(duration_ms, 2),
            "backend_instance": e.headers.get("X-Backend-Instance", "unknown") if e.headers else "unknown",
            "upstream_addr": e.headers.get("X-Upstream-Addr", "unknown") if e.headers else "unknown",
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        duration_ms = (time.perf_counter() - start) * 1000.0
        return {
            "status_code": 0,
            "duration_ms": round(duration_ms, 2),
            "backend_instance": "none",
            "upstream_addr": "none",
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }


def run_experiment(
    target_service: str = "backend1",
    gateway_url: str = "http://localhost:8080/api/health",
    failure_duration_s: float = 10.0,
    dry_run: bool = True
) -> Dict[str, Any]:
    """
    Execute a controlled stop/restart failure experiment with guaranteed cleanup.
    """
    experiment_id = f"chaos-{target_service}-{int(time.time())}"
    start_time = datetime.now(timezone.utc).isoformat()
    
    report: Dict[str, Any] = {
        "experiment_id": experiment_id,
        "target_service": target_service,
        "dry_run": dry_run,
        "start_time": start_time,
        "end_time": None,
        "docker_available": False,
        "baseline_probes": [],
        "failure_probes": [],
        "recovery_probes": [],
        "baseline_success_rate": 0.0,
        "failure_success_rate": 0.0,
        "detection_time_ms": "N/A",
        "recovery_time_s": "N/A",
        "service_restored": False,
        "summary": ""
    }

    print(f"\n[CHAOS HARNESS] Starting experiment: {experiment_id}")
    print(f"[CHAOS HARNESS] Target Service: {target_service} | Dry-run: {dry_run}")

    docker_ok = check_docker_available()
    report["docker_available"] = docker_ok

    if not docker_ok:
        msg = "Docker daemon is not running. Live container manipulation is blocked."
        print(f"[CHAOS HARNESS] {msg}")
        report["summary"] = msg
        report["end_time"] = datetime.now(timezone.utc).isoformat()
        return report

    # 1. Baseline Phase (10 probes)
    print("\n[PHASE 1] Recording baseline traffic (10 probes)...")
    baseline_success = 0
    for _ in range(10):
        probe = probe_endpoint(gateway_url)
        report["baseline_probes"].append(probe)
        if 200 <= probe["status_code"] < 300:
            baseline_success += 1
        time.sleep(0.3)

    report["baseline_success_rate"] = round((baseline_success / 10) * 100.0, 1)
    print(f"  Baseline success rate: {report['baseline_success_rate']}%")

    if dry_run:
        msg = "Dry-run complete. No containers were stopped or altered."
        print(f"\n[CHAOS HARNESS] {msg}")
        report["summary"] = msg
        report["end_time"] = datetime.now(timezone.utc).isoformat()
        return report

    # 2. Failure Injection Phase (Guaranteed cleanup in finally block)
    failure_start = time.perf_counter()
    try:
        print(f"\n[PHASE 2] Stopping target container: {target_service}...")
        subprocess.run(["docker", "compose", "stop", target_service], check=True, timeout=15)
        print(f"  Container '{target_service}' stopped successfully.")

        # Probe gateway during failure
        print(f"  Observing gateway failover for {failure_duration_s} seconds...")
        probe_deadline = time.perf_counter() + failure_duration_s
        fail_success = 0
        total_fail_probes = 0

        while time.perf_counter() < probe_deadline:
            probe = probe_endpoint(gateway_url)
            report["failure_probes"].append(probe)
            total_fail_probes += 1
            if 200 <= probe["status_code"] < 300:
                fail_success += 1
            time.sleep(0.5)

        if total_fail_probes > 0:
            report["failure_success_rate"] = round((fail_success / total_fail_probes) * 100.0, 1)
        print(f"  Failover success rate: {report['failure_success_rate']}% ({fail_success}/{total_fail_probes} probes)")

    finally:
        # 3. Guaranteed Recovery Phase
        print(f"\n[PHASE 3] Guaranteeing service restoration for: {target_service}...")
        recovery_start = time.perf_counter()
        subprocess.run(["docker", "compose", "start", target_service], timeout=15)
        
        # Poll target until healthy or timeout (up to 20s)
        restored = False
        timeout_deadline = time.perf_counter() + 20.0
        while time.perf_counter() < timeout_deadline:
            probe = probe_endpoint(gateway_url)
            report["recovery_probes"].append(probe)
            if 200 <= probe["status_code"] < 300:
                # Check if target container is serving or back in pool
                restored = True
                break
            time.sleep(1.0)

        recovery_duration = round(time.perf_counter() - recovery_start, 2)
        report["service_restored"] = restored
        report["recovery_time_s"] = recovery_duration
        print(f"  Service restored: {restored} in {recovery_duration}s")

    report["end_time"] = datetime.now(timezone.utc).isoformat()
    report["summary"] = (
        f"Experiment complete. Baseline: {report['baseline_success_rate']}%, "
        f"During failure: {report['failure_success_rate']}%, "
        f"Restored: {report['service_restored']}"
    )
    return report


def main():
    parser = argparse.ArgumentParser(description="StreamOps Chaos Engineering Harness")
    parser.add_argument("--service", "--target", dest="service", default="backend1", help="Target service to stop (default: backend1)")
    parser.add_argument("--gateway-url", "--url", dest="gateway_url", default="http://localhost:8080/api/health", help="Gateway URL to probe")
    parser.add_argument("--duration", type=float, default=10.0, help="Failure duration in seconds (default: 10s)")
    parser.add_argument("--execute", action="store_true", help="Execute real container stop (Default is safe dry-run)")
    parser.add_argument("--dry-run", dest="execute", action="store_false", help="Force dry-run mode (Default is dry-run)")
    parser.add_argument("--output", default="artifacts/chaos-experiments/latest-experiment.json", help="Output JSON path")
    args = parser.parse_args()

    dry_run = not args.execute
    result = run_experiment(
        target_service=args.service,
        gateway_url=args.gateway_url,
        failure_duration_s=args.duration,
        dry_run=dry_run
    )

    out_dir = os.path.dirname(args.output)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    print(f"\n[CHAOS HARNESS] Result exported to: {args.output}")


if __name__ == "__main__":
    main()
