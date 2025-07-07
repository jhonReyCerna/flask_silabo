document.addEventListener('DOMContentLoaded', function() {
    const modificarBtn = document.getElementById('modificarBtn');
    const vistaPreviaBtn = document.getElementById('vistaPreviaBtn');
    const generarDocumentoBtn = document.getElementById('generarDocumentoBtn');
    const verHistorialBtn = document.getElementById('verHistorialBtn');

    function mostrarMensaje(texto, tipo = 'info') {
        const mensajeAnterior = document.querySelector('.mensaje-estado');
        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }

        const mensaje = document.createElement('div');
        mensaje.className = `mensaje-estado ${tipo}`;
        mensaje.innerHTML = `<p>${texto}</p>`;

        const titulo = document.querySelector('.finalizar-titulo');
        titulo.parentNode.insertBefore(mensaje, titulo.nextSibling);

        setTimeout(() => {
            if (mensaje.parentNode) {
                mensaje.remove();
            }
        }, 5000);
    }

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

    modificarBtn.addEventListener('click', function() {
        mostrarMensaje('🔄 Redirigiendo al formulario general...', 'info');
        setTimeout(() => {
            window.location.href = '/general';
        }, 1000);
    });

    vistaPreviaBtn.addEventListener('click', async function() {
        mostrarMensaje('👁️ Cargando vista previa...', 'info');
        
        const datos = await cargarDatos();
        if (datos && Object.keys(datos).length > 0) {
            mostrarVistaPrevia(datos);
        } else {
            mostrarMensaje('❌ No hay datos para mostrar. Complete el formulario general primero.', 'error');
        }
    });

    generarDocumentoBtn.addEventListener('click', async function() {
        mostrarMensaje('📄 Generando documento y finalizando registro...', 'info');
        
        const datos = await cargarDatos();
        if (datos && Object.keys(datos).length > 0) {
            await generarDocumento(datos);
        } else {
            mostrarMensaje('❌ No hay datos para generar el documento. Complete el formulario general primero.', 'error');
        }
    });

    verHistorialBtn.addEventListener('click', async function() {
        mostrarMensaje('📋 Cargando historial...', 'info');
        await mostrarHistorial();
    });

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

    async function generarDocumento(datos) {
        try {
            mostrarMensaje('📄 Generando documento Word...', 'info');
            
            const response = await fetch('/generar_word');
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                
                const contentDisposition = response.headers.get('Content-Disposition');
                let filename = 'Silabo.docx';
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                    if (filenameMatch && filenameMatch[1]) {
                        filename = filenameMatch[1].replace(/['"]/g, '');
                    }
                }
                
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                mostrarMensaje('✅ Documento Word descargado correctamente. Registro finalizado.', 'success');
                
                mostrarOpcionesPosteriorFinalizacion();
                
            } else {
                const errorData = await response.json();
                mostrarMensaje(`❌ ${errorData.message}`, 'error');
            }
        } catch (error) {
            console.error('Error al generar documento:', error);
            mostrarMensaje('❌ Error al generar el documento Word', 'error');
        }
    }

    function mostrarOpcionesPosteriorFinalizacion() {
        generarDocumentoBtn.disabled = true;
        vistaPreviaBtn.disabled = true;
        modificarBtn.disabled = true;
        
        const container = document.querySelector('.finalizar-container');
        container.innerHTML = `
            <h1 class="finalizar-titulo">🎉 ¡Registro Completado!</h1>
            <p class="finalizar-mensaje">
                Tu sílabo ha sido generado exitosamente y el registro ha sido guardado en el historial.
            </p>
            <p class="finalizar-mensaje">
                ¿Qué deseas hacer ahora?
            </p>
            <div class="finalizar-botones">
                <button class="finalizar-btn" id="nuevoRegistroBtn">🆕 Crear Nuevo Sílabo</button>
                <button class="finalizar-btn" id="verHistorialBtn">📋 Ver Historial</button>
                <button class="finalizar-btn" id="volverInicioBtn">🏠 Volver al Inicio</button>
            </div>
        `;
        
        document.getElementById('nuevoRegistroBtn').addEventListener('click', async function() {
            mostrarMensaje('🆕 Creando nuevo registro...', 'info');
            try {
                const response = await fetch('/nuevo_registro', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                if (response.ok) {
                    mostrarMensaje('✅ Nuevo registro creado. Redirigiendo...', 'success');
                    setTimeout(() => {
                        window.location.href = '/general';
                    }, 1500);
                } else {
                    mostrarMensaje('❌ Error al crear nuevo registro', 'error');
                }
            } catch (error) {
                console.error('Error al crear nuevo registro:', error);
                mostrarMensaje('❌ Error al crear nuevo registro', 'error');
            }
        });
        
        document.getElementById('verHistorialBtn').addEventListener('click', async function() {
            mostrarMensaje('📋 Cargando historial...', 'info');
            await mostrarHistorial();
        });
        
        document.getElementById('volverInicioBtn').addEventListener('click', function() {
            window.location.href = '/';
        });
    }

    async function mostrarHistorial() {
        try {
            const response = await fetch('/api/historial');
            const data = await response.json();
            
            if (data.success) {
                const registros = data.historial.registros_completados || [];
                
                let historialHtml = `
                    <div class="finalizar-container">
                        <h1 class="finalizar-titulo">📋 Historial de Sílabos</h1>
                        <div style="max-height: 400px; overflow-y: auto; border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: white; color: black; margin: 20px 0;">
                `;
                
                if (registros.length === 0) {
                    historialHtml += '<p style="color: #666; text-align: center; padding: 20px;">No hay registros completados anteriormente.</p>';
                } else {
                    registros.forEach((registro, index) => {
                        const general = registro.general || {};
                        const metadatos = registro.metadatos || {};
                        
                        historialHtml += `
                            <div style="border-bottom: 1px solid #eee; padding: 15px 0; margin-bottom: 10px;">
                                <h4 style="color: #333; margin: 0 0 10px 0;">📚 ${general.asignatura || 'Sin nombre'}</h4>
                                <p style="margin: 5px 0; color: #666;"><strong>Código:</strong> ${general.codigo || 'N/A'}</p>
                                <p style="margin: 5px 0; color: #666;"><strong>Docente:</strong> ${general.docente || 'N/A'}</p>
                                <p style="margin: 5px 0; color: #666;"><strong>Finalizado:</strong> ${metadatos.fecha_finalizacion ? new Date(metadatos.fecha_finalizacion).toLocaleDateString('es-ES') : 'N/A'}</p>
                            </div>
                        `;
                    });
                }
                
                historialHtml += `
                        </div>
                        <div class="finalizar-botones">
                            <button class="finalizar-btn" onclick="location.reload()">🔙 Volver</button>
                        </div>
                    </div>
                `;
                
                document.querySelector('.finalizar-container').outerHTML = historialHtml;
            } else {
                mostrarMensaje('❌ Error al cargar historial', 'error');
            }
        } catch (error) {
            console.error('Error al cargar historial:', error);
            mostrarMensaje('❌ Error al cargar historial', 'error');
        }
    }

    cargarDatos().then(datos => {
        if (datos && Object.keys(datos).length > 0) {
            mostrarMensaje(`📋 Datos cargados: ${datos.asignatura || 'Curso sin nombre'}`, 'success');
        }
    });
});
