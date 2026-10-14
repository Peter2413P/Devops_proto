"""
StreamOps HTTP Load Testing & Range Streaming Runner.

Executes real concurrent HTTP workloads and Range streaming checks against the StreamOps
gateway or standalone backend, recording latencies and backend replica distribution.
Outputs k6-compatible JSON summaries that feed directly into reliability_report.py.
"""
import sys
import os
import json
import time
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, Any, List, Optional
import urllib.request
import urllib.error


def execute_request(url: str, headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    """Execute a single HTTP request and record response metadata."""
    req_headers = {"User-Agent": "StreamOps-LoadRunner/1.0"}
    if headers:
        req_headers.update(headers)

    start = time.perf_counter()
    try:
        req = urllib.request.Request(url, headers=req_headers)
        with urllib.request.urlopen(req, timeout=5.0) as resp:
            body = resp.read()
            duration_ms = (time.perf_counter() - start) * 1000.0
            return {
                "status_code": resp.status,
                "duration_ms": round(duration_ms, 2),
                "bytes_received": len(body),
                "backend_instance": resp.headers.get("X-Backend-Instance", "unknown"),
                "content_range": resp.headers.get("Content-Range", None),
                "error": None
            }
    except urllib.error.HTTPError as e:
        duration_ms = (time.perf_counter() - start) * 1000.0
        body = e.read()
        return {
            "status_code": e.code,
            "duration_ms": round(duration_ms, 2),
            "bytes_received": len(body),
            "backend_instance": e.headers.get("X-Backend-Instance", "unknown") if e.headers else "unknown",
            "content_range": e.headers.get("Content-Range", None) if e.headers else None,
            "error": str(e)
        }
    except Exception as e:
        duration_ms = (time.perf_counter() - start) * 1000.0
        return {
            "status_code": 0,
            "duration_ms": round(duration_ms, 2),
            "bytes_received": 0,
            "backend_instance": "none",
            "content_range": None,
            "error": str(e)
        }


def run_workload(
    base_url: str,
    profile: str = "smoke",
    total_requests: int = 30,
    concurrency: int = 5,
    video_id: str = "sample"
) -> Dict[str, Any]:
    """Execute a concurrent load workload and collect operational telemetry."""
    print(f"\n[LOAD RUNNER] Profile: '{profile.upper()}' | Target: {base_url}")
    print(f"[LOAD RUNNER] Concurrency: {concurrency} workers | Total requests: {total_requests}")

    start_time = time.time()
    results: List[Dict[str, Any]] = []

    def task_worker(req_idx: int) -> Dict[str, Any]:
        if profile == "smoke":
            # Round-robin between health, videos, and a range chunk
            mod = req_idx % 3
            if mod == 0:
                return execute_request(f"{base_url}/api/health")
            elif mod == 1:
                return execute_request(f"{base_url}/api/videos")
            else:
                return execute_request(
                    f"{base_url}/api/videos/{video_id}/stream",
                    {"Range": "bytes=0-1023"}
                )
        elif profile == "streaming":
            # Test 1 KB chunk, 16 KB seeking chunk, and 416 invalid chunk
            mod = req_idx % 3
            if mod == 0:
                return execute_request(
                    f"{base_url}/api/videos/{video_id}/stream",
                    {"Range": "bytes=0-1023"}
                )
            elif mod == 1:
                return execute_request(
                    f"{base_url}/api/videos/{video_id}/stream",
                    {"Range": "bytes=40960-57343"}
                )
            else:
                return execute_request(
                    f"{base_url}/api/videos/{video_id}/stream",
                    {"Range": "bytes=999999999-"}
                )
        else: # general load
            return execute_request(f"{base_url}/api/health")

    with ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = [executor.submit(task_worker, i) for i in range(total_requests)]
        for f in as_completed(futures):
            results.append(f.result())

    duration_s = max(0.001, time.time() - start_time)

    # Aggregate stats
    successful = sum(1 for r in results if 200 <= r["status_code"] < 300 or r["status_code"] == 416)
    failed = len(results) - successful
    latencies = [r["duration_ms"] for r in results]
    latencies.sort()

    backend_dist: Dict[str, int] = {}
    for r in results:
        b = r.get("backend_instance", "unknown")
        backend_dist[b] = backend_dist.get(b, 0) + 1

    avg_lat = round(sum(latencies) / len(latencies), 2) if latencies else 0.0
    p95_lat = round(latencies[int(len(latencies) * 0.95)], 2) if latencies else 0.0

    print(f"[LOAD RUNNER] Finished in {duration_s:.2f}s")
    print(f"  Total: {len(results)} | Successful: {successful} | Failed: {failed}")
    print(f"  Avg Latency: {avg_lat} ms | p95 Latency: {p95_lat} ms")
    print(f"  Backend Distribution: {backend_dist}")

    return {
        "profile": profile,
        "base_url": base_url,
        "total_requests": len(results),
        "duration_seconds": round(duration_s, 2),
        "req_per_sec": round(len(results) / duration_s, 2),
        "metrics": {
            "http_reqs": {"count": len(results)},
            "http_req_failed": {"passes": failed, "fails": successful},
            "http_req_duration": {"avg": avg_lat, "p(95)": p95_lat}
        },
        "results": results,
        "backend_distribution": backend_dist
    }


def main():
    parser = argparse.ArgumentParser(description="StreamOps HTTP Load Testing Runner")
    parser.add_argument("--url", default="http://localhost:8080", help="Base URL (default: http://localhost:8080)")
    parser.add_argument("--profile", choices=["smoke", "load", "streaming"], default="smoke", help="Workload profile")
    parser.add_argument("--requests", type=int, default=30, help="Total requests to dispatch")
    parser.add_argument("--concurrency", type=int, default=5, help="Concurrent client workers")
    parser.add_argument("--video-id", default="sample", help="Target video ID for streaming tests")
    parser.add_argument("--output", default="artifacts/load-tests/load-summary.json", help="Summary JSON output path")
    args = parser.parse_args()

    summary = run_workload(
        base_url=args.url,
        profile=args.profile,
        total_requests=args.requests,
        concurrency=args.concurrency,
        video_id=args.video_id
    )

    out_dir = os.path.dirname(args.output)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print(f"[LOAD RUNNER] Summary exported to: {args.output}")


if __name__ == "__main__":
    main()
