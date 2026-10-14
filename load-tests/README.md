# StreamOps Load Testing Suite (k6)

This directory contains real performance and load-testing profiles for the StreamOps containerized video streaming gateway (`http://localhost:8080`).

---

## 🚀 Profiles Overview

| Script | Profile | Virtual Users | Duration | Purpose |
|---|---|---|---|---|
| [`smoke.js`](file:///d:/College/Class/Sem%205/Devops/Proto/load-tests/smoke.js) | Smoke Test | 1 VU | 15s | Quick sanity check of gateway, backend health, video catalogue, and Range streaming |
| [`load.js`](file:///d:/College/Class/Sem%205/Devops/Proto/load-tests/load.js) | Gradual Load | 1 -> 10 VUs | 2.5 min | Evaluates sustained traffic distribution across `backend1` and `backend2` replicas |
| [`streaming.js`](file:///d:/College/Class/Sem%205/Devops/Proto/load-tests/streaming.js) | Range Seeking | 2 -> 6 VUs | 50s | Verifies RFC 7233 partial content chunk delivery, exact byte lengths, and 416 error handling |
| [`stress.js`](file:///d:/College/Class/Sem%205/Devops/Proto/load-tests/stress.js) | Saturation Stress | 5 -> 25 VUs | 2 min | Controlled saturation test (Opt-in with `ENABLE_STRESS=true`) |

---

## 📦 k6 Installation Guide (Windows)

If `k6` is not yet installed on your Windows environment, install it via any of the following:

### Option 1: Via Windows Package Manager (winget)
```powershell
winget install k6 --source winget
```

### Option 2: Via Chocolatey
```powershell
choco install k6
```

### Option 3: Direct Official Binary / MSI
Download and run the installer from: [https://dl.k6.io/msi/k6-latest.amd64.msi](https://dl.k6.io/msi/k6-latest.amd64.msi)

Verify installation:
```powershell
k6 version
```

---

## 🛠 Running the Load Tests

Ensure the StreamOps Docker Compose stack is running (`docker compose up -d`).

### 1. Run Smoke Test
```powershell
k6 run load-tests/smoke.js
```

Export summary to JSON:
```powershell
k6 run --summary-export artifacts/load-tests/smoke-summary.json load-tests/smoke.js
```

### 2. Run Gradual Load Test
```powershell
k6 run load-tests/load.js
```

### 3. Run Range Streaming Test
```powershell
k6 run load-tests/streaming.js
```

### 4. Run Stress Test (Explicit Opt-In Required)
```powershell
$env:ENABLE_STRESS="true"
k6 run load-tests/stress.js
```

---

## ⚙️ Environment Variables

- `BASE_URL`: StreamOps gateway URL (Default: `http://localhost:8080`)
- `VIDEO_ID`: Specific video ID to stream (Default: `sample`)
- `ENABLE_STRESS`: Must be set to `true` to execute the stress profile
