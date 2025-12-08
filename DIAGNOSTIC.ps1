# NUAM Exchange - Diagnostic Check Script
# Run this to verify your setup is correct

Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  NUAM Exchange - System Diagnostic Check       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Track overall status
$allGood = $true

# 1. Check Python
Write-Host "1️⃣  Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = & python --version 2>&1
    Write-Host "   ✅ Python installed: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Python not found. Install from python.org" -ForegroundColor Red
    $allGood = $false
}

# 2. Check Node.js
Write-Host ""
Write-Host "2️⃣  Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = & node --version 2>&1
    Write-Host "   ✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js not found. Install from nodejs.org" -ForegroundColor Red
    $allGood = $false
}

# 3. Check npm
Write-Host ""
Write-Host "3️⃣  Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = & npm --version 2>&1
    Write-Host "   ✅ npm installed: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ npm not found" -ForegroundColor Red
    $allGood = $false
}

# 4. Check backend folder
Write-Host ""
Write-Host "4️⃣  Checking backend folder..." -ForegroundColor Yellow
if (Test-Path "backend") {
    Write-Host "   ✅ backend/ folder exists" -ForegroundColor Green
    
    # Check Python files
    $requiredFiles = @("app.py", "db_coneccion.py", "modelo_sql.py", "seteo_programa.py")
    foreach ($file in $requiredFiles) {
        if (Test-Path "backend/$file") {
            Write-Host "      ✅ $file" -ForegroundColor Green
        } else {
            Write-Host "      ❌ $file missing" -ForegroundColor Red
            $allGood = $false
        }
    }
    
    # Check venv
    if (Test-Path "backend/.venv") {
        Write-Host "      ✅ Virtual environment exists" -ForegroundColor Green
    } else {
        Write-Host "      ⚠️  Virtual environment not created" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ backend/ folder not found" -ForegroundColor Red
    $allGood = $false
}

# 5. Check frontend folder
Write-Host ""
Write-Host "5️⃣  Checking frontend folder..." -ForegroundColor Yellow
if (Test-Path "frontend") {
    Write-Host "   ✅ frontend/ folder exists" -ForegroundColor Green
    
    # Check package.json
    if (Test-Path "frontend/package.json") {
        Write-Host "      ✅ package.json" -ForegroundColor Green
    } else {
        Write-Host "      ❌ package.json missing" -ForegroundColor Red
        $allGood = $false
    }
    
    # Check node_modules
    if (Test-Path "frontend/node_modules") {
        Write-Host "      ✅ node_modules installed" -ForegroundColor Green
    } else {
        Write-Host "      ⚠️  node_modules not installed (run: npm install)" -ForegroundColor Yellow
    }
    
    # Check src folder
    if (Test-Path "frontend/src") {
        Write-Host "      ✅ src/ folder exists" -ForegroundColor Green
    } else {
        Write-Host "      ❌ src/ folder missing" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "   ❌ frontend/ folder not found" -ForegroundColor Red
    $allGood = $false
}

# 6. Check databases
Write-Host ""
Write-Host "6️⃣  Checking databases..." -ForegroundColor Yellow

# MongoDB
try {
    # This will fail if mongo isn't installed, but we just check if running
    $mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
    if ($mongoProcess) {
        Write-Host "   ✅ MongoDB is running" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  MongoDB is not running (expected on first run)" -ForegroundColor Yellow
        Write-Host "      Start with: mongod" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ⚠️  Could not check MongoDB status" -ForegroundColor Yellow
}

# MySQL
try {
    $mysqlProcess = Get-Process mysqld -ErrorAction SilentlyContinue
    if ($mysqlProcess) {
        Write-Host "   ✅ MySQL is running" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  MySQL is not running (check Windows Services)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Could not check MySQL status" -ForegroundColor Yellow
}

# 7. Check ports
Write-Host ""
Write-Host "7️⃣  Checking ports..." -ForegroundColor Yellow

$port8000 = netstat -ano | findstr ":8000"
if ($port8000) {
    Write-Host "   ✅ Port 8000 is in use (backend may be running)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Port 8000 is free (backend not started)" -ForegroundColor Yellow
}

$port5173 = netstat -ano | findstr ":5173"
if ($port5173) {
    Write-Host "   ✅ Port 5173 is in use (frontend may be running)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Port 5173 is free (frontend not started)" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  SUMMARY                                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

if ($allGood) {
    Write-Host "✅ All essential components are in place!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Green
    Write-Host "  1. Make sure MongoDB and MySQL are running" -ForegroundColor Green
    Write-Host "  2. Run: .\START.ps1  (or START.bat)" -ForegroundColor Green
    Write-Host "  3. Or manually start backend and frontend (see README.md)" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some components are missing or not set up properly." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please fix the issues above before starting." -ForegroundColor Yellow
    Write-Host "See README.md or FULL_STACK_GUIDE.md for help." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - README.md (Project overview)" -ForegroundColor Gray
Write-Host "   - FULL_STACK_GUIDE.md (Detailed setup & troubleshooting)" -ForegroundColor Gray
Write-Host "   - .github/copilot-instructions.md (Development patterns)" -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to close"
