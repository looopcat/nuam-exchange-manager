# seteo_programa.py
import bcrypt
from db_coneccion import get_mongodb, create_all_mysql_tables
from modelo_sql import Base

def crear_usuarios_mongo():
    db = get_mongodb()
    if db is None: return
    usuarios_col = db["usuarios"]
    
    # Se crea solo una vez para la evaluación
    if usuarios_col.count_documents({}) == 0:
        
        usuarios = [
            {
                "username": "MirtaAguilar",
                "rol": "Operador", # El antiguo vendedor
                "password": bcrypt.hashpw("1234".encode(), bcrypt.gensalt()),
                "perfilBolsa": "CL"
            },
            {
                "username": "GabrielFuentes",
                "rol": "Admin", # El administrador
                "password": bcrypt.hashpw("admin".encode(), bcrypt.gensalt()),
                "perfilBolsa": "Regional"
            }
        ]
        usuarios_col.insert_many(usuarios)
        print("✅ Usuarios iniciales creados en MongoDB.")
    else:
        print("ℹ Los usuarios ya existen en MongoDB.")

def inicializar_todo():
    print("\n--- INICIALIZACIÓN DE BASES DE DATOS NUAM EXCHANGE ---")
    crear_usuarios_mongo()
    create_all_mysql_tables(Base)

if __name__ == "__main__":
    inicializar_todo()