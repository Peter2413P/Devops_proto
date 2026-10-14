# StreamOps High-Availability (HA) & Failover Test Suite

This directory contains integration and high-availability tests verifying gateway routing, replica distribution, single-backend failover, recovery, and HTTP Range streaming.

---

## 📋 Test Files

| Test File | Objective | Preconditions |
|---|---|---|
| [`test_gateway_routing.py`](file:///d:/College/Class/Sem%205/Devops/Proto/tests/ha/test_gateway_routing.py) | Verifies NGINX gateway healthz, API routing, and replica header attachment | Gateway online (`http://localhost:8080`) |
| [`test_range_streaming.py`](file:///d:/College/Class/Sem%205/Devops/Proto/tests/ha/test_range_streaming.py) | Verifies HTTP 206 Partial Content, exact byte lengths, seeking, and 416 error handling | Gateway online (`http://localhost:8080`) |
| [`test_backend_failover.py`](file:///d:/College/Class/Sem%205/Devops/Proto/tests/ha/test_backend_failover.py) | Stops `backend1`, verifies uninterrupted service via `backend2`, and restores `backend1` | Running Docker daemon + Compose stack |
| [`test_backend_recovery.py`](file:///d:/College/Class/Sem%205/Devops/Proto/tests/ha/test_backend_recovery.py) | Re-starts a stopped backend replica and verifies it rejoins the active pool | Running Docker daemon + Compose stack |

---

## 🛠 Running the HA Test Suite

To run the HA test suite from Windows PowerShell:

```powershell
$env:PYTHONPATH="d:\College\Class\Sem 5\Devops\Proto"
.\backend\.venv\Scripts\pytest.exe tests/ha -v
```

> [!NOTE]
> If the live gateway or Docker daemon is not running, tests will cleanly report `SKIPPED` with an explanatory message rather than failing.
