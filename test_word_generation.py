#!/usr/bin/env python3
"""
Script de prueba para verificar que las descripciones largas se muestran completamente
en el documento Word generado.
"""

import json
from generar_word import generar_documento_word

def test_with_real_data():
    """Prueba con datos reales del historial"""
    
    # Cargar datos del último registro completado
    with open('historial.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Obtener el último registro completado
    if 'registros_completados' in data and data['registros_completados']:
        ultimo_registro = data['registros_completados'][-1]
        print("Datos cargados del historial:")
        
        # Verificar competencias
        if 'competencias' in ultimo_registro:
            print("\n=== COMPETENCIAS ===")
            for comp in ultimo_registro['competencias'].get('unidades_competencias', []):
                for competencia in comp.get('competencias', []):
                    print(f"- {competencia['codigo']}")
                    print(f"  Título: {competencia['titulo']}")
                    print(f"  Descripción: {competencia['descripcion'][:100]}...")
                    print()
        
        # Verificar productos
        if 'productos' in ultimo_registro:
            print("\n=== PRODUCTOS ===")
            for prod in ultimo_registro['productos'].get('unidades_productos', []):
                for producto in prod.get('productos', []):
                    print(f"- {producto['codigo']}")
                    print(f"  Título: {producto['titulo']}")
                    print(f"  Descripción: {producto['descripcion'][:100]}...")
                    print()
        
        # Generar documento Word de prueba
        try:
            archivo = generar_documento_word(ultimo_registro)
            print(f"\n✅ Documento Word generado exitosamente: {archivo}")
            print("Revisa el documento para verificar que las descripciones largas aparezcan completas.")
            return archivo
        except Exception as e:
            print(f"\n❌ Error al generar documento: {e}")
            return None
    else:
        print("No se encontraron registros completados en el historial.")
        return None

def test_with_long_text():
    """Prueba con texto específicamente largo para verificar el problema reportado"""
    
    datos_prueba = {
        "general": {
            "codigo": "TEST001",
            "asignatura": "Prueba de Textos Largos",
            "docente": "Test Teacher",
            "maestria": "Test Master",
            "semestre": "2025-1",
            "fecha": "2025-07-09",
            "creditos": "3",
            "horas_teoria": "16",
            "horas_practica": "0"
        },
        "competencias_especificas": [
            (
                "RAE1 (CE1)",
                "Analiza un caso práctico de una organización industrial: Analiza un caso práctico de una organización industrial para identificar, describir y evaluar sus componentes esenciales (estructura organizativa, procesos clave y portafolio de activos críticos) en relación con la metodología JIMP (4 fases, 12 pasos y 8 pilares) y las normativas ISO 55000:2024 e ISO 55001:2024, con el fin de diseñar un plan preliminar para la implementación de un sistema Analiza un caso práctico de una organización industrial para identificar, describir y evaluar sus componentes esenciales (estructura organizativa, procesos clave y portafolio de activos críticos) en relación con la metodología JIMP (4 fases, 12 pasos y 8 pilares) y las normativas ISO 55000:2024 e ISO 55001:2024, con el fin de diseñar un plan preliminar para la implementación de un sistema"
            )
        ],
        "productos_actividades": [
            (
                "PA1 (C1)",
                "Informe de análisis organizacional: Desarrolla un informe completo de análisis organizacional que incluye la identificación de estructura organizativa, procesos clave y portafolio de activos críticos, aplicando la metodología JIMP con sus 4 fases, 12 pasos y 8 pilares, alineado con las normativas ISO 55000:2024 e ISO 55001:2024 para el diseño de un plan preliminar de implementación de sistema de gestión de activos en una organización industrial seleccionada"
            )
        ]
    }
    
    print("=== DATOS DE PRUEBA ===")
    print(f"Competencia completa: {datos_prueba['competencias_especificas'][0][1]}")
    print(f"Longitud: {len(datos_prueba['competencias_especificas'][0][1])} caracteres")
    print()
    print(f"Producto completo: {datos_prueba['productos_actividades'][0][1]}")
    print(f"Longitud: {len(datos_prueba['productos_actividades'][0][1])} caracteres")
    
    try:
        archivo = generar_documento_word(datos_prueba)
        print(f"\n✅ Documento de prueba generado: {archivo}")
        print("Revisa que el texto completo aparezca en el documento Word.")
        return archivo
    except Exception as e:
        print(f"\n❌ Error al generar documento de prueba: {e}")
        return None

if __name__ == "__main__":
    print("🔍 Probando generación de Word con textos largos...")
    print("=" * 50)
    
    # Prueba con datos reales del historial
    archivo1 = test_with_real_data()
    
    print("\n" + "=" * 50)
    
    # Prueba con datos específicos del problema reportado
    archivo2 = test_with_long_text()
    
    print("\n" + "=" * 50)
    print("🏁 Pruebas completadas.")
    if archivo1:
        print(f"📄 Archivo 1: {archivo1}")
    if archivo2:
        print(f"📄 Archivo 2: {archivo2}")
