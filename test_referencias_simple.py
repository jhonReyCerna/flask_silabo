#!/usr/bin/env python3
"""
Test simple para verificar la funcionalidad de referencias
"""

import json
import sys
import os

# Agregar el directorio actual al path para importar generar_word
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from generar_word import formatear_referencia_libro, formatear_referencia_articulo, formatear_referencia_web
    print("✓ Funciones de formateo importadas correctamente")
except ImportError as e:
    print(f"✗ Error al importar funciones: {e}")
    sys.exit(1)

def test_referencias():
    print("=== TESTING REFERENCIAS ===\n")
    
    # Test 1: Verificar que el historial existe
    print("1. Verificando historial.json...")
    try:
        with open("historial.json", "r", encoding="utf-8") as f:
            historial = json.load(f)
            print("✓ Historial cargado correctamente")
            print(f"  - Registros completados: {len(historial.get('registros_completados', []))}")
    except Exception as e:
        print(f"✗ Error cargando historial: {e}")
        return
    
    # Test 2: Buscar referencias en el historial
    print("\n2. Buscando referencias...")
    referencias_encontradas = 0
    
    for i, registro in enumerate(historial.get("registros_completados", [])):
        if "referencias" in registro:
            referencias_data = registro["referencias"]
            print(f"✓ Encontradas referencias en registro {i}")
            
            if isinstance(referencias_data, dict):
                libros = referencias_data.get("libros", [])
                articulos = referencias_data.get("articulos", [])
                web = referencias_data.get("web", [])
                
                print(f"  - Libros: {len(libros)}")
                print(f"  - Artículos: {len(articulos)}")
                print(f"  - Web: {len(web)}")
                
                # Test formateo de un libro si existe
                if libros and len(libros) > 0:
                    primer_libro = libros[0]
                    print(f"  - Primer libro raw: {primer_libro}")
                    try:
                        libro_formateado = formatear_referencia_libro(primer_libro)
                        print(f"  - Primer libro formateado: {libro_formateado}")
                        referencias_encontradas += 1
                    except Exception as e:
                        print(f"  ✗ Error formateando libro: {e}")
                
                break
    
    if referencias_encontradas == 0:
        print("⚠ No se encontraron referencias para formatear")
    
    # Test 3: Test directo de funciones
    print("\n3. Test directo de funciones de formateo...")
    
    # Test libro
    libro_test = {
        "autores": {
            "0": {
                "apellido": "Cerna",
                "inicial": "J."
            }
        },
        "año": "2025",
        "editorial": "Editorial Test",
        "titulo": "Libro de Prueba"
    }
    
    try:
        libro_formateado = formatear_referencia_libro(libro_test)
        print(f"✓ Libro test formateado: {libro_formateado}")
    except Exception as e:
        print(f"✗ Error en formateo de libro test: {e}")
    
    print("\n=== FIN DEL TEST ===")

if __name__ == "__main__":
    test_referencias()
