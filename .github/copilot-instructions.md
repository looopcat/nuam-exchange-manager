# NUAM Exchange Project - AI Coding Agent Instructions

## Project Overview
**NUAM Exchange** is a multi-exchange trading platform supporting regional stock markets (Chile, Peru, Colombia). It features:
- FastAPI backend with dual-database architecture
- Order book and transaction execution system
- Role-based access (Operadores, Admins)
- Three bolsas/exchanges: CL, PE, CO

**Key Insight**: This is an _integrated project_ where the FastAPI layer (`app.py`) is the primary API, but legacy CLI modules (`main.py`, `auth.py`, `operador.py`, `administrador.py`) represent an older interaction pattern. New features should be added to `app.py` endpoints, not the CLI modules.

---

## Architecture & Data Flow

### Database Strategy (Dual-DB)
- **MongoDB** (`db_coneccion.py`): User authentication, market configuration, logs
  - Collections: `usuarios`, `configuracion_mercado`
  - Use `get_mongodb()` to access; handles connection errors gracefully
  
- **MySQL** (`db_coneccion.py`): Critical order/transaction data (ACID compliance)
  - Models: `Orden`, `Transaccion` (defined in `modelo_sql.py`)
  - Always use `@contextmanager get_mysql_session()` for transactions
  - Automatic rollback on exceptions; explicit `commit()` on context exit

**Why dual-DB?**: MongoDB handles configuration volatility (tarifas), MySQL ensures transaction integrity (orders, matching).

### Core Entity Flow
```
User (MongoDB) → Login (app.py) → Session Token (in-memory sesiones_activas) 
                    ↓
              Colocar Orden (app.py)
                    ↓
              MySQL Orden + Transaccion (70% execution probability)
                    ↓
              Return to Client (success, orden_data, transaccion_data)
```

### Role-Based Permissions Pattern
```python
if user['rol'] not in ['Operador', 'Admin']:  # Found in app.py /api/orden
    raise HTTPException(status_code=403, detail="No tiene permisos...")
```
- Checked at endpoint level, not middleware
- Roles: `'Operador'`, `'Admin'`
- User object includes: `idUsuario`, `nombre`, `rol`, `perfilBolsa`

---

## API Endpoint Patterns (app.py)

### Pydantic Models (Response Consistency)
All endpoints use consistent response format:
```python
class LoginResponse(BaseModel):
    success: bool
    message: str
    user: Optional[dict] = None
    session_token: Optional[str] = None
```
**Pattern**: Always include `success` boolean + `message` for client clarity.

### Session Token Authentication
- **Session storage**: In-memory dict `sesiones_activas` (not production-ready)
- **Token format**: `f"session_{username}_{timestamp}"`
- **Validation**: `get_current_user(session_token)` raises 401 if invalid
- **TODO**: Replace with JWT in production (see /api/login comment)

### Key Endpoints
- **POST /api/login**: Username/password auth against MongoDB
- **POST /api/logout**: Clears session from sesiones_activas
- **POST /api/orden**: Places buy/sell order; 70% execution probability (line 134)
- **GET /api/ordenes**: Returns user's order history
- **GET /api/reportes**: Admin-only transaction summary
- **POST /api/tarifas**: Admin-only market rate configuration
- **GET /api/health**: Database connection status check

---

## Project-Specific Patterns & Conventions

### Pydantic Response Wrapping
Every API response uses Pydantic models with `success` + `message`. Example from `colocar_orden()`:
```python
return OrdenResponse(
    success=True,
    message=mensaje,  # "Orden ejecutada exitosamente..." or "Pendiente de match..."
    orden=orden_data,
    transaccion=transaccion_data
)
```
**When adding endpoints**: Always wrap responses in a Pydantic model, never return raw dicts.

### Ordem/Transacción Conversion to JSON
MySQL ORM objects require explicit conversion (floats, dates):
```python
orden_data = {
    "idOrden": nueva_orden.idOrden,  # int (ok)
    "precioLimite": float(nueva_orden.precioLimite) if nueva_orden.precioLimite else None,  # REQUIRED
    "fechaCreacion": nueva_orden.fechaCreacion.isoformat()  # REQUIRED for DateTime
}
```
**Convention**: `float()` prices, `.isoformat()` datetimes before JSON serialization.

### Orden Status Enum
Defined in MySQL model: `Enum('Pendiente', 'Ejecutada', 'Cancelada')`
- Default: `'Pendiente'`
- Updated to `'Ejecutada'` after transaction match (app.py line 135)
- Used in `/api/ordenes` queries and responses

### Market/Bolsa Values
- Valid: `'CL'` (Chile), `'PE'` (Peru), `'CO'` (Colombia), `'Regional'` (Admin umbrella)
- Stored in `user['perfilBolsa']` and `transaccion.bolsaOrigen`
- Validation at config endpoint: `if request.bolsa not in ['CL', 'PE', 'CO']`

### Simulation Behavior
- **Order execution**: 70% probability (line 134: `if random.random() < 0.7`)
- **Execution price**: Uses `precioLimite` if provided, else random $90-100 range (line 135)
- Transacción fields use `'MATCH_FICTICIO'` placeholder when no real counterparty (line 139-140)

---

## Common Workflows

### Adding a New API Endpoint
1. Define Pydantic request/response model (see `TarifaRequest`, `OrdenResponse`)
2. Write `@app.get()` or `@app.post()` function in `app.py`
3. Call `get_current_user(session_token)` for auth
4. Check `user['rol']` if restricted
5. Use `with get_mysql_session() as session:` for DB operations
6. Return Pydantic response model instance (not dict)

**Example**: Tarifa endpoints (lines 278-306) show POST (admin config) and GET (retrieve) pattern.

### Debugging Database Issues
- **MongoDB down?** `get_mongodb()` returns `None`; endpoints raise 500 with detail message
- **MySQL error?** Exception caught in `get_mysql_session()`, logged, then re-raised
- **Test connection**: Call `GET /health` endpoint; returns mongodb/mysql status + overall health

### Querying Orders by User
```python
with get_mysql_session() as session:
    ordenes = session.query(Orden).filter(
        Orden.idUsuario == user['idUsuario']
    ).order_by(Orden.fechaCreacion.desc()).limit(limite).all()
```
**Pattern**: Always filter by `idUsuario` to prevent cross-user data leaks.

---

## Setup & Dependencies

### Required Packages
**Backend**:
```
pip install pymongo sqlalchemy pymysql bcrypt fastapi uvicorn
```

**Frontend** (React with Vite):
```
npm install  # Installs from package.json in frontend/
npm run dev  # Runs on http://localhost:5173
```

### Environment Prerequisites
1. **MongoDB** running on `localhost:27017` (see `db_coneccion.py` line 7)
2. **MySQL** running with credentials `root:Inacap.2024` on `localhost` (line 24)
3. **Database**: `Nuam` must exist in MySQL (created by `create_all_mysql_tables()`)
4. **Initial Users**: Created by `seteo_programa.py` on first run
5. **Node.js** 16+ for React frontend development

### Running the App

**Backend** (from `backend/` directory):
```bash
# First time only: Install dependencies
pip install fastapi uvicorn pymongo sqlalchemy pymysql bcrypt python-multipart

# Initialize databases and create default users
python seteo_programa.py

# Start FastAPI server (runs on http://localhost:8000)
python -m uvicorn app:app --reload --port 8000
```

**Frontend** (from `frontend/` directory):
```bash
# Install dependencies
npm install

# Development server (runs on http://localhost:5173)
npm run dev

# Production build
npm run build
npm run preview
```

### Default Test Users
- **Operador**: `MirtaAguilar` / `1234` (perfilBolsa: `CL`)
- **Admin**: `GabrielFuentes` / `admin` (perfilBolsa: `Regional`)

### Testing Endpoints Locally

**Using Swagger UI** (interactive):
```
http://localhost:8000/docs
```

**Using curl**:
```bash
# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"MirtaAguilar","password":"1234"}'

# Place order (use session_token from login response)
curl -X POST http://localhost:8000/api/orden \
  -H "Content-Type: application/json" \
  -d '{
    "session_token":"...",
    "instrumento":"ENEL",
    "tipo":"Compra",
    "cantidad":100,
    "precioLimite":25.50
  }'
```

---

## Troubleshooting Common Issues

### Backend Setup Issues

**Problem**: `uvicorn: command not found` or `No module named uvicorn`
- **Cause**: Uvicorn not installed in virtual environment or environment not activated
- **Solution**: 
  ```bash
  # Ensure virtual environment is active (you should see (.venv) in terminal)
  .venv\Scripts\Activate.ps1  # Windows
  source .venv/bin/activate   # Mac/Linux
  
  # Install/reinstall dependencies
  python -m pip install --upgrade pip
  python -m pip install fastapi uvicorn pymongo sqlalchemy pymysql bcrypt python-multipart
  
  # Run using module syntax (most reliable)
  python -m uvicorn app:app --reload --port 8000
  ```

**Problem**: `Error loading ASGI app. Attribute "app" not found in module "app"`
- **Cause**: `app.py` is empty, has syntax errors, or missing the `app = FastAPI(...)` line
- **Solution**:
  1. Verify file exists: `ls app.py` (should show file size > 0)
  2. Check first line: `Get-Content app.py | Select-Object -First 5`
  3. Ensure this line exists: `app = FastAPI(title="NUAM Exchange API", version="1.0.0")`
  4. Verify no syntax errors in app.py (red underlines in VS Code indicate issues)

**Problem**: `ModuleNotFoundError: No module named 'db_coneccion'`
- **Cause**: Running uvicorn from wrong directory or files not in expected location
- **Solution**:
  ```bash
  # Ensure you're in the backend/ directory
  cd backend
  
  # Verify files exist
  ls db_coneccion.py
  ls modelo_sql.py
  
  # Run from backend directory
  python -m uvicorn app:app --reload --port 8000
  ```

**Problem**: MongoDB/MySQL connection errors
- **Cause**: Database servers not running on localhost
- **Solution**:
  1. Start MongoDB: `mongod` (default port 27017)
  2. Start MySQL: Check your MySQL service is running
  3. Verify connection: `curl http://localhost:8000/health`
  4. Response should show: `{"mongodb": "connected", "mysql": "connected", "status": "healthy"}`

### Frontend Issues

**Problem**: CORS errors when calling backend
- **Cause**: Frontend not served from `localhost:5173` or backend not running
- **Solution**:
  1. Verify backend is running: `curl http://localhost:8000/`
  2. Verify frontend port: Check that `npm run dev` shows `Local: http://localhost:5173`
  3. Check CORS configuration in `app.py` includes your frontend port
  4. Browser DevTools → Network tab → check response headers include `Access-Control-Allow-Origin`

**Problem**: `session_token` not stored after login
- **Cause**: Frontend not saving token from response or localStorage issues
- **Solution**:
  1. Check `api.js` saves token: `localStorage.setItem('session_token', response.session_token)`
  2. Verify Login.jsx passes token to next page/component
  3. Check browser DevTools → Application → LocalStorage for `session_token` key
  4. Use browser console to test: `localStorage.getItem('session_token')`

---

## Key File Responsibilities

| File | Purpose |
|------|---------|
| `app.py` | FastAPI server configuration + router includes (primary entry point) |
| `routes/auth_routes.py` | Login/logout endpoints + health checks |
| `routes/operador_routes.py` | Order placement & retrieval endpoints |
| `routes/admin_routes.py` | Admin reports & market configuration endpoints |
| `db_coneccion.py` | MongoDB & MySQL connection management + session factory |
| `modelo_sql.py` | SQLAlchemy ORM models (`Orden`, `Transaccion`) |
| `seteo_programa.py` | DB initialization + default user creation |
| `auth.py`, `operador.py`, `administrador.py` | Legacy CLI modules (not actively developed) |
| `main.py` | Legacy CLI menu (not actively developed) |

---

## Security Considerations

### Session Management (TODO: Production Priority)
- **Current**: In-memory `sesiones_activas` dict - **NOT SECURE**, loses data on restart
- **Planned**: Migrate to JWT tokens with expiration
  ```python
  # Future pattern:
  from fastapi.security import HTTPBearer
  from jose import JWTError, jwt
  
  security = HTTPBearer()
  async def get_current_user(credentials: HTTPAuthCredentialDetails):
      token = credentials.credentials
      # Verify JWT signature, check expiration, return user
  ```

### Password Hashing
- Uses `bcrypt` with salt for MongoDB user storage
- **Pattern**: Always hash passwords before storing (see `seteo_programa.py` lines 20-22)
- **Never** store plaintext passwords or transmit over HTTP (use HTTPS in production)

### Role-Based Access Control (RBAC)
- Checked at endpoint level in each routes file
- **Pattern**: Always validate `user['rol']` before admin-only operations
- **User object** from `get_current_user()` contains: `idUsuario`, `nombre`, `rol`, `perfilBolsa`
- **Prevent data leaks**: Always filter queries by `idUsuario` (see `/api/ordenes`)

### CORS Whitelist
- **Current**: Allows `localhost:3000` (React) and `localhost:5173` (Vite)
- **Production**: Replace with specific trusted domain, remove wildcard headers
  ```python
  allow_origins=["https://yourdomain.com"],  # NOT "*"
  allow_methods=["GET", "POST"],  # NOT "*"
  allow_headers=["Content-Type", "Authorization"],  # Specific headers
  ```

### Input Validation
- **Pydantic models** enforce type checking at request boundary (see `OrdenRequest`)
- **Manual validation** for business logic (negative quantities, invalid bolsas)
- **Pattern**: Reject invalid input early with 400 response, log for security review

---

## Frontend Integration (React + FastAPI)

The frontend is a React application served on port 5173 (Vite):

### Frontend Structure
```
frontend/ (React app)
    ├── src/
    │   ├── components/
    │   │   ├── Login.jsx
    │   │   ├── OperadorDashboard.jsx
    │   │   └── AdminDashboard.jsx
    │   ├── services/
    │   │   └── api.js
    │   └── App.jsx
    └── package.json
```

### Implementation Pattern
- **CORS configured** for `localhost:5173` in `app.py` (lines 17-23)
- **Session tokens** passed via `session_token` query parameter or request body
- **Response format**: All endpoints return `{success: bool, message: str, ...}`
- **Authentication**: Post login response includes `session_token` for subsequent requests

**Frontend patterns**:
- Store `session_token` in localStorage after login
- Include token in all protected endpoint requests (via `api.js` service)
- Display `message` field for user feedback (errors, confirmations)
- Route components based on `user.rol`: 'Operador' → OperadorDashboard, 'Admin' → AdminDashboard

---

## Implementation Plan

This project follows a structured development approach:

### Phase 1: Backend API (FastAPI)
- ✅ Create core database layer (`db_coneccion.py`, `modelo_sql.py`)
- ✅ Implement authentication system (bcrypt hashing, session tokens)
- ✅ Build monolithic `app.py` with all endpoints
- 🔄 **Next**: Refactor endpoints into modular routes (`routes/auth_routes.py`, `routes/operador_routes.py`, `routes/admin_routes.py`)

### Phase 2: Frontend App (React + Vite)
- Build component structure (Login, OperadorDashboard, AdminDashboard)
- Implement API service layer (`services/api.js`) for centralized HTTP calls
- Add state management for user session and order data
- Integrate with backend endpoints

### Phase 3: Integration & Polish
- E2E testing (React frontend ↔ FastAPI backend)
- Security hardening (JWT migration, HTTPS, rate limiting)
- Real order matching engine (replace 70% simulation)
- Deployment preparation

### Refactoring: Moving Routes to Modular Files

**Current state**: All endpoints in `app.py` (lines 58-343)  
**Target state**: Endpoints split into `routes/` folder

**Process**:
1. Create `routes/auth_routes.py` with login/logout/health endpoints
2. Create `routes/operador_routes.py` with orden placement/retrieval
3. Create `routes/admin_routes.py` with reports/tarifas configuration
4. Update `app.py` to include routers via `app.include_router()`
5. Remove duplicate endpoints from `app.py`

**Example refactoring pattern**:
```python
# routes/auth_routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    # Move login logic here
    pass

# In app.py
from routes.auth_routes import router as auth_router
app.include_router(auth_router, prefix="/api", tags=["auth"])
```

---

To improve code organization, API endpoints are split into feature modules:

### `auth_routes.py`
- `POST /api/login` - Authentication
- `POST /api/logout` - Session termination
- `GET /health` - Database connectivity check

**Pattern**: Import in `app.py` via `from routes.auth_routes import router as auth_router`

### `operador_routes.py`
- `POST /api/orden` - Place buy/sell order (Operador + Admin only)
- `GET /api/ordenes` - Get user's order history

**Pattern**: Requires session token validation via `get_current_user(session_token)`

### `admin_routes.py`
- `GET /api/reportes` - Transaction report summary (Admin only)
- `POST /api/tarifas` - Configure market rates (Admin only)
- `GET /api/tarifas` - Retrieve market rate configuration

**Pattern**: All endpoints check `if user['rol'] != 'Admin'` before proceeding

**Implementation approach**:
```python
# In app.py
from routes.auth_routes import router as auth_router
from routes.operador_routes import router as operador_router
from routes.admin_routes import router as admin_router

app.include_router(auth_router, prefix="/api", tags=["authentication"])
app.include_router(operador_router, prefix="/api", tags=["operator"])
app.include_router(admin_router, prefix="/api", tags=["admin"])
```

Each route file imports dependencies once and defines all endpoints for that feature.

---

## Anti-Patterns & Known Limitations

❌ **Session in-memory storage**: `sesiones_activas` dict will lose data on restart. Replace with JWT.  
❌ **No transaction matching engine**: Orden execution is simulated (70% random). Real order book logic needed.  
❌ **Order matching**: Placeholder IDs (`'MATCH_FICTICIO'`). Implement real buy/sell pairing.  
❌ **Error handling**: Generic exception catches in `db_coneccion.py`. Add structured logging.  
⚠️ **Frontend state**: React state management needed for token persistence and user context.

---

## CORS & Frontend Integration

**Configured origins** (line 16-17):
```python
allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React/Vite defaults
```
Frontend should be served on port 3000 (React) or 5173 (Vite). Update if different.

---

## Questions to Ask When Uncertain

1. **Should I modify `app.py` or CLI modules?** → Always `app.py` for new features.
2. **How do I add a new Pydantic model?** → Define alongside `LoginRequest`, before route handlers.
3. **Do I need to handle missing session tokens?** → No, `get_current_user()` handles with HTTPException.
4. **Can I return a plain dict from an endpoint?** → No, use Pydantic response_model.
5. **Where do I validate input?** → Pydantic models + explicit checks in route handlers.
