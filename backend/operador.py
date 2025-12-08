# operador.py
from db_coneccion import get_mysql_session
from auth import get_current_user
from modelo_sql import Orden, Transaccion
import random
from datetime import datetime

def colocar_orden():
    user = get_current_user()
    if user is None or user['rol'] not in ['Operador', 'Admin']:
     print(" Solo los Operadores o Administradores pueden colocar órdenes.")
     return

    print("\n [HU03] Colocación de Órden Bursátil")
    print(f"Bolsa de operación: {user['perfilBolsa']}")
    
    instrumento = input("Ticker (Ej: ENEL, SQM-B): ").strip().upper()
    tipo = input("Tipo de Órden (COMPRA / VENTA): ").strip().capitalize()
    
    if tipo not in ['Compra', 'Venta']:
        print(" Tipo de órden inválido.")
        return

    try:
        cantidad = int(input(f"Cantidad de {instrumento}: "))
        precio_limite = float(input("Precio Límite (0 para Mercado): "))
        if cantidad <= 0:
            print(" La cantidad debe ser mayor a cero.")
            return
    except ValueError:
        print(" Entrada inválida. Ingrese números.")
        return
    
    precio_final = precio_limite if precio_limite > 0 else None
    
    # 1. Registrar la Órden en MySQL (Order Book)
    nueva_orden = Orden(
        idUsuario=user['idUsuario'],
        tipo=tipo,
        instrumento=instrumento,
        cantidad=cantidad,
        precioLimite=precio_final
    )

    with get_mysql_session() as session:
        session.add(nueva_orden)
        # El commit ocurre al salir del bloque 'with'

        print(f"\n Órden registrada (ID: {nueva_orden.idOrden}). Estado: Pendiente.")
        
        # 2. SIMULACIÓN DE EJECUCIÓN
        if random.random() < 0.7: 
            precio_ejecucion = precio_final if precio_final else round(random.uniform(90.00, 100.00), 2)
            
            # Actualizar Orden y crear Transacción (Modelo NUAM)
            nueva_orden.estado = 'Ejecutada'
            
            transaccion = Transaccion(
                idOrdenCompra=nueva_orden.idOrden if tipo == 'Compra' else 'MATCH_ID_FICTICIO',
                idOrdenVenta=nueva_orden.idOrden if tipo == 'Venta' else 'MATCH_ID_FICTICIO',
                precioEjecucion=precio_ejecucion,
                cantidadEjecutada=cantidad,
                fechaEjecucion=datetime.utcnow(),
                bolsaOrigen=user['perfilBolsa']
            )
            session.add(transaccion)
            session.flush() # Forzar que se obtenga el ID antes de salir

            print(f" [EJECUTADA] Transacción ID: {transaccion.idTransaccion} a {precio_ejecucion}.")
        else:
            print(" La órden permanece en el Order Book (Pendiente de match).")