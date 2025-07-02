document.addEventListener('DOMContentLoaded', function() {
    const modificarBtn = document.getElementById('modificarBtn');
    const vistaPreviaBtn = document.getElementById('vistaPreviaBtn');
    const generarDocumentoBtn = document.getElementById('generarDocumentoBtn');

    // Función para mostrar mensajes
    function mostrarMensaje(texto, tipo = 'info') {
        // Remover mensaje anterior si existe
        const mensajeAnterior = document.querySelector('.mensaje-estado');
        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }

        // Crear nuevo mensaje
        const mensaje = document.createElement('div');
        mensaje.className = `mensaje-estado ${tipo}`;
        mensaje.innerHTML = `<p>${texto}</p>`;

        // Insertar después del título
        const titulo = document.querySelector('.finalizar-titulo');
        titulo.parentNode.insertBefore(mensaje, titulo.nextSibling);

        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            if (mensaje.parentNode) {
                mensaje.remove();
            }
        }, 5000);
    }

    // Función para cargar datos del historial
    async function cargarDatos() {
        try {
            const response = await fetch('/api/cargar_general');
            const datos = await response.json();
            return datos;
        } catch (error) {
            console.error('Error al cargar datos:', error);
            return null;
        }
    }

    // Botón Modificar - Regresar a General
    modificarBtn.addEventListener('click', function() {
        mostrarMensaje('🔄 Redirigiendo al formulario general...', 'info');
        setTimeout(() => {
            window.location.href = '/general';
        }, 1000);
    });

    // Botón Vista Previa
    vistaPreviaBtn.addEventListener('click', async function() {
        mostrarMensaje('👁️ Cargando vista previa...', 'info');
        
        const datos = await cargarDatos();
        if (datos && Object.keys(datos).length > 0) {
            mostrarVistaPrevia(datos);
        } else {
            mostrarMensaje('❌ No hay datos para mostrar. Complete el formulario general primero.', 'error');
        }
    });

    // Botón Generar Documento
    generarDocumentoBtn.addEventListener('click', async function() {
        mostrarMensaje('📄 Generando documento...', 'info');
        
        const datos = await cargarDatos();
        if (datos && Object.keys(datos).length > 0) {
            generarDocumento(datos);
        } else {
            mostrarMensaje('❌ No hay datos para generar el documento. Complete el formulario general primero.', 'error');
        }
    });

    // Función para mostrar vista previa
    function mostrarVistaPrevia(datos) {
        const ventanaPrevia = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
        
        const htmlPrevia = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Vista Previa - Sílabo</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                    .seccion { margin-bottom: 20px; }
                    .campo { margin-bottom: 10px; }
                    .label { font-weight: bold; color: #333; }
                    .valor { color: #666; }
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>UNIVERSIDAD UNAC</h1>
                    <h2>SÍLABO - ${datos.asignatura || 'Sin Asignatura'}</h2>
                    <p>Generado el: ${new Date().toLocaleDateString('es-ES')}</p>
                </div>
                
                <div class="grid">
                    <div class="seccion">
                        <h3>📝 Información General</h3>
                        <div class="campo"><span class="label">Código:</span> <span class="valor">${datos.codigo || 'N/A'}</span></div>
                        <div class="campo"><span class="label">Versión:</span> <span class="valor">${datos.version || 'N/A'}</span></div>
                        <div class="campo"><span class="label">Fecha:</span> <span class="valor">${datos.fecha || 'N/A'}</span></div>
                        <div class="campo"><span class="label">Maestría:</span> <span class="valor">${datos.maestria || 'N/A'}</span></div>
                        <div class="campo"><span class="label">Asignatura:</span> <span class="valor">${datos.asignatura || 'N/A'}</span></div>
                        <div class="campo"><span class="label">Semestre:</span> <span class="valor">2025-${datos.semestre || 'N/A'}</span></div>
                    </div>
                    
                    <div class="seccion">
                        <h3>👨‍🏫 Información del Docente</h3>
                        <div class="campo"><span class="label">Docente:</span> <span class="valor">${datos.docente || 'N/A'}</span></div>
                        <div class="campo"><span class="label">Correo:</span> <span class="valor">${datos.correo || 'N/A'}</span></div>
                        <div class="campo"><span class="label">Modalidad:</span> <span class="valor">${datos.modalidad || 'N/A'}</span></div>
                        ${datos.link_virtual ? `<div class="campo"><span class="label">Link Virtual:</span> <span class="valor">${datos.link_virtual}</span></div>` : ''}
                    </div>
                </div>
                
                <div class="grid">
                    <div class="seccion">
                        <h3>⏱️ Información Académica</h3>
                        <div class="campo"><span class="label">Horas Teoría:</span> <span class="valor">${datos.horas_teoria || 'N/A'}</span></div>
                        <div class="campo"><span class="label">Horas Práctica:</span> <span class="valor">${datos.horas_practica || 'N/A'}</span></div>
                        <div class="campo"><span class="label">Créditos:</span> <span class="valor">${datos.creditos || 'N/A'}</span></div>
                        <div class="campo"><span class="label">Sesiones:</span> <span class="valor">${datos.sesiones || 'N/A'}</span></div>
                        <div class="campo"><span class="label">Semanas:</span> <span class="valor">${datos.semanas || 'N/A'}</span></div>
                    </div>
                    
                    <div class="seccion">
                        <h3>📚 Detalles del Curso</h3>
                        <div class="campo"><span class="label">Código del Posgrado:</span> <span class="valor">${datos.codigo_programa || 'N/A'}</span></div>
                        <div class="campo"><span class="label">Carácter:</span> <span class="valor">${datos.caracter || 'N/A'}</span></div>
                        <div class="campo"><span class="label">Horario:</span> <span class="valor">${datos.horario || 'N/A'}</span></div>
                    </div>
                </div>
                
                <div class="seccion">
                    <h3>🎯 Propósito del Curso</h3>
                    <p>${datos.proposito || 'No especificado'}</p>
                </div>
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; color: #666;">
                    <small>Documento generado automáticamente por el Sistema de Sílabos UNAC</small>
                </div>
            </body>
            </html>
        `;
        
        ventanaPrevia.document.write(htmlPrevia);
        ventanaPrevia.document.close();
        
        mostrarMensaje('✅ Vista previa generada correctamente', 'success');
    }

    // Función para generar documento (simulación)
    function generarDocumento(datos) {
        // Simular generación de documento
        setTimeout(() => {
            const contenido = JSON.stringify(datos, null, 2);
            const blob = new Blob([contenido], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `silabo_${datos.asignatura || 'documento'}_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            mostrarMensaje('✅ Documento descargado correctamente', 'success');
        }, 2000);
    }

    // Cargar datos al inicio para mostrar información
    cargarDatos().then(datos => {
        if (datos && Object.keys(datos).length > 0) {
            mostrarMensaje(`📋 Datos cargados: ${datos.asignatura || 'Curso sin nombre'}`, 'success');
        }
    });
});
