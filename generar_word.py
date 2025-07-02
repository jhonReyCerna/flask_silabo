"""
Módulo para la generación de documentos Word del sílabo universitario.
Contiene toda la lógica relacionada con la creación del documento .docx
"""

from docx import Document
from docx.shared import Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from datetime import datetime


def generar_documento_word(datos_general):
    """
    Genera un documento Word con los datos del sílabo
    
    Args:
        datos_general (dict): Diccionario con los datos del formulario general
        
    Returns:
        Document: Objeto Document de python-docx con el contenido del sílabo
    """
    # Crear documento
    doc = Document()
    
    # Configurar márgenes
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
    
    # Encabezado del documento
    header = doc.add_heading('UNIVERSIDAD UNAC', 0)
    header.alignment = WD_ALIGN_PARAGRAPH.CENTER
    header_run = header.runs[0]
    header_run.font.color.rgb = RGBColor(0, 0, 128)
    
    subtitle = doc.add_heading('SÍLABO', level=1)
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    subtitle_run = subtitle.runs[0]
    subtitle_run.font.color.rgb = RGBColor(128, 0, 0)
    
    # Información del curso
    doc.add_paragraph()
    curso_heading = doc.add_heading(f"{datos_general.get('asignatura', 'SIN ASIGNATURA')}", level=2)
    curso_heading.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Tabla de información general
    doc.add_heading('I. INFORMACIÓN GENERAL', level=2)
    table = doc.add_table(rows=1, cols=2)
    table.style = 'Table Grid'
    
    # Datos para la tabla
    datos_tabla = [
        ('Código:', datos_general.get('codigo', 'N/A')),
        ('Versión:', datos_general.get('version', 'N/A')),
        ('Fecha:', datos_general.get('fecha', 'N/A')),
        ('Maestría:', datos_general.get('maestria', 'N/A')),
        ('Asignatura:', datos_general.get('asignatura', 'N/A')),
        ('Semestre:', f"2025-{datos_general.get('semestre', 'N/A')}"),
        ('Docente:', datos_general.get('docente', 'N/A')),
        ('Correo:', datos_general.get('correo', 'N/A')),
        ('Horas de Teoría:', datos_general.get('horas_teoria', 'N/A')),
        ('Horas de Práctica:', datos_general.get('horas_practica', 'N/A')),
        ('Créditos:', datos_general.get('creditos', 'N/A')),
        ('Sesiones:', datos_general.get('sesiones', 'N/A')),
        ('Semanas:', datos_general.get('semanas', 'N/A')),
        ('Código del Posgrado:', datos_general.get('codigo_programa', 'N/A')),
        ('Carácter:', datos_general.get('caracter', 'N/A')),
        ('Horario:', datos_general.get('horario', 'N/A')),
        ('Modalidad:', datos_general.get('modalidad', 'N/A')),
    ]
    
    # Agregar link virtual si existe
    if datos_general.get('modalidad') == 'Virtual' and datos_general.get('link_virtual'):
        datos_tabla.append(('Link Virtual:', datos_general.get('link_virtual')))
    
    # Llenar la tabla
    for etiqueta, valor in datos_tabla:
        row_cells = table.add_row().cells
        row_cells[0].text = etiqueta
        row_cells[1].text = str(valor)
        
        # Formatear la primera columna (etiquetas)
        run = row_cells[0].paragraphs[0].runs[0]
        run.bold = True
        run.font.color.rgb = RGBColor(0, 0, 128)
    
    # Propósito del curso
    doc.add_heading('II. PROPÓSITO DEL CURSO', level=2)
    proposito = datos_general.get('proposito', 'No especificado')
    p = doc.add_paragraph(proposito)
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    
    # Secciones adicionales (para futuras implementaciones)
    doc.add_heading('III. COMPETENCIAS', level=2)
    doc.add_paragraph('Por implementar...')
    
    doc.add_heading('IV. UNIDADES DE APRENDIZAJE', level=2)
    doc.add_paragraph('Por implementar...')
    
    doc.add_heading('V. CRONOGRAMA', level=2)
    doc.add_paragraph('Por implementar...')
    
    doc.add_heading('VI. ESTRATEGIAS METODOLÓGICAS', level=2)
    doc.add_paragraph('Por implementar...')
    
    doc.add_heading('VII. RECURSOS DIDÁCTICOS', level=2)
    doc.add_paragraph('Por implementar...')
    
    doc.add_heading('VIII. EVALUACIÓN', level=2)
    doc.add_paragraph('Por implementar...')
    
    doc.add_heading('IX. REFERENCIAS BIBLIOGRÁFICAS', level=2)
    doc.add_paragraph('Por implementar...')
    
    # Pie de página
    doc.add_paragraph()
    doc.add_paragraph()
    footer = doc.add_paragraph(f"Documento generado automáticamente el {datetime.now().strftime('%d/%m/%Y a las %H:%M')}")
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    footer_run = footer.runs[0]
    footer_run.font.size = Inches(0.1)
    footer_run.font.color.rgb = RGBColor(128, 128, 128)
    
    return doc


def generar_nombre_archivo(datos_general):
    """
    Genera un nombre de archivo apropiado para el documento Word
    
    Args:
        datos_general (dict): Diccionario con los datos del formulario general
        
    Returns:
        str: Nombre del archivo con formato: Silabo_[Asignatura]_[Fecha].docx
    """
    asignatura = datos_general.get('asignatura', 'Silabo')
    asignatura_clean = "".join(c for c in asignatura if c.isalnum() or c in (' ', '-', '_')).rstrip()
    fecha_actual = datetime.now().strftime('%Y-%m-%d')
    return f"Silabo_{asignatura_clean}_{fecha_actual}.docx"
