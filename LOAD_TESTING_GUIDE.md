# Pruebas de Carga Masiva - NUAM Exchange

## Requisitos Previos

1. **Backend corriendo**
   ```bash
   cd backend
   python -m uvicorn app:app --reload --port 8000
   ```

2. **MongoDB corriendo**
   ```bash
   # Abrir otra terminal
   "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "C:\data\db"
   ```

3. **Locust instalado**
   ```bash
   pip install locust
   ```

## Opción 1: Ejecutar Script Automatizado (Recomendado)

Ejecuta todos los escenarios de prueba automáticamente:

```bash
cd "e:\Documentos\inacap\proyecto integrado\nuam_project"
python run_load_tests.py
```

Este script ejecuta 5 escenarios:
- **light_load**: 10 usuarios (60 seg)
- **normal_load**: 50 usuarios (120 seg)
- **high_load**: 100 usuarios (180 seg)
- **massive_load**: 500 usuarios (240 seg)
- **stress_test**: 1000 usuarios (300 seg)

## Opción 2: Interfaz Gráfica de Locust

Para ver en tiempo real el progreso con interfaz web:

```bash
cd "e:\Documentos\inacap\proyecto integrado\nuam_project"
.venv\Scripts\python.exe -m locust -f locustfile.py --host=http://localhost:8000
```

Luego abre http://localhost:8089 en tu navegador.

**Pasos en la interfaz:**
1. Ingresa número de usuarios (ej: 100)
2. Ingresa "Spawn rate" - usuarios/segundo (ej: 10)
3. Haz clic en "Start swarming"
4. Observa las métricas en tiempo real
5. Detén con el botón "Stop"

## Opción 3: Línea de Comandos (Modo headless)

Para ejecutar una prueba simple sin interfaz:

```bash
# 100 usuarios, 10 usuarios/seg, 5 minutos
.venv\Scripts\python.exe -m locust \
  -f locustfile.py \
  --host http://localhost:8000 \
  --users 100 \
  --spawn-rate 10 \
  --run-time 300s \
  --headless
```

## Interpretación de Resultados

### Métricas Clave

| Métrica | Bueno | Aceptable | Malo |
|---------|-------|-----------|------|
| **Response Time (p95)** | < 500ms | 500-1000ms | > 1000ms |
| **Failure Rate** | 0% | < 1% | > 5% |
| **Throughput** | > 100 req/s | 50-100 req/s | < 50 req/s |
| **Users** | Todo completado | 90%+ completado | < 90% |

### Archivos de Salida

- `results_*_stats.csv`: Estadísticas generales
- `results_*_stats_history.csv`: Series de tiempo

Puedes importarlos en Excel para análisis detallado.

## Escenarios de Prueba Detallados

### 1. Light Load (Carga Ligera)
- **Usuarios**: 10
- **Duración**: 60 segundos
- **Objetivo**: Verificar funcionamiento básico

### 2. Normal Load (Carga Normal)
- **Usuarios**: 50
- **Duración**: 120 segundos
- **Objetivo**: Operación en horario típico

### 3. High Load (Carga Alta)
- **Usuarios**: 100
- **Duración**: 180 segundos
- **Objetivo**: Picos de mercado

### 4. Massive Load (Carga Masiva)
- **Usuarios**: 500
- **Duración**: 240 segundos
- **Objetivo**: Límites del sistema

### 5. Stress Test (Prueba de Estrés)
- **Usuarios**: 1000
- **Duración**: 300 segundos
- **Objetivo**: Punto de ruptura

## Acciones Simuladas

Cada usuario simula:
1. **Login** (1 vez al inicio)
2. **Colocar órdenes** (60% del tiempo)
   - Instrumento aleatorio: ENEL, SQM-B, BSANTANDER, AAPL, BBVA
   - Tipo: Compra o Venta
   - Cantidad: 10-500
   - Precio: $20-150
3. **Obtener órdenes** (30% del tiempo)
4. **Health Check** (10% del tiempo)

Los Admins también:
- Obtienen reportes
- Configuran tarifas

## Troubleshooting

### Error: "Failed to connect to server"
```
✗ Asegúrate que el backend corra en http://localhost:8000
```

### Error: "conexión a MongoDB falló"
```
✗ Asegúrate que MongoDB esté corriendo
mongod --dbpath "C:\data\db"
```

### Error: "No pudieron conectar usuarios"
```
✗ Verifica que las credenciales existan:
  - MirtaAguilar / 1234
  - GabrielFuentes / admin
```

### El servidor se cae con carga masiva
```
✓ Normal. Anota el número de usuarios donde falló.
  Este es tu "breaking point".
```

## Optimizaciones Recomendadas

Si el servidor no soporta la carga masiva:

### 1. **Backend**
   - Agregar connection pooling en MySQL
   - Aumentar worker threads en Uvicorn
   - Cachear respuestas comunes

### 2. **Base de Datos**
   - Crear índices en campos frecuentes
   - Particionar datos por fecha
   - Usar réplicas para lectura

### 3. **Infraestructura**
   - Load balancer para múltiples instancias
   - Redis para sesiones
   - CDN para assets estáticos

## Comandos Útiles

```bash
# Ver procesos de Python activos
Get-Process python

# Detener uvicorn
Ctrl + C

# Detener MongoDB
taskkill /IM mongod.exe /F

# Limpiar archivos de resultados
Remove-Item results_* -Force
```

## Contacto / Soporte

Si tienes preguntas sobre las pruebas, revisa:
- Los logs del backend (ventana uvicorn)
- Los resultados CSV generados
- La documentación de Locust: https://locust.io/

---

**Última actualización**: Diciembre 2025
**Versión**: 1.0
