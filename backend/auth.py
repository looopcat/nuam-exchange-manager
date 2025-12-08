# auth.py
import bcrypt
from db_coneccion import get_mongodb

db = get_mongodb()
if db is not None:
    usuarios_col = db["usuarios"]
else:
    usuarios_col = None

usuario_actual = None

def login():
    global usuario_actual
    if usuarios_col is None:
        print("❌ ERROR: Conexión a MongoDB fallida.")
        return None
        
    nombre = input("👤 Nombre de usuario: ").strip()
    password = input("🔒 Contraseña: ").strip()

    usuario = usuarios_col.find_one({"username": nombre})

    if usuario:
        # Convertir el password de MongoDB (Binary) a bytes
        password_hash = usuario["password"]
        
        # Si es un objeto Binary de MongoDB, convertirlo a bytes
        if hasattr(password_hash, 'decode'):
            password_hash = password_hash
        elif isinstance(password_hash, bytes):
            password_hash = password_hash
        else:
            # Si es Binary de pymongo, ya funciona directamente
            password_hash = bytes(password_hash)
        
        try:
            if bcrypt.checkpw(password.encode(), password_hash):
                usuario_actual = {
                    'idUsuario': str(usuario['_id']), 
                    'nombre': usuario['username'],
                    'rol': usuario['rol'],
                    'perfilBolsa': usuario['perfilBolsa']
                }
                print(f"✅ Inicio de sesión exitoso. Bienvenido, {usuario['username']}!")
                return usuario_actual
        except Exception as e:
            print(f"❌ Error al verificar contraseña: {e}")
            return None
    
    print("❌ Nombre de usuario o contraseña incorrectos.")
    return None

def logout():
    global usuario_actual
    if usuario_actual:
        print(f"\n👋 Cerrando sesión de {usuario_actual['nombre']}")
        usuario_actual = None

def get_current_user():
    return usuario_actual