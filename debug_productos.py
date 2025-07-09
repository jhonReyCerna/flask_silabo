import json

# Leer el historial para ver los datos reales
try:
    with open("historial.json", "r", encoding="utf-8") as f:
        historial = json.load(f)
        
    print("=== ANÁLISIS DE PRODUCTOS ===")
    
    for idx, registro in enumerate(reversed(historial)):
        if "datos" in registro:
            datos = registro["datos"]
            print(f"\n--- Registro {idx + 1} ---")
            
            # Buscar productos en diferentes ubicaciones posibles
            if "productos" in datos:
                print("Productos encontrados en 'productos':")
                productos_data = datos["productos"]
                print(f"Tipo: {type(productos_data)}")
                print(f"Contenido: {productos_data}")
                
                if isinstance(productos_data, dict) and "unidades_productos" in productos_data:
                    print("\nUnidades productos:")
                    for unidad_prod in productos_data["unidades_productos"]:
                        print(f"  Unidad: {unidad_prod}")
                        if "productos" in unidad_prod:
                            for prod in unidad_prod["productos"]:
                                print(f"    Producto: {prod}")
                                if isinstance(prod, dict):
                                    codigo = prod.get('codigo', 'SIN_CODIGO')
                                    titulo = prod.get('titulo', 'SIN_TITULO')
                                    descripcion = prod.get('descripcion', 'SIN_DESCRIPCION')
                                    print(f"      - Código: '{codigo}'")
                                    print(f"      - Título: '{titulo}'")
                                    print(f"      - Descripción: '{descripcion}'")
            
            # Buscar en productos_actividades si existe
            if "productos_actividades" in datos:
                print(f"\nProductos actividades: {datos['productos_actividades']}")
            
            # Solo mostrar el primer registro con datos
            break
            
except Exception as e:
    print(f"Error: {e}")
