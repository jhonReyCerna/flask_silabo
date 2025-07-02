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
    """Carga los datos del archivo JSON"""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def guardar_datos(datos):
    """Guarda los datos en el archivo JSON"""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(datos, f, ensure_ascii=False, indent=2)

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
        # Cargar datos existentes para obtener las unidades
        datos = cargar_datos()
        unidades_data = datos.get('unidades', {})
        
        if not unidades_data or not unidades_data.get('unidades_detalle'):
            return jsonify({
                'success': False,
                'error': 'No se encontraron unidades. Debes crear las unidades primero.'
            }), 400
        
        # Obtener datos JSON del frontend
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
        
        # Validar estructura de datos
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
            
            # Validar que cada competencia tenga la estructura correcta
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
        
        # Estructurar datos para guardar
        datos_formulario = {
            'unidades_competencias': unidades_competencias
        }
        
        # Cargar datos existentes y agregar competencias
        datos['competencias'] = datos_formulario
        
        # Guardar datos actualizados
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
        
        # Obtener datos JSON del frontend
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
        
        # Validar estructura de datos
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
            
            # Validar que cada producto tenga la estructura correcta
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
        
        # Guardar productos
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
    """Página de sesiones (por implementar)"""
    return render_template('base.html', 
                         titulo='📅 Sesiones',
                         contenido='<p>Módulo de sesiones en desarrollo...</p>')

@app.route('/cronograma')
def cronograma():
    """Página de cronograma (por implementar)"""
    return render_template('base.html', 
                         titulo='⏰ Cronograma',
                         contenido='<p>Módulo de cronograma en desarrollo...</p>')

@app.route('/referencias')
def referencias():
    """Página de referencias (por implementar)"""
    return render_template('base.html', 
                         titulo='🔗 Referencias',
                         contenido='<p>Módulo de referencias en desarrollo...</p>')

@app.route('/finalizar')
def finalizar():
    """Página de finalización del sílabo"""
    datos = cargar_datos()
    return render_template('finalizar.html', datos=datos)

@app.route('/generar_word')
def generar_word():
    """Genera y descarga un documento Word del sílabo"""
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

if __name__ == '__main__':
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    
    app.run(debug=True, port=5000)
