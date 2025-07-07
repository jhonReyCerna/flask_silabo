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

    let registrosDisponibles = [];
    let filaSeleccionada = null;

    async function mostrarHistorial() {
        try {
            const response = await fetch('/api/historial');
            const data = await response.json();
            
            if (data.success) {
                const registros = data.historial.registros_completados || [];
                registrosDisponibles = registros; // Guardar para uso posterior
                
                let historialHtml = `
                    <div class="finalizar-container">
                        <h1 class="finalizar-titulo">📋 Historial de Sílabos</h1>
                        <div style="margin-bottom: 20px;">
                            <p style="color: #333; font-size: 16px; text-align: center; margin-bottom: 15px; background-color: #e3f2fd; padding: 12px; border-radius: 8px; border: 1px solid #bbdefb;">
                                💡 <strong>Instrucciones:</strong> Haz clic en una fila para seleccionarla, luego presiona "Llenar Formulario" para cargar esos datos
                            </p>
                            <div style="text-align: center; margin-bottom: 20px;">
                                <button id="llenarFormularioBtn" class="finalizar-btn" style="background-color: #4caf50; border-color: #4caf50; opacity: 0.6; pointer-events: none;">
                                    📥 Llenar Formulario
                                </button>
                            </div>
                        </div>
                        <div style="max-height: 500px; overflow-y: auto; border: 1px solid #ddd; border-radius: 8px; background: white; color: black; margin: 20px 0;">
                `;
                
                if (registros.length === 0) {
                    historialHtml += '<p style="color: #666; text-align: center; padding: 40px;">No hay registros completados anteriormente.</p>';
                } else {
                    historialHtml += `
                        <table id="historialTable" style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <thead>
                                <tr style="background-color: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                                    <th style="padding: 12px; text-align: left; border-right: 1px solid #dee2e6; color: #333; font-weight: bold;">📚 Asignatura</th>
                                    <th style="padding: 12px; text-align: left; border-right: 1px solid #dee2e6; color: #333; font-weight: bold;">🔢 Código</th>
                                    <th style="padding: 12px; text-align: left; border-right: 1px solid #dee2e6; color: #333; font-weight: bold;">👨‍🏫 Docente</th>
                                    <th style="padding: 12px; text-align: left; border-right: 1px solid #dee2e6; color: #333; font-weight: bold;">🎓 Maestría</th>
                                    <th style="padding: 12px; text-align: left; border-right: 1px solid #dee2e6; color: #333; font-weight: bold;">📅 Semestre</th>
                                    <th style="padding: 12px; text-align: left; color: #333; font-weight: bold;">✅ Finalizado</th>
                                </tr>
                            </thead>
                            <tbody>
                    `;
                    
                    registros.forEach((registro, index) => {
                        const general = registro.general || {};
                        const metadatos = registro.metadatos || {};
                        const fechaFinalizacion = metadatos.fecha_finalizacion ? 
                            new Date(metadatos.fecha_finalizacion).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            }) : 'N/A';
                        
                        const backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
                        
                        historialHtml += `
                            <tr class="historial-row" data-index="${index}" style="background-color: ${backgroundColor}; border-bottom: 1px solid #dee2e6; cursor: pointer; transition: background-color 0.2s ease;">
                                <td style="padding: 12px; border-right: 1px solid #dee2e6; color: #333; font-weight: 500;">${general.asignatura || 'Sin nombre'}</td>
                                <td style="padding: 12px; border-right: 1px solid #dee2e6; color: #666;">${general.codigo || 'N/A'}</td>
                                <td style="padding: 12px; border-right: 1px solid #dee2e6; color: #666;">${general.docente || 'N/A'}</td>
                                <td style="padding: 12px; border-right: 1px solid #dee2e6; color: #666;">${general.maestria || 'N/A'}</td>
                                <td style="padding: 12px; border-right: 1px solid #dee2e6; color: #666;">2025-${general.semestre || 'N/A'}</td>
                                <td style="padding: 12px; color: #28a745; font-weight: 500;">${fechaFinalizacion}</td>
                            </tr>
                        `;
                    });
                    
                    historialHtml += `
                            </tbody>
                        </table>
                    `;
                }
                
                historialHtml += `
                        </div>
                        <div style="text-align: center; margin-top: 20px;">
                            <p style="color: #333; font-size: 16px; margin-bottom: 20px; background-color: #e8f5e8; padding: 15px 25px; border-radius: 12px; display: inline-block; border: 2px solid #4caf50; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                                📊 Total de registros: <strong style="background-color: #4caf50; color: white; padding: 8px 16px; border-radius: 20px; font-size: 18px; margin-left: 10px;">${registros.length}</strong>
                            </p>
                        </div>
                        <div class="finalizar-botones">
                            <button class="finalizar-btn" onclick="location.reload()">🔙 Volver</button>
                        </div>
                    </div>
                `;
                
                document.querySelector('.finalizar-container').outerHTML = historialHtml;
                
                configurarSeleccionFilas();
                
            } else {
                mostrarMensaje('❌ Error al cargar historial', 'error');
            }
        } catch (error) {
            console.error('Error al cargar historial:', error);
            mostrarMensaje('❌ Error al cargar historial', 'error');
        }
    }

    function configurarSeleccionFilas() {
        const filas = document.querySelectorAll('.historial-row');
        const botonLlenar = document.getElementById('llenarFormularioBtn');
        
        const style = document.createElement('style');
        style.textContent = `
            .historial-row:hover {
                background-color: #e3f2fd !important;
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .historial-row.seleccionada {
                background-color: #4caf50 !important;
                color: white !important;
            }
            .historial-row.seleccionada td {
                color: white !important;
            }
        `;
        document.head.appendChild(style);
        
        filas.forEach(fila => {
            fila.addEventListener('click', function() {
                filas.forEach(f => f.classList.remove('seleccionada'));
                
                this.classList.add('seleccionada');
                filaSeleccionada = parseInt(this.getAttribute('data-index'));
                
                botonLlenar.style.opacity = '1';
                botonLlenar.style.pointerEvents = 'auto';
                
                const general = registrosDisponibles[filaSeleccionada]?.general || {};
                mostrarMensaje(`✅ Seleccionado: ${general.asignatura || 'Registro'} - ${general.codigo || 'Sin código'}`, 'success');
            });
        });
        
        if (botonLlenar) {
            botonLlenar.addEventListener('click', llenarFormularioDesdeHistorial);
        }
    }
    
    async function llenarFormularioDesdeHistorial() {
        if (filaSeleccionada === null || !registrosDisponibles[filaSeleccionada]) {
            mostrarMensaje('❌ Por favor selecciona una fila primero', 'error');
            return;
        }
        
        const registroSeleccionado = registrosDisponibles[filaSeleccionada];
        
        try {
            mostrarMensaje('⏳ Cargando datos del registro seleccionado...', 'info');
            
            const response = await fetch('/api/cargar_registro_desde_historial', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    registro_index: filaSeleccionada
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                mostrarMensaje('✅ ¡Datos cargados exitosamente! Redirigiendo al formulario...', 'success');
                
                setTimeout(() => {
                    window.location.href = '/general';
                }, 2000);
            } else {
                mostrarMensaje(`❌ Error al cargar datos: ${result.message}`, 'error');
            }
            
        } catch (error) {
            console.error('Error al cargar registro:', error);
            mostrarMensaje('❌ Error al cargar el registro', 'error');
        }
    }

    cargarDatos().then(datos => {
        if (datos && Object.keys(datos).length > 0) {
            mostrarMensaje(`📋 Datos cargados: ${datos.asignatura || 'Curso sin nombre'}`, 'success');
        }
    });
});
