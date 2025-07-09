import json
from generar_word import generar_documento_word

# Simular exactamente lo que hace app.py cuando genera el documento
print("=== PRUEBA DE GENERACIÓN COMPLETA ===")

try:
    # Cargar datos del historial como lo hace app.py
    with open("historial.json", "r", encoding="utf-8") as f:
        historial = json.load(f)
        
    # Obtener el registro más reciente
    datos_completos = None
    if "registros_completados" in historial and historial["registros_completados"]:
        datos_completos = historial["registros_completados"][0]
        print("✓ Datos cargados del historial")
    else:
        print("✗ No se encontraron datos en el historial")
        exit(1)
    
    # Verificar estructura de productos antes del procesamiento
    print("\n=== DATOS DE PRODUCTOS ANTES DEL PROCESAMIENTO ===")
    if "productos" in datos_completos:
        productos_data = datos_completos["productos"]
        if "unidades_productos" in productos_data:
            for i, unidad in enumerate(productos_data["unidades_productos"], 1):
                for prod in unidad.get("productos", []):
                    codigo = prod.get("codigo", "")
                    titulo = prod.get("titulo", "")
                    print(f"Unidad {i}: Código='{codigo}', Título='{titulo}'")
    
    # Generar el documento siguiendo el mismo proceso que app.py
    print("\n=== GENERANDO DOCUMENTO ===")
    doc = generar_documento_word(datos_completos, "test_fix_final.docx")
    print("✓ Documento generado: test_fix_final.docx")
    
    print("\n=== RESUMEN ===")
    print("El problema 'PA1(C1) Título no definido' debería estar solucionado.")
    print("Ahora debería mostrar los títulos reales de los productos.")
    print("Verifique el archivo test_fix_final.docx para confirmar.")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
