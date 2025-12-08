# NUAM Exchange - Quick Start Script for PowerShell
# Run this from the project root directory

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host " NUAM Exchange - Full Stack Startup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if directories exist
if (-not (Test-Path "backend")) {
    Write-Host "ERROR: backend folder not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

if (-not (Test-Path "frontend")) {
    Write-Host "ERROR: frontend folder not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

Write-Host "Starting NUAM Exchange..." -ForegroundColor Green
Write-Host ""
Write-Host "Opening 2 terminals:" -ForegroundColor Yellow
Write-Host "  1. Backend (FastAPI on port 8000)" -ForegroundColor Yellow
Write-Host "  2. Frontend (React/Vite on port 5173)" -ForegroundColor Yellow
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "Starting Backend Server..." -ForegroundColor Green
$backendScript = {
    Set-Location backend
    .\.venv\Scripts\Activate.ps1
    python -m uvicorn app:app --reload --port 8000
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend Server..." -ForegroundColor Green
$frontendScript = {
    Set-Location frontend
    npm run dev
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript -WindowStyle Normal

Write-Host ""
Write-Host "Waiting for servers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check services
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Checking service status..." -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$backend = netstat -ano | findstr ":8000"
if ($backend) {
    Write-Host "[OK] Backend is running on http://localhost:8000" -ForegroundColor Green
} else {
    Write-Host "[WAIT] Backend is starting... (may take 10 seconds)" -ForegroundColor Yellow
}

$frontend = netstat -ano | findstr ":5173"
if ($frontend) {
    Write-Host "[OK] Frontend is running on http://localhost:5173" -ForegroundColor Green
} else {
    Write-Host "[WAIT] Frontend is starting... (may take 10 seconds)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Wait for both terminals to show 'running' message" -ForegroundColor Cyan
Write-Host "  2. Browser should open frontend automatically" -ForegroundColor Cyan
Write-Host "  3. Login with: MirtaAguilar / 1234" -ForegroundColor Cyan
Write-Host "  4. Or use: GabrielFuentes / admin" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan
Write-Host "Health check: http://localhost:8000/health" -ForegroundColor Cyan
Write-Host "Swagger docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to close this window"
