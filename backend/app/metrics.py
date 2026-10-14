"""
Prometheus Metrics Instrumentation for StreamOps FastAPI Backend.

Provides:
- streamops_http_requests_total (Counter: method, route, status_code, instance)
- streamops_http_request_duration_seconds (Histogram: method, route, status_code, instance)
- streamops_http_requests_in_progress (Gauge: instance)
- streamops_build_info (Gauge: version, service, instance)
- GET /metrics endpoint delivering standard Prometheus exposition format.
"""
import time
import logging
from typing import Callable, Tuple
from fastapi import Request, Response
from starlette.responses import StreamingResponse
from prometheus_client import (
    Counter,
    Histogram,
    Gauge,
    CollectorRegistry,
    REGISTRY,
    generate_latest,
    CONTENT_TYPE_LATEST,
)

from .config import INSTANCE_NAME

logger = logging.getLogger("streamops.metrics")

# Latency histogram buckets (0.005s to 10s)
LATENCY_BUCKETS = (0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0)


def create_metrics(registry: CollectorRegistry = REGISTRY) -> Tuple[Counter, Histogram, Gauge, Gauge]:
    """
    Register and return Prometheus metric collectors for the specified registry.
    Safely retrieves collectors if they already exist on the registry (test isolation).
    """
    def _get_or_create(metric_cls, name, documentation, labelnames=(), **kwargs):
        try:
            return metric_cls(name, documentation, labelnames, registry=registry, **kwargs)
        except ValueError:
            # Collector already registered in this registry
            return registry._names_to_collectors[name]

    http_requests_total = _get_or_create(
        Counter,
        "streamops_http_requests_total",
        "Total number of HTTP requests processed by StreamOps backend.",
        ["method", "route", "status_code", "instance"]
    )

    http_request_duration_seconds = _get_or_create(
        Histogram,
        "streamops_http_request_duration_seconds",
        "HTTP request processing latency in seconds.",
        ["method", "route", "status_code", "instance"],
        buckets=LATENCY_BUCKETS
    )

    http_requests_in_progress = _get_or_create(
        Gauge,
        "streamops_http_requests_in_progress",
        "Number of HTTP requests currently in progress.",
        ["instance"]
    )

    build_info = _get_or_create(
        Gauge,
        "streamops_build_info",
        "StreamOps backend build and instance information.",
        ["version", "service", "instance"]
    )
    # Set build info value to 1.0
    build_info.labels(version="1.0.0", service="streamops-backend", instance=INSTANCE_NAME).set(1.0)

    return http_requests_total, http_request_duration_seconds, http_requests_in_progress, build_info


# Global default metric instances bound to default REGISTRY
HTTP_REQUESTS_TOTAL, HTTP_REQUEST_DURATION, HTTP_REQUESTS_IN_PROGRESS, BUILD_INFO = create_metrics(REGISTRY)


def normalize_route_template(request: Request, status_code: int) -> str:
    """
    Normalize route to bounded path template (e.g. '/api/videos/{video_id}/stream')
    to strictly prevent metric label cardinality explosion.
    """
    route = request.scope.get("route")
    if route and hasattr(route, "path"):
        return route.path

    path = request.url.path
    if path == "/":
        return "/"
    elif path == "/api/health":
        return "/api/health"
    elif path == "/api/videos":
        return "/api/videos"
    elif path.startswith("/api/videos/"):
        parts = path.split("/")
        if len(parts) == 4: # /api/videos/{id}
            return "/api/videos/{video_id}"
        elif len(parts) >= 5 and parts[4] == "stream":
            return "/api/videos/{video_id}/stream"

    if status_code == 404:
        return "unmatched"
    return "other"


async def prometheus_metrics_middleware(request: Request, call_next: Callable) -> Response:
    """
    FastAPI / Starlette middleware that measures HTTP requests, duration,
    in-progress gauges, and records normalized status codes and route templates.
    Preserves streaming responses without buffering.
    """
    path = request.url.path

    # Exclude the metrics endpoint itself from application traffic metrics
    if path == "/metrics":
        return await call_next(request)

    method = request.method
    start_time = time.perf_counter()
    instance = INSTANCE_NAME

    # Increment in-progress gauge
    HTTP_REQUESTS_IN_PROGRESS.labels(instance=instance).inc()

    recorded = False

    def record_completion(status_code: int, route_str: str):
        nonlocal recorded
        if recorded:
            return
        recorded = True
        duration = max(0.0, time.perf_counter() - start_time)
        try:
            HTTP_REQUEST_DURATION.labels(
                method=method,
                route=route_str,
                status_code=str(status_code),
                instance=instance
            ).observe(duration)
            HTTP_REQUESTS_TOTAL.labels(
                method=method,
                route=route_str,
                status_code=str(status_code),
                instance=instance
            ).inc()
        finally:
            HTTP_REQUESTS_IN_PROGRESS.labels(instance=instance).dec()

    try:
        response = await call_next(request)
        status_code = response.status_code
        route_template = normalize_route_template(request, status_code)

        if isinstance(response, StreamingResponse):
            # For streaming responses, wrap the body iterator to record completion
            # only after the stream transmission finishes, without buffering chunks.
            original_iterator = response.body_iterator

            async def wrapped_stream():
                try:
                    if hasattr(original_iterator, "__aiter__"):
                        async for chunk in original_iterator:
                            yield chunk
                    else:
                        for chunk in original_iterator:
                            yield chunk
                finally:
                    record_completion(status_code, route_template)

            response.body_iterator = wrapped_stream()
            return response
        else:
            record_completion(status_code, route_template)
            return response

    except Exception:
        # Request failed with unhandled exception
        record_completion(500, normalize_route_template(request, 500))
        raise
