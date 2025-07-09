import json

# Simular datos del cronograma como aparecen en el historial
cronograma_data = {
    "fecha_inicio": "2025-07-03",
    "cronograma": [
        {
            "sesion": 1,
            "unidad": 1,
            "nombreUnidad": "FRAMEWORK TPM SEGÚN JIMP",
            "dia": "Sábado",
            "fecha": "05/07/2025",
            "horas": 9
        },
        {
            "sesion": 2,
            "unidad": 1,
            "nombreUnidad": "FRAMEWORK TPM SEGÚN JIMP",
            "dia": "Domingo",
            "fecha": "06/07/2025",
            "horas": 9
        },
        {
            "sesion": 5,
            "unidad": 2,
            "nombreUnidad": "Propuesta de Valor del TPM a la Organización",
            "dia": "Sábado",
            "fecha": "19/07/2025",
            "horas": 9
        },
        {
            "sesion": 6,
            "unidad": 2,
            "nombreUnidad": "Propuesta de Valor del TPM a la Organización",
            "dia": "Domingo",
            "fecha": "20/07/2025",
            "horas": 9
        }
    ]
}

def obtener_fechas_unidades(cronograma_data):
    fechas = {}
    if not cronograma_data or not isinstance(cronograma_data, dict):
        return fechas
    
    # Manejar la estructura del cronograma del usuario
    cronograma_array = cronograma_data.get("cronograma", [])
    if not cronograma_array:
        return fechas
        
    # Agrupar sesiones por unidad
    unidades_sesiones = {}
    for sesion in cronograma_array:
        if isinstance(sesion, dict) and sesion.get("unidad") and sesion.get("fecha"):
            unidad_num = sesion.get("unidad")
            unidad_key = f"Unidad {['I', 'II', 'III', 'IV'][unidad_num - 1]}"
            
            if unidad_key not in unidades_sesiones:
                unidades_sesiones[unidad_key] = []
            
            # Convertir fecha de formato DD/MM/YYYY a YYYY-MM-DD para ordenar
            fecha_str = sesion.get("fecha", "")
            if fecha_str and fecha_str != "Fecha pendiente":
                unidades_sesiones[unidad_key].append(fecha_str)
    
    # Obtener fechas de inicio y término para cada unidad
    for unidad, fechas_sesiones in unidades_sesiones.items():
        if fechas_sesiones:
            # Ordenar las fechas (asumiendo formato DD/MM/YYYY)
            fechas_ordenadas = sorted(fechas_sesiones)
            fechas[unidad] = {
                "inicio": fechas_ordenadas[0],
                "termino": fechas_ordenadas[-1]
            }
        else:
            fechas[unidad] = {"inicio": "Fecha pendiente", "termino": "Fecha pendiente"}
            
    return fechas

# Probar la función
print("=== PRUEBA DE LA FUNCIÓN ===")
resultado = obtener_fechas_unidades(cronograma_data)
print("Resultado:", resultado)

# Probar con datos reales del historial
print("\n=== PRUEBA CON DATOS REALES ===")
with open('historial.json', 'r', encoding='utf-8') as f:
    historial = json.load(f)

if historial['registros_completados']:
    datos = historial['registros_completados'][0]
    cronograma_real = datos.get('cronograma', {})
    print("Cronograma real keys:", list(cronograma_real.keys()))
    resultado_real = obtener_fechas_unidades(cronograma_real)
    print("Resultado real:", resultado_real)
