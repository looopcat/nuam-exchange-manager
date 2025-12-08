# NUAM Exchange - Full Stack Running Guide

## ⚠️ "Failed to Fetch" Error - Troubleshooting

This error occurs when the frontend cannot connect to the backend. Follow these steps:

### Step 1: Verify Backend is Running
```bash
# Open a terminal and check if port 8000 is in use
netstat -ano | findstr ":8000"
```
- If you see output with port 8000, backend is running ✅
- If empty, backend is NOT running ❌ → go to Step 2

### Step 2: Start Backend Server (in a NEW terminal)
```bash
# Navigate to backend folder
cd backend

# Activate virtual environment (Windows)
.\.venv\Scripts\Activate.ps1

# Run initialization (first time only)
python seteo_programa.py

# Start FastAPI server
python -m uvicorn app:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete
```

### Step 3: Verify Backend is Healthy
Open browser: `http://localhost:8000/health`

You should see:
```json
{
  "mongodb": "connected",
  "mysql": "connected", 
  "status": "healthy"
}
```

**If mongodb or mysql shows "disconnected":**
- Ensure MongoDB is running: `mongod` (on port 27017)
- Ensure MySQL is running (check Windows Services)
- Verify credentials in `db_coneccion.py` match your setup

### Step 4: Verify Frontend is Running
Check if another terminal shows:
```
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

If not, start it:
```bash
# In a NEW terminal (from frontend folder)
npm run dev
```

### Step 5: Login
- Go to `http://localhost:5173`
- Use: **MirtaAguilar** / **1234** (Operador)
- Or: **GabrielFuentes** / **admin** (Admin)

---

## ✅ Full Stack Checklist

| Component | Port | Command | Status |
|-----------|------|---------|--------|
| MongoDB | 27017 | `mongod` | Check if running |
| MySQL | 3306 | Windows Service | Check Services |
| Backend (FastAPI) | 8000 | `python -m uvicorn app:app --reload --port 8000` (from backend/) | Must be RUNNING |
| Frontend (React/Vite) | 5173 | `npm run dev` (from frontend/) | Must be RUNNING |

## 🚀 Recommended Setup

Open **4 separate terminals**:

### Terminal 1: Backend
```bash
cd backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app:app --reload --port 8000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

### Terminal 3: Monitoring (Optional)
```bash
# Keep this open to monitor services
while($true) { 
  Clear-Host
  Write-Host "=== SERVICES STATUS ===" -ForegroundColor Green
  netstat -ano | findstr ":8000" | ForEach-Object { Write-Host "Backend (8000): RUNNING" -ForegroundColor Green }
  netstat -ano | findstr ":5173" | ForEach-Object { Write-Host "Frontend (5173): RUNNING" -ForegroundColor Green }
  Start-Sleep -Seconds 5
}
```

### Terminal 4: Free for other commands

---

## 🔧 Common Issues & Fixes

### Issue: "Failed to Fetch" in Browser
**Cause**: Backend not running  
**Fix**: Start backend in Terminal 1 (see above)

### Issue: "Cannot GET /api/login"
**Cause**: Wrong URL or backend crashed  
**Fix**: 
- Check `http://localhost:8000/` returns `{"message": "NUAM Exchange API"}`
- Check browser Console (F12) for actual error

### Issue: MongoDB/MySQL not connected
**Cause**: Database servers not running  
**Fix**:
- MongoDB: Run `mongod` from command line
- MySQL: Check Windows Services (services.msc) → MySQL is running

### Issue: Module not found errors in backend
**Cause**: Running from wrong directory or missing dependencies  
**Fix**:
```bash
cd backend  # Must be in backend folder
python -m pip install -r requirements.txt  # Install all deps
python -m uvicorn app:app --reload --port 8000
```

### Issue: Port already in use
**Cause**: Service already running on that port  
**Fix**:
```bash
# Find process using port 8000
netstat -ano | findstr ":8000"
# Kill it (replace PID with actual number)
taskkill /PID <PID> /F
```

---

## 📝 API Test URLs (after backend starts)

```bash
# Test backend is alive
curl http://localhost:8000/

# Test health check
curl http://localhost:8000/health

# Test login (example)
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"MirtaAguilar","password":"1234"}'
```

---

## 🎯 Success Indicators

✅ Backend shows: `Application startup complete`  
✅ Frontend shows: `Local: http://localhost:5173`  
✅ Health check returns: `"status": "healthy"`  
✅ Login page loads without errors  
✅ Can login with test credentials  
✅ See dashboard after login

---

## 💡 Tips

- Keep all 4 services running while developing
- Frontend will auto-refresh when you save JS files
- Backend will auto-reload when you save Python files
- Use browser DevTools (F12) → Network tab to see API calls
- Use browser DevTools → Console to see errors
- Check `http://localhost:8000/docs` for Swagger API docs

