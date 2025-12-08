# main.py
import os
from auth import login, logout, get_current_user
from operador import colocar_orden
from administrador import ver_reportes, configurar_tarifas_mercado
from seteo_programa import inicializar_todo

def abrir_html_conceptual():
    """Abre el archivo HTML de bienvenida para cumplir el requisito de 'apertura html'."""
    try:
        # Asume que index.html está en el mismo directorio
        os.system('start index.html') # Para Windows
        # Para macOS/Linux se podría usar 'open index.html' o 'xdg-open index.html'
        print("\n Abriendo 'index.html' en el navegador por defecto...")
    except Exception:
        print("\n No se pudo abrir 'index.html' automáticamente. Por favor, ábralo manualmente.")

def menu_principal():
    user = get_current_user()
    if user is None: return

    print(f"\nBienvenido, {user['nombre']}! (Rol: {user['rol']} | Bolsa: {user['perfilBolsa']})")
    
    if user['rol'] == 'Operador':
        menu_operador()
    elif user['rol'] == 'Admin':
        menu_administrador()

def menu_operador():
    while True:
        print("\n--- Menú Operador Bursátil NUAM ---")
        print("1. Colocar Órden de Compra/Venta (HU03)")
        print("2. Cerrar sesión")
        opcion = input("Seleccione una opción: ")

        if opcion == '1':
            colocar_orden()
        elif opcion == '2':
            logout()
            break
        else:
            print(" Opción no válida.")

def menu_administrador():
    while True:
        print("\n--- Menú Administrador Regional NUAM ---")
        print("1. Ver reportes de Transacciones (HU04)")
        print("2. Configurar tarifas de mercado (HU02)")
        print("3. Colocar Órden (Prueba)")
        print("4. Cerrar sesión")
        opcion = input("Seleccione una opción: ")

        if opcion == '1':
            ver_reportes()
        elif opcion == '2':
            configurar_tarifas_mercado()
        elif opcion == '3':
            colocar_orden()
        elif opcion == '4':
            logout()
            break
        else:
            print(" Opción no válida.")

if __name__ == "__main__":
    inicializar_todo() # Prepara ambas bases de datos
    abrir_html_conceptual() # Abre la ventana de bienvenida
    
    while True:
        print("\n--- Menú Principal NUAM Exchange ---")
        print("1. Iniciar sesión")
        print("2. Salir")
        opcion = input("Seleccione una opción: ")

        if opcion == '1':
            login()
            menu_principal()
        elif opcion == '2':
            print(" Saliendo del sistema.")
            break
        else:
            print(" Opción no válida.")
            