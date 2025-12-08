# administrador.py
from db_coneccion import get_mysql_session, get_mongodb
from auth import get_current_user
from modelo_sql import Transaccion

def ver_reportes():
    user = get_current_user()
    if user is None or user['rol'] != 'Admin':
        print(" Solo los administradores pueden ver los reportes consolidados.")
        return

    print("\n [HU04] Reporte Consolidado de Transacciones (Últimas 10)\n")

    with get_mysql_session() as session:
        # Consulta de Transacciones en MySQL (similar a tu reporte de pedidos)
        transacciones = session.query(Transaccion).order_by(Transaccion.fechaEjecucion.desc()).limit(10).all()

        if not transacciones:
            print(" No se han registrado transacciones aún.")
            return

        for idx, t in enumerate(transacciones, start=1):
            monto = t.cantidadEjecutada * float(t.precioEjecucion)
            print(f"--- Transacción #{idx} ---")
            print(f" Bolsa: {t.bolsaOrigen}")
            print(f" Instrumento/Activo: (Buscar en Orden ID: {t.idOrdenCompra} / {t.idOrdenVenta})")
            print(f" Cantidad Ejecutada: {t.cantidadEjecutada}")
            print(f" Precio de Ejecución: ${t.precioEjecucion}")
            print(f" Monto Total: ${monto:,.2f}")
            print(f" Fecha: {t.fechaEjecucion.strftime('%Y-%m-%d %H:%M:%S')}\n")

def configurar_tarifas_mercado():
    user = get_current_user()
    if user is None or user['rol'] != 'Admin':
        print(" Solo los administradores pueden configurar mercados y tarifas.")
        return

    print("\n [HU02] Configuración de Tarifas de Mercado (Simulado)")
    db = get_mongodb()
    if db is None: return

    # Usamos MongoDB para simular la tabla MERCADO/ReglasTarifarias (HU02)
    config_col = db["configuracion_mercado"]

    bolsa = input("Seleccione la Bolsa a configurar (CL, PE, CO): ").upper()
    if bolsa in ['CL', 'PE', 'CO']:
        try:
            nueva_tarifa = float(input(f"Ingrese la nueva tarifa base para {bolsa} (ej: 0.005): "))
            
            config_col.update_one(
                {"idMercado": bolsa},
                {"$set": {"tarifa_base": nueva_tarifa, "timestamp": datetime.now()}},
                upsert=True
            )
            print(f"✅ Tarifa base de {nueva_tarifa} configurada exitosamente para {bolsa} en MongoDB.")
        except ValueError:
            print("Entrada inválida. Ingrese un número para la tarifa.")
    else:
        print(" Bolsa inválida.")
