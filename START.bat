@echo off
REM NUAM Exchange - Quick Start Script for Windows

echo.
echo ======================================
echo  NUAM Exchange - Full Stack Startup
echo ======================================
echo.

REM Check if backend directory exists
if not exist "backend" (
    echo ERROR: backend folder not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

REM Check if frontend directory exists
if not exist "frontend" (
    echo ERROR: frontend folder not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo Starting NUAM Exchange...
echo.
echo Opening 2 terminals:
echo   1. Backend (FastAPI on port 8000)
echo   2. Frontend (React/Vite on port 5173)
echo.
echo ======================================
echo.

REM Start Backend in new window
echo Starting Backend Server...
start cmd /k "cd backend && .\.venv\Scripts\Activate.ps1 && python -m uvicorn app:app --reload --port 8000"

timeout /t 3

REM Start Frontend in new window
echo Starting Frontend Server...
start cmd /k "cd frontend && npm run dev"

echo.
echo Waiting for servers to start...
timeout /t 5

REM Check if services are running
echo.
echo ======================================
echo Checking service status...
echo ======================================
echo.

netstat -ano | findstr ":8000" >nul
if %errorlevel% equ 0 (
    echo [OK] Backend is running on http://localhost:8000
) else (
    echo [WAIT] Backend is starting... (may take 10 seconds)
)

netstat -ano | findstr ":5173" >nul
if %errorlevel% equ 0 (
    echo [OK] Frontend is running on http://localhost:5173
) else (
    echo [WAIT] Frontend is starting... (may take 10 seconds)
)

echo.
echo ======================================
echo Next steps:
echo   1. Wait for both terminals to show "running" message
echo   2. Browser should open frontend automatically
echo   3. Login with: MirtaAguilar / 1234
echo   4. Or use: GabrielFuentes / admin
echo.
echo Health check: http://localhost:8000/health
echo Swagger docs: http://localhost:8000/docs
echo ======================================
echo.

pause
