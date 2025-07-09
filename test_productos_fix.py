import json
from generar_word import generar_documento_word

# Cargar datos del historial para probar
try:
    with open("historial.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    
    # Obtener el primer registro completo
    if "registros_completados" in data and data["registros_completados"]:
        datos_completos = data["registros_completados"][0]
        print("Datos cargados del historial")
        
        # Mostrar algunos productos para verificar
        if "productos" in datos_completos:
            productos = datos_completos["productos"]
            print("\n=== PRODUCTOS ENCONTRADOS ===")
            if "unidades_productos" in productos:
                for unidad in productos["unidades_productos"]:
                    print(f"Unidad {unidad.get('unidad_numero')}: {unidad.get('unidad_nombre')}")
                    for prod in unidad.get('productos', []):
                        print(f"  - Código: '{prod.get('codigo')}'")
                        print(f"  - Título: '{prod.get('titulo')}'")
                        print(f"  - Descripción: '{prod.get('descripcion')[:100]}...'")
                        print()
        
        # Generar documento
        print("Generando documento...")
        doc = generar_documento_word(datos_completos, "test_productos.docx")
        print("Documento generado exitosamente: test_productos.docx")
        
    else:
        print("No se encontraron registros en el historial")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
