#!/usr/bin/env python
"""
Script para ejecutar pruebas de carga masiva en diferentes escenarios
"""

import subprocess
import sys
import time

def run_load_test(num_users, spawn_rate, duration, scenario_name):
    """Ejecuta una prueba de carga con parámetros específicos"""
    
    print(f"\n{'='*70}")
    print(f"ESCENARIO: {scenario_name}")
    print(f"{'='*70}")
    print(f"Usuarios simultáneos: {num_users}")
    print(f"Tasa de generación (spawn rate): {spawn_rate} usuarios/seg")
    print(f"Duración: {duration} segundos")
    print(f"{'='*70}\n")
    
    cmd = [
        sys.executable, "-m", "locust",
        "-f", "locustfile.py",
        "--host", "http://localhost:8000",
        "--users", str(num_users),
        "--spawn-rate", str(spawn_rate),
        "--run-time", f"{duration}s",
        "--headless",
        "--csv", f"results_{scenario_name}"
    ]
    
    try:
        subprocess.run(cmd, check=True)
        print(f"\n✓ Prueba '{scenario_name}' completada exitosamente")
    except subprocess.CalledProcessError as e:
        print(f"\n✗ Error en prueba '{scenario_name}': {e}")
        return False
    
    return True


def main():
    """Ejecuta múltiples escenarios de prueba"""
    
    print("\n" + "="*70)
    print("PRUEBAS DE CARGA MASIVA - NUAM EXCHANGE")
    print("="*70)
    print("\nAsegúrate de que:")
    print("  ✓ MongoDB esté corriendo")
    print("  ✓ El backend esté corriendo en http://localhost:8000")
    print("  ✓ Las credenciales de prueba existan (MirtaAguilar/1234, GabrielFuentes/admin)")
    print("="*70)
    
    input("\nPresiona ENTER para continuar...")
    
    scenarios = [
        {
            "name": "light_load",
            "description": "Carga ligera - 10 usuarios",
            "users": 10,
            "spawn_rate": 2,
            "duration": 60
        },
        {
            "name": "normal_load",
            "description": "Carga normal - 50 usuarios",
            "users": 50,
            "spawn_rate": 5,
            "duration": 120
        },
        {
            "name": "high_load",
            "description": "Carga alta - 100 usuarios",
            "users": 100,
            "spawn_rate": 10,
            "duration": 180
        },
        {
            "name": "massive_load",
            "description": "Carga masiva - 500 usuarios",
            "users": 500,
            "spawn_rate": 50,
            "duration": 240
        },
        {
            "name": "stress_test",
            "description": "Prueba de estrés - 1000 usuarios",
            "users": 1000,
            "spawn_rate": 100,
            "duration": 300
        }
    ]
    
    results = {}
    total_scenarios = len(scenarios)
    
    for i, scenario in enumerate(scenarios, 1):
        print(f"\n[{i}/{total_scenarios}] {scenario['description']}")
        
        success = run_load_test(
            scenario["users"],
            scenario["spawn_rate"],
            scenario["duration"],
            scenario["name"]
        )
        
        results[scenario["name"]] = success
        
        if i < total_scenarios:
            print("\nEsperando 30 segundos antes de la siguiente prueba...")
            time.sleep(30)
    
    # Resumen final
    print("\n" + "="*70)
    print("RESUMEN DE PRUEBAS")
    print("="*70)
    
    for scenario in scenarios:
        name = scenario["name"]
        status = "✓ EXITOSA" if results.get(name) else "✗ FALLÓ"
        print(f"{scenario['description']:40} {status}")
    
    print("\nArchivos de resultados CSV generados:")
    for scenario in scenarios:
        print(f"  - results_{scenario['name']}_stats.csv")
        print(f"  - results_{scenario['name']}_stats_history.csv")
    
    print("\n" + "="*70)
    print("ANÁLISIS DE RESULTADOS")
    print("="*70)
    print("\nPara analizar los resultados, revisa los archivos CSV:")
    print("  - Tiempo de respuesta promedio")
    print("  - Percentiles (p50, p95, p99)")
    print("  - Tasa de errores")
    print("  - Throughput (peticiones/segundo)")
    print("="*70 + "\n")


if __name__ == "__main__":
    main()
