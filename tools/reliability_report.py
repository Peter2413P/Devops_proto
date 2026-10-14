"""
StreamOps Reliability Report Generator.

Parses load test summaries, probe observations, and chaos experiment logs to produce
structured, audit-grade reliability reports in Markdown and JSON.
Handles missing data honestly with 'N/A' rather than fabricating metrics.
"""
import os
import sys
import json
import math
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional


def calculate_percentile(values: List[float], percentile: float) -> Optional[float]:
    """Calculate the p-th percentile from an array of floats."""
    if not values:
        return None
    sorted_vals = sorted(values)
    k = (len(sorted_vals) - 1) * (percentile / 100.0)
    f = math.floor(k)
    c = math.ceil(k)
    if f == c:
        return round(sorted_vals[int(k)], 2)
    d0 = sorted_vals[int(f)] * (c - k)
    d1 = sorted_vals[int(c)] * (k - f)
    return round(d0 + d1, 2)


def generate_reliability_data(
    load_test_data: Optional[Dict[str, Any]] = None,
    chaos_data: Optional[Dict[str, Any]] = None,
    probe_records: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """Aggregate actual test observations into structured reliability metrics."""
    now = datetime.now(timezone.utc).isoformat()
    
    total_requests = 0
    successful_requests = 0
    failed_requests = 0
    latencies: List[float] = []
    backend_counts: Dict[str, int] = {}

    # 1. Parse probe records if provided
    if probe_records:
        for p in probe_records:
            total_requests += 1
            status = p.get("status_code", 0)
            if 200 <= status < 400:
                successful_requests += 1
            else:
                failed_requests += 1
            
            lat = p.get("duration_ms")
            if lat is not None and isinstance(lat, (int, float)):
                latencies.append(float(lat))
            
            instance = p.get("backend_instance", "unknown")
            backend_counts[instance] = backend_counts.get(instance, 0) + 1

    # 2. Parse load test summary if provided
    if load_test_data:
        if "results" in load_test_data and not probe_records:
            for p in load_test_data["results"]:
                lat = p.get("duration_ms")
                if lat is not None and isinstance(lat, (int, float)):
                    latencies.append(float(lat))
                instance = p.get("backend_instance", "unknown")
                backend_counts[instance] = backend_counts.get(instance, 0) + 1

        if "metrics" in load_test_data:
            metrics = load_test_data["metrics"]
            req_count = metrics.get("http_reqs", {}).get("count")
            if req_count is not None and not probe_records:
                total_requests = req_count
            failed_count = metrics.get("http_req_failed", {}).get("passes")
            if failed_count is not None and not probe_records:
                failed_requests = failed_count
                successful_requests = max(0, total_requests - failed_count)

    # Derived calculations
    failure_rate = (
        round((failed_requests / total_requests) * 100.0, 2)
        if total_requests > 0
        else "N/A"
    )
    if latencies:
        avg_latency = round(sum(latencies) / len(latencies), 2)
        p95_latency = calculate_percentile(latencies, 95.0)
    elif load_test_data and "metrics" in load_test_data and "http_req_duration" in load_test_data["metrics"]:
        dur = load_test_data["metrics"]["http_req_duration"]
        avg_latency = dur.get("avg", "N/A")
        p95_latency = dur.get("p(95)", "N/A")
    else:
        avg_latency = "N/A"
        p95_latency = "N/A"

    # Chaos results
    failover_status = "N/A"
    recovery_time = "N/A"
    chaos_target = "N/A"
    if chaos_data:
        chaos_target = chaos_data.get("target_service", "N/A")
        recovery_time = chaos_data.get("recovery_time_s", "N/A")
        restored = chaos_data.get("service_restored")
        if restored is True:
            failover_status = "PASSED"
        elif restored is False:
            failover_status = "FAILED"
        else:
            failover_status = "DRY-RUN / UNVERIFIED"

    # Overall outcome
    if total_requests == 0 and not chaos_data:
        overall_result = "NO_DATA"
    elif failed_requests > 0 and (isinstance(failure_rate, float) and failure_rate > 5.0):
        overall_result = "DEGRADED"
    else:
        overall_result = "PASSED"

    return {
        "generated_at": now,
        "overall_result": overall_result,
        "traffic_metrics": {
            "total_requests": total_requests,
            "successful_requests": successful_requests,
            "failed_requests": failed_requests,
            "failure_rate_percent": failure_rate,
            "average_latency_ms": avg_latency,
            "p95_latency_ms": p95_latency,
            "traffic_distribution": backend_counts if backend_counts else "N/A"
        },
        "chaos_metrics": {
            "target_service": chaos_target,
            "failover_test_status": failover_status,
            "recovery_time_seconds": recovery_time,
            "chaos_experiment_summary": chaos_data.get("summary", "N/A") if chaos_data else "N/A"
        },
        "limitations": [
            "Measurements represent observed client responses through the gateway.",
            "Active HTTP video streams cannot be guaranteed zero-byte resume if the serving container process abruptly terminates.",
            "If Docker daemon was offline, container failover indicates configuration validation rather than live execution."
        ]
    }


def format_markdown_report(data: Dict[str, Any]) -> str:
    """Format structured reliability data into comprehensive GitHub-flavored Markdown."""
    tm = data["traffic_metrics"]
    cm = data["chaos_metrics"]

    md = f"""# StreamOps Reliability & High Availability Report
> Generated: {data["generated_at"]} | Status: **{data["overall_result"]}**

---

## 1. Executive Summary

This report documents the observed resilience, failover capabilities, and request distributions of the StreamOps containerized media platform.

- **Overall Reliability Assessment:** `{data["overall_result"]}`
- **Total Gateway Probes Evaluated:** `{tm["total_requests"]}`
- **Observed Request Success Rate:** `{"100%" if tm["failure_rate_percent"] == 0.0 else f"{100 - tm['failure_rate_percent']}%" if isinstance(tm["failure_rate_percent"], (int, float)) else "N/A"}`
- **Single-Backend Failover Status:** `{cm["failover_test_status"]}`

---

## 2. Traffic & Latency Metrics

| Metric | Measured Value | Unit / Status |
|---|---|---|
| Total Gateway Requests | `{tm["total_requests"]}` | Requests |
| Successful HTTP 2xx/3xx | `{tm["successful_requests"]}` | Requests |
| Failed HTTP Requests | `{tm["failed_requests"]}` | Requests |
| Failure Rate | `{tm["failure_rate_percent"]}{'%' if tm['failure_rate_percent'] != 'N/A' else ''}` | Percentage |
| Average Request Latency | `{tm["average_latency_ms"]}{' ms' if tm['average_latency_ms'] != 'N/A' else ''}` | Milliseconds |
| 95th Percentile Latency (p95) | `{tm["p95_latency_ms"]}{' ms' if tm['p95_latency_ms'] != 'N/A' else ''}` | Milliseconds |

### Replica Traffic Distribution:
"""
    if isinstance(tm["traffic_distribution"], dict):
        for k, v in tm["traffic_distribution"].items():
            md += f"- **`{k}`**: {v} requests\n"
    else:
        md += "- *No traffic distribution data observed.*\n"

    md += f"""
---

## 3. High Availability & Chaos Experimentation

| Experiment Parameter | Value | Notes |
|---|---|---|
| Target Failure Container | `{cm["target_service"]}` | Container stopped via Docker Compose |
| Failover Verification | `{cm["failover_test_status"]}` | Evaluated gateway handling on remaining replica |
| Service Recovery Time | `{cm["recovery_time_seconds"]}{' s' if cm['recovery_time_seconds'] != 'N/A' else ''}` | Duration to return to healthy readiness |
| Chaos Summary | `{cm["chaos_experiment_summary"]}` | Automated test harness record |

---

## 4. Operational Boundaries & Documented Limitations

"""
    for lim in data["limitations"]:
        md += f"- {lim}\n"

    md += "\n---\n*Report generated by StreamOps Automated Reliability Suite.*\n"
    return md


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Generate StreamOps Reliability Report")
    parser.add_argument("--chaos-json", help="Path to chaos experiment JSON file")
    parser.add_argument("--k6-json", help="Path to k6 summary JSON file")
    parser.add_argument("--out-md", "--output-md", dest="out_md", default="artifacts/reliability-report.md", help="Output Markdown report path")
    parser.add_argument("--out-json", "--output-json", dest="out_json", default="artifacts/reliability-report.json", help="Output JSON report path")
    args = parser.parse_args()

    chaos_data = None
    if args.chaos_json and os.path.exists(args.chaos_json):
        try:
            with open(args.chaos_json, "r", encoding="utf-8") as f:
                chaos_data = json.load(f)
        except Exception as e:
            print(f"Warning: Failed to read chaos JSON: {e}")

    k6_data = None
    if args.k6_json and os.path.exists(args.k6_json):
        try:
            with open(args.k6_json, "r", encoding="utf-8") as f:
                k6_data = json.load(f)
        except Exception as e:
            print(f"Warning: Failed to read k6 JSON: {e}")

    # Aggregate probe records from chaos data if available
    probes = []
    if chaos_data:
        probes.extend(chaos_data.get("baseline_probes", []))
        probes.extend(chaos_data.get("failure_probes", []))
        probes.extend(chaos_data.get("recovery_probes", []))

    report_data = generate_reliability_data(
        load_test_data=k6_data,
        chaos_data=chaos_data,
        probe_records=probes if probes else None
    )

    md_content = format_markdown_report(report_data)

    os.makedirs(os.path.dirname(args.out_md) or ".", exist_ok=True)
    os.makedirs(os.path.dirname(args.out_json) or ".", exist_ok=True)

    with open(args.out_md, "w", encoding="utf-8") as f:
        f.write(md_content)

    with open(args.out_json, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2)

    print(f"[RELIABILITY REPORT] Markdown report written to: {args.out_md}")
    print(f"[RELIABILITY REPORT] JSON report written to: {args.out_json}")


if __name__ == "__main__":
    main()
