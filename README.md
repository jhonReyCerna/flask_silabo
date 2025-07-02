# Sistema de Gestión de Sílabos Universitarios

## Descripción

Sistema web desarrollado en Python Flask para la gestión de sílabos universitarios, que permite la creación, edición, validación y exportación de datos del sílabo académico, incluyendo la generación de documentos Word profesionales.

## Estructura del Proyecto

```
c:\Users\jhonc\Desktop\prueba\
├── app.py                      # Aplicación principal Flask
├── generar_word.py             # Módulo para generación de documentos Word
├── requirements.txt            # Dependencias del proyecto
├── historial.json             # Archivo de datos (almacenamiento)
├── templates/                  # Templates HTML con Jinja2
│   ├── general.html           # Formulario de información general
│   └── finalizar.html         # Página de finalización y generación
├── static/
│   ├── css/                   # Archivos de estilo
│   │   └── finalizar.css      # Estilos para la página de finalización
│   └── js/                    # Scripts JavaScript
│       ├── general.js         # Validaciones del formulario general
│       ├── finalizar.js       # Funcionalidad de la página de finalización
│       └── main.js            # Funciones JavaScript comunes
├── css/                       # Archivos CSS originales (legacy)
│   ├── general.css
│   └── principal.css
└── html/                      # Archivos HTML originales (legacy)
    ├── general.html
    └── portada.html
```

## Funcionalidades Implementadas

### 1. Formulario General (Información Básica)
- **Campos**: Código, versión, fecha, maestría, asignatura, semestre, docente, correo, horas, créditos, sesiones, semanas, código del programa, carácter, horario, modalidad, propósito.
- **Validaciones Frontend**: 
  - Horas de teoría y práctica deben sumar al menos 1
  - Créditos calculados automáticamente: (horas_teoria + horas_practica) / 16
  - Validación de correo para dominios específicos (@gmail.com, @unacvirtual.edu.pe)
  - Horario personalizado opcional cuando se selecciona "Otro"
  - Link virtual requerido para modalidad "Virtual"
- **Validaciones Backend**: Validación de datos en el servidor antes de guardar

### 2. Sistema de Navegación
- **Rutas implementadas**:
  - `/` - Página principal
  - `/general` - Formulario de información general
  - `/finalizar` - Página de finalización y generación de documentos
  - API endpoints para guardar y cargar datos

### 3. Generación de Documentos Word
- **Módulo**: `generar_word.py`
- **Funciones**:
  - `generar_documento_word(datos_general)`: Crea el documento con formato profesional
  - `generar_nombre_archivo(datos_general)`: Genera nombre de archivo apropiado
- **Características del documento**:
  - Encabezado institucional (Universidad UNAC)
  - Tabla de información general con formato profesional
  - Secciones estructuradas (Competencias, Unidades, Cronograma, etc.)
  - Pie de página con fecha de generación

### 4. Almacenamiento de Datos
- **Archivo**: `historial.json`
- **Formato**: JSON con estructura organizada
- **Datos guardados**: `fecha_guardado` al inicio + datos del formulario general

### 5. API REST
- **Endpoints**:
  - `POST /guardar_general` - Guardar datos del formulario general
  - `GET /api/cargar_general` - Cargar datos guardados
  - `POST /generar_word` - Generar y descargar documento Word

## Dependencias

```
Flask==3.0.0           # Framework web
Flask-WTF==1.2.1       # Formularios y validación
WTForms==3.1.1         # Manejo de formularios
python-docx==1.1.0     # Generación de documentos Word
```

## Instalación y Uso

1. **Instalación de dependencias**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Ejecutar la aplicación**:
   ```bash
   python app.py
   ```

3. **Acceder a la aplicación**:
   - Abrir navegador en `http://localhost:5000`

## Características Técnicas

### Frontend
- **HTML**: Templates Jinja2 con Flask
- **CSS**: Estilos personalizados responsivos
- **JavaScript**: Validaciones en tiempo real, interactividad

### Backend
- **Python**: Flask framework
- **Datos**: JSON para almacenamiento (simulando base de datos)
- **Documentos**: python-docx para generación de Word
- **Validaciones**: Frontend (JS) + Backend (Python)

## Flujo de Trabajo

1. **Ingreso de datos**: Usuario llena formulario general con validaciones en tiempo real
2. **Validación**: Sistema valida datos tanto en frontend como backend
3. **Almacenamiento**: Datos se guardan en `historial.json` con fecha
4. **Navegación**: Usuario puede navegar entre secciones (futuras implementaciones)
5. **Finalización**: En la página de finalizar puede:
   - Modificar datos
   - Ver vista previa
   - Generar documento Word profesional

## Próximas Implementaciones

- [ ] Secciones adicionales: Competencias, Unidades de Aprendizaje, Cronograma
- [ ] Vista previa completa del sílabo
- [ ] Exportación a PDF
- [ ] Sistema de usuarios y autenticación
- [ ] Historial de versiones
- [ ] Plantillas personalizables

## Notas de Desarrollo

- **Modularidad**: Código organizado en módulos separados
- **Mantenibilidad**: Separación clara entre lógica de aplicación y generación de documentos
- **Escalabilidad**: Estructura preparada para agregar nuevas funcionalidades
- **Validaciones**: Doble validación (frontend/backend) para garantizar integridad de datos
