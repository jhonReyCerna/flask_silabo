from flask import Flask, render_template, request, jsonify, redirect, url_for, send_file
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
        sesiones_total = int(request.form.get('sesiones'))
        num_unidades = int(request.form.get('unidades'))
        
        print(f"DEBUG: Guardando unidades - Total sesiones: {sesiones_total}, Num unidades: {num_unidades}")
        
        unidades_detalle = []
        suma_sesiones = 0
        
        for i in range(1, num_unidades + 1):
            sesiones_unidad = int(request.form.get(f'sesiones_unidad_{i}', 0))
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
        except json.JSONDecodeError:
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
        
        doc = generar_documento_word(datos_general)
        
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
        
        registro_seleccionado = registros_completados[registro_index]
        
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
            
            # Filtros de texto
            asignatura_coincide = not asignatura_filtro or asignatura_filtro in general.get('asignatura', '').lower()
            docente_coincide = not docente_filtro or docente_filtro in general.get('docente', '').lower()
            maestria_coincide = not maestria_filtro or maestria_filtro in general.get('maestria', '').lower()
            
            # Filtros de fecha
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
        
        # Estadísticas
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
        
        # Análisis por maestría
        maestrias = {}
        for registro in registros:
            maestria = registro.get('general', {}).get('maestria', 'Sin especificar')
            maestrias[maestria] = maestrias.get(maestria, 0) + 1
        
        # Análisis por docente
        docentes = {}
        for registro in registros:
            docente = registro.get('general', {}).get('docente', 'Sin especificar')
            docentes[docente] = docentes.get(docente, 0) + 1
        
        # Análisis por mes
        por_mes = {}
        for registro in registros:
            fecha_finalizacion = registro.get('metadatos', {}).get('fecha_finalizacion')
            if fecha_finalizacion:
                fecha = datetime.fromisoformat(fecha_finalizacion)
                mes_año = fecha.strftime('%Y-%m')
                por_mes[mes_año] = por_mes.get(mes_año, 0) + 1
        
        # Análisis por modalidad
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

if __name__ == '__main__':
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    
    app.run(debug=True, port=5000)
