import pytest
from tools.reliability_report import calculate_percentile, generate_reliability_data, format_markdown_report
from tools.chaos_experiment import run_experiment


def test_calculate_percentile_known_distributions():
    """Verify p95 percentile calculation on synthetic latency samples."""
    samples = [10.0, 20.0, 30.0, 40.0, 50.0, 60.0, 70.0, 80.0, 90.0, 100.0]
    p95 = calculate_percentile(samples, 95.0)
    assert p95 is not None
    assert 90.0 <= p95 <= 100.0

    # Edge cases
    assert calculate_percentile([], 95.0) is None
    assert calculate_percentile([42.0], 95.0) == 42.0


def test_generate_reliability_data_from_probes():
    """Verify aggregation of probe observations into accurate reliability metrics."""
    probes = [
        {"status_code": 200, "duration_ms": 12.5, "backend_instance": "backend1"},
        {"status_code": 200, "duration_ms": 14.0, "backend_instance": "backend2"},
        {"status_code": 200, "duration_ms": 11.0, "backend_instance": "backend1"},
        {"status_code": 502, "duration_ms": 25.0, "backend_instance": "none"},
    ]

    data = generate_reliability_data(probe_records=probes)
    tm = data["traffic_metrics"]

    assert tm["total_requests"] == 4
    assert tm["successful_requests"] == 3
    assert tm["failed_requests"] == 1
    assert tm["failure_rate_percent"] == 25.0
    assert tm["average_latency_ms"] == round((12.5 + 14.0 + 11.0 + 25.0) / 4, 2)
    assert tm["traffic_distribution"] == {"backend1": 2, "backend2": 1, "none": 1}
    assert data["overall_result"] == "DEGRADED"


def test_generate_reliability_data_empty_input():
    """Verify empty input returns NO_DATA without raising exceptions."""
    data = generate_reliability_data()
    assert data["overall_result"] == "NO_DATA"
    assert data["traffic_metrics"]["total_requests"] == 0
    assert data["traffic_metrics"]["failure_rate_percent"] == "N/A"
    assert data["traffic_metrics"]["average_latency_ms"] == "N/A"


def test_generate_reliability_data_with_chaos_data():
    """Verify parsing of chaos experiment logs."""
    chaos = {
        "target_service": "backend1",
        "service_restored": True,
        "recovery_time_s": 2.45,
        "summary": "Restored in 2.45s"
    }

    data = generate_reliability_data(chaos_data=chaos)
    cm = data["chaos_metrics"]

    assert cm["target_service"] == "backend1"
    assert cm["failover_test_status"] == "PASSED"
    assert cm["recovery_time_seconds"] == 2.45


def test_format_markdown_report():
    """Verify Markdown report generation contains tables, headers, and does not crash on N/A."""
    data = generate_reliability_data()
    md = format_markdown_report(data)

    assert "# StreamOps Reliability & High Availability Report" in md
    assert "Total Gateway Probes Evaluated" in md
    assert "Traffic & Latency Metrics" in md
    assert "Operational Boundaries & Documented Limitations" in md


def test_chaos_dry_run_mode():
    """Verify chaos experiment dry-run mode returns safe report without Docker commands."""
    res = run_experiment(target_service="backend1", dry_run=True)
    assert res["target_service"] == "backend1"
    assert res["dry_run"] is True
    assert "summary" in res
