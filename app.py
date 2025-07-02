from flask import Flask, render_template, request, jsonify, redirect, url_for
import json
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'tu_clave_secreta_para_silabo'

# Configuración de carpetas
app.template_folder = 'templates'
app.static_folder = 'static'

# Archivo para almacenar datos (simula una base de datos)
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
        # Validar correo con dominios específicos
        correo = request.form.get('correo_entry')
        dominios_permitidos = ['@gmail.com', '@unacvirtual.edu.pe']
        
        if not any(correo.lower().endswith(dominio) for dominio in dominios_permitidos):
            return jsonify({
                'success': False, 
                'message': 'El correo debe ser @gmail.com o @unacvirtual.edu.pe'
            }), 400
        
        # Manejar días personalizados si se seleccionó horario personalizado
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
        
        # Obtener datos del formulario
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
    """Página de unidades (por implementar)"""
    return render_template('base.html', 
                         titulo='📚 Unidades de Aprendizaje',
                         contenido='<p>Módulo de unidades en desarrollo...</p>')

@app.route('/competencias')
def competencias():
    """Página de competencias (por implementar)"""
    return render_template('base.html', 
                         titulo='🎯 Competencias',
                         contenido='<p>Módulo de competencias en desarrollo...</p>')

@app.route('/productos')
def productos():
    """Página de productos (por implementar)"""
    return render_template('base.html', 
                         titulo='📦 Productos',
                         contenido='<p>Módulo de productos en desarrollo...</p>')

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
    """Página de finalización (por implementar)"""
    return render_template('base.html', 
                         titulo='✅ Finalizar',
                         contenido='<p>Módulo de finalización en desarrollo...</p>')

if __name__ == '__main__':
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    
    app.run(debug=True, port=5000)
