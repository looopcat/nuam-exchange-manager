# NUAM Exchange - Plataforma de Trading Multi-Bolsa

Aplicación web full-stack para trading de acciones en múltiples bolsas regionales (Chile, Perú, Colombia).

**Stack Tecnológico:**
- **Backend**: FastAPI (Python) con arquitectura de doble base de datos (MongoDB + MySQL)
- **Frontend**: React 18 + Vite + ES6
- **Bases de Datos**: MongoDB (autenticación/configuración), MySQL (órdenes/transacciones)

---

## 🚀 Inicio Rápido

### Opción 1: Inicio de Un Click (Recomendado)

**Windows - PowerShell:**
```powershell
.\START.ps1
```

**Windows - Command Prompt:**
```cmd
START.bat
```

Esto abre 2 terminales automáticamente e inicia ambos servicios.

### Opción 2: Inicio Manual (2 Terminales)

**Terminal 1 - Backend:**
```bash
cd backend
..\.venv\Scripts\python.exe -m uvicorn app:app --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Luego:**
- Abre `http://localhost:5173` en tu navegador
- Inicia sesión con las credenciales de prueba (ver abajo)

---

## 📋 Credenciales de Prueba

| Rol | Usuario | Contraseña |
|------|----------|----------|
| Operador (Trader) | MirtaAguilar | 1234 |
| Admin | GabrielFuentes | admin |

---

## 🏗️ Estructura del Proyecto

```
nuam-exchange-manager/
├── backend/                          # Servidor FastAPI
│   ├── app.py                        # Aplicación FastAPI principal
│   ├── db_coneccion.py              # Conexiones a MongoDB y MySQL
│   ├── modelo_sql.py                # Modelos ORM de SQLAlchemy
│   ├── seteo_programa.py            # Inicialización de BD
│   └── .venv/                       # Entorno virtual de Python
│
├── frontend/                         # Aplicación React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── OperadorDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js               # Servicio centralizado de API
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── .github/
│   └── copilot-instructions.md      # Guía para agentes de IA
│
├── FULL_STACK_GUIDE.md              # Guía de solución de problemas
├── START.ps1 y START.bat            # Scripts de inicio
└── README.md                        # Este archivo
```

---

## 🎯 Características

### Panel del Operador (Trader)
- ✅ Colocar órdenes de compra/venta
- ✅ Especificar instrumento, cantidad y precio límite
- ✅ Ver historial de órdenes con seguimiento de estado
- ✅ Estados: Pendiente, Ejecutada, Cancelada

### Panel de Administrador
- ✅ Ver reportes consolidados de transacciones
- ✅ Configurar tasas de mercado (tarifas) para CL, PE, CO
- ✅ Ver configuración de tarifas actuales
- ✅ Detalles de transacciones con fecha

### API del Backend
- ✅ Endpoints RESTful con documentación Swagger/OpenAPI
- ✅ Autenticación basada en sesiones
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Arquitectura de doble base de datos
- ✅ CORS configurado para desarrollo local
- ✅ Interfaz completamente en español

---

## 🔧 Prerequisitos y Configuración

### Requisitos del Sistema

**Verifica antes de empezar:**

```powershell
python --version          # Debe ser 3.10+
node --version           # Debe ser 16+
npm --version

# Bases de datos (deben estar ejecutándose)
netstat -ano | findstr ":27017"    # MongoDB en puerto 27017
netstat -ano | findstr ":3306"     # MySQL en puerto 3306
```

### Configuración Inicial Paso a Paso

#### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/looopcat/nuam-exchange-manager.git
cd nuam-exchange-manager
```

#### Paso 2: Configurar el Backend

**En Windows PowerShell:**

```powershell
cd backend

# Crear entorno virtual
python -m venv .venv

# Activar el entorno virtual
.\.venv\Scripts\Activate.ps1

# Instalar dependencias
pip install fastapi uvicorn pymongo sqlalchemy pymysql bcrypt python-multipart requests

# Inicializar la base de datos (crea tablas y usuarios por defecto)
python seteo_programa.py

# Verificar que funciona
python -c "import app; print('Backend OK')"
```

**Si tienes problemas con activación:**
- En Command Prompt: `.\.venv\Scripts\activate.bat`
- En Mac/Linux: `source .venv/bin/activate`

#### Paso 3: Configurar el Frontend

```powershell
cd ../frontend

# Instalar dependencias de Node.js
npm install
```

#### Paso 4: Verificar Bases de Datos

**MongoDB:**
```powershell
# En una terminal aparte, ejecuta:
mongod

# Debería mostrar: "waiting for connections on port 27017"
```

**MySQL:**
- Abre MySQL Workbench, MySQL Command Line Client, o Servicios de Windows
- Usuario: `root`
- Contraseña: `Inacap.2024`
- Host: `localhost:3306`
- Base de datos: `Nuam` (se crea automáticamente)

---

## 🚀 Cómo Ejecutar la Aplicación

### Opción 1: Inicio Automático (MÁS FÁCIL) ⭐

En la raíz del proyecto:

```powershell
.\START.ps1
```

Esto:
1. Inicia el backend en puerto 8000
2. Inicia el frontend en puerto 5173
3. Abre el navegador automáticamente
4. Muestra logs en tiempo real

### Opción 2: Inicio Manual en Dos Terminales

**Terminal 1 - Backend:**
```powershell
cd backend
..\.venv\Scripts\python.exe -m uvicorn app:app --port 8000
```

Esperado:
```
Uvicorn running on http://127.0.0.1:8000
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

Esperado:
```
VITE v5.0.8  ready in 123 ms

➜  Local:   http://localhost:5173/
```

### Verificar que Funciona

1. Abre http://localhost:5173 en tu navegador
2. Deberías ver la pantalla de Login
3. Inicia sesión con:
   - **Usuario**: MirtaAguilar
   - **Contraseña**: 1234
4. Si eres Admin:
   - **Usuario**: GabrielFuentes
   - **Contraseña**: admin

---

## 📚 Endpoints de la API

Todos retornan: `{success: bool, message: string, ...}`

### Autenticación
```
POST /api/login
  Cuerpo: {"username": "MirtaAguilar", "password": "1234"}
  Respuesta: {success: true, session_token: "...", user: {...}}

POST /api/logout
  Parámetro: ?session_token=...

GET /health
  Retorna: {mongodb: "connected", mysql: "connected", status: "healthy"}
```

### Órdenes (Operador + Admin)
```
POST /api/orden
  Cuerpo: {
    "session_token": "...",
    "instrumento": "ENEL",
    "tipo": "Compra",
    "cantidad": 100,
    "precioLimite": 25.50
  }

GET /api/ordenes?session_token=...&limite=20
  Retorna historial de órdenes del usuario
```

### Solo Admin
```
GET /api/reportes?session_token=...&limite=10
  Retorna transacciones consolidadas

POST /api/tarifas
  Cuerpo: {
    "session_token": "...",
    "bolsa": "CL",
    "tarifa_base": 0.005
  }

GET /api/tarifas?session_token=...
  Retorna tarifas configuradas
```

### Documentación Interactiva
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🔐 Notas de Seguridad

⚠️ **Estado Actual (Desarrollo):**
- Tokens en memoria (se pierden al reiniciar)
- Contraseñas hasheadas con bcrypt
- CORS abierto a localhost

✅ **Para Producción:**
- Migrar a JWT con expiración
- Almacenar sesiones en base de datos
- HTTPS/SSL obligatorio
- CORS restringido a dominio específico
- Rate limiting
- Variables de entorno para secretos

---

## 🐛 Solución de Problemas

### Error: "Failed to Fetch" (No se puede conectar)

```powershell
# Verifica que el backend está ejecutándose
netstat -ano | findstr ":8000"

# Verifica la salud del backend
Invoke-WebRequest http://localhost:8000/health

# Si no funciona, reinicia el backend en una terminal nueva
cd backend
..\.venv\Scripts\python.exe -m uvicorn app:app --port 8000
```

### Errores de Base de Datos

```powershell
# ¿MongoDB ejecutándose?
netstat -ano | findstr ":27017"
# Si no aparece, ejecuta: mongod

# ¿MySQL ejecutándose?
netstat -ano | findstr ":3306"
# Inicia desde Servicios de Windows (services.msc) si no funciona
```

### Puerto Ocupado (8000 o 5173)

```powershell
# Encuentra qué proceso ocupa el puerto
netstat -ano | findstr ":8000"

# Matalo (reemplaza <PID> con el número)
taskkill /PID <PID> /F
```

### node_modules Corrupto

```powershell
cd frontend

# Elimina y reinstala
rm -r node_modules package-lock.json
npm cache clean --force
npm install
npm run dev
```

### Entorno Virtual Corrupto

```powershell
cd backend

# Elimina el viejo y crea uno nuevo
rm -r .venv
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install fastapi uvicorn pymongo sqlalchemy pymysql bcrypt python-multipart requests
```

### Login no funciona

```powershell
# Verifica que se crearon los usuarios de prueba
cd backend
python seteo_programa.py  # Ejecuta nuevamente
```

---

## 📖 Documentación Adicional

- **Guía Completa**: `FULL_STACK_GUIDE.md`
- **Instrucciones para Desarrollo**: `.github/copilot-instructions.md`
- **API Interactiva**: http://localhost:8000/docs (cuando backend está ejecutándose)
- **Código Comentado**: Lee los comentarios en los archivos `.jsx` y `.py`

---

## 🚧 Mejoras Futuras

- [ ] Autenticación JWT (reemplazar tokens en sesión)
- [ ] Motor real de emparejamiento de órdenes
- [ ] WebSocket para actualizaciones en tiempo real
- [ ] Gráficos avanzados de precios
- [ ] Soporte multi-idioma (ES/EN)
- [ ] Aplicación móvil (React Native)
- [ ] Docker y docker-compose
- [ ] Kubernetes
- [ ] PostgreSQL
- [ ] Redis cache

---

## 📝 Licencia

Proyecto Integrado INACAP 2024

---

## 👥 Equipo

- **Desarrolladores**: Jorge Manzanares, Gabriel Fuentes, Mirta Aguilar
- **Framework Backend**: FastAPI (Python)
- **Framework Frontend**: React + Vite
- **Arquitectura**: Monolítica (Backend) + SPA (Frontend)

---

## 🆘 Checklist de Verificación Rápida

Si algo no funciona, verifica esto:

```powershell
# ¿Backend ejecutándose en puerto 8000?
netstat -ano | findstr ":8000"

# ¿Frontend ejecutándose en puerto 5173?
netstat -ano | findstr ":5173"

# ¿MongoDB conectado?
netstat -ano | findstr ":27017"

# ¿MySQL conectado?
netstat -ano | findstr ":3306"

# ¿API responde?
Invoke-WebRequest http://localhost:8000/health
```

**Si algo falla:**
1. Lee la sección "Solución de Problemas" arriba
2. Consulta `FULL_STACK_GUIDE.md` para casos más complejos
3. Busca errores en la consola (F12 en navegador para frontend)
4. Busca errores en la terminal del backend

---

**Última Actualización**: 8 de Diciembre de 2025  
**Estado**: Listo para Desarrollo ✅  
**Repositorio**: https://github.com/looopcat/nuam-exchange-manager
