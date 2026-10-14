# StreamOps: Academic Demonstration & Presentation Runbook
> **5-Minute Live Demonstration Guide for College DevOps & Cloud Computing Project**

---

## 🎯 1. Demonstration Objective & Overview

**Project Name:** StreamOps — DevOps-Based Video Streaming Platform  
**Purpose:** An academic demonstration illustrating how core DevOps principles solve real-world media delivery challenges:
- **Challenge 1 (Bandwidth & Seeking):** Naive downloads buffer entire files. **DevOps Solution:** RFC 7233 chunked HTTP Range streaming (`206 Partial Content`).
- **Challenge 2 (Single Point of Failure):** Monolithic failure crashes all playback. **DevOps Solution:** NGINX load balancer, dual FastAPI backend replicas, and passive upstream failover (`proxy_next_upstream`).
- **Challenge 3 (Blind Operations):** No visibility into server degradation. **DevOps Solution:** Real-time Prometheus metrics scraping and multi-panel Grafana dashboards.
- **Challenge 4 (Manual Errors):** Inconsistent deployments. **DevOps Solution:** Automated multi-stage GitHub Actions CI/CD pipeline.

---

## 🏗️ 2. Architectural Overview (For Presentation Slides)

```text
                                [ CLIENT / BROWSER ]
                                         │
                                         ▼
                               [ NGINX REVERSE PROXY ]
                                   localhost:8080
                                         │
                    ┌────────────────────┴────────────────────┐
                    │                                         │
                    ▼                                         ▼
          [ REACT FRONTEND SPA ]                     [ API UPSTREAM POOL ]
           (dist/ served via NGINX)                  (Round-Robin Load Balancer)
                                                              │
                                            ┌─────────────────┴─────────────────┐
                                            │                                   │
                                            ▼                                   ▼
                                     [ BACKEND 1 ]                       [ BACKEND 2 ]
                                   (FastAPI: node 1)                   (FastAPI: node 2)
                                            │                                   │
                                            └─────────────────┬─────────────────┘
                                                              │
                                                              ▼
                                                   [ SHARED MEDIA STORAGE ]
                                                      (./backend/media:ro)

          ┌────────────────────────────────────────────────────────────────────────┐
          │                         OBSERVABILITY STACK                            │
          │  cAdvisor (container telemetry) ──┐                                    │
          │  NGINX Exporter (gateway status) ─┼──► Prometheus (9090) ──► Grafana   │
          │  FastAPI /metrics (app metrics) ──┘                           (3000)   │
          └────────────────────────────────────────────────────────────────────────┘
```

---

## ⏱️ 3. Five-Minute Presentation Walkthrough Script

### 🕒 Minute 1: Introduction & Architecture
- **What to say:**
  > "StreamOps demonstrates production DevOps for high-throughput video delivery. Instead of a monolithic app, our architecture separates concerns into a high-performance NGINX gateway, containerized React frontend, dual FastAPI backend replicas with shared read-only storage, and full Prometheus/Grafana observability."
- **What to show:**
  - Architecture diagram or Docker Compose architecture in `docker-compose.yml`.
  - Browser pointing to the gateway entry point: `http://localhost:8080/`.

---

### 🕒 Minute 2: Video Playback & HTTP Range Seeking (RFC 7233)
- **What to say:**
  > "Video streaming requires sub-second seek latency without loading entire gigabytes into memory. We implemented RFC 7233 byte-range streaming. When a user seeks to the middle of a video, the browser sends an HTTP Range header, and our backend returns 206 Partial Content with the exact requested byte slice."
- **What to show:**
  - Navigate to `http://localhost:8080/watch`.
  - Open **Chrome DevTools (F12) -> Network tab -> Fetch/XHR or Media filter**.
  - Click play, then click to seek to various timeline points.
  - Show the network request:
    - **Status:** `206 Partial Content`
    - **Request Header:** `Range: bytes=394240-`
    - **Response Header:** `Content-Range: bytes 394240-788492/788493`
    - **Instance Header:** `X-Backend-Instance: backend1` (or `backend2`)

---

### 🕒 Minute 3: Observability & Telemetry in Grafana
- **What to say:**
  > "Phase 3 introduced telemetry. Our FastAPI backends expose `/metrics` using the Prometheus client library, normalized by route to prevent cardinality explosion. Prometheus scrapes backends, NGINX metrics, and cAdvisor every 5 seconds."
- **What to show:**
  - Open **Grafana** at `http://localhost:3000/` (Login: `admin` / `admin`).
  - Open the auto-provisioned **StreamOps - Observability & Telemetry Overview** dashboard.
  - Highlight the 12 live panels:
    - **HTTP Request Rate by Backend Instance** (showing traffic split).
    - **p95 Request Duration Histogram**.
    - **Backend Node Availability** (both green `UP=1`).
    - **Active Video Streams in Progress**.

---

### 🕒 Minute 4: High Availability & Chaos Failover
- **What to say:**
  > "In Phase 4, we implemented upstream resilience. Notice what happens when a backend crashes mid-operation. NGINX detects connection failures within 2 seconds via `proxy_connect_timeout 2s;` and safely fails over to the surviving replica using `proxy_next_upstream`."
- **What to execute:**
  In PowerShell:
  ```powershell
  # Stop Backend 1 to simulate a container crash
  docker compose stop backend1
  ```
- **What to show:**
  - Refresh the video catalogue or seek in the video player: **the user experiences zero errors!**
  - Check `X-Backend-Instance`: requests are now 100% served by `backend2`.
  - Switch to Grafana or Prometheus targets (`http://localhost:9090/targets`): show `backend1` marked as `DOWN` (`0`).

---

### 🕒 Minute 5: Self-Healing Recovery & CI/CD Pipeline
- **What to say:**
  > "DevOps requires automated recovery. When the failed node restarts, its Docker healthcheck probes `/api/health`, and NGINX automatically re-admits it to the round-robin pool. In Phase 5, all of this is protected by a 5-stage GitHub Actions CI/CD pipeline."
- **What to execute:**
  ```powershell
  # Restart Backend 1
  docker compose start backend1
  ```
- **What to show:**
  - Show `backend1` rejoining the pool in Grafana and in response headers.
  - Run the automated End-to-End validator:
    ```powershell
    .\backend\.venv\Scripts\python.exe tools\e2e_validator.py
    ```
  - Show the output: all 38 backend tests passing, configuration schemas valid, and CI pipeline validated.

---

## 🛠️ 4. Standalone Fallback Demonstration (Zero-Docker Mode)

If presenting on a laptop where Docker Desktop cannot run or the Linux daemon is offline, **do not panic**. Use this verified standalone demonstration:

### Step 1: Start the Local FastAPI Backend
```powershell
$env:PYTHONPATH="d:\College\Class\Sem 5\Devops\Proto"
$env:INSTANCE_NAME="backend-node-1"
.\backend\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```
- Exposes:
  - API Health: `http://127.0.0.1:8000/api/health`
  - Liveness Probe: `http://127.0.0.1:8000/api/health/live`
  - Readiness Probe: `http://127.0.0.1:8000/api/health/ready`
  - Video Catalogue: `http://127.0.0.1:8000/api/videos`
  - Prometheus Metrics: `http://127.0.0.1:8000/metrics`

### Step 2: Start the React Frontend Development Server
```powershell
npm run dev
```
- Open `http://localhost:5173/`.
- Show full streaming, catalogue discovery, and responsive UI.

### Step 3: Demonstrate HTTP Range Streaming via Terminal
Show examiners the exact RFC 7233 bytes returned:
```powershell
# Request 1024-byte partial slice
curl.exe -i -H "Range: bytes=0-1023" http://127.0.0.1:8000/api/videos/sample/stream
```
Point out:
- HTTP status `206 Partial Content`.
- `Content-Range: bytes 0-1023/788493`.
- `X-Backend-Instance: backend-node-1`.

### Step 4: Run the Automated Validation Suite
```powershell
.\backend\.venv\Scripts\python.exe tools\e2e_validator.py
```
Demonstrates that the academic prototype is backed by 38 passing automated tests, validated JSON/YAML configurations, and a 5-job GitHub Actions CI/CD pipeline.

---

## 📋 5. Demonstration Q&A Cheat Sheet

- **Q: Why NGINX rather than direct browser-to-backend connections?**  
  *A:* Single entry point eliminates CORS issues, provides round-robin load distribution across replicas, enables fast passive upstream failover (`proxy_next_upstream`), and terminates SSL/TLS in production.
- **Q: How does HTTP Range streaming prevent memory exhaustion?**  
  *A:* The FastAPI backend uses Python generators and chunked file readers (`file.read(chunk_size)`). It streams 64KB buffers on-demand without loading the entire 700MB+ file into server RAM.
- **Q: How does the system prevent non-idempotent duplicate requests on failover?**  
  *A:* NGINX's `proxy_next_upstream` directive was configured without `non_idempotent`. It only retries idempotent GET and HEAD requests, preventing duplicate POST or state-changing operations.
- **Q: What is the difference between liveness and readiness?**  
  *A:* `/api/health/live` checks that the ASGI event loop and process are alive. `/api/health/ready` validates that dependencies—specifically the shared media volume at `/app/media`—are mounted and readable.
