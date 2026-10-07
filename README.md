# DevOps-Based Video Streaming Platform (StreamOps)
> **Interactive Academic Prototype for DevOps Coursework & Defense**

---

## 📌 1. Project Title & Overview
**Project Name:** DevOps-Based Video Streaming Platform (`StreamOps`)  
**Context:** Academic Demonstration Prototype (Sem 5 DevOps Curriculum)  
**Live Development Port:** `http://localhost:5173/`

> **Academic Notice:**  
> This project is an **educational prototype**. DevOps infrastructure such as Kubernetes, Docker orchestration, CI/CD pipelines, Prometheus, Grafana, and auto-scaling are **simulated through an interactive frontend** rather than deployed as real multi-machine infrastructure. This provides a clear, zero-setup, visual demonstration of the core engineering solutions for academic evaluations and examiners.

---

## 🎯 2. Problem Statement
> *"Video streaming platforms must handle high traffic, frequent updates, and service failures while maintaining fast and reliable video delivery."*

Traditional monolithic and static server deployments suffer from critical vulnerabilities when delivering video at scale:
1. **Traffic Spikes & CPU Saturation:** Viral videos or live events overwhelm single servers, resulting in 90%+ CPU spikes, dropped frames, packet loss, and viewer buffering.
2. **Single Point of Failure (SPOF):** If a single media streaming server crashes due to a software defect or kernel panic, all viewers experience immediate service disruption.
3. **Risky Manual Deployments:** Releasing codec updates, security patches, or new features manually causes human configuration errors and costly maintenance downtime.
4. **Lack of Telemetry:** Administrators discover outages only after viewers complain, rather than preemptively detecting resource degradation.

---

## 💡 3. Proposed Solution
> *"Use DevOps concepts such as containerization, automated deployment, monitoring, high availability, and auto-scaling to improve reliability and scalability."*

StreamOps demonstrates how modern DevOps practices solve each challenge:
- **Elastic Auto-Scaling (HPA):** Dynamically provisions backend instances when CPU load exceeds defined thresholds (e.g. 70%), distributing HTTP chunk requests and lowering CPU back to ~55%.
- **High Availability & Failover:** Upstream load balancers monitor container health. If an instance fails, traffic is instantly rerouted to healthy nodes, maintaining 100% platform availability.
- **Automated CI/CD Pipeline:** A multi-stage automated workflow runs tests, builds container images, and conducts zero-downtime rolling deployments from version `v1.0.0` to `v1.1.0`.
- **Continuous Telemetry & Observability:** Real-time dashboards track CPU usage, active viewers, request throughput, and latency alongside timestamped audit logs.

---

## 🛠 4. Technology Stack
- **Framework:** React 18 + Vite 6
- **Routing:** React Router v6 (`/`, `/watch`, `/dashboard`, `/simulation`, `/architecture`)
- **Styling:** Vanilla CSS3 Design System (Modern dark navy aesthetic, glassmorphism, responsive grid layouts, custom progress indicators)
- **Icons:** Lucide React
- **Data & Telemetry:** Lightweight SVG time-series sparklines and client-side reactive state engine (`SimulationContext`)
- **Video Delivery:** Native HTML5 Video Element streaming `public/videos/sample.mp4` with automated fallback handling

---

## 🚀 5. Key Features & Page Breakdown

| Page | Route | Description & Key Features |
|---|---|---|
| **Home** | `/` | Hero section, StreamOps branding, featured demo video preview card, and four "Why DevOps?" cards (Scalability, Reliability, Monitoring, Automated Deployment). |
| **Watch Video** | `/watch` | Functional video player with native controls (play, pause, seek, volume, fullscreen), dynamic viewer count, 1080p stream tag, and server health indicator. Graceful fallback if video is missing. |
| **DevOps Dashboard** | `/dashboard` | Executive telemetry cockpit with 6 animated KPI cards (Active Users, Requests/sec, CPU %, Memory %, Pods, Status), real-time SVG charts, individual backend node status cards, and audit event feed. |
| **Simulation Control Center** | `/simulation` | Interactive playground to trigger traffic surges (Normal, High, Extreme), execute Horizontal Auto-Scaling, simulate node crashes/failovers, and run CI/CD deployments. |
| **Architecture & Specification** | `/architecture` | Visual diagram of the Proposed Production Architecture and DevOps Lifecycle, educational concept cards, and a Problem vs Solution Defense Matrix. |
| **Academic Presentation Mode** | *Header Button* | One-click examiner walkthrough mode providing guided scenario steps and problem vs solution reference banners. |

---

## 🏗 6. Proposed Production Architecture

```
                    VIEWERS / CLIENT DEVICES
                               |
                               v
                  React Streaming Frontend (CDN Edge)
                               |
                               v
                  NGINX / HAProxy Load Balancer
                 (Health Checks & Round-Robin)
                               |
        +----------------------+----------------------+
        |                      |                      |
        v                      v                      v
Backend Instance 1      Backend Instance 2      Backend Instance 3
   (Docker Pod 1)         (Docker Pod 2)         (Docker Pod 3)
   Port: 8081             Port: 8082             Port: 8083
   Zone: us-east-1a       Zone: us-east-1b       Zone: us-east-1c
        |                      |                      |
        +----------------------+----------------------+
                               |
                               v
              Distributed Video Object Storage (S3 / MinIO)
```

### Continuous DevOps CI/CD & Auto-Scaling Loop
```
GitHub Commit ──> Automated CI (Tests & Lint) ──> Docker Build ──> Rolling CD Deploy
                                                                          │
Auto-Scaling (HPA) <── Threshold Alarms <── Prometheus & Grafana Telemetry ◄┘
```

---

## 🔬 7. How Concepts Are Simulated

### A. Auto-Scaling Simulation
1. Initial baseline: 1 backend instance running at 30% CPU with 100 viewers.
2. Clicking **Extreme Traffic** spikes load to 2,500 viewers and 350 req/s, driving CPU to **95% (OVERLOADED)**.
3. Clicking **Enable Auto Scaling** triggers a multi-phase timed animation:
   - *Phase 1:* Detecting high load (> 70% threshold)
   - *Phase 2:* Scaling backend via Horizontal Pod Autoscaler
   - *Phase 3:* Booting Backend Instance 2 in `us-east-1b`
   - *Phase 4:* Booting Backend Instance 3 in `us-east-1c`
   - *Phase 5:* Load balancing requests across 3 target nodes
   - *Phase 6:* CPU normalizes to **58%**, status returns to **HEALTHY**.

### B. High Availability & Failover Simulation
1. Clicking **Simulate Server Failure** crashes Instance 2 (`🔴 FAILED`).
2. The load balancer detects the timeout and drains connections from Instance 2.
3. Traffic is instantly redistributed to healthy nodes (Instance 1: 50%, Instance 3: 50%).
4. System Status displays **AVAILABLE** (Zero viewer disconnection, High Availability maintained).
5. A **Self-Heal / Restart Pod** button simulates container restart back to 33% balanced traffic.

### C. Automated CI/CD Deployment Simulation
1. Current version starts at `v1.0.0`.
2. Clicking **Deploy New Version** launches a 6-stage animated rollout pipeline:
   - Step 1: Preparing release manifest & Git commit
   - Step 2: Running automated test suite (128 passing tests)
   - Step 3: Building multi-stage production Docker image
   - Step 4: Rolling blue/green zero-downtime deployment
   - Step 5: Automated HTTP health check probe
   - Step 6: Upgraded to **v1.1.0** with **0 seconds downtime**.

### D. Real-Time Telemetry & Monitoring
- Responsive SVG sparklines track **CPU Usage**, **Active Viewers**, **Request Rate**, and **Instance Count**.
- Realistic micro-jitter simulates live server activity every 3 seconds.
- Every state transition appends a formatted entry to the **DevOps Telemetry Log**.

---

## 🎬 8. Recommended Examiner Demo Script (3-Minute Walkthrough)

To present this prototype to a professor or examiner:

1. **Step 1 — Baseline Operation:**
   - Open Home (`/`) and show StreamOps branding.
   - Click **Watch Demo Video** (`/watch`) to confirm video playback and baseline server health.
   - Open **Dashboard** (`/dashboard`): 1 backend node, 100 viewers, 30% CPU, status `HEALTHY`.
2. **Step 2 — Demonstrate the Problem (Traffic Spike):**
   - Click **Simulation** (`/simulation`).
   - Click **Extreme Traffic** (2,500 viewers, 350 req/s).
   - Observe single-server CPU surging to **95%** and status shifting to **OVERLOADED**.
3. **Step 3 — Demonstrate the DevOps Solution (Auto-Scaling):**
   - Click **Enable Auto-Scaling**.
   - Watch the animated lifecycle spin up Instance 2 and Instance 3.
   - Observe CPU drop from 95% down to **58%** and system status recover to **HEALTHY**.
4. **Step 4 — Demonstrate High Availability & Failover:**
   - Click **Simulate Server Failure (Crash Instance 2)**.
   - Show Instance 2 turning **FAILED**, but the system status remaining **AVAILABLE**.
   - Point out the traffic redistribution (Instances 1 & 3 each taking 50% traffic).
5. **Step 5 — Demonstrate Automated Zero-Downtime Deployment:**
   - Click **Deploy New Version (v1.1.0)**.
   - Follow the 6 pipeline stages (Tests -> Docker Build -> Rolling Deploy -> Health Check).
   - Verify version incrementing to `v1.1.0` with **0 seconds downtime**.
6. **Step 6 — Academic Architecture & Conclusion:**
   - Navigate to **Architecture** (`/architecture`).
   - Switch between the **Runtime Architecture** and **DevOps Lifecycle** views.
   - Highlight the **Problem vs Solution Matrix**.

---

## 💻 9. Installation & Local Run Instructions

### Prerequisites
- Node.js (v18.x or newer)
- npm (v9.x or newer)

### Setup & Launch
```bash
# 1. Clone or navigate to the project directory
cd "d:\College\Class\Sem 5\Devops\Proto"

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open your browser at:
```
http://localhost:5173/
```

### Production Build Validation
```bash
npm run build
npm run preview
```

---

## ⚠️ 10. Educational Limitations & Scope
- **Client-Side Simulation:** Infrastructure state (traffic, node health, deployment) is modeled in browser memory using React Context rather than physical bare-metal or cloud clusters.
- **Single-Host Video:** A local HTML5 video is used instead of a distributed multi-bitrate HLS/DASH transcoder cluster.
- **Mock Telemetry:** Charts reflect simulated mathematical load profiles rather than a physical Prometheus exporter daemon.

---

## 🔮 11. Future Extensions
1. Integrating real Docker Compose configurations for local container orchestration.
2. Hooking an actual Prometheus exporter to expose `/metrics` endpoints.
3. Adding adaptive bitrate (ABR) switching simulation between 360p, 720p, and 1080p based on simulated bandwidth.
4. Implementing Chaos Engineering simulations (e.g. Chaos Monkey random pod terminates).

---

## 📄 Academic Integrity & License
Created as an academic demonstrator for DevOps engineering coursework. MIT License.
