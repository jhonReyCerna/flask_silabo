import json
from generar_word import obtener_fechas_unidades

# Cargar datos del historial
with open('historial.json', 'r', encoding='utf-8') as f:
    historial = json.load(f)

# Usar el primer registro completo
if historial['registros_completados']:
    datos = historial['registros_completados'][0]
    
    print("=== ESTRUCTURA DEL CRONOGRAMA ===")
    cronograma_data = datos.get('cronograma', {})
    print("cronograma_data keys:", list(cronograma_data.keys()))
    print("fecha_inicio:", cronograma_data.get('fecha_inicio', 'No encontrado'))
    
    cronograma_array = cronograma_data.get('cronograma', [])
    print(f"cronograma array length: {len(cronograma_array)}")
    
    if cronograma_array:
        print("Primera sesión:", cronograma_array[0])
        print("Segunda sesión:", cronograma_array[1] if len(cronograma_array) > 1 else "No hay segunda sesión")
    
    print("\n=== RESULTADO DE obtener_fechas_unidades ===")
    fechas_unidades = obtener_fechas_unidades(cronograma_data)
    print("fechas_unidades:", fechas_unidades)
    
    print("\n=== AGRUPACIÓN POR UNIDADES ===")
    unidades_sesiones = {}
    for sesion in cronograma_array:
        if isinstance(sesion, dict) and sesion.get("unidad") and sesion.get("fecha"):
            unidad_num = sesion.get("unidad")
            unidad_key = f"Unidad {['I', 'II', 'III', 'IV'][unidad_num - 1]}"
            
            if unidad_key not in unidades_sesiones:
                unidades_sesiones[unidad_key] = []
            
            fecha_str = sesion.get("fecha", "")
            print(f"Sesión {sesion.get('sesion')}: Unidad {unidad_num} -> {unidad_key}, fecha: {fecha_str}")
            unidades_sesiones[unidad_key].append(fecha_str)
    
    print("unidades_sesiones:", unidades_sesiones)
    
else:
    print('No hay registros completados')
