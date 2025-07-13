from flask import Flask, render_template, request, jsonify, redirect, url_for, send_file, g
import json
import os
from datetime import datetime
import tempfile
from generar_word import generar_documento_word, generar_nombre_archivo


app = Flask(__name__)
app.secret_key = 'tu_clave_secreta_para_silabo'
app.template_folder = 'templates'
app.static_folder = 'static'
DATA_FILE = 'historial.json'

def estado_secciones():
    import os, json
    estado = {
        'seccion_general_completa': False,
        'seccion_unidades_completa': False,
        'seccion_competencias_completa': False,
        'seccion_productos_completa': False,
        'seccion_sesiones_completa': False,
        'seccion_cronograma_completa': False,
        'registro_finalizado': False
    }
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                datos = json.load(f)
            registro = datos.get('registro_actual', {})
            estado['seccion_general_completa'] = bool(registro.get('general'))
            estado['seccion_unidades_completa'] = bool(registro.get('unidades'))
            estado['seccion_competencias_completa'] = bool(registro.get('competencias'))
            estado['seccion_productos_completa'] = bool(registro.get('productos'))
            estado['seccion_sesiones_completa'] = bool(registro.get('sesiones'))
            estado['seccion_cronograma_completa'] = bool(registro.get('cronograma'))
            if registro.get('metadatos', {}).get('estado') == 'completado':
                estado['registro_finalizado'] = True
        except Exception:
            pass
    return estado

@app.context_processor
def inject_secciones_estado():
    return estado_secciones()

def cargar_datos():
    """Carga los datos del registro actual"""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            historial = json.load(f)
            registro_actual = historial.get('registro_actual', {})
            return registro_actual
    return {}

def cargar_historial_completo():
    """Carga todo el historial incluyendo registros completados"""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"registro_actual": {}, "registros_completados": []}

def guardar_datos(datos):
    """Guarda los datos en el registro actual"""
    historial = cargar_historial_completo()
    historial['registro_actual'] = datos
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(historial, f, ensure_ascii=False, indent=2)

def finalizar_registro():
    """Finaliza el registro actual y lo mueve al historial"""
    historial = cargar_historial_completo()
    registro_actual = historial.get('registro_actual', {})
    
    if registro_actual:
        registro_actual['metadatos'] = {
            'fecha_finalizacion': datetime.now().isoformat(),
            'estado': 'completado',
            'id_registro': len(historial.get('registros_completados', [])) + 1
        }
        
        if 'registros_completados' not in historial:
            historial['registros_completados'] = []
        historial['registros_completados'].append(registro_actual)
        
        historial['registro_actual'] = {}
        
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(historial, f, ensure_ascii=False, indent=2)
        
        return True
    return False

def iniciar_nuevo_registro():
    """Inicializa un nuevo registro vacío"""
    historial = cargar_historial_completo()
    historial['registro_actual'] = {}
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(historial, f, ensure_ascii=False, indent=2)

@app.route('/')
def index():
    """Página principal - Panel de control"""
    iniciar_nuevo_registro()
    return render_template('portada.html')

@app.route('/general')
def general():
    """Página del formulario general"""
    datos = cargar_datos()
    datos_general = datos.get('general', {})
    return render_template('general.html', datos=datos_general)

@app.route('/guardar_general', methods=['POST'])
def guardar_general():
    """Guarda los datos del formulario general"""
    try:
        correo = request.form.get('correo_entry')
        dominios_permitidos = ['@gmail.com', '@unacvirtual.edu.pe']
        
        if not any(correo.lower().endswith(dominio) for dominio in dominios_permitidos):
            return jsonify({
                'success': False, 
                'message': 'El correo debe ser @gmail.com o @unacvirtual.edu.pe'
            }), 400
        
        horario = request.form.get('horario_entry')
        if horario == 'Horario: Personalizado':
            dias_personalizados = request.form.getlist('dias_personalizados')
            if len(dias_personalizados) >= 2 and len(dias_personalizados) <= 4:
                horario = f"Horario: {' - '.join(dias_personalizados)}"
            else:
                return jsonify({
                    'success': False, 
                    'message': 'Debe seleccionar entre 2 y 4 días para el horario personalizado'
                }), 400
        
        datos_formulario = {
            'fecha_guardado': datetime.now().isoformat(),
            'codigo': request.form.get('codigo_entry'),
            'version': request.form.get('version_entry'),
            'fecha': request.form.get('fecha_entry'),
            'maestria': request.form.get('rama_entry'),
            'asignatura': request.form.get('asignatura_entry'),
            'semestre': request.form.get('semestre_combobox'),
            'docente': request.form.get('docente_entry'),
            'horas_teoria': request.form.get('horas_teoria_entry'),
            'horas_practica': request.form.get('horas_practica_entry'),
            'creditos': request.form.get('creditos_entry'),
            'sesiones': request.form.get('sesiones_entry'),
            'semanas': request.form.get('semanas_entry'),
            'correo': request.form.get('correo_entry'),
            'codigo_programa': request.form.get('codigo_programa_entry'),
            'caracter': request.form.get('caracter_entry'),
            'proposito': request.form.get('proposito_entry'),
            'horario': horario,
            'modalidad': request.form.get('modalidad_entry'),
            'link_virtual': request.form.get('link_virtual_entry') if request.form.get('modalidad_entry') == 'Virtual' else None
        }
        
        datos = cargar_datos()
        datos['general'] = datos_formulario
        
        guardar_datos(datos)
        
        return jsonify({
            'success': True, 
            'message': 'Datos guardados correctamente',
            'datos': datos_formulario
        })
        
    except Exception as e:
        return jsonify({
            'success': False, 
            'message': f'Error al guardar datos: {str(e)}'
        }), 500

@app.route('/api/cargar_general')
def api_cargar_general():
    """API para cargar datos del formulario general"""
    datos = cargar_datos()
    return jsonify(datos.get('general', {}))

@app.route('/unidades')
def unidades():
    """Página del formulario de unidades"""
    datos = cargar_datos()
    datos_unidades = datos.get('unidades', {})
    return render_template('unidades.html', datos=datos_unidades)

@app.route('/guardar_unidades', methods=['POST'])
def guardar_unidades():
    """Guarda los datos del formulario de unidades"""
    try:
        sesiones_form = request.form.get('sesiones')
        unidades_form = request.form.get('unidades')
        
        if not sesiones_form or not unidades_form:
            return jsonify({
                'success': False,
                'message': 'Error: Faltan datos requeridos (sesiones o unidades)'
            }), 400
        
        try:
            sesiones_total = int(sesiones_form)
            num_unidades = int(unidades_form)
        except (ValueError, TypeError) as e:
            return jsonify({
                'success': False,
                'message': f'Error: Valores inválidos para sesiones o unidades: {str(e)}'
            }), 400
        
        print(f"DEBUG: Guardando unidades - Total sesiones: {sesiones_total}, Num unidades: {num_unidades}")
        
        unidades_detalle = []
        suma_sesiones = 0
        
        for i in range(1, num_unidades + 1):
            sesiones_unidad_form = request.form.get(f'sesiones_unidad_{i}', '0')
            try:
                sesiones_unidad = int(sesiones_unidad_form)
            except (ValueError, TypeError):
                sesiones_unidad = 0
                
            suma_sesiones += sesiones_unidad
            
            instrumentos = request.form.getlist(f'instrumento_unidad_{i}[]')
            
            unidad_data = {
                'numero': i,
                'nombre': request.form.get(f'nombre_unidad_{i}'),
                'sesiones': sesiones_unidad,
                'logro': request.form.get(f'logro_unidad_{i}'),
                'instrumentos': instrumentos
            }
            unidades_detalle.append(unidad_data)
            print(f"DEBUG: Unidad {i} - {unidad_data}")
        
        if suma_sesiones != sesiones_total:
            return jsonify({
                'success': False,
                'message': f'Error: La suma de sesiones ({suma_sesiones}) no coincide con el total ({sesiones_total})'
            }), 400
        
        datos_formulario = {
            'sesiones': sesiones_total,
            'unidades': num_unidades,
            'unidades_detalle': unidades_detalle
        }
        
        datos = cargar_datos()
        datos['unidades'] = datos_formulario
        
        guardar_datos(datos)
        
        print(f"DEBUG: Datos guardados exitosamente en historial.json")
        
        return jsonify({
            'success': True,
            'message': f'Datos de {num_unidades} unidades guardados correctamente',
            'datos': datos_formulario
        })
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': 'Error en los datos numéricos proporcionados'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al guardar datos: {str(e)}'
        }), 500

@app.route('/api/cargar_unidades')
def api_cargar_unidades():
    """API para cargar datos del formulario de unidades"""
    datos = cargar_datos()
    return jsonify(datos.get('unidades', {}))

@app.route('/competencias')
def competencias():
    """Página del formulario de competencias"""
    datos = cargar_datos()
    datos_competencias = datos.get('competencias', {})
    return render_template('competencias.html', datos=datos_competencias)

@app.route('/guardar_competencias', methods=['POST'])
def guardar_competencias():
    """Guarda los datos del formulario de competencias con nueva estructura"""
    try:
        datos = cargar_datos()
        unidades_data = datos.get('unidades', {})
        
        if not unidades_data or not unidades_data.get('unidades_detalle'):
            return jsonify({
                'success': False,
                'error': 'No se encontraron unidades. Debes crear las unidades primero.'
            }), 400
        
        competencias_data = request.form.get('competencias_data')
        if not competencias_data:
            return jsonify({
                'success': False,
                'error': 'No se recibieron datos de competencias.'
            }), 400
        
        try:
            unidades_competencias = json.loads(competencias_data)
            print(f"DEBUG: Datos de competencias recibidos: {unidades_competencias}")
        except json.JSONDecodeError as e:
            print(f"DEBUG: Error al decodificar JSON: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'Datos de competencias inválidos.'
            }), 400
        
        for unidad_comp in unidades_competencias:
            numero_unidad = unidad_comp.get('numero_unidad')
            competencias = unidad_comp.get('competencias', [])
            
            if not isinstance(competencias, list) or len(competencias) < 1:
                return jsonify({
                    'success': False,
                    'error': f'La unidad {numero_unidad} debe tener al menos 1 competencia.'
                }), 400
            
            if len(competencias) > 4:
                return jsonify({
                    'success': False,
                    'error': f'La unidad {numero_unidad} no puede tener más de 4 competencias.'
                }), 400
            
            for i, competencia in enumerate(competencias):
                if not isinstance(competencia, dict):
                    return jsonify({
                        'success': False,
                        'error': f'Estructura de competencia inválida en unidad {numero_unidad}.'
                    }), 400
                
                codigo = competencia.get('codigo', '').strip()
                titulo = competencia.get('titulo', '').strip()
                descripcion = competencia.get('descripcion', '').strip()
                
                print(f"DEBUG: Competencia {i+1} - Código: {codigo}, Título: {titulo[:50]}..., Descripción: {descripcion[:100]}...")
                
                if not codigo or not titulo or not descripcion:
                    return jsonify({
                        'success': False,
                        'error': f'Todas las competencias deben tener código, título y descripción.'
                    }), 400
        
        datos_formulario = {
            'unidades_competencias': unidades_competencias
        }
        
        datos['competencias'] = datos_formulario
        
        guardar_datos(datos)
        
        print(f"DEBUG: Competencias guardadas exitosamente para {len(unidades_competencias)} unidades")
        
        return jsonify({
            'success': True,
            'message': f'Competencias guardadas correctamente para {len(unidades_competencias)} unidades',
            'datos': datos_formulario
        })
        
    except Exception as e:
        print(f"DEBUG: Error al guardar competencias: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error al guardar competencias: {str(e)}'
        }), 500

@app.route('/api/cargar_competencias')
def api_cargar_competencias():
    """API para cargar datos del formulario de competencias"""
    try:
        datos = cargar_datos()
        competencias_data = datos.get('competencias', {})
        
        if competencias_data and 'unidades_competencias' in competencias_data:
            return jsonify({
                'success': True,
                'competencias': competencias_data['unidades_competencias']
            })
        else:
            return jsonify({
                'success': True,
                'competencias': []
            })
    except Exception as e:
        print(f"DEBUG: Error al cargar competencias: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error al cargar competencias: {str(e)}'
        }), 500

@app.route('/api/cargar_unidades_para_competencias')
def api_cargar_unidades_para_competencias():
    """API para cargar las unidades disponibles para competencias"""
    datos = cargar_datos()
    unidades_data = datos.get('unidades', {})
    
    if not unidades_data or not unidades_data.get('unidades_detalle'):
        return jsonify({
            'success': False,
            'message': 'No se encontraron unidades. Debes crear las unidades primero.',
            'unidades': []
        })
    
    return jsonify({
        'success': True,
        'unidades': unidades_data['unidades_detalle']
    })

@app.route('/productos')
def productos():
    """Página del formulario de productos"""
    datos = cargar_datos()
    datos_productos = datos.get('productos', {})
    return render_template('productos.html', datos=datos_productos)

@app.route('/guardar_productos', methods=['POST'])
def guardar_productos():
    """Guarda los datos del formulario de productos"""
    try:
        datos = cargar_datos()
        unidades_data = datos.get('unidades', {})
        
        if not unidades_data or not unidades_data.get('unidades_detalle'):
            return jsonify({
                'success': False,
                'error': 'No se encontraron unidades. Debes crear las unidades primero.'
            }), 400
        
        productos_data = request.form.get('productos_data')
        if not productos_data:
            return jsonify({
                'success': False,
                'error': 'No se recibieron datos de productos.'
            }), 400
        
        try:
            unidades_productos = json.loads(productos_data)
        except json.JSONDecodeError:
            return jsonify({
                'success': False,
                'error': 'Datos de productos inválidos.'
            }), 400
        
        for unidad_prod in unidades_productos:
            numero_unidad = unidad_prod.get('numero_unidad')
            productos = unidad_prod.get('productos', [])
            
            if not isinstance(productos, list) or len(productos) < 1:
                return jsonify({
                    'success': False,
                    'error': f'La unidad {numero_unidad} debe tener al menos 1 producto.'
                }), 400
            
            if len(productos) > 4:
                return jsonify({
                    'success': False,
                    'error': f'La unidad {numero_unidad} no puede tener más de 4 productos.'
                }), 400
            
            for i, producto in enumerate(productos):
                if not isinstance(producto, dict):
                    return jsonify({
                        'success': False,
                        'error': f'Estructura de producto inválida en unidad {numero_unidad}.'
                    }), 400
                
                codigo = producto.get('codigo', '').strip()
                titulo = producto.get('titulo', '').strip()
                descripcion = producto.get('descripcion', '').strip()
                
                if not codigo or not titulo or not descripcion:
                    return jsonify({
                        'success': False,
                        'error': f'Todos los campos son obligatorios para el producto {i+1} de la unidad {numero_unidad}.'
                    }), 400
        
        datos['productos'] = {
            'unidades_productos': unidades_productos
        }
        
        guardar_datos(datos)
        print(f"DEBUG: Productos guardados exitosamente")
        
        return jsonify({
            'success': True,
            'message': 'Productos guardados exitosamente'
        })
        
    except Exception as e:
        print(f"DEBUG: Error al guardar productos: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error interno del servidor: {str(e)}'
        }), 500

@app.route('/api/cargar_productos')
def api_cargar_productos():
    """API para cargar productos guardados"""
    try:
        datos = cargar_datos()
        productos_data = datos.get('productos', {})
        
        return jsonify({
            'success': True,
            'productos': productos_data.get('unidades_productos', [])
        })
    except Exception as e:
        print(f"DEBUG: Error al cargar productos: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error al cargar productos: {str(e)}'
        }), 500

@app.route('/api/cargar_unidades_para_productos')
def api_cargar_unidades_para_productos():
    """API para cargar las unidades disponibles para productos"""
    datos = cargar_datos()
    unidades_data = datos.get('unidades', {})
    
    if not unidades_data or not unidades_data.get('unidades_detalle'):
        return jsonify({
            'success': False,
            'message': 'No se encontraron unidades. Debes crear las unidades primero.',
            'unidades': []
        })
    
    return jsonify({
        'success': True,
        'unidades': unidades_data['unidades_detalle']
    })

@app.route('/sesiones')
def sesiones():
    """Página del formulario de sesiones"""
    datos = cargar_datos()
    datos_sesiones = datos.get('sesiones', {})
    return render_template('sesiones.html', datos=datos_sesiones)

@app.route('/guardar_sesiones', methods=['POST'])
def guardar_sesiones():
    """Guarda los datos del formulario de sesiones"""
    try:
        datos = cargar_datos()
        unidades_data = datos.get('unidades', {})
        
        if not unidades_data or not unidades_data.get('unidades_detalle'):
            return jsonify({
                'success': False,
                'error': 'No se encontraron unidades. Debes crear las unidades primero.'
            }), 400
        
        sesiones_data = request.form.get('sesiones_data')
        if not sesiones_data:
            return jsonify({
                'success': False,
                'error': 'No se recibieron datos de sesiones.'
            }), 400
        
        try:
            unidades_sesiones = json.loads(sesiones_data)
        except json.JSONDecodeError:
            return jsonify({
                'success': False,
                'error': 'Datos de sesiones inválidos.'
            }), 400
        
        for unidad_ses in unidades_sesiones:
            sesiones = unidad_ses.get('sesiones', [])
            if not isinstance(sesiones, list) or len(sesiones) < 1:
                return jsonify({
                    'success': False,
                    'error': f'Cada unidad debe tener al menos 1 sesión.'
                }), 400
            
            for sesion in sesiones:
                if not all(key in sesion for key in ['numero_sesion', 'temario']):
                    return jsonify({
                        'success': False,
                        'error': 'Cada sesión debe tener número y temario.'
                    }), 400
        
        datos['sesiones'] = {
            'unidades_sesiones': unidades_sesiones
        }
        
        guardar_datos(datos)
        
        return jsonify({
            'success': True,
            'message': f'Sesiones guardadas correctamente. Total: {sum(len(u.get("sesiones", [])) for u in unidades_sesiones)} sesiones.'
        })
        
    except Exception as e:
        print(f"DEBUG: Error al guardar sesiones: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error interno del servidor: {str(e)}'
        }), 500

@app.route('/api/cargar_sesiones')
def api_cargar_sesiones():
    """API para cargar datos del formulario de sesiones"""
    try:
        datos = cargar_datos()
        sesiones_data = datos.get('sesiones', {})
        
        if sesiones_data and 'unidades_sesiones' in sesiones_data:
            return jsonify({
                'success': True,
                'sesiones': sesiones_data['unidades_sesiones']
            })
        else:
            return jsonify({
                'success': True,
                'sesiones': []
            })
    except Exception as e:
        print(f"DEBUG: Error al cargar sesiones: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error al cargar sesiones: {str(e)}'
        }), 500

@app.route('/api/cargar_unidades_para_sesiones')
def api_cargar_unidades_para_sesiones():
    """API para cargar las unidades disponibles para sesiones"""
    datos = cargar_datos()
    unidades_data = datos.get('unidades', {})
    
    if not unidades_data or not unidades_data.get('unidades_detalle'):
        return jsonify({
            'success': False,
            'message': 'No se encontraron unidades. Debes crear las unidades primero.',
            'unidades': []
        })
    
    return jsonify({
        'success': True,
        'unidades': unidades_data['unidades_detalle']
    })

@app.route('/cronograma')
def cronograma():
    """Página de cronograma"""
    return render_template('cronograma.html')

@app.route('/guardar_cronograma', methods=['POST'])
def guardar_cronograma():
    """Guarda los datos del cronograma"""
    try:
        fecha_inicio = request.form.get('fecha_inicio')
        cronograma_data = request.form.get('cronograma')
        
        if not fecha_inicio:
            return jsonify({
                'success': False,
                'message': 'Fecha de inicio es requerida'
            }), 400
        
        cronograma_list = []
        if cronograma_data:
            import json
            cronograma_list = json.loads(cronograma_data)
        
        datos_cronograma = {
            'fecha_inicio': fecha_inicio,
            'cronograma': cronograma_list
        }
        
        datos = cargar_datos()
        datos['cronograma'] = datos_cronograma
        
        guardar_datos(datos)
        
        return jsonify({
            'success': True,
            'message': 'Cronograma guardado correctamente',
            'datos': datos_cronograma
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al guardar cronograma: {str(e)}'
        }), 500

@app.route('/api/cargar_cronograma')
def api_cargar_cronograma():
    """API para cargar datos del cronograma"""
    datos = cargar_datos()
    return jsonify({
        'success': True,
        'data': datos.get('cronograma', {})
    })

@app.route('/api/cargar_unidades_para_cronograma')
def api_cargar_unidades_para_cronograma():
    """API para cargar datos de unidades para el cronograma"""
    datos = cargar_datos()
    unidades_data = datos.get('unidades', {})
    
    unidades_list = []
    if 'unidades_detalle' in unidades_data:
        for i, unidad in enumerate(unidades_data['unidades_detalle']):
            unidades_list.append({
                'numero': i + 1,
                'nombre': unidad.get('nombre', f'Unidad {i + 1}'),
                'sesiones': unidad.get('sesiones', 0)
            })
    
    return jsonify({
        'success': True,
        'data': unidades_list
    })

@app.route('/referencias')
def referencias():
    """Página de referencias bibliográficas"""
    datos = cargar_datos()
    referencias_data = datos.get('referencias', {})
    return render_template('referencias.html', datos=referencias_data)

@app.route('/guardar_referencias', methods=['POST'])
def guardar_referencias():
    """Guarda las referencias bibliográficas"""
    try:
        referencias_data = request.get_json()
        
        datos = cargar_datos()
        
        datos['referencias'] = {
            'libros': referencias_data.get('libros', []),
            'articulos': referencias_data.get('articulos', []),
            'web': referencias_data.get('web', [])
        }
        
        guardar_datos(datos)
        
        return jsonify({
            'success': True,
            'message': 'Referencias guardadas exitosamente'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al guardar referencias: {str(e)}'
        })

@app.route('/api/cargar_referencias')
def cargar_referencias():
    """Carga las referencias guardadas"""
    try:
        datos = cargar_datos()
        referencias = datos.get('referencias', {})
        
        return jsonify({
            'success': True,
            'referencias': {
                'libros': referencias.get('libros', []),
                'articulos': referencias.get('articulos', []),
                'web': referencias.get('web', [])
            }
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al cargar referencias: {str(e)}'
        })

@app.route('/finalizar')
def finalizar():
    """Página de finalización del sílabo"""
    datos = cargar_datos()
    return render_template('finalizar.html', datos=datos)

@app.route('/generar_word')
def generar_word():
    """Genera y descarga un documento Word del sílabo, luego finaliza el registro"""
    try:
        datos = cargar_datos()
        datos_general = datos.get('general', {})
        
        if not datos_general:
            return jsonify({
                'success': False,
                'message': 'No hay datos para generar el documento. Complete el formulario general primero.'
            }), 400
        
        datos_completos = {
            'general': datos_general,
            'unidades': datos.get('unidades', {}),
            'competencias': datos.get('competencias', {}),
            'productos': datos.get('productos', {}),
            'sesiones': datos.get('sesiones', {}),
            'cronograma': datos.get('cronograma', {}),
            'referencias': datos.get('referencias', {})
        }
        
        doc = generar_documento_word(datos_completos)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.docx') as tmp_file:
            doc.save(tmp_file.name)
            tmp_file_path = tmp_file.name
        
        nombre_archivo = generar_nombre_archivo(datos_general)
        
        finalizar_registro()
        
        return send_file(
            tmp_file_path,
            as_attachment=True,
            download_name=nombre_archivo,
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al generar el documento: {str(e)}'
        }), 500

@app.route('/finalizar_registro', methods=['POST'])
def finalizar_registro_route():
    """Finaliza el registro actual y lo mueve al historial"""
    try:
        if finalizar_registro():
            return jsonify({
                'success': True,
                'message': 'Registro finalizado exitosamente'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'No hay datos para finalizar'
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al finalizar registro: {str(e)}'
        })

@app.route('/nuevo_registro', methods=['POST'])
def nuevo_registro_route():
    """Crea un nuevo registro vacío"""
    try:
        iniciar_nuevo_registro()
        return jsonify({
            'success': True,
            'message': 'Nuevo registro iniciado correctamente'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al crear nuevo registro: {str(e)}'
        })

@app.route('/api/historial')
def obtener_historial():
    """Obtiene el historial completo de registros"""
    try:
        historial = cargar_historial_completo()
        return jsonify({
            'success': True,
            'historial': {
                'registro_actual': historial.get('registro_actual', {}),
                'registros_completados': historial.get('registros_completados', [])
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al obtener historial: {str(e)}'
        })

@app.route('/api/cargar_registro_desde_historial', methods=['POST'])
def cargar_registro_desde_historial():
    """Carga un registro específico del historial al registro actual"""
    try:
        data = request.get_json()
        registro_index = data.get('registro_index')
        
        if registro_index is None:
            return jsonify({
                'success': False,
                'message': 'Índice de registro no proporcionado'
            })
        
        historial = cargar_historial_completo()
        registros_completados = historial.get('registros_completados', [])
        
        if registro_index < 0 or registro_index >= len(registros_completados):
            return jsonify({
                'success': False,
                'message': 'Índice de registro inválido'
            })
        
        indice_real = len(registros_completados) - 1 - registro_index
        registro_seleccionado = registros_completados[indice_real]
        
        nuevo_registro_actual = {}
        for seccion, datos in registro_seleccionado.items():
            if seccion != 'metadatos':  
                nuevo_registro_actual[seccion] = datos.copy() if isinstance(datos, dict) else datos
        
        if 'general' in nuevo_registro_actual:
            if 'fecha_guardado' in nuevo_registro_actual['general']:
                del nuevo_registro_actual['general']['fecha_guardado']
        
        historial['registro_actual'] = nuevo_registro_actual
        
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(historial, f, ensure_ascii=False, indent=2)
        
        return jsonify({
            'success': True,
            'message': 'Registro cargado exitosamente',
            'datos_cargados': {
                'asignatura': nuevo_registro_actual.get('general', {}).get('asignatura', 'Sin nombre'),
                'codigo': nuevo_registro_actual.get('general', {}).get('codigo', 'Sin código'),
                'secciones_cargadas': list(nuevo_registro_actual.keys())
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al cargar registro: {str(e)}'
        })

@app.route('/api/filtrar_historial', methods=['POST'])
def api_filtrar_historial():
    """API para filtrar y buscar en el historial"""
    try:
        data = request.json
        asignatura_filtro = data.get('asignatura', '').lower()
        docente_filtro = data.get('docente', '').lower() 
        maestria_filtro = data.get('maestria', '').lower()
        fecha_desde = data.get('fecha_desde')
        fecha_hasta = data.get('fecha_hasta')
        
        historial = cargar_historial_completo()
        registros = historial.get('registros_completados', [])
        
        registros_filtrados = []
        
        for registro in registros:
            general = registro.get('general', {})
            metadatos = registro.get('metadatos', {})
            
            asignatura_coincide = not asignatura_filtro or asignatura_filtro in general.get('asignatura', '').lower()
            docente_coincide = not docente_filtro or docente_filtro in general.get('docente', '').lower()
            maestria_coincide = not maestria_filtro or maestria_filtro in general.get('maestria', '').lower()
            
            fecha_coincide = True
            if fecha_desde or fecha_hasta:
                fecha_finalizacion = metadatos.get('fecha_finalizacion')
                if fecha_finalizacion:
                    fecha_reg = datetime.fromisoformat(fecha_finalizacion).date()
                    if fecha_desde:
                        fecha_coincide = fecha_coincide and fecha_reg >= datetime.fromisoformat(fecha_desde).date()
                    if fecha_hasta:
                        fecha_coincide = fecha_coincide and fecha_reg <= datetime.fromisoformat(fecha_hasta).date()
                else:
                    fecha_coincide = False
            
            if asignatura_coincide and docente_coincide and maestria_coincide and fecha_coincide:
                registros_filtrados.append(registro)
        

        maestrias_unicas = list(set(r.get('general', {}).get('maestria', '') for r in registros_filtrados if r.get('general', {}).get('maestria')))
        docentes_unicos = list(set(r.get('general', {}).get('docente', '') for r in registros_filtrados if r.get('general', {}).get('docente')))
        
        return jsonify({
            'success': True,
            'registros_filtrados': registros_filtrados,
            'total_filtrados': len(registros_filtrados),
            'total_original': len(registros),
            'estadisticas': {
                'maestrias_unicas': maestrias_unicas,
                'docentes_unicos': docentes_unicos
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al filtrar historial: {str(e)}'
        })

@app.route('/api/estadisticas_historial')
def api_estadisticas_historial():
    """API para obtener estadísticas del historial"""
    try:
        historial = cargar_historial_completo()
        registros = historial.get('registros_completados', [])
        
        if not registros:
            return jsonify({
                'success': True,
                'estadisticas': {
                    'total_registros': 0,
                    'maestrias': {},
                    'docentes': {},
                    'por_mes': {},
                    'modalidades': {}
                }
            })
        
        maestrias = {}
        for registro in registros:
            maestria = registro.get('general', {}).get('maestria', 'Sin especificar')
            maestrias[maestria] = maestrias.get(maestria, 0) + 1
        
        docentes = {}
        for registro in registros:
            docente = registro.get('general', {}).get('docente', 'Sin especificar')
            docentes[docente] = docentes.get(docente, 0) + 1
        
        por_mes = {}
        for registro in registros:
            fecha_finalizacion = registro.get('metadatos', {}).get('fecha_finalizacion')
            if fecha_finalizacion:
                fecha = datetime.fromisoformat(fecha_finalizacion)
                mes_año = fecha.strftime('%Y-%m')
                por_mes[mes_año] = por_mes.get(mes_año, 0) + 1
        
        modalidades = {}
        for registro in registros:
            modalidad = registro.get('general', {}).get('modalidad', 'Sin especificar')
            modalidades[modalidad] = modalidades.get(modalidad, 0) + 1
        
        return jsonify({
            'success': True,
            'estadisticas': {
                'total_registros': len(registros),
                'maestrias': maestrias,
                'docentes': docentes,
                'por_mes': por_mes,
                'modalidades': modalidades
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al obtener estadísticas: {str(e)}'
        })

@app.route('/vista_previa_word')
def vista_previa_word():
    """Genera una vista previa HTML del documento Word que se va a generar"""
    try:
        datos = cargar_datos()
        
        datos_procesados = {
            'general': datos.get('general', {}),
            'unidades': datos.get('unidades', {}),
            'competencias': datos.get('competencias', {}),
            'productos': datos.get('productos', {}),
            'sesiones': datos.get('sesiones', {}),
            'cronograma': datos.get('cronograma', {}),
            'referencias': datos.get('referencias', {})
        }
        
        html_preview = generar_html_vista_previa(datos_procesados)
        
        return html_preview
        
    except Exception as e:
        return f"""
        <html>
            <head>
                <title>Error - Vista Previa</title>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 20px; }}
                    .error {{ color: red; background: #ffe6e6; padding: 20px; border-radius: 5px; }}
                </style>
            </head>
            <body>
                <div class="error">
                    <h2>Error al generar vista previa</h2>
                    <p>{str(e)}</p>
                </div>
            </body>
        </html>
        """

def generar_html_vista_previa(datos):
    general = datos.get('general', {})
    programa = general.get('maestria', '[PROGRAMA]')
    asignatura = general.get('asignatura', '[ASIGNATURA]')
    semestre = general.get('semestre', '[SEMESTRE]')
    docente = general.get('docente', '[DOCENTE]')
    codigo = general.get('codigo', '[CÓDIGO]')
    version = general.get('version', '[VERSIÓN]')
    fecha = general.get('fecha', '[FECHA]')
    correo = general.get('correo', '[CORREO]')
    modalidad = general.get('modalidad', '[MODALIDAD]')
    proposito = general.get('proposito', '[PROPÓSITO DE LA ASIGNATURA]')
    caracter = general.get('caracter', '[CARÁCTER]')
    codigo_programa = general.get('codigo_programa', '[CÓDIGO PROGRAMA]')
    horas_teoria = general.get('horas_teoria', 0)
    horas_practica = general.get('horas_practica', 0)
    creditos = general.get('creditos', 0)
    sesiones_total = general.get('sesiones', 0)
    semanas = general.get('semanas', 0)
    horas_totales = int(horas_teoria) + int(horas_practica)
    """Genera el HTML de vista previa que simula exactamente el documento Word"""
    general = datos.get('general', {})
    unidades = datos.get('unidades', {})
    competencias = datos.get('competencias', {})
    unidades = datos.get('unidades', {})
    unidades_detalle = unidades.get('unidades_detalle', []) if isinstance(unidades, dict) else []
    unidades_html = ""
    for i, unidad in enumerate(unidades_detalle, 1):
        if isinstance(unidad, dict):
            nombre = unidad.get('nombre', f'Unidad {i}')
            descripcion = unidad.get('descripcion', '').strip()
            if descripcion:
                unidades_html += f"<p style='margin: 6px 0;'><strong>Unidad {i}:</strong> {nombre if nombre else f'Unidad {i}'}<br>{descripcion}</p>"
            else:
                unidades_html += f"<p style='margin: 6px 0;'><strong>Unidad {i}:</strong> {nombre if nombre else f'Unidad {i}'}</p>"
    competencias = datos.get('competencias', {})
    competencias_html = ""
    if isinstance(competencias, dict) and competencias.get('unidades_competencias'):
        for unidad in competencias['unidades_competencias']:
            for comp in unidad.get('competencias', []):
                codigo = comp.get('codigo', '')
                titulo = comp.get('titulo', '')
                descripcion = comp.get('descripcion', '')
                competencias_html += f"<div style='margin: 6px 0; margin-left: 1.3cm;'><p style='margin: 6px 0 0 0; font-weight: bold; font-size: 12pt;'>{codigo} {titulo}:</p><p style='margin: 6px 0 0 0.5in; text-align: justify; font-size: 11pt;'>{descripcion}</p></div>"
    productos = datos.get('productos', {})
    productos_html = ""
    if isinstance(productos, dict) and productos.get('unidades_productos'):
        for unidad in productos['unidades_productos']:
            for prod in unidad.get('productos', []):
                codigo = prod.get('codigo', '')
                titulo = prod.get('titulo', '')
                descripcion = prod.get('descripcion', '')
                productos_html += f"<div style='margin: 6px 0; margin-left: 1.3cm;'><p style='margin: 6px 0 0 0; font-weight: bold; font-size: 12pt;'>{codigo} {titulo}:</p><p style='margin: 6px 0 0 0.5in; text-align: justify; font-size: 11pt;'>{descripcion}</p></div>"
    sesiones = datos.get('sesiones', {})
    productos = datos.get('productos', {})
    competencias = datos.get('competencias', {})
    sesiones_html = ""
    if isinstance(sesiones, dict) and sesiones.get('unidades_sesiones') and unidades_detalle:
        for i, unidad in enumerate(unidades_detalle, 1):
            nombre_unidad = unidad.get('nombre', f'Unidad {i}') if isinstance(unidad, dict) else f'Unidad {i}'
            fecha_inicio = unidad.get('fecha_inicio', '')
            fecha_termino = unidad.get('fecha_termino', '')
            # Buscar RAE y PA para la unidad
            rae = ""
            pa = ""
            if isinstance(competencias, dict) and competencias.get('unidades_competencias'):
                comp_unidad = next((u for u in competencias['unidades_competencias'] if u.get('numero_unidad') == i), None)
                if comp_unidad:
                    rae_list = comp_unidad.get('competencias', [])
                    if rae_list:
                        rae = '<br>'.join([f"<strong>{c.get('codigo', '')} ({c.get('titulo', '')}):</strong> {c.get('descripcion', '')}" for c in rae_list])
            # Buscar producto de aprendizaje solo por número de unidad o por nombre, nunca mostrar el producto de otra unidad
            if isinstance(productos, dict) and productos.get('unidades_productos'):
                prod_unidad = next((u for u in productos['unidades_productos'] if u.get('unidad_numero') == i), None)
                if not prod_unidad:
                    nombre_unidad_normalizado = nombre_unidad.strip().lower()
                    prod_unidad = next((u for u in productos['unidades_productos'] if u.get('unidad_nombre', '').strip().lower() == nombre_unidad_normalizado), None)
                if prod_unidad:
                    pa_list = prod_unidad.get('productos', [])
                    if pa_list and any(p.get('codigo', '').strip() or p.get('titulo', '').strip() or p.get('descripcion', '').strip() for p in pa_list):
                        pa = ''.join([
                            f"<div style='margin: 6px 0; margin-left: 1.3cm;'><p style='margin: 6px 0 0 0; font-weight: bold; font-size: 12pt;'>{p.get('codigo', '')} {p.get('titulo', '')}:</p><p style='margin: 6px 0 0 0.5in; text-align: justify; font-size: 11pt;'>{p.get('descripcion', '') if p.get('descripcion', '').strip() else '<span class=\"no-data\">No definido</span>'}</p></div>"
                            for p in pa_list if p.get('codigo', '').strip() or p.get('titulo', '').strip() or p.get('descripcion', '').strip()
                        ])
                    else:
                        pa = '<span class=\"no-data\">No definido</span>'

            sesiones_unidad = sesiones['unidades_sesiones'][i-1]['sesiones'] if len(sesiones['unidades_sesiones']) > i-1 else []
            sesiones_html += f"<div style='page-break-inside: avoid; margin-bottom: 30px;'>"
            sesiones_html += f"<h4 style='margin-bottom: 6px;'>UNIDAD DE APRENDIZAJE N° {i}: {nombre_unidad}</h4>"
            sesiones_html += f"<div style='margin-bottom: 6px;'><strong>Fecha de inicio:</strong> {fecha_inicio if fecha_inicio else '-'} &nbsp;&nbsp; <strong>Fecha de término:</strong> {fecha_termino if fecha_termino else '-'}</div>"
            sesiones_html += f"<div style='margin-bottom: 6px;'><strong>Resultado de aprendizaje específico:</strong><br>{rae if rae else '<span class=\"no-data\">No definido</span>'}</div>"
            sesiones_html += f"<div style='margin-bottom: 6px;'><strong>Producto de aprendizaje de la unidad:</strong><br>{pa if pa else '<span class=\"no-data\">No definido</span>'}</div>"
            sesiones_html += f"<table style='width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 11pt;'>"
            sesiones_html += f"<tr style='background-color: #e8e8e8; font-weight: bold;'><td style='border: 1px solid #000; padding: 8px; text-align: center;'>No. Sesión / Horas Lectivas</td><td style='border: 1px solid #000; padding: 8px; text-align: left;'>Tema / actividad</td><td style='border: 1px solid #000; padding: 8px; text-align: left;'>Indicador(es) de logro</td><td style='border: 1px solid #000; padding: 8px; text-align: left;'>Instrumentos de evaluación</td></tr>"
            # Obtener el indicador de logro combinado
            indicador_combinado = None
            for sesion in sesiones_unidad:
                indicador = sesion.get('indicador_logro', sesion.get('indicadores_logro', ''))
                if indicador and indicador != '-':
                    if isinstance(indicador, list):
                        indicador_combinado = '<ul style="margin:0; padding-left:18px;">' + ''.join(f'<li>{ind}</li>' for ind in indicador) + '</ul>'
                    else:
                        indicador_combinado = indicador.replace('\n', '<br>')
                    break
            if not indicador_combinado:
                indicador_combinado = '<span class="no-data">No definido</span>'

            # Obtener instrumentos de evaluación combinados
            instrumentos_combinados = None
            for sesion in sesiones_unidad:
                instrumentos = sesion.get('instrumentos', sesion.get('instrumentos_evaluacion', ''))
                if instrumentos and instrumentos != '-':
                    if isinstance(instrumentos, list):
                        instrumentos_combinados = '<ul style="margin:0; padding-left:18px;">' + ''.join(f'<li>{inst}</li>' for inst in instrumentos) + '</ul>'
                    else:
                        instrumentos_combinados = instrumentos.replace('\n', '<br>')
                    break
            if not instrumentos_combinados:
                instrumentos_combinados = '<span class="no-data">No definido</span>'

            for idx, sesion in enumerate(sesiones_unidad):
                sesion_num = sesion.get('numero_sesion', '') or sesion.get('nombre', '') or 'Sesión'
                horas = sesion.get('horas', '')
                fecha = sesion.get('fecha', '')
                sesion_info = f"<strong>{sesion_num}</strong>" + (f"<br>{horas}" if horas else "") + (f"<br>{fecha}" if fecha else "")

                tema = sesion.get('temario', '')
                if isinstance(tema, list):
                    tema_html = '<ul style="margin:0; padding-left:18px;">' + ''.join(f'<li>{t}</li>' for t in tema) + '</ul>'
                else:
                    tema_html = tema.replace('\n', '<br>') if tema else '<span class="no-data">No definido</span>'

                sesiones_html += f"<tr>"
                sesiones_html += f"<td style='border: 2px solid #222; padding: 7px; text-align: center; vertical-align: middle; font-family: Arial, sans-serif; font-size: 11pt;'>{sesion_info}</td>"
                sesiones_html += f"<td style='border: 2px solid #222; padding: 7px; text-align: left; vertical-align: top; font-family: Arial, sans-serif; font-size: 11pt;'>{tema_html}</td>"
                if idx == 0:
                    sesiones_html += f"<td style='border: 2px solid #222; padding: 7px; text-align: left; vertical-align: top; font-family: Arial, sans-serif; font-size: 11pt;' rowspan='{len(sesiones_unidad)}'>{indicador_combinado}</td>"
                    sesiones_html += f"<td style='border: 2px solid #222; padding: 7px; text-align: left; vertical-align: top; font-family: Arial, sans-serif; font-size: 11pt;' rowspan='{len(sesiones_unidad)}'>{instrumentos_combinados}</td>"
                sesiones_html += "</tr>"
            sesiones_html += "</table></div>"
    # Encabezado de la tabla con formato Word
    sesiones_html = sesiones_html.replace('<table', "<table style='border-collapse: collapse; width: 100%; margin-top: 10px; font-family: Arial, sans-serif; font-size: 11pt;'", 1)
    sesiones_html = sesiones_html.replace('<th', "<th style='border: 2px solid #222; background: #e6e6e6; color: #222; padding: 7px; text-align: center; font-family: Arial, sans-serif; font-size: 11pt;'")
    sesiones_html = sesiones_html.replace('<tr>', "<tr style='border: 2px solid #222;'>")
    referencias_html = ""
    if isinstance(referencias, dict) and referencias:
        if referencias.get('libros'):
            referencias_html += "<p style='margin: 12px 0 6px 0; font-weight: bold; font-size: 12pt;'>Libros:</p>"
            for i, libro in enumerate(referencias['libros'], 1):
                if isinstance(libro, dict):
                    autores = []
                    for autor in libro.get('autores', []):
                        if isinstance(autor, dict):
                            nombre = autor.get('nombre', '')
                            apellido = autor.get('apellido', '')
                            if apellido and nombre:
                                autores.append(f"{apellido}, {nombre[0]}.")
                    
                    autores_str = " & ".join(autores) if autores else "Autor desconocido"
                    referencias_html += f"""
                    <p style="margin: 3px 0 3px 0.5in; text-align: justify; font-size: 11pt;">
                        {i}. {autores_str} ({libro.get('año', 'S.f.')}). <em>{libro.get('titulo', '')}</em>. {libro.get('editorial', '')}.
                    </p>
                    """
        
        if referencias.get('articulos'):
            referencias_html += "<p style='margin: 12px 0 6px 0; font-weight: bold; font-size: 12pt;'>Artículos de revista:</p>"
            for i, articulo in enumerate(referencias['articulos'], 1):
                if isinstance(articulo, dict):
                    autores = []
                    for autor in articulo.get('autores', []):
                        if isinstance(autor, dict):
                            nombre = autor.get('nombre', '')
                            apellido = autor.get('apellido', '')
                            if apellido and nombre:
                                autores.append(f"{apellido}, {nombre[0]}.")
                    
                    autores_str = " & ".join(autores) if autores else "Autor desconocido"
                    referencias_html += f"""
                    <p style="margin: 3px 0 3px 0.5in; text-align: justify; font-size: 11pt;">
                        {i}. {autores_str} ({articulo.get('año', 'S.f.')}). {articulo.get('titulo', '')}. <em>{articulo.get('revista', '')}</em>, {articulo.get('volumen', '')}({articulo.get('numero', '')}), {articulo.get('paginas', '')}. {articulo.get('doi', '')}
                    </p>
                    """
        
        if referencias.get('web'):
            referencias_html += "<p style='margin: 12px 0 6px 0; font-weight: bold; font-size: 12pt;'>Recursos web:</p>"
            for i, web in enumerate(referencias['web'], 1):
                if isinstance(web, dict):
                    referencias_html += f"""
                    <p style="margin: 3px 0 3px 0.5in; text-align: justify; font-size: 11pt;">
                        {i}. {web.get('autor', 'Autor desconocido')} ({web.get('año', 'S.f.')}). {web.get('titulo', '')}. <em>{web.get('sitio', '')}</em>. {web.get('url', '')}
                    </p>
                    """
    
    cronograma_html = ""
    if isinstance(cronograma, dict) and cronograma and cronograma.get('semanas'):
        cronograma_html += """
        <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
            <tr>
                <td style="border: 1px solid #000; padding: 8px; font-weight: bold; font-size: 10pt; text-align: center; background-color: #f8f8f8; width: 15%;">
                    SEMANA
                </td>
                <td style="border: 1px solid #000; padding: 8px; font-weight: bold; font-size: 10pt; text-align: center; background-color: #f8f8f8; width: 15%;">
                    FECHA
                </td>
                <td style="border: 1px solid #000; padding: 8px; font-weight: bold; font-size: 10pt; text-align: center; background-color: #f8f8f8; width: 50%;">
                    ACTIVIDAD
                </td>
                <td style="border: 1px solid #000; padding: 8px; font-weight: bold; font-size: 10pt; text-align: center; background-color: #f8f8f8; width: 20%;">
                    OBSERVACIONES
                </td>
            </tr>
        """
        
        semanas_cronograma = cronograma.get('semanas', [])
        for i, semana in enumerate(semanas_cronograma, 1):
            if isinstance(semana, dict):
                fecha = semana.get('fecha', f'Semana {i}')
                actividad = semana.get('actividad', 'Actividad de aprendizaje')
                observaciones = semana.get('observaciones', '')
            else:
                fecha = f'Semana {i}'
                actividad = 'Actividad de aprendizaje'
                observaciones = ''
            
            cronograma_html += f"""
            <tr>
                <td style="border: 1px solid #000; padding: 8px; font-size: 10pt; text-align: center; vertical-align: top;">
                    {i}
                </td>
                <td style="border: 1px solid #000; padding: 8px; font-size: 10pt; text-align: center; vertical-align: top;">
                    {fecha}
                </td>
                <td style="border: 1px solid #000; padding: 8px; font-size: 10pt; vertical-align: top; text-align: justify;">
                    {actividad}
                </td>
                <td style="border: 1px solid #000; padding: 8px; font-size: 10pt; text-align: center; vertical-align: top;">
                    {observaciones}
                </td>
            </tr>
            """
        
        cronograma_html += "</table>"
    
    html_content = f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vista Previa - Sílabo {asignatura}</title>
        <link rel="stylesheet" href="/static/css/vista_previa.css">
        <style>
            body {{
                font-family: 'Times New Roman', serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
            }}
            .document {{
                max-width: 21cm;
                margin: 0 auto;
                background: white;
                padding: 2.5cm;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                min-height: 29.7cm;
            }}
            .header {{
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
            }}
            .header h1 {{
                font-size: 22pt;
                margin: 10px 0;
                font-weight: bold;
            }}
            .header h2 {{
                font-size: 18pt;
                margin: 5px 0;
                font-weight: bold;
            }}
            .header h3 {{
                font-size: 14pt;
                margin: 5px 0;
                font-weight: bold;
            }}
            .header .programa {{
                font-size: 14pt;
                margin: 10px 0;
                font-weight: bold;
            }}
            .header .info {{
                font-size: 14pt;
                margin: 5px 0;
                text-align: left;
                font-weight: bold;
            }}
            .header .ubicacion {{
                font-size: 18pt;
                margin: 15px 0;
                font-weight: bold;
            }}
            .section {{
                margin-bottom: 25px;
            }}
            .section h3 {{
                font-size: 12pt;
                font-weight: bold;
                margin-bottom: 10px;
                color: #000;
            }}
            .section h4 {{
                font-size: 11pt;
                font-weight: bold;
                margin-bottom: 8px;
                color: #000;
            }}
            .data-table {{
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }}
            .data-table td {{
                border: 1px solid #000;
                padding: 8px;
                font-size: 11pt;
                vertical-align: top;
            }}
            .data-table td:first-child {{
                width: 50px;
                text-align: left;
                font-weight: bold;
            }}
            .data-table td:nth-child(2) {{
                width: 200px;
                font-weight: bold;
            }}
            .data-table td:nth-child(3) {{
                width: auto;
            }}
            .content {{
                font-size: 12pt;
                text-align: justify;
                margin-bottom: 15px;
            }}
            .content p {{
                margin-bottom: 10px;
            }}
            .lista {{
                margin-left: 20px;
            }}
            .lista li {{
                margin-bottom: 5px;
            }}
            .page-break {{
                page-break-before: always;
            }}
            .logo {{
                width: 1.8in;
                height: auto;
                margin: 10px 0;
            }}
            .centrado {{
                text-align: center;
            }}
            .titulo-silabo {{
                font-size: 36pt;
                font-weight: bold;
                margin: 20px 0;
                text-align: center;
            }}
            .preview-toolbar {{
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px;
                border-radius: 5px;
                z-index: 1000;
            }}
            .preview-toolbar button {{
                background: #4CAF50;
                color: white;
                border: none;
                padding: 8px 12px;
                margin: 0 5px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
            }}
            .preview-toolbar button:hover {{
                background: #45a049;
            }}
            .no-data {{
                color: #999;
                font-style: italic;
            }}
            @media print {{
                body {{ margin: 0; padding: 0; background: white; }}
                .document {{ box-shadow: none; margin: 0; padding: 2.5cm; }}
                .preview-toolbar {{ display: none; }}
            }}
        </style>
    </head>
    <body>
        <div class="preview-toolbar">
            <button onclick="window.print()" title="Imprimir">🖨️ Imprimir</button>
            <button onclick="window.close()" title="Cerrar">❌ Cerrar</button>
        </div>
        
        <div class="document">
            <!-- Portada -->
            <div class="header">
                <h1>UNIVERSIDAD NACIONAL DEL CALLAO</h1>
                <h2>ESCUELA DE POSGRADO DE LA UNAC</h2>
                <h3>UNIDAD DE POSGRADO DE LA FACULTAD DE INGENIERÍA MECÁNICA Y DE ENERGÍA</h3>
                
                <div class="centrado">
                    <div style="margin: 20px 0;">
                        <img src="/static/img/UC.png" alt="Logo UNAC" style="width:300px; height:220px; object-fit:contain; border: 1px solid #ccc; display: inline-block;" />
                    </div>
                </div>
                
                <div class="titulo-silabo">SÍLABO</div>
                
                <div class="programa">PROGRAMA DE POSGRADO:</div>
                <div class="programa">MAESTRÍA EN {programa.upper()}</div>
                <div class="info">ASIGNATURA: {asignatura.upper()}</div>
                <div class="info">SEMESTRE ACADÉMICO: 2025 - {semestre.upper()}</div>
                <div class="info">DOCENTE: {docente.upper()}</div>
                
                <div class="ubicacion">
                    <br>
                    CALLAO, PERÚ<br>
                    2025
                </div>
            </div>
            
            <div class="page-break"></div>
            
            <!-- Contenido del Sílabo -->
            <div class="centrado">
                <h2 style="font-size: 16pt; margin-bottom: 20px;">SÍLABO</h2>
            </div>
            
            <div class="section">
                <h3>I. DATOS GENERALES</h3>
                <table class="data-table">
                    <tr>
                        <td>1.1</td>
                        <td>Asignatura</td>
                        <td>{asignatura.title()}</td>
                    </tr>
                    <tr>
                        <td>1.2</td>
                        <td>Código</td>
                        <td>{codigo.upper()}</td>
                    </tr>
                    <tr>
                        <td>1.3</td>
                        <td>Carácter</td>
                        <td>{caracter}</td>
                    </tr>
                    <tr>
                        <td>1.4</td>
                        <td>Requisito (nombre y código)</td>
                        <td>Ninguno</td>
                    </tr>
                    <tr>
                        <td>1.5</td>
                        <td>Ciclo</td>
                        <td>I</td>
                    </tr>
                    <tr>
                        <td>1.6</td>
                        <td>Semestre académico</td>
                        <td>{semestre}</td>
                    </tr>
                    <tr>
                        <td rowspan="3">1.7</td>
                        <td>Número de horas de clase</td>
                        <td>{horas_totales} horas semanales.</td>
                    </tr>
                    <tr>
                        <td>Horas de teoría</td>
                        <td>{horas_teoria} horas semanales.</td>
                    </tr>
                    <tr>
                        <td>Horas de práctica</td>
                        <td>{horas_practica} horas semanales.</td>
                    </tr>
                    <tr>
                        <td>1.8</td>
                        <td>Número de créditos</td>
                        <td>{creditos}</td>
                    </tr>
                    <tr>
                        <td>1.9</td>
                        <td>Duración</td>
                        <td>{sesiones_total} sesiones {semanas} semanas</td>
                    </tr>
                    <tr>
                        <td rowspan="2">1.10</td>
                        <td>Docente(s)</td>
                        <td>{docente.title()}</td>
                    </tr>
                    <tr>
                        <td>Correo electrónico institucional</td>
                        <td>{correo}</td>
                    </tr>
                    <tr>
                        <td>1.11</td>
                        <td>Modalidad</td>
                        <td>{modalidad}</td>
                    </tr>
                </table>
            </div>
            
            <div class="section">
                <h3>II. SUMILLA</h3>
                <div class="content">
                    <p>La asignatura de {asignatura.title()} pertenece al módulo curricular de estudios de especialidad, es de naturaleza teórico-práctico y de carácter {caracter.lower()}, tiene por propósito {proposito}</p>
                    <p>La asignatura se organiza en cuatro unidades de aprendizaje:</p>
                    {unidades_html if unidades_html else '<p class="no-data">No se han definido unidades de aprendizaje.</p>'}
                </div>
            </div>
            
            {f'''
            <div class="section">
                <h3>III. COMPETENCIAS Y CAPACIDADES</h3>
                <div class="content">
                    {competencias_html}
                </div>
            </div>
            ''' if competencias_html else '''
            <div class="section">
                <h3>III. COMPETENCIAS Y CAPACIDADES</h3>
                <div class="content">
                    <p class="no-data">No se han definido competencias.</p>
                </div>
            </div>
            '''}
            
            {f'''
            <div class="section">
                <h3>IV. PRODUCTOS ACADÉMICOS</h3>
                <div class="content">
                    {productos_html}
                </div>
            </div>
            ''' if productos_html else '''
            <div class="section">
                <h3>IV. PRODUCTOS ACADÉMICOS</h3>
                <div class="content">
                    <p class="no-data">No se han definido productos académicos.</p>
                </div>
            </div>
            '''}
            
            {f'''
            <div class="section">
                <h3>V. ORGANIZACIÓN DE LAS UNIDADES DE APRENDIZAJE </h3>
                <div class="content">
                    {sesiones_html}
                </div>
            </div>
            ''' if sesiones_html else '''
            <div class="section">
                <h3>V. ORGANIZACIÓN DE LAS UNIDADES DE APRENDIZAJE</h3>
                <div class="content">
                    <p class="no-data">No se han definido sesiones.</p>
                </div>
            </div>
            '''}
            
            {f'''
            <div class="section">
                <h3>VI. CRONOGRAMA</h3>
                <div class="content">
                    {cronograma_html}
                </div>
            </div>
            ''' if cronograma_html else '''
            <div class="section">
                <h3>VI. CRONOGRAMA</h3>
                <div class="content">
                    <p class="no-data">No se ha generado el cronograma.</p>
                </div>
            </div>
            '''}
            
            {f'''
            <div class="section">
                <h3>VII. REFERENCIAS BIBLIOGRÁFICAS</h3>
                <div class="content">
                    {referencias_html}
                </div>
            </div>
            ''' if referencias_html else '''
            <div class="section">
                <h3>VII. REFERENCIAS BIBLIOGRÁFICAS</h3>
                <div class="content">
                    <p class="no-data">No se han agregado referencias bibliográficas.</p>
                </div>
            </div>
            '''}
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; color: #666; font-size: 10pt;">
                <p><strong>Documento generado automáticamente por el Sistema de Sílabos UNAC</strong></p>
                <p>Fecha de generación: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}</p>
                <p><em>Esta es una vista previa del documento Word que se generará</em></p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return html_content

if __name__ == '__main__':
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    
    app.run(debug=True, port=5000)
