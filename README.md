# NUAM Exchange - Multi-Exchange Trading Platform

A full-stack web application for multi-regional stock exchange trading (Chile, Peru, Colombia).

**Tech Stack:**
- **Backend**: FastAPI (Python) with dual-database architecture (MongoDB + MySQL)
- **Frontend**: React 18 + Vite + ES6
- **Databases**: MongoDB (auth/config), MySQL (orders/transactions)

## 🚀 Quick Start

### Option 1: One-Click Start (Recommended)

**Windows - PowerShell:**
```powershell
.\START.ps1
```

**Windows - Command Prompt:**
```cmd
START.bat
```

This opens 2 terminals automatically and starts both services.

### Option 2: Manual Start (4 Terminals)

**Terminal 1 - Backend:**
```bash
cd backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Then:**
- Open `http://localhost:5173` in browser
- Login with test credentials (see below)

## 📋 Test Credentials

| Role | Username | Password |
|------|----------|----------|
| Operador (Trader) | MirtaAguilar | 1234 |
| Admin | GabrielFuentes | admin |

## 🏗️ Project Structure

```
nuam_project/
├── backend/                          # FastAPI server
│   ├── app.py                        # Main FastAPI app with all endpoints
│   ├── db_coneccion.py              # MongoDB & MySQL connections
│   ├── modelo_sql.py                # SQLAlchemy ORM models
│   ├── seteo_programa.py            # Database initialization
│   ├── routes/                      # (planned) Modular routes
│   │   ├── auth_routes.py
│   │   ├── operador_routes.py
│   │   └── admin_routes.py
│   └── .venv/                       # Python virtual environment
│
├── frontend/                         # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── OperadorDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js              # Centralized API service
│   │   ├── App.jsx                 # Main app with routing
│   │   └── main.jsx                # Vite entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .github/
│   └── copilot-instructions.md     # AI coding agent guide
│
├── FULL_STACK_GUIDE.md             # Troubleshooting & detailed setup
├── START.ps1                        # PowerShell startup script
├── START.bat                        # Batch startup script
└── README.md                        # This file
```

## 🎯 Features

### Operador (Trader) Dashboard
- ✅ Place buy/sell orders (Compra/Venta)
- ✅ Specify instrument, quantity, limit price
- ✅ View order history with status tracking
- ✅ Real-time order list updates
- ✅ Order status: Pendiente, Ejecutada, Cancelada

### Admin Dashboard
- ✅ View consolidated transaction reports
- ✅ Configure market rates (tarifas) for CL, PE, CO
- ✅ View current tariff settings
- ✅ Transaction details: price, quantity, amount, timestamp

### Backend API
- ✅ RESTful endpoints with Swagger/OpenAPI docs
- ✅ Session-based authentication (JWT planned)
- ✅ Role-based access control (RBAC)
- ✅ Order simulation (70% execution probability)
- ✅ Dual-database architecture
- ✅ CORS configured for local development

## 🔧 Prerequisites

### System Requirements
- **Python**: 3.10+ (check: `python --version`)
- **Node.js**: 16+ (check: `node --version`)
- **MongoDB**: Running on localhost:27017
- **MySQL**: Running with root:Inacap.2024 on localhost:3306

### First-Time Setup

**1. Create Python virtual environment (Windows):**
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**2. Install Python dependencies:**
```bash
pip install fastapi uvicorn pymongo sqlalchemy pymysql bcrypt python-multipart
```

**3. Initialize databases:**
```bash
python seteo_programa.py
```

**4. Install Node dependencies:**
```bash
cd ../frontend
npm install
```

## 📚 API Endpoints

All endpoints return `{success: bool, message: str, ...}`

### Authentication
- `POST /api/login` - Login with username/password
- `POST /api/logout` - Logout current user
- `GET /health` - Check database connections

### Orders (Operador + Admin)
- `POST /api/orden` - Place new order
  ```json
  {
    "session_token": "...",
    "instrumento": "ENEL",
    "tipo": "Compra",
    "cantidad": 100,
    "precioLimite": 25.50
  }
  ```
- `GET /api/ordenes?session_token=...&limite=20` - Get user's orders

### Admin Only
- `GET /api/reportes?session_token=...&limite=10` - Transaction reports
- `POST /api/tarifas` - Configure market rates
  ```json
  {
    "session_token": "...",
    "bolsa": "CL",
    "tarifa_base": 0.005
  }
  ```
- `GET /api/tarifas?session_token=...` - Get configured rates

### Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🔐 Security Notes

⚠️ **Current Implementation (Development):**
- Session tokens stored in-memory (not persistent)
- Basic password hashing with bcrypt
- CORS open to localhost (hardcoded)
- No rate limiting
- No HTTPS

✅ **Production Recommendations:**
- Migrate to JWT tokens with expiration
- Use database for session storage
- Implement HTTPS/SSL
- Restrict CORS to specific domains
- Add rate limiting
- Use environment variables for secrets
- Add comprehensive logging

## 🐛 Troubleshooting

### "Failed to Fetch" Error
**Problem**: Frontend can't reach backend  
**Solution**:
1. Verify backend is running: `netstat -ano | findstr ":8000"`
2. Check health: `http://localhost:8000/health`
3. See `FULL_STACK_GUIDE.md` for detailed steps

### MongoDB/MySQL Connection Errors
**Problem**: Database not responding  
**Solution**:
1. Start MongoDB: `mongod`
2. Verify MySQL is running (Windows Services)
3. Check credentials in `backend/db_coneccion.py`

### Port Already in Use
**Problem**: Port 8000 or 5173 already occupied  
**Solution**:
```bash
# Find and kill process
netstat -ano | findstr ":8000"
taskkill /PID <PID> /F
```

### npm Module Errors
**Problem**: `node_modules` corrupted  
**Solution**:
```bash
cd frontend
rm -r node_modules package-lock.json
npm cache clean --force
npm install
```

## 📖 Documentation

- **Backend API Design**: See comments in `backend/app.py`
- **Frontend Component Guide**: See comments in `frontend/src/components/`
- **AI Agent Instructions**: See `.github/copilot-instructions.md`
- **Full Stack Setup**: See `FULL_STACK_GUIDE.md`

## 🚧 Future Enhancements

- [ ] JWT token authentication (replace session tokens)
- [ ] Real order matching engine
- [ ] WebSocket support for real-time updates
- [ ] Advanced charting and analytics
- [ ] Multi-language support (ES/EN)
- [ ] Mobile app (React Native)
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] PostgreSQL migration
- [ ] Redis caching layer

## 📝 License

INACAP Proyecto Integrado 2024

## 👥 Team

- **Developer**: INACAP Student
- **Backend Framework**: FastAPI
- **Frontend Framework**: React + Vite
- **Architecture**: Monolithic (Backend), Single-Page App (Frontend)

## 🆘 Support

For issues or questions:
1. Check `FULL_STACK_GUIDE.md` for common problems
2. Review `.github/copilot-instructions.md` for development patterns
3. Check browser DevTools (F12) for client errors
4. Check backend terminal for server errors
5. Verify all services are running (see Quick Start)

---

**Last Updated**: December 8, 2025  
**Status**: Development Ready ✅
