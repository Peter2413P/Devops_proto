# DevOps-Based Video Streaming Platform (StreamOps)
> **Complete Production Architecture: Real Video Streaming (Phase 1), Container Orchestration (Phase 2), Full Observability (Phase 3), High Availability & Chaos (Phase 4), Automated CI/CD (Phase 5) & End-to-End System Integration (Phase 6)**

---

## 📌 1. Project Title & Overview
**Project Name:** DevOps-Based Video Streaming Platform (`StreamOps`)  
**Phase 1 Goal:** Production-grade video streaming application backed by a real **FastAPI backend** and an interactive **React frontend**.  
**Phase 2 Goal:** Genuine containerization, multi-container orchestration with Docker Compose, NGINX load balancing, and shared storage.  
**Phase 3 Goal:** Production-grade observability, Prometheus time-series metrics collection, Grafana real-time dashboards, cAdvisor container telemetry, and FastAPI HTTP instrumentation.  
**Phase 4 Goal:** High availability upstream resilience, controlled failure recovery, real k6 load testing, chaos engineering, and automated reliability verification.  
**Phase 5 Goal:** GitHub Actions CI/CD automation, static configuration validation, multi-stage image caching, and production container hardening.  
**Phase 6 Goal:** End-to-end system validation, academic demonstration runbook, interactive presentation helpers, and complete verification.

- **Unified Entry Point (NGINX Gateway):** `http://localhost:8080/`
- **Prometheus Metrics Engine & Query UI:** `http://localhost:9090/` (Targets: `http://localhost:9090/targets`)
- **Grafana Observability Dashboards:** `http://localhost:3000/` (Default dev login: `admin` / `admin`)
- **Frontend SPA Direct (Container):** Served through NGINX at `http://localhost:8080/` (or Vite dev `http://localhost:5173/`)
- **Backend API Direct (via Load Balancer):** `http://localhost:8080/api/` (distributes across `backend1` and `backend2`)
- **Raw Prometheus Metrics Endpoint:** `http://localhost:8001/metrics` / `http://localhost:8002/metrics` (or `http://localhost:8000/metrics` standalone)
- **API Documentation (Swagger UI):** `http://localhost:8080/docs` (or standalone backend `http://localhost:8000/docs`)

---

## 🎯 2. Phase 1 Architecture & Real Backend Implementation

StreamOps Phase 1 is a **real, fully functional media delivery platform**:

1. **Real FastAPI Backend (`backend/`):**
   - High-performance asynchronous Python backend using FastAPI and Uvicorn.
   - Discovers real video files dynamically from the storage directory (`backend/media/`).
   - Supports `.mp4`, `.webm`, `.mkv`, and `.mov`.
   - Resolves paths safely with strict relative containment checks to eliminate path traversal vulnerabilities.
2. **HTTP Range Request Streaming (RFC 7233):**
   - Implements partial content streaming (`206 Partial Content`) via byte-range headers (`Range: bytes=start-end`).
   - Delivers chunked generator streams without loading entire video files into system memory.
   - Enables native browser timeline seeking backwards and forwards with sub-second response times.
   - Responds with `416 Range Not Satisfiable` for out-of-bounds byte ranges with `Content-Range: bytes */total`.
3. **Dynamic Video Catalogue & Metadata Extraction:**
   - `GET /api/videos`: Returns the live catalogue of discovered videos.
   - Extracts real file size, format, MIME type, modified timestamp, and derived titles.
   - `GET /api/videos/{id}`: Returns metadata for a single video.
4. **Real Backend Health & Diagnostics:**
   - `GET /api/health`: Live server health diagnostics, reporting uptime, storage existence, and video count.
5. **Modern React Frontend (`src/`):**
   - Dynamic catalogue grid displaying real discovered media files.
   - HTML5 video player streaming directly from `/api/videos/{id}/stream`.
   - Real-time backend connectivity indicator in the navigation bar (`API: Online` or `Offline`).
   - Playlist switcher allowing instant playback of all discovered media files.

---

## 🏗 2.1 Phase 2 Architecture: Real Docker Infrastructure & Orchestration

Phase 2 elevates StreamOps into an orchestrated, multi-container production architecture managed by **Docker Compose**:

```text
                     USER / BROWSER
                           │
                           ▼
                  NGINX ENTRY POINT
                   localhost:8080
                           │
                 ┌─────────┴─────────┐
                 │                   │
                 ▼                   ▼
           REACT FRONTEND      API LOAD BALANCER
            (nginx:alpine)      (Round-Robin Upstream)
                                     │
                          ┌──────────┴──────────┐
                          │                     │
                          ▼                     ▼
                     BACKEND 1             BACKEND 2
                  (FastAPI:8000)        (FastAPI:8000)
                          │                     │
                          └──────────┬──────────┘
                                     │
                                     ▼
                            SHARED VIDEO STORAGE
                           (./backend/media :ro)
```

### Key Orchestration Components:
1. **NGINX Gateway & Load Balancer (`localhost:8080`):**
   - Single external ingress point routing `/` to the React frontend and `/api/` to the backend cluster.
   - **Upstream Load Balancing:** Round-robin proxying across `backend1:8000` and `backend2:8000`.
   - **RFC 7233 Range Streaming Preservation:** Explicitly proxies `Range: $http_range` and `If-Range: $http_if_range`, disables proxy buffering (`proxy_buffering off;`), and sets 1-hour streaming timeouts for smooth HTML5 timeline seeking.
   - **Diagnostic Tracing:** Attaches `X-Upstream-Addr` header indicating the exact backend container that fulfilled each request.
2. **Production React Frontend Container (`frontend`):**
   - **Multi-Stage Build:** Stage 1 uses `node:20-alpine` (`npm ci` & `npm run build`); Stage 2 uses `nginx:alpine` to serve optimized static assets.
   - **SPA Routing Fallback:** Custom `frontend/nginx.conf` with `try_files $uri $uri/ /index.html;` ensures routes like `/watch` and `/dashboard` never 404 on refresh.
3. **Dual FastAPI Backend Nodes (`backend1`, `backend2`):**
   - Built from `backend/Dockerfile` (`python:3.11-slim`) with security hardening: runs as unprivileged user `appuser`, excludes local files and media via `.dockerignore`.
   - Container health checks using standard library `urllib.request` against `http://127.0.0.1:8000/api/health`.
   - Injected node identity: `INSTANCE_NAME=backend1` and `INSTANCE_NAME=backend2`. Emits `X-Backend-Instance` header on all HTTP responses and exposes it in the `/api/health` payload.
4. **Shared Video Storage:**
   - Both backend nodes bind-mount `./backend/media` read-only at `/app/media:ro`, ensuring identical media catalogues and zero data drift.
5. **Isolated Docker Network (`streamops-net`):**
   - Bridge network providing stable DNS-based service discovery without hardcoded IPs.

---

## 📊 2.2 Phase 3 Architecture: Real-Time Monitoring & Observability Stack

Phase 3 introduces an enterprise-grade telemetry and observability pipeline into StreamOps, capturing real HTTP request metrics, container hardware utilization, gateway activity, and high-availability health:

```text
                     USER / BROWSER
                           │
                           ▼
                    NGINX GATEWAY
                    localhost:8080
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
       REACT FRONTEND              FASTAPI API
       (nginx:alpine)             LOAD BALANCER
                                        │
                            ┌───────────┴───────────┐
                            │                       │
                            ▼                       ▼
                       BACKEND 1               BACKEND 2
                       (Port 8000)             (Port 8000)
                            │                       │
                            └───────────┬───────────┘
                                        │
                                   SHARED MEDIA
                                        │
                ┌───────────────────────┼───────────────────┐
                │                       │                   │
                ▼                       ▼                   ▼
           PROMETHEUS               CADVISOR          NGINX METRICS
          localhost:9090           Container CPU       Real gateway
          Metrics database         Memory usage        statistics
                │
                ▼
             GRAFANA
          localhost:3000
          Persistent dashboards
                │
                ▼
      StreamOps Telemetry Cockpit
```

### Key Monitoring Components:

1. **FastAPI Prometheus Instrumentation (`backend/app/metrics.py`):**
   - **`streamops_http_requests_total`** (Counter): Labels `method`, `route`, `status_code`, `instance`.
   - **`streamops_http_request_duration_seconds`** (Histogram): Latency buckets `[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]`. Supports PromQL p50, p95, p99 latency calculations.
   - **`streamops_http_requests_in_progress`** (Gauge): Tracks concurrent in-flight requests, guaranteed to decrement in a `finally` block.
   - **`streamops_build_info`** (Gauge): Exposes service version, service name, and container instance.
   - **Route Template Normalization:** Normalized to bounded route patterns (e.g., `/api/health`, `/api/videos`, `/api/videos/{video_id}/stream`, or `unmatched`). Dynamic video IDs and query parameters never pollute labels, preventing cardinality explosion.
   - **Zero Content Buffering on Video Streaming:** For HTTP Range streaming responses (`StreamingResponse`), the body iterator is wrapped to measure duration across the full streaming lifecycle without loading media chunks into memory.
   - **Self-Scrape Noise Exclusion:** The `/metrics` endpoint is excluded from request counting to avoid recursive metric loops.

2. **Multi-Target Prometheus Engine (`monitoring/prometheus/prometheus.yml`):**
   - Configured with a 10s scrape interval across three specialized jobs:
     - `streamops-backend`: Scrapes `backend1:8000/metrics` and `backend2:8000/metrics`.
     - `streamops-containers`: Scrapes `cadvisor:8080/metrics`.
     - `streamops-nginx`: Scrapes `nginx-exporter:9113/metrics`.
   - Target availability is verified using standard PromQL `up` metric (`1` = healthy, `0` = unreachable).
   - Time-series persistence backed by Docker named volume `prometheus-data`.

3. **Persistent Grafana Provisioning (`monitoring/grafana/`):**
   - **Datasource Provisioning:** Automatically binds Prometheus datasource at `http://prometheus:9090` on startup without manual UI setup.
   - **Dashboard Auto-Provisioning:** Pre-loads `monitoring/grafana/dashboards/streamops-overview.json`.
   - **Persistence:** Volume `grafana-data` ensures dashboard states, user credentials, and annotations survive container restarts.
   - **12 Dedicated Telemetry Panels:**
     1. *Backend Availability*: Real scrape status for `backend1` and `backend2`.
     2. *Total HTTP Request Rate*: `sum(rate(streamops_http_requests_total[5m]))`.
     3. *Request Rate by Backend Node*: Traffic distribution across instances.
     4. *HTTP 5xx Error Rate*: Error rate per second with zero-fallback guard.
     5. *HTTP Latency (p95)*: 95th percentile latency from histogram buckets.
     6. *Request Latency by Node*: Per-instance latency comparison.
     7. *Container CPU Usage*: Real CPU % from cAdvisor.
     8. *Container Memory Usage*: Real memory working set bytes from cAdvisor.
     9. *Container Network Traffic*: Real RX/TX bytes/sec from cAdvisor.
     10. *NGINX Gateway Activity*: Active connections and handled request rates.
     11. *Recent Request Activity*: Breakdown by normalized route templates.
     12. *Service Health Summary*: Global status across all targets.

4. **Container Hardware Monitoring (cAdvisor):**
   - Runs `gcr.io/cadvisor/cadvisor:v0.49.1` collecting live container CPU, memory limits, and network throughput across the `streamops-net` network.

5. **NGINX Gateway Telemetry (NGINX Prometheus Exporter):**
   - Internal `/stub_status` restricted to private networks (`127.0.0.1`, `172.16.0.0/12`) scraped by `nginx/nginx-prometheus-exporter:1.3`.

---

## 🛠 3. Technology Stack

### Backend
- **Framework:** FastAPI
- **Server:** Uvicorn ASGI
- **Data Validation:** Pydantic v2
- **Testing:** Pytest + HTTPX / FastAPI TestClient
- **Streaming:** Python file generator streaming with RFC 7233 byte-range parsing

### Frontend
- **Framework:** React 18 + Vite 6
- **Routing:** React Router v6 (`/`, `/watch`, `/watch/:videoId`, `/dashboard`, `/simulation`, `/architecture`)
- **Styling:** Vanilla CSS3 Design System (Dark navy theme, glassmorphism, responsive cards)
- **Icons:** Lucide React
- **API Client:** Native Fetch API client with automatic Vite `/api` proxy

### DevOps & Containers
- **Containerization:** Multi-stage Dockerfiles (`backend/Dockerfile`, `Dockerfile`)
- **Orchestration:** `docker-compose.yml`

---

## 🚀 4. API Endpoints

| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `GET` | `/` | API service root verification | `200 OK` |
| `GET` | `/api/health` | Real backend health, uptime, and media count | `200 OK` |
| `GET` | `/api/videos` | Discovered video catalogue list | `200 OK` |
| `GET` | `/api/videos/{id}` | Detailed metadata for a single video | `200 OK` / `404 Not Found` |
| `GET` | `/api/videos/{id}/stream` | Range-supported video stream | `200 OK` / `206 Partial Content` / `416 Range Not Satisfiable` |
| `HEAD` | `/api/videos/{id}/stream` | Header inspection for streaming players | `200 OK` |
| `GET` | `/docs` | Interactive Swagger API documentation | `200 OK` |

---

## 💻 5. Running the Application Locally

### Prerequisites
- Python 3.10+ (tested with Python 3.14)
- Node.js 18+ and npm 9+

### 1. Setup & Run the Backend
```bash
# Navigate to project root
cd "d:\College\Class\Sem 5\Devops\Proto"

# Create and activate virtual environment (if not already created)
python -m venv backend\.venv
.\backend\.venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Run the FastAPI server
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
Backend API will be running at `http://127.0.0.1:8000/`.

### 2. Setup & Run the Frontend
In a second terminal window:
```bash
cd "d:\College\Class\Sem 5\Devops\Proto"

# Install frontend dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```
Frontend application will be running at `http://127.0.0.1:5173/`.

### 3. Running with Docker Compose (Multi-Container Orchestration & Monitoring)

To build and run the complete containerized application and observability stack:

```bash
# Build and start all 7 services in detached mode
docker compose up --build -d

# Check container status and health checks
docker compose ps

# View real-time logs across all services
docker compose logs -f

# View Prometheus and Grafana logs
docker compose logs -f prometheus grafana
```

#### Service Port Mappings:
| Service | Container Name | URL / Port | Purpose |
|---|---|---|---|
| **NGINX Gateway** | `streamops-gateway` | `http://localhost:8080/` | Public application entry point & API load balancer |
| **Grafana** | `streamops-grafana` | `http://localhost:3000/` | Real-time observability dashboard (Login: `admin` / `admin`) |
| **Prometheus** | `streamops-prometheus` | `http://localhost:9090/` | Time-series metrics engine, PromQL queries, targets status |
| **React Frontend** | `streamops-frontend` | `streamops-net:80` | Internal static NGINX SPA production server |
| **Backend 1** | `streamops-backend1` | `http://localhost:8001/` | FastAPI replica 1 (`/metrics`, `/api/health`, Range streaming) |
| **Backend 2** | `streamops-backend2` | `http://localhost:8002/` | FastAPI replica 2 (`/metrics`, `/api/health`, Range streaming) |
| **cAdvisor** | `streamops-cadvisor` | `streamops-net:8080` | Container CPU, memory, and network telemetry collector |
| **NGINX Exporter** | `streamops-nginx-exporter` | `streamops-net:9113` | NGINX active connections and handled requests exporter |

#### Stop Containers Without Deleting Monitoring Data:
```bash
# Gracefully stop containers while preserving prometheus-data and grafana-data volumes
docker compose down
```

> [!NOTE]
> **Docker Daemon Status Notice:**
> The Docker CLI is installed and the `docker-compose.yml` specification is fully verified (`docker compose config` exits with code 0). When executing on Windows, ensure Docker Desktop is launched and the Linux engine background service is running (`docker info` responds).

---

## 🧪 6. Automated Testing

The project includes an automated test suite verifying health checks, catalogue discovery, metadata extraction, HTTP Range requests, route normalization, Prometheus metrics collection, Grafana provisioning, and Docker orchestration configurations.

### Run Backend Tests:
```bash
# Run pytest test suite (with PYTHONPATH set to project root)
$env:PYTHONPATH="d:\College\Class\Sem 5\Devops\Proto"; .\backend\.venv\Scripts\pytest.exe backend\tests -v
```

**Test Coverage Summary (30 Tests, 100% Passing):**
- `test_metrics.py` (8 Tests):
  - `test_metrics_endpoint_returns_prometheus_format`: Validates `GET /metrics` returns HTTP 200 with `text/plain; charset=utf-8` exposition format.
  - `test_request_increments_counter_and_records_labels`: Validates request counter increments with bounded labels (`method`, `route`, `status_code`, `instance`).
  - `test_route_normalization_prevents_cardinality_explosion`: Verifies raw video IDs are normalized to `/api/videos/{video_id}`.
  - `test_video_stream_route_normalization`: Verifies range video stream routes normalize to `/api/videos/{video_id}/stream`.
  - `test_metrics_endpoint_excluded_from_request_counter`: Guarantees `/metrics` self-scrapes do not cause infinite metric loops.
  - `test_unmatched_route_recorded_safely`: Ensures arbitrary 404 paths are categorized as `unmatched` without unbounded labels.
  - `test_in_progress_gauge_returns_to_zero`: Validates in-flight request gauge increments during execution and resets to 0.
  - `test_build_info_metric_present`: Validates `streamops_build_info` exposes instance and version tags.
- `test_monitoring_config.py` (5 Tests):
  - `test_prometheus_configuration_structure`: Validates `prometheus.yml` global 10s interval, backend1/backend2 targets, cAdvisor, and NGINX exporter.
  - `test_grafana_provisioning_and_datasource`: Validates datasource configuration binding `http://prometheus:9090`.
  - `test_grafana_dashboard_json_schema`: Validates dashboard JSON schema, refresh intervals, and 12 operational panels.
  - `test_compose_monitoring_services_and_ports`: Validates Compose services, ports (8080, 9090, 3000), and named persistent volumes.
  - `test_nginx_stub_status_restricted`: Validates `/stub_status` access restriction to private subnets.
- `test_docker_config.py` (3 Tests):
  - `test_docker_compose_structure`: Validates base services, healthchecks, shared media volume, and bridge network.
  - `test_nginx_gateway_configuration`: Validates NGINX upstream balancing, `proxy_set_header Range`, `If-Range`, and `proxy_buffering off;`.
  - `test_frontend_nginx_spa_routing`: Validates frontend SPA `try_files` client-side fallback.
- `test_health.py` (2 Tests):
  - `test_health_check_endpoint`: Validates health status, uptime, video count, instance name, and `X-Backend-Instance` header.
  - `test_root_endpoint`: Validates root endpoint status.
- `test_catalog.py` (3 Tests):
  - `test_list_videos_catalog`: Validates video listing, metadata fields, and stream URLs.
  - `test_get_video_details_success`: Validates single video metadata.
  - `test_get_video_details_not_found`: Validates 404 for missing video IDs.
- `test_streaming.py` (8 Tests):
  - `test_stream_full_video_no_range`: Validates full-file 200 OK response.
  - `test_stream_video_head_request`: Validates HEAD request with streaming headers.
  - `test_stream_video_initial_range_request`: Validates `Range: bytes=0-1023` returning `206 Partial Content` and exact 1024 bytes.
  - `test_stream_video_mid_range_request`: Validates seeking (`Range: bytes=500-1499`).
  - `test_stream_video_open_ended_range_request`: Validates open-ended range (`Range: bytes=1000-`).
  - `test_stream_video_invalid_range_exceeds_filesize`: Validates out-of-bounds `416 Range Not Satisfiable`.
  - `test_stream_video_malformed_range`: Validates malformed range `416`.
  - `test_stream_non_existent_video_returns_404`: Validates 404 for missing video streams.
- `test_integration.py` (1 Test):
  - `test_full_catalog_and_stream_workflow`: End-to-end catalogue discovery and multi-chunk seeking workflow.

---

## 📁 7. Project Directory Structure

```text
StreamOps/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py                  # Environment (INSTANCE_NAME) & path configurations
│   │   ├── main.py                    # FastAPI, CORS, instance headers, metrics middleware
│   │   ├── metrics.py                 # Prometheus collectors (counter, histogram, gauge, build_info)
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── video.py               # Pydantic schemas (Metadata, Health with instance_name)
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── health.py              # /api/health endpoint reporting node instance identity
│   │   │   └── videos.py              # /api/videos and range streaming endpoints
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── video_catalog.py       # Discovery, path security, metadata extractor
│   │       └── video_stream.py        # RFC 7233 byte-range parser & chunk generator
│   ├── media/                         # Shared storage for video files (.mp4, .webm)
│   │   ├── sample.mp4
│   │   └── devops_architecture_demo.mp4
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py                # TestClient fixtures
│   │   ├── test_health.py
│   │   ├── test_catalog.py
│   │   ├── test_streaming.py
│   │   ├── test_integration.py
│   │   ├── test_metrics.py            # Prometheus metrics & route normalization tests
│   │   ├── test_monitoring_config.py  # Prometheus, Grafana, Compose validation tests
│   │   └── test_docker_config.py      # Compose & NGINX gateway tests
│   ├── .dockerignore                  # Excludes .venv, tests, cache, and media
│   ├── requirements.txt               # Declares prometheus-client, fastapi, uvicorn
│   └── Dockerfile                     # Production Python 3.11-slim (non-root appuser)
├── frontend/
│   └── nginx.conf                     # Production NGINX static server with SPA try_files fallback
├── monitoring/
│   ├── prometheus/
│   │   └── prometheus.yml             # Scrape jobs: backend (10s), cadvisor (10s), nginx (10s)
│   └── grafana/
│       ├── provisioning/
│       │   ├── datasources/
│       │   │   └── prometheus.yml     # Automated Prometheus datasource (http://prometheus:9090)
│       │   └── dashboards/
│       │       └── dashboards.yml     # Automated dashboard provider
│       └── dashboards/
│           └── streamops-overview.json# 12-panel StreamOps observability dashboard
├── nginx/
│   ├── Dockerfile                     # Gateway NGINX container
│   └── nginx.conf                     # Reverse proxy, round-robin upstream, stub_status
├── src/
│   ├── api/
│   │   └── client.js                  # Real API client for backend communication
│   ├── components/
│   │   ├── Navbar.jsx                 # Live backend API connectivity status badge
│   │   ├── VideoCard.jsx              # Dynamic video card with real file metadata
│   │   └── ...                        # Telemetry and educational simulator components
│   ├── context/
│   │   └── SimulationContext.jsx      # Telemetry polling, last probe timestamp, simulation state
│   ├── pages/
│   │   ├── Home.jsx                   # Discovered catalogue grid + DevOps overview
│   │   ├── VideoPlayer.jsx            # Video player with Range stream seeking & node indicator
│   │   ├── Dashboard.jsx              # Live infrastructure status, Grafana/Prometheus links, simulator
│   │   ├── Simulation.jsx             # DevOps chaos & scaling demonstration center
│   │   └── Architecture.jsx           # Architecture & defense matrix
│   ├── App.jsx                        # Routing (/watch, /watch/:videoId, /dashboard, etc.)
│   └── index.css                      # Dark navy theme design system
├── public/
│   └── videos/
│       └── sample.mp4
├── .dockerignore                      # Excludes node_modules, dist, backend, .git
├── .env.example                       # Development secrets: GF_SECURITY_ADMIN_USER, etc.
├── Dockerfile                         # Multi-stage production frontend Dockerfile
├── docker-compose.yml                 # Orchestration: nginx, frontend, backend1, backend2, prometheus, grafana, cadvisor, nginx-exporter
├── package.json
└── vite.config.js                     # Development server + /api proxy
```

---

## 🎬 8. Verification & Demonstration Steps

### 1. Validate Docker Compose Configuration
```bash
docker compose config
```
Ensures all 7 services, network bindings, environment interpolations, and volume declarations parse cleanly.

### 2. Run Automated Architecture & Telemetry Test Suite
```bash
$env:PYTHONPATH="d:\College\Class\Sem 5\Devops\Proto"; .\backend\.venv\Scripts\pytest.exe backend\tests -v
```
All 30 automated tests will execute and pass, verifying metrics middleware, latency histograms, route normalization, NGINX configurations, and streaming endpoints.

### 3. Launch the Stack in Docker
```bash
docker compose up --build -d
```

### 4. Verify Prometheus Targets
Visit `http://localhost:9090/targets` or run:
```bash
curl http://localhost:9090/api/v1/targets
```
Confirm `streamops-backend`, `streamops-containers`, and `streamops-nginx` targets report status `UP`.

### 5. Generate Real Application Traffic (PowerShell)
Send real requests through the NGINX gateway to populate Prometheus metrics:
```powershell
1..30 | ForEach-Object {
    try {
        Invoke-RestMethod "http://localhost:8080/api/health" | Out-Null
    }
    catch {
        Write-Host "Request failed: $_"
    }
}
```

### 6. Verify Metrics in Prometheus
Query the PromQL metrics via `http://localhost:9090`:
- Scrape health:
  ```promql
  up{job="streamops-backend"}
  ```
- Request rate:
  ```promql
  sum(rate(streamops_http_requests_total[5m]))
  ```
- Request rate by backend node:
  ```promql
  sum by (instance) (rate(streamops_http_requests_total[5m]))
  ```
- 95th Percentile Latency:
  ```promql
  histogram_quantile(0.95, sum by (le) (rate(streamops_http_request_duration_seconds_bucket[5m])))
  ```

### 7. View Live Dashboards in Grafana
Navigate to `http://localhost:3000` (Login: `admin` / `admin`).
Open the auto-provisioned **StreamOps - Observability & Telemetry Overview** dashboard to monitor all 12 operational panels in real time.

### 8. Test Backend Failure & High Availability Detection
Simulate a node failure by stopping `backend1`:
```powershell
docker compose stop backend1
```
- Observe in Prometheus (`http://localhost:9090/targets`) that `backend1:8000` changes to state `DOWN` (`up=0`).
- Observe that the Grafana Backend Availability panel updates dynamically.
- Send further traffic to `http://localhost:8080/api/health`: NGINX automatically routes all traffic to `backend2:8000`.
- Recover the node:
  ```powershell
  docker compose start backend1
  ```
- Observe `backend1` rejoining the pool and returning to `UP` (`up=1`).

---

## 🛡️ 9. Phase 4 Architecture: High Availability, Load Testing & Chaos Engineering

Phase 4 introduces enterprise reliability engineering to StreamOps, featuring upstream failover, multi-stage k6 load testing, a safe chaos harness, and an automated reliability reporter.

### 9.1 Upstream Resilience & NGINX Failover Policy
The NGINX reverse proxy (`nginx/nginx.conf`) is configured for passive upstream health monitoring and fast failover:
- **Fast Connect Timeout:** `proxy_connect_timeout 2s;` prevents client stalls when a backend node crashes or becomes unresponsive.
- **Circuit Breaking Thresholds:** `max_fails=3 fail_timeout=10s` marks a failing instance temporarily unavailable for 10 seconds before probing again.
- **Idempotent Retry Safety:** `proxy_next_upstream error timeout http_502 http_503 http_504;` retries requests on eligible replica nodes. Notice that `non_idempotent` is omitted to protect state-changing HTTP requests from duplicate execution.
- **Bounded Retry Attempts:** `proxy_next_upstream_tries 2; proxy_next_upstream_timeout 10s;` prevents cascading retry storms.
- **Range Streaming Integrity:** Streaming responses maintain `proxy_buffering off;` and 300s read timeouts. Active connections interrupted mid-stream require client-initiated range re-requests (transparent byte-offset resumption cannot be assumed by the gateway).

### 9.2 Real Health, Liveness, and Readiness Endpoints
The FastAPI backend (`backend/app/routes/health.py`) distinguishes between process liveness and service readiness:
- `GET /api/health`: Legacy and diagnostic health endpoint returning uptime, storage status, and video count.
- `GET /api/health/live`: Fast liveness probe verifying that the Python process and event loop are responding.
- `GET /api/health/ready`: Readiness probe verifying access to `/app/media` storage and required assets. Returns HTTP 503 if media storage is unmounted or inaccessible.

### 9.3 Load Testing Suite (`load-tests/` & `tools/http_load_runner.py`)
StreamOps includes four calibrated k6 test profiles designed for bounded, repeatable execution:
- **Smoke Test (`load-tests/smoke.js`):** Fast sanity check (1-2 VUs) validating gateway connectivity, video catalogue discovery, and RFC 7233 range requests.
- **Gradual Load Test (`load-tests/load.js`):** Ramps from 1 to 10 VUs over 2.5 minutes to evaluate throughput, p95 latency, and upstream traffic distribution.
- **Range Streaming Test (`load-tests/streaming.js`):** Simulates 5 concurrent video players requesting successive 64KB byte ranges.
- **Stress Test (`load-tests/stress.js`):** Opt-in stress test ramping up to 25 VUs. Requires explicit environment variable: `$env:ENABLE_STRESS="true"`.
- **Standalone HTTP Load Runner (`tools/http_load_runner.py`):** Python-based concurrent load testing utility exporting k6-compatible JSON summaries without requiring global k6 CLI installation.

### 9.4 Controlled Chaos Engineering Harness (`tools/chaos_experiment.py`)
A safety-first chaos testing harness with guaranteed container restoration:
- **Default Dry-Run Mode:** Running without `--execute` verifies preconditions and outputs experiment plans without stopping containers.
- **Guaranteed Cleanup:** Container start commands execute inside Python `finally:` blocks to prevent orphaned down states even if assertions or probes fail.
- **Bounded Observation:** Probes the gateway at 1-second intervals during failure to measure detection time, replica failover, and recovery duration.

### 9.5 Reliability Report Generator (`tools/reliability_report.py`)
Consumes load-test summaries (`artifacts/load-tests/`) and chaos logs (`artifacts/chaos-experiments/`) to produce structured Markdown and JSON reports (`artifacts/reliability-report.md`). Missing measurements are reported strictly as `N/A` rather than fabricated values.

---

## 🚀 10. Phase 4 PowerShell Execution Commands

### 1. Run Unit Tests (Docker Independent)
```powershell
$env:PYTHONPATH="d:\College\Class\Sem 5\Devops\Proto"
.\backend\.venv\Scripts\python.exe -m pytest backend\tests -v
```

### 2. Run High Availability Gateway Integration Tests
```powershell
$env:PYTHONPATH="d:\College\Class\Sem 5\Devops\Proto"
.\backend\.venv\Scripts\python.exe -m pytest tests\ha -v
```
*(Tests cleanly skip if containers are not running on `http://localhost:8080`)*

### 3. Run Load Tests with k6
```powershell
# Smoke Test
k6 run load-tests/smoke.js

# Gradual Load Test
k6 run load-tests/load.js

# Range Streaming Test
k6 run load-tests/streaming.js

# Opt-in Stress Test
$env:ENABLE_STRESS="true"
k6 run load-tests/stress.js
```

### 4. Run Standalone Load Runner (Python Alternative)
```powershell
.\backend\.venv\Scripts\python.exe tools\http_load_runner.py --url http://localhost:8080 --profile smoke --requests 50 --out artifacts\load-tests\smoke-summary.json
```

### 5. Run Controlled Chaos Experiments
```powershell
# Safe Dry-Run (Verifies preconditions without stopping containers)
.\backend\.venv\Scripts\python.exe tools\chaos_experiment.py --dry-run --target backend1

# Real Failure Experiment (Requires Docker Engine and explicit opt-in)
.\backend\.venv\Scripts\python.exe tools\chaos_experiment.py --execute --target backend1 --duration 15
```

### 6. Generate Comprehensive Reliability Report
```powershell
.\backend\.venv\Scripts\python.exe tools\reliability_report.py --k6-json artifacts\load-tests\smoke-summary.json --chaos-json artifacts\chaos-experiments\latest-experiment.json --out-md artifacts\reliability-report.md --out-json artifacts\reliability-report.json
```

---

## 🚀 11. Phase 5 & 6: Automated CI/CD, Security Hardening & End-to-End System Integration

Phases 5 and 6 finalize StreamOps into an enterprise-ready, academically rigorous, and fully demonstrable DevOps video streaming platform.

### 11.1 GitHub Actions Continuous Integration (`.github/workflows/ci.yml`)
The automated CI/CD pipeline enforces quality gates on all pushes and pull requests to `main` across five parallel and dependent jobs:
- **Job A (Backend Validation):** Sets up Python 3.11, installs pinned dependencies, and executes the complete 38-test pytest suite.
- **Job B (Frontend Validation):** Sets up Node.js 20.x, executes clean installs (`npm ci`), builds production static bundles (`npm run build`), and verifies asset emission.
- **Job C (Configuration Integrity):** Validates Docker Compose schema (`docker compose config`), verifies Grafana dashboard JSON parsing, checks Prometheus YAML syntax, and tests NGINX configurations (`nginx -t`).
- **Job D (Container Image Builds):** Utilizes Docker Buildx with GitHub Actions layer caching (`type=gha`) to build production images for backend, frontend, and gateway without pushing unauthenticated artifacts.
- **Job E (Compose Integration Smoke Test):** Spins up the multi-container Compose stack on Ubuntu runners, awaits healthy states, queries `/api/health`, verifies catalogue discovery, and executes a real RFC 7233 byte-range request verifying HTTP `206 Partial Content` (1024 bytes).

### 11.2 Security & Production Hardening Controls
- **Non-Root Execution:** The FastAPI backend runs under an unprivileged system user (`appuser:appuser`, UID/GID non-root) with restrictive file ownership.
- **Attack Surface Minimization:** Only the NGINX gateway (port `8080`), Prometheus (port `9090`), and Grafana (port `3000`) expose host ports. Backend nodes and frontend containers remain isolated within the private bridge network (`streamops-net`).
- **Secret & Dependency Hygiene:** All environment variables use `.env.example` templates with zero hard-coded credentials. The repository enforces strict `.gitignore` and `.dockerignore` filters preventing leaks of keys, caches, or virtual environments.
- **Safe Passive Upstream Retries:** NGINX `proxy_next_upstream` deliberately omits `non_idempotent` flags, ensuring state-changing HTTP requests are never accidentally duplicated across backend replicas.
- **Probe Separation:** Decouples process liveness (`/api/health/live`) from external dependency readiness (`/api/health/ready`), ensuring transient storage hiccups do not trigger premature container restarts.

### 11.3 End-to-End Validation Engine (`tools/e2e_validator.py`)
A single-command platform audit engine that executes and classifies system health into standardized categories:
- **PASS:** Verified against actual runtime/code acceptance criteria.
- **FAIL:** Executed and failed to meet acceptance criteria.
- **BLOCKED:** Prerequisite unavailable (e.g. offline Docker Desktop daemon pipe).
- **SKIPPED:** Intentionally bypassed test.
- **NOT RUN:** Not evaluated.

Reports are saved to `artifacts/e2e-validation-report.json` and `artifacts/e2e-validation-report.md`.

### 11.4 Academic Demonstration Runbook (`DEMO_RUNBOOK.md` & `tools/demo_helper.ps1`)
- **[DEMO_RUNBOOK.md](file:///D:/College/Class/Sem%205/Devops/Proto/DEMO_RUNBOOK.md):** Complete 5-minute presentation script with minute-by-minute talking points, browser actions, DevTools inspection, and examiner Q&A answers.
- **[tools/demo_helper.ps1](file:///D:/College/Class/Sem%205/Devops/Proto/tools/demo_helper.ps1):** Interactive PowerShell presentation assistant providing a menu-driven interface to trigger validation, failover simulations, load tests, and web portal access during live evaluations.
- **Standalone Fallback Mode:** Complete instructions to showcase the React frontend, FastAPI range streaming, and architecture even if presenting on a machine where Docker Desktop is unavailable.

---

## ⚡ 12. Complete Phase 5 & 6 PowerShell Execution Commands

### 1. Run Complete Platform End-to-End Validator
```powershell
.\backend\.venv\Scripts\python.exe tools\e2e_validator.py
```

### 2. Validate GitHub Actions CI Workflow Syntax Locally
```powershell
.\backend\.venv\Scripts\python.exe -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml', encoding='utf-8')); print('CI Workflow Syntax Valid!')"
```

### 3. Validate Monitoring Configurations (JSON & YAML)
```powershell
.\backend\.venv\Scripts\python.exe -c "import json, yaml; json.load(open('monitoring/grafana/dashboards/streamops-overview.json', encoding='utf-8')); yaml.safe_load(open('monitoring/prometheus/prometheus.yml', encoding='utf-8')); print('Monitoring configurations valid!')"
```

### 4. Launch Interactive Presentation Helper
```powershell
.\tools\demo_helper.ps1
```

### 5. Verify Standalone Fallback Streaming Mode
```powershell
# 1. Start backend in terminal 1
$env:PYTHONPATH="d:\College\Class\Sem 5\Devops\Proto"
.\backend\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000

# 2. Test range stream in terminal 2
curl.exe -i -H "Range: bytes=0-1023" http://127.0.0.1:8000/api/videos/sample/stream

# 3. Start frontend
npm run dev
```



