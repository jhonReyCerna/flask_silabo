import json

print("=== DIAGNÓSTICO DEL HISTORIAL ===")

try:
    with open("historial.json", "r", encoding="utf-8") as f:
        historial = json.load(f)
    
    print("✓ Archivo historial.json cargado exitosamente")
    print(f"Tipo: {type(historial)}")
    print(f"Claves principales: {list(historial.keys())}")
    
    # Verificar registros_completados
    if "registros_completados" in historial:
        registros = historial["registros_completados"]
        print(f"✓ Encontrados {len(registros)} registros completados")
        
        if registros:
            primer_registro = registros[0]
            print(f"Claves del primer registro: {list(primer_registro.keys())}")
            
            # Buscar referencias
            if "referencias" in primer_registro:
                referencias_data = primer_registro["referencias"]
                print(f"✓ Sección 'referencias' encontrada")
                print(f"Tipo: {type(referencias_data)}")
                print(f"Claves: {list(referencias_data.keys()) if isinstance(referencias_data, dict) else 'No es diccionario'}")
                
                if isinstance(referencias_data, dict) and "enlaces_referencia" in referencias_data:
                    enlaces = referencias_data["enlaces_referencia"]
                    print(f"✓ Encontrados {len(enlaces)} enlaces de referencia")
                    if enlaces:
                        print(f"Primer enlace: {enlaces[0]}")
                else:
                    print("❌ No se encontró 'enlaces_referencia' en referencias")
            else:
                print("❌ No se encontró sección 'referencias'")
                print(f"Secciones disponibles: {list(primer_registro.keys())}")
    
    # Probar la carga de referencias
    print("\n=== PRUEBA DE CARGA DE REFERENCIAS ===")
    from generar_word import generar_documento_word
    
    doc = generar_documento_word(historial["registros_completados"][0], "test_referencias.docx")
    print("✓ Documento generado exitosamente sin errores")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
