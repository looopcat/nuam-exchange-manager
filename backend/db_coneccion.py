# db_coneccion.py
from pymongo import MongoClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager

# --- CONEXIÓN MONGODB (Para Usuarios y Logs) ---
MONGO_URL = "mongodb://localhost:27017/"
MONGO_DB_NAME = "NUAM" 

def get_mongodb():
    """Retorna el objeto de la base de datos MongoDB."""
    try:
        client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000)
        client.admin.command('ping') # Verificar conexión
        return client[MONGO_DB_NAME]
    except Exception as e:
        print(f"Error al conectar con MongoDB: {e}")
        print("Asegúrese de que el servidor de MongoDB esté corriendo.")
        return None

# --- CONEXIÓN MYSQL (Para Órdenes y Transacciones Críticas) ---

DB_URL_MYSQL = "mysql+pymysql://root:Inacap.2024@localhost/Nuam"
Engine_MYSQL = create_engine(DB_URL_MYSQL, echo=False)
SessionLocal_MYSQL = sessionmaker(autocommit=False, autoflush=False, bind=Engine_MYSQL)

@contextmanager
def get_mysql_session():
    """Provee una sesión transaccional para el Trading Core (MySQL)."""
    session = SessionLocal_MYSQL()
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        print(f"Error en transacción MySQL: {e}")
        raise
    finally:
        session.close()

def create_all_mysql_tables(Base):
    """Crea todas las tablas de MySQL definidas en el modelo."""
    try:
        Base.metadata.create_all(bind=Engine_MYSQL)
        print("Tablas de MySQL creadas/verificadas.")
    except Exception as e:
        print(f"Error al crear tablas MySQL: {e}")
        print("Asegúrese de que la base de datos 'nuam_exchange_db' exista.")