"""
Locustfile para pruebas de carga masiva del NUAM Exchange
Simula múltiples usuarios realizando operaciones concurrentes
"""

from locust import HttpUser, task, between, events
import random
import json

# Token global para reutilizar
global_token = None

class NUAMUser(HttpUser):
    """Usuario del NUAM Exchange simulado"""
    
    wait_time = between(1, 3)  # Espera entre 1-3 segundos entre tareas
    
    def on_start(self):
        """Se ejecuta cuando el usuario inicia sesión"""
        self.login()
    
    def login(self):
        """Autentica el usuario y obtiene token de sesión"""
        global global_token
        
        response = self.client.post(
            "/api/login",
            json={
                "username": "MirtaAguilar",
                "password": "1234"
            },
            name="Login"
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                self.session_token = data.get("session_token")
                global_token = self.session_token
                print(f"✓ Usuario autenticado: {self.session_token[:30]}...")
            else:
                print(f"✗ Error de login: {data.get('message')}")
        else:
            print(f"✗ Error HTTP {response.status_code}")
    
    def get_headers(self):
        """Retorna headers con el token de autenticación"""
        if not hasattr(self, 'session_token'):
            return {"Content-Type": "application/json"}
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.session_token}"
        }
    
    @task(3)  # Esta tarea se ejecuta 3 veces más que otras
    def place_order(self):
        """Coloca una orden de compra/venta (tarea principal)"""
        
        instrumento = random.choice(["ENEL", "SQM-B", "BSANTANDER", "AAPL", "BBVA"])
        tipo = random.choice(["Compra", "Venta"])
        cantidad = random.randint(10, 500)
        precio = round(random.uniform(20, 150), 2)
        
        response = self.client.post(
            "/api/orden",
            json={
                "instrumento": instrumento,
                "tipo": tipo,
                "cantidad": cantidad,
                "precioLimite": precio
            },
            headers=self.get_headers(),
            name="Colocar Orden"
        )
        
        if response.status_code != 200:
            print(f"✗ Error al colocar orden: {response.status_code}")
    
    @task(2)  # Esta tarea se ejecuta 2 veces
    def get_orders(self):
        """Obtiene la lista de órdenes del usuario"""
        
        response = self.client.get(
            "/api/ordenes?limite=20",
            headers=self.get_headers(),
            name="Obtener Órdenes"
        )
        
        if response.status_code != 200:
            print(f"✗ Error al obtener órdenes: {response.status_code}")
    
    @task(1)  # Esta tarea se ejecuta menos frecuentemente
    def get_health(self):
        """Verifica el estado de salud del servidor"""
        
        response = self.client.get(
            "/health",
            name="Health Check"
        )
        
        if response.status_code != 200:
            print(f"✗ Error en health check: {response.status_code}")


class AdminUser(HttpUser):
    """Usuario Admin del sistema"""
    
    wait_time = between(2, 5)
    
    def on_start(self):
        """Se ejecuta cuando el usuario inicia sesión"""
        self.login()
    
    def login(self):
        """Autentica como Admin"""
        response = self.client.post(
            "/api/login",
            json={
                "username": "GabrielFuentes",
                "password": "admin"
            },
            name="Login Admin"
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                self.session_token = data.get("session_token")
                print(f"✓ Admin autenticado: {self.session_token[:30]}...")
    
    def get_headers(self):
        """Retorna headers con el token de autenticación"""
        if not hasattr(self, 'session_token'):
            return {"Content-Type": "application/json"}
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.session_token}"
        }
    
    @task(2)
    def get_reports(self):
        """Obtiene reporte de transacciones (Admin)"""
        
        response = self.client.get(
            "/api/reportes?limite=20",
            headers=self.get_headers(),
            name="Obtener Reportes"
        )
        
        if response.status_code != 200:
            print(f"✗ Error al obtener reportes: {response.status_code}")
    
    @task(1)
    def configure_tarifa(self):
        """Configura tarifas de bolsa (Admin)"""
        
        bolsa = random.choice(["CL", "PE", "CO"])
        tarifa = round(random.uniform(0.001, 0.01), 5)
        
        response = self.client.post(
            "/api/tarifas",
            json={
                "bolsa": bolsa,
                "tarifa_base": tarifa
            },
            headers=self.get_headers(),
            name="Configurar Tarifa"
        )
        
        if response.status_code != 200:
            print(f"✗ Error al configurar tarifa: {response.status_code}")


@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    """Se ejecuta cuando inician las pruebas"""
    print("\n" + "="*60)
    print("INICIANDO PRUEBAS DE CARGA - NUAM EXCHANGE")
    print("="*60)
    print(f"URL destino: {environment.host}")
    print("="*60 + "\n")


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """Se ejecuta cuando terminan las pruebas"""
    print("\n" + "="*60)
    print("PRUEBAS COMPLETADAS")
    print("="*60)
    print(f"Total de peticiones: {sum(r.num_requests for r in environment.stats.entries.values())}")
    print(f"Total de fallos: {sum(r.num_failures for r in environment.stats.entries.values())}")
    print("="*60 + "\n")


# Configuración para ejecutar desde línea de comandos
if __name__ == "__main__":
    import os
    from locust.main import main
    
    # Por defecto ejecuta sin interfaz gráfica
    os.environ['LOCUST_HEADLESS'] = '1'
    main()
