# modelo_sql.py
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Orden(Base):
    __tablename__ = 'ordenes'
    
    idOrden = Column(Integer, primary_key=True, autoincrement=True)
    idUsuario = Column(String(50), nullable=False)
    tipo = Column(Enum('Compra', 'Venta'), nullable=False)
    instrumento = Column(String(20), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precioLimite = Column(Float, nullable=True)
    estado = Column(Enum('Pendiente', 'Ejecutada', 'Cancelada'), default='Pendiente')
    fechaCreacion = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<Orden {self.idOrden}: {self.tipo} {self.cantidad} {self.instrumento} @ {self.precioLimite}>"

class Transaccion(Base):
    __tablename__ = 'transacciones'
    
    idTransaccion = Column(Integer, primary_key=True, autoincrement=True)
    idOrdenCompra = Column(String(50), nullable=False)
    idOrdenVenta = Column(String(50), nullable=False)
    precioEjecucion = Column(Float, nullable=False)
    cantidadEjecutada = Column(Integer, nullable=False)
    fechaEjecucion = Column(DateTime, default=datetime.utcnow)
    bolsaOrigen = Column(String(20), nullable=False)
    
    def __repr__(self):
        return f"<Transaccion {self.idTransaccion}: {self.cantidadEjecutada} @ ${self.precioEjecucion}>"