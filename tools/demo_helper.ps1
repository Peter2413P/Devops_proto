# ==============================================================================
# StreamOps: Interactive Academic Demonstration Helper
# Run this script during project presentation or evaluation.
# Usage: .\tools\demo_helper.ps1
# ==============================================================================

$RootPath = Split-Path -Parent $PSScriptRoot
Set-Location $RootPath

function Show-Header {
    Clear-Host
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host "       StreamOps - DevOps-Based Video Streaming Platform" -ForegroundColor White
    Write-Host "                Academic Demonstration Helper (Sem 5)" -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host " Repo Root: $RootPath" -ForegroundColor DarkGray
    Write-Host ""
}

function Show-Menu {
    Write-Host "Select an action for the presentation:" -ForegroundColor Yellow
    Write-Host "  [1] Run End-to-End System Validator & Verification Report"
    Write-Host "  [2] Run Backend & Reliability Unit Tests (pytest)"
    Write-Host "  [3] Launch Docker Compose Production Stack"
    Write-Host "  [4] Simulate Chaos Failure: Stop Backend 1 (Failover Test)"
    Write-Host "  [5] Simulate Self-Healing: Restart Backend 1 (Recovery Test)"
    Write-Host "  [6] Execute Automated Smoke Load Test"
    Write-Host "  [7] Generate High-Availability Reliability Report"
    Write-Host "  [8] Open Web Portals in Default Browser"
    Write-Host "  [9] Verify RFC 7233 HTTP Range Streaming (curl sample)"
    Write-Host "  [0] Exit"
    Write-Host ""
}

do {
    Show-Header
    Show-Menu
    $choice = Read-Host "Enter option number [0-9]"

    switch ($choice) {
        "1" {
            Write-Host "`n>>> Running StreamOps End-to-End Validator..." -ForegroundColor Cyan
            & .\backend\.venv\Scripts\python.exe tools\e2e_validator.py
            Write-Host "`nReport saved to artifacts\e2e-validation-report.md" -ForegroundColor Green
            Read-Host "Press Enter to return to menu"
        }
        "2" {
            Write-Host "`n>>> Running 38 Automated Backend Tests..." -ForegroundColor Cyan
            $env:PYTHONPATH = $RootPath
            & .\backend\.venv\Scripts\python.exe -m pytest backend\tests -v
            Read-Host "Press Enter to return to menu"
        }
        "3" {
            Write-Host "`n>>> Launching Docker Compose Stack..." -ForegroundColor Cyan
            docker compose up -d
            docker compose ps
            Read-Host "Press Enter to return to menu"
        }
        "4" {
            Write-Host "`n>>> [CHAOS] Stopping Backend 1 to demonstrate passive failover..." -ForegroundColor Yellow
            docker compose stop backend1
            Write-Host "Backend 1 stopped! Send traffic to http://localhost:8080 to verify Backend 2 takes over." -ForegroundColor Green
            Read-Host "Press Enter to return to menu"
        }
        "5" {
            Write-Host "`n>>> [RECOVERY] Restarting Backend 1 to demonstrate automated healing..." -ForegroundColor Yellow
            docker compose start backend1
            Write-Host "Backend 1 restarted! Healthcheck will re-admit it to the NGINX pool." -ForegroundColor Green
            Read-Host "Press Enter to return to menu"
        }
        "6" {
            Write-Host "`n>>> Executing Local Smoke Load Test (20 requests)..." -ForegroundColor Cyan
            & .\backend\.venv\Scripts\python.exe tools\http_load_runner.py --url http://127.0.0.1:8000 --profile smoke --requests 20 --out artifacts\load-tests\smoke-summary.json
            Read-Host "Press Enter to return to menu"
        }
        "7" {
            Write-Host "`n>>> Generating Comprehensive Reliability Report..." -ForegroundColor Cyan
            & .\backend\.venv\Scripts\python.exe tools\reliability_report.py --k6-json artifacts\load-tests\smoke-summary.json --chaos-json artifacts\chaos-experiments\latest-experiment.json --out-md artifacts\reliability-report.md --out-json artifacts\reliability-report.json
            Read-Host "Press Enter to return to menu"
        }
        "8" {
            Write-Host "`n>>> Opening platform endpoints in browser..." -ForegroundColor Cyan
            Start-Process "http://localhost:8080"
            Start-Process "http://localhost:3000"
            Start-Process "http://localhost:9090"
            Start-Process "http://localhost:8080/docs"
            Read-Host "Press Enter to return to menu"
        }
        "9" {
            Write-Host "`n>>> Testing RFC 7233 Range Request (bytes 0-1023)..." -ForegroundColor Cyan
            curl.exe -i -H "Range: bytes=0-1023" http://127.0.0.1:8000/api/videos/sample/stream
            Read-Host "`nPress Enter to return to menu"
        }
        "0" {
            Write-Host "`nExiting demonstration helper. Good luck with your presentation!" -ForegroundColor Green
            break
        }
        default {
            Write-Host "Invalid selection. Please choose an option from 0 to 9." -ForegroundColor Red
            Start-Sleep -Seconds 1
        }
    }
} while ($choice -ne "0")
