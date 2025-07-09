#!/usr/bin/env python3
"""
Script de prueba para verificar la funcionalidad de temas_por_unidad
"""
import json
from generar_word import generar_documento_word

# Cargar datos de ejemplo del historial
with open('historial.json', 'r', encoding='utf-8') as f:
    historial = json.load(f)

# Obtener el primer registro completado
if historial['registros_completados']:
    primer_registro = historial['registros_completados'][0]
    
    print("=== DATOS DEL REGISTRO ===")
    print(f"Asignatura: {primer_registro['general']['asignatura']}")
    print(f"Docente: {primer_registro['general']['docente']}")
    
    # Verificar estructura de unidades
    if 'unidades' in primer_registro:
        unidades = primer_registro['unidades']
        print(f"\nNúmero de unidades: {unidades['unidades']}")
        
        print("\n=== UNIDADES DETALLE ===")
        for i, unidad in enumerate(unidades['unidades_detalle'], 1):
            print(f"Unidad {i}: {unidad['nombre']}")
    
    # Preparar datos para generar documento
    datos_completos = {
        'general': primer_registro['general'],
        'unidades': primer_registro.get('unidades', {}),
        'competencias': primer_registro.get('competencias', {}),
        'productos': primer_registro.get('productos', {}),
        'sesiones': primer_registro.get('sesiones', {}),
        'cronograma': primer_registro.get('cronograma', {}),
        'referencias': primer_registro.get('referencias', {})
    }
    
    print("\n=== GENERANDO DOCUMENTO ===")
    try:
        doc = generar_documento_word(datos_completos, "test_documento.docx")
        print("✅ Documento generado exitosamente como 'test_documento.docx'")
    except Exception as e:
        print(f"❌ Error al generar documento: {e}")
        import traceback
        traceback.print_exc()
else:
    print("❌ No hay registros completados en el historial")
