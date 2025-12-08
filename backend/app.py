# app.py - Backend FastAPI para NUAM Exchange
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import bcrypt
from datetime import datetime
from sqlalchemy import text

from db_coneccion import get_mongodb, get_mysql_session
from modelo_sql import Orden, Transaccion
import random

app = FastAPI(title="NUAM Exchange API", version="1.0.0")

# Configurar CORS para que React pueda conectarse
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],  # Puertos comunes de React/Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simulación de sesión (en producción usarías JWT o similar)
sesiones_activas = {}

# ============= MODELOS PYDANTIC =============

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    message: str
    user: Optional[dict] = None
    session_token: Optional[str] = None

class OrdenRequest(BaseModel):
    instrumento: str
    tipo: str  # "Compra" o "Venta"
    cantidad: int
    precioLimite: Optional[float] = None

class OrdenResponse(BaseModel):
    success: bool
    message: str
    orden: Optional[dict] = None
    transaccion: Optional[dict] = None

class TarifaRequest(BaseModel):
    bolsa: str  # "CL", "PE", "CO"
    tarifa_base: float

# ============= FUNCIONES AUXILIARES =============

def get_current_user(session_token: str):
    """Valida el token de sesión y retorna el usuario"""
    if session_token not in sesiones_activas:
        raise HTTPException(status_code=401, detail="Sesión inválida o expirada")
    return sesiones_activas[session_token]

# ============= RUTAS DE AUTENTICACIÓN =============

@app.post("/api/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Autenticar usuario"""
    db = get_mongodb()
    if db is None:
        raise HTTPException(status_code=500, detail="Error de conexión a MongoDB")
    
    usuarios_col = db["usuarios"]
    usuario = usuarios_col.find_one({"username": request.username})
    
    if not usuario:
        return LoginResponse(
            success=False,
            message="Usuario no encontrado"
        )
    
    # Verificar contraseña
    password_hash = bytes(usuario['password'])
    if not bcrypt.checkpw(request.password.encode(), password_hash):
        return LoginResponse(
            success=False,
            message="Contraseña incorrecta"
        )
    
    # Crear sesión (en producción usarías JWT)
    session_token = f"session_{usuario['username']}_{datetime.now().timestamp()}"
    
    user_data = {
        'idUsuario': str(usuario['_id']),
        'nombre': usuario['username'],
        'rol': usuario['rol'],
        'perfilBolsa': usuario['perfilBolsa']
    }
    
    sesiones_activas[session_token] = user_data
    
    return LoginResponse(
        success=True,
        message=f"Bienvenido, {usuario['username']}!",
        user=user_data,
        session_token=session_token
    )

@app.post("/api/logout")
async def logout(session_token: str):
    """Cerrar sesión"""
    if session_token in sesiones_activas:
        user = sesiones_activas[session_token]
        del sesiones_activas[session_token]
        return {"success": True, "message": f"Sesión cerrada para {user['nombre']}"}
    return {"success": False, "message": "Sesión no encontrada"}

# ============= RUTAS DE OPERADOR =============

@app.post("/api/orden", response_model=OrdenResponse)
async def colocar_orden(request: OrdenRequest, session_token: str):
    """Colocar una orden de compra/venta"""
    user = get_current_user(session_token)
    
    if user['rol'] not in ['Operador', 'Admin']:
        raise HTTPException(status_code=403, detail="No tiene permisos para colocar órdenes")
    
    # Validaciones
    if request.tipo not in ['Compra', 'Venta']:
        return OrdenResponse(success=False, message="Tipo de orden inválido")
    
    if request.cantidad <= 0:
        return OrdenResponse(success=False, message="La cantidad debe ser mayor a cero")
    
    precio_final = request.precioLimite if request.precioLimite and request.precioLimite > 0 else None
    
    # Registrar orden en MySQL
    nueva_orden = Orden(
        idUsuario=user['idUsuario'],
        tipo=request.tipo,
        instrumento=request.instrumento,
        cantidad=request.cantidad,
        precioLimite=precio_final
    )
    
    with get_mysql_session() as session:
        session.add(nueva_orden)
        session.flush()
        
        orden_data = {
            "idOrden": nueva_orden.idOrden,
            "tipo": nueva_orden.tipo,
            "instrumento": nueva_orden.instrumento,
            "cantidad": nueva_orden.cantidad,
            "precioLimite": float(nueva_orden.precioLimite) if nueva_orden.precioLimite else None,
            "estado": nueva_orden.estado,
            "fechaCreacion": nueva_orden.fechaCreacion.isoformat()
        }
        
        # Simulación de ejecución (70% de probabilidad)
        transaccion_data = None
        if random.random() < 0.7:
            precio_ejecucion = precio_final if precio_final else round(random.uniform(90.00, 100.00), 2)
            
            nueva_orden.estado = 'Ejecutada'
            
            transaccion = Transaccion(
                idOrdenCompra=str(nueva_orden.idOrden) if request.tipo == 'Compra' else 'MATCH_FICTICIO',
                idOrdenVenta=str(nueva_orden.idOrden) if request.tipo == 'Venta' else 'MATCH_FICTICIO',
                precioEjecucion=precio_ejecucion,
                cantidadEjecutada=request.cantidad,
                fechaEjecucion=datetime.utcnow(),
                bolsaOrigen=user['perfilBolsa']
            )
            session.add(transaccion)
            session.flush()
            
            transaccion_data = {
                "idTransaccion": transaccion.idTransaccion,
                "precioEjecucion": float(transaccion.precioEjecucion),
                "cantidadEjecutada": transaccion.cantidadEjecutada,
                "monto": float(transaccion.precioEjecucion) * transaccion.cantidadEjecutada,
                "fechaEjecucion": transaccion.fechaEjecucion.isoformat()
            }
            
            orden_data["estado"] = "Ejecutada"
            mensaje = f"Orden ejecutada exitosamente a ${precio_ejecucion}"
        else:
            mensaje = "Orden registrada. Pendiente de match en el Order Book"
        
        return OrdenResponse(
            success=True,
            message=mensaje,
            orden=orden_data,
            transaccion=transaccion_data
        )

@app.get("/api/ordenes")
async def obtener_ordenes(session_token: str, limite: int = 20):
    """Obtener las últimas órdenes del usuario"""
    user = get_current_user(session_token)
    
    with get_mysql_session() as session:
        ordenes = session.query(Orden).filter(
            Orden.idUsuario == user['idUsuario']
        ).order_by(Orden.fechaCreacion.desc()).limit(limite).all()
        
        return {
            "success": True,
            "ordenes": [
                {
                    "idOrden": o.idOrden,
                    "tipo": o.tipo,
                    "instrumento": o.instrumento,
                    "cantidad": o.cantidad,
                    "precioLimite": float(o.precioLimite) if o.precioLimite else None,
                    "estado": o.estado,
                    "fechaCreacion": o.fechaCreacion.isoformat()
                }
                for o in ordenes
            ]
        }

# ============= RUTAS DE ADMINISTRADOR =============

@app.get("/api/reportes")
async def ver_reportes(session_token: str, limite: int = 10):
    """Ver reporte consolidado de transacciones (Solo Admin)"""
    user = get_current_user(session_token)
    
    if user['rol'] != 'Admin':
        raise HTTPException(status_code=403, detail="Solo administradores pueden ver reportes")
    
    with get_mysql_session() as session:
        transacciones = session.query(Transaccion).order_by(
            Transaccion.fechaEjecucion.desc()
        ).limit(limite).all()
        
        return {
            "success": True,
            "transacciones": [
                {
                    "idTransaccion": t.idTransaccion,
                    "bolsaOrigen": t.bolsaOrigen,
                    "idOrdenCompra": t.idOrdenCompra,
                    "idOrdenVenta": t.idOrdenVenta,
                    "cantidadEjecutada": t.cantidadEjecutada,
                    "precioEjecucion": float(t.precioEjecucion),
                    "monto": t.cantidadEjecutada * float(t.precioEjecucion),
                    "fechaEjecucion": t.fechaEjecucion.isoformat()
                }
                for t in transacciones
            ]
        }

@app.post("/api/tarifas")
async def configurar_tarifas(request: TarifaRequest, session_token: str):
    """Configurar tarifas de mercado (Solo Admin)"""
    user = get_current_user(session_token)
    
    if user['rol'] != 'Admin':
        raise HTTPException(status_code=403, detail="Solo administradores pueden configurar tarifas")
    
    if request.bolsa not in ['CL', 'PE', 'CO']:
        return {"success": False, "message": "Bolsa inválida"}
    
    db = get_mongodb()
    if db is None:
        raise HTTPException(status_code=500, detail="Error de conexión a MongoDB")
    
    config_col = db["configuracion_mercado"]
    
    config_col.update_one(
        {"idMercado": request.bolsa},
        {"$set": {"tarifa_base": request.tarifa_base, "timestamp": datetime.now()}},
        upsert=True
    )
    
    return {
        "success": True,
        "message": f"Tarifa de {request.tarifa_base} configurada para {request.bolsa}"
    }

@app.get("/api/tarifas")
async def obtener_tarifas(session_token: str):
    """Obtener tarifas configuradas"""
    user = get_current_user(session_token)
    
    db = get_mongodb()
    if db is None:
        raise HTTPException(status_code=500, detail="Error de conexión a MongoDB")
    
    config_col = db["configuracion_mercado"]
    tarifas = list(config_col.find({}, {"_id": 0}))
    
    return {
        "success": True,
        "tarifas": tarifas
    }

# ============= RUTA DE PRUEBA =============

@app.get("/")
async def root():
    return {
        "message": "NUAM Exchange API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Verificar estado de conexiones"""
    mongo_ok = False
    mysql_ok = False
    
    # Test MongoDB
    try:
        db = get_mongodb()
        if db is not None:
            mongo_ok = True
    except Exception as e:
        print(f"Health check MongoDB error: {e}")
        mongo_ok = False
    
    # Test MySQL
    try:
        with get_mysql_session() as session:
            session.execute(text("SELECT 1"))
            mysql_ok = True
    except Exception as e:
        print(f"Health check MySQL error: {e}")
        mysql_ok = False
    
    return {
        "mongodb": "connected" if mongo_ok else "disconnected",
        "mysql": "connected" if mysql_ok else "disconnected",
        "status": "healthy" if (mongo_ok and mysql_ok) else "degraded"
    }