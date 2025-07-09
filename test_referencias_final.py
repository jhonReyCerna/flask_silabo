import json

print("=== ANÁLISIS DE REFERENCIAS EN HISTORIAL ===")

try:
    with open("historial.json", "r", encoding="utf-8") as f:
        historial = json.load(f)
    
    if "registros_completados" in historial and historial["registros_completados"]:
        primer_registro = historial["registros_completados"][0]
        
        if "referencias" in primer_registro:
            referencias_data = primer_registro["referencias"]
            print(f"Estructura de referencias: {referencias_data}")
            
            # Verificar cada tipo de referencia
            for tipo in ["libros", "articulos", "web"]:
                if tipo in referencias_data:
                    items = referencias_data[tipo]
                    print(f"\n{tipo.upper()}: {len(items)} elementos")
                    for i, item in enumerate(items[:2]):  # Mostrar solo los primeros 2
                        print(f"  {i+1}. {item}")
        
        # Probar la nueva función
        print(f"\n=== PRUEBA DE GENERACIÓN CON REFERENCIAS CORREGIDAS ===")
        from generar_word import generar_documento_word
        
        doc = generar_documento_word(primer_registro, "test_referencias_corregidas.docx")
        print("✓ Documento generado exitosamente")
        print("Las referencias ahora deberían cargarse correctamente")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
