document.addEventListener('DOMContentLoaded', function() {
    const vistaPreviaBtn = document.getElementById('vistaPreviaBtn');
    const generarDocumentoBtn = document.getElementById('generarDocumentoBtn');
    const verHistorialBtn = document.getElementById('verHistorialBtn');

    function mostrarNotificacion(titulo, mensaje, tipo = 'info', duracion = 5000) {
        const iconos = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        const colores = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        
        const notificacion = document.createElement('div');
        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            color: #333;
            padding: 15px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            border-left: 4px solid ${colores[tipo]};
            z-index: 10001;
            max-width: 350px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        notificacion.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 10px;">
                <span style="font-size: 20px; flex-shrink: 0;">${iconos[tipo]}</span>
                <div>
                    <h4 style="margin: 0 0 5px 0; font-size: 16px; color: ${colores[tipo]};">${titulo}</h4>
                    <p style="margin: 0; font-size: 14px; line-height: 1.4;">${mensaje}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #999; margin-left: auto; padding: 0; line-height: 1;">×</button>
            </div>
        `;
        
        if (!document.getElementById('notificacionStyles')) {
            const style = document.createElement('style');
            style.id = 'notificacionStyles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            if (notificacion.parentElement) {
                notificacion.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => {
                    if (notificacion.parentElement) {
                        notificacion.remove();
                    }
                }, 300);
            }
        }, duracion);
    }
    
    function mostrarMensajeMejorado(texto, tipo = 'info') {
        const titulos = {
            success: 'Éxito',
            error: 'Error',
            warning: 'Advertencia',
            info: 'Información'
        };
        
        mostrarNotificacion(titulos[tipo], texto, tipo);
        
        mostrarMensaje(texto, tipo);
    }

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


    vistaPreviaBtn.addEventListener('click', async function() {
        const boton = this;
        const textoOriginal = boton.textContent;
        
        try {
            boton.textContent = 'Cargando...';
            boton.disabled = true;
            
            mostrarMensaje('👁️ Cargando vista previa del documento Word...', 'info');
            
            const ventanaPrevia = window.open('/vista_previa_word', '_blank', 'width=1000,height=700,scrollbars=yes,toolbar=yes,location=yes,status=yes,menubar=yes,resizable=yes');
            
            if (!ventanaPrevia) {
                throw new Error('No se pudo abrir la ventana de vista previa. Por favor, habilite las ventanas emergentes para este sitio.');
            }
            
            mostrarNotificacion('Vista Previa', 'Vista previa del documento Word abierta en una nueva ventana', 'success');
            
        } catch (error) {
            console.error('Error al mostrar vista previa:', error);
            mostrarMensaje('❌ Error al cargar la vista previa: ' + error.message, 'error');
        } finally {
            boton.textContent = textoOriginal;
            boton.disabled = false;
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
        // modificarBtn ya no existe
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
    let registrosFiltrados = [];
    let filaSeleccionada = null;
    let paginaActual = 1;
    const registrosPorPagina = 10;

    async function mostrarHistorial() {
        try {
            const response = await fetch('/api/historial');
            const data = await response.json();
            
            if (data.success) {
                const registros = data.historial.registros_completados || [];
                
                registrosDisponibles = [...registros].reverse(); 
                
                let historialHtml = `
                    <div class="finalizar-container" style="max-width: 1400px;">
                        <h1 class="finalizar-titulo">📋 Historial de Sílabos</h1>
                        
                        <!-- Barra de filtros y acciones -->
                        <div class="historial-controls" style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr auto auto; gap: 15px; margin-bottom: 15px; align-items: end;">
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">🔍 Buscar por asignatura:</label>
                                    <input type="text" id="filtroAsignatura" placeholder="Nombre de la asignatura..." style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">👨‍🏫 Buscar por docente:</label>
                                    <input type="text" id="filtroDocente" placeholder="Nombre del docente..." style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">🎓 Filtrar por maestría:</label>
                                    <select id="filtroMaestria" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
                                        <option value="">Todas las maestrías</option>
                                    </select>
                                </div>
                                <button id="limpiarFiltros" class="btn-filtro" style="background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">🔄 Limpiar</button>
                                <button id="exportarCSV" class="btn-filtro" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">📊 Exportar CSV</button>
                                <button id="verEstadisticas" class="btn-filtro" style="background: #17a2b8; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">📈 Estadísticas</button>
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <p style="color: #333; font-size: 16px; margin: 0; background-color: #e3f2fd; padding: 12px; border-radius: 8px; border: 1px solid #bbdefb;">
                                    💡 <strong>Instrucciones:</strong> Haz clic en una fila para seleccionarla, luego presiona "Llenar Formulario"
                                </p>
                                <div style="display: flex; gap: 10px;">
                                    <button id="previewBtn" class="finalizar-btn" style="background-color: #17a2b8; border-color: #17a2b8; opacity: 0.6; pointer-events: none;">
                                        👁️ Vista Previa
                                    </button>
                                    <button id="llenarFormularioBtn" class="finalizar-btn" style="background-color: #4caf50; border-color: #4caf50; opacity: 0.6; pointer-events: none;">
                                        📥 Llenar Formulario
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div style="max-height: 500px; overflow-y: auto; border: 1px solid #ddd; border-radius: 8px; background: white; color: black; margin: 20px 0;">
                `;
                
                if (registrosDisponibles.length === 0) {
                    historialHtml += '<p style="color: #666; text-align: center; padding: 40px;">No hay registros completados anteriormente.</p>';
                } else {
                    const maestriasUnicas = [...new Set(registrosDisponibles.map(r => r.general?.maestria).filter(m => m))];
                    
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
                    
                    window.maestriasUnicas = maestriasUnicas;
                    
                    registrosDisponibles.forEach((registro, index) => {
                        const general = registro.general || {};
                        const metadatos = registro.metadatos || {};
                        let fechaFinalizacion = 'N/A';
                        if (metadatos.fecha_finalizacion) {
                            const fechaStr = metadatos.fecha_finalizacion;
                            const fechaObj = new Date(fechaStr);
                            const dia = fechaObj.getDate();
                            const mes = fechaObj.toLocaleString('es-ES', { month: 'short' });
                            const anio = fechaObj.getFullYear();
                            const hora = fechaObj.getHours().toString().padStart(2, '0');
                            const minutos = fechaObj.getMinutes().toString().padStart(2, '0');
                            fechaFinalizacion = `${dia} ${mes} ${anio}, ${hora}:${minutos}`;
                        }
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
                configurarFiltros();
                configurarExportacion();
                configurarEstadisticas();
                configurarPaginacion();
                
                setTimeout(() => {
                    agregarAyudaContextual();
                    cargarPreferenciasUsuario();
                }, 100);
                configurarPaginacion();
                
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
        const botonPreview = document.getElementById('previewBtn');
        
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
                botonPreview.style.opacity = '1';
                botonPreview.style.pointerEvents = 'auto';
                
                const general = registrosDisponibles[filaSeleccionada]?.general || {};
                mostrarMensaje(`✅ Seleccionado: ${general.asignatura || 'Registro'} - ${general.codigo || 'Sin código'}`, 'success');
            });
        });
        
        if (botonLlenar) {
            botonLlenar.addEventListener('click', confirmarCargarRegistro);
        }
        
        if (botonPreview) {
            botonPreview.addEventListener('click', mostrarPreviewRegistro);
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

    function configurarFiltros() {
        const filtroAsignatura = document.getElementById('filtroAsignatura');
        const filtroDocente = document.getElementById('filtroDocente');
        const filtroMaestria = document.getElementById('filtroMaestria');
        const limpiarFiltros = document.getElementById('limpiarFiltros');
        
        const maestriaSelect = document.getElementById('filtroMaestria');
        if (window.maestriasUnicas) {
            window.maestriasUnicas.forEach(maestria => {
                const option = document.createElement('option');
                option.value = maestria;
                option.textContent = maestria;
                maestriaSelect.appendChild(option);
            });
        }
        
        function filtrarRegistros() {
            const valorAsignatura = filtroAsignatura.value.toLowerCase().trim();
            const valorDocente = filtroDocente.value.toLowerCase().trim();
            const valorMaestria = filtroMaestria.value.toLowerCase().trim();
            
            registrosFiltrados = registrosDisponibles.filter(registro => {
                const general = registro?.general || {};
                
                const asignatura = (general.asignatura || '').toLowerCase();
                const docente = (general.docente || '').toLowerCase();
                const maestria = (general.maestria || '').toLowerCase();
                
                const coincideAsignatura = !valorAsignatura || asignatura.includes(valorAsignatura);
                const coincideDocente = !valorDocente || docente.includes(valorDocente);
                const coincideMaestria = !valorMaestria || maestria.includes(valorMaestria);
                
                return coincideAsignatura && coincideDocente && coincideMaestria;
            });
            
            paginaActual = 1;
            mostrarPagina(1);
            
            filaSeleccionada = null;
            const botonLlenar = document.getElementById('llenarFormularioBtn');
            const botonPreview = document.getElementById('previewBtn');
            if (botonLlenar) {
                botonLlenar.style.opacity = '0.6';
                botonLlenar.style.pointerEvents = 'none';
            }
            if (botonPreview) {
                botonPreview.style.opacity = '0.6';
                botonPreview.style.pointerEvents = 'none';
            }
            
            const totalFiltrados = registrosFiltrados.length;
            const totalOriginales = registrosDisponibles.length;
            
            if (totalFiltrados === 0) {
                mostrarMensaje('🔍 No se encontraron registros que coincidan con los filtros aplicados', 'warning');
            } else if (totalFiltrados < totalOriginales) {
                mostrarMensaje(`🔍 Filtros aplicados: ${totalFiltrados} de ${totalOriginales} registros`, 'info');
            }
        }
        
        filtroAsignatura.addEventListener('input', () => {
            filtrarRegistros();
            setTimeout(() => guardarPreferenciasUsuario(), 300);
        });
        filtroDocente.addEventListener('input', () => {
            filtrarRegistros();
            setTimeout(() => guardarPreferenciasUsuario(), 300);
        });
        filtroMaestria.addEventListener('change', () => {
            filtrarRegistros();
            setTimeout(() => guardarPreferenciasUsuario(), 300);
        });
        
        limpiarFiltros.addEventListener('click', () => {
            filtroAsignatura.value = '';
            filtroDocente.value = '';
            filtroMaestria.value = '';
            registrosFiltrados = [...registrosDisponibles];
            paginaActual = 1;
            mostrarPagina(1);
            
            filaSeleccionada = null;
            const botonLlenar = document.getElementById('llenarFormularioBtn');
            const botonPreview = document.getElementById('previewBtn');
            if (botonLlenar) {
                botonLlenar.style.opacity = '0.6';
                botonLlenar.style.pointerEvents = 'none';
            }
            if (botonPreview) {
                botonPreview.style.opacity = '0.6';
                botonPreview.style.pointerEvents = 'none';
            }
            
            limpiarPreferenciasUsuario();
            mostrarMensaje('🔄 Filtros limpiados - Mostrando todos los registros', 'info');
        });
    }
    
    function configurarExportacion() {
        const exportarBtn = document.getElementById('exportarCSV');
        if (exportarBtn) {
            exportarBtn.addEventListener('click', exportarHistorialCSV);
        }
    }
    
    function exportarHistorialCSV() {
        try {
            const registrosAExportar = registrosFiltrados;
            
            if (registrosAExportar.length === 0) {
                mostrarMensaje('❌ No hay registros para exportar', 'error');
                return;
            }
            
            const headers = ['Asignatura', 'Código', 'Docente', 'Maestría', 'Semestre', 'Fecha Finalización', 'Créditos', 'Modalidad'];
            let csvContent = headers.join(',') + '\n';
            
            registrosAExportar.forEach(registro => {
                const general = registro?.general || {};
                const metadatos = registro?.metadatos || {};
                
                const fechaFinalizacion = metadatos.fecha_finalizacion ? 
                    new Date(metadatos.fecha_finalizacion).toLocaleDateString('es-ES') : 'N/A';
                
                const row = [
                    `"${general.asignatura || 'N/A'}"`,
                    `"${general.codigo || 'N/A'}"`,
                    `"${general.docente || 'N/A'}"`,
                    `"${general.maestria || 'N/A'}"`,
                    `"2025-${general.semestre || 'N/A'}"`,
                    `"${fechaFinalizacion}"`,
                    `"${general.creditos || 'N/A'}"`,
                    `"${general.modalidad || 'N/A'}"`
                ];
                
                csvContent += row.join(',') + '\n';
            });
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            const fecha = new Date().toISOString().split('T')[0];
            link.download = `historial_silabos_${fecha}.csv`;
            link.href = url;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            mostrarMensaje(`📊 Historial exportado exitosamente (${registrosAExportar.length} registros)`, 'success');
            
        } catch (error) {
            console.error('Error al exportar CSV:', error);
            mostrarMensaje('❌ Error al exportar el historial', 'error');
        }
    }
    
    function mostrarPreviewRegistro() {
        if (filaSeleccionada === null || !registrosDisponibles[filaSeleccionada]) {
            mostrarMensaje('❌ Por favor selecciona una fila primero', 'error');
            return;
        }
        
        const registro = registrosDisponibles[filaSeleccionada];
        const general = registro.general || {};
        const competencias = registro.competencias || {};
        const unidades = registro.unidades || {};
        const productos = registro.productos || {};
        const cronograma = registro.cronograma || {};
        const referencias = registro.referencias || {};
        const metadatos = registro.metadatos || {};
        
        const modalHTML = `
            <div id="previewModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                <div style="background: white; width: 90%; max-width: 800px; max-height: 80%; overflow-y: auto; border-radius: 12px; padding: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                    <div style="position: sticky; top: 0; background: #2c3e50; color: white; padding: 20px; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; font-size: 20px;">👁️ Vista Previa del Registro</h2>
                        <button id="closePreviewModal" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 0; line-height: 1;">&times;</button>
                    </div>
                    <div style="padding: 20px; color: #333;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;">
                                <h3 style="margin: 0 0 10px 0; color: #007bff;">📝 Información General</h3>
                                <p><strong>Asignatura:</strong> ${general.asignatura || 'N/A'}</p>
                                <p><strong>Código:</strong> ${general.codigo || 'N/A'}</p>
                                <p><strong>Docente:</strong> ${general.docente || 'N/A'}</p>
                                <p><strong>Maestría:</strong> ${general.maestria || 'N/A'}</p>
                                <p><strong>Semestre:</strong> 2025-${general.semestre || 'N/A'}</p>
                                <p><strong>Modalidad:</strong> ${general.modalidad || 'N/A'}</p>
                            </div>
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745;">
                                <h3 style="margin: 0 0 10px 0; color: #28a745;">📊 Detalles Académicos</h3>
                                <p><strong>Créditos:</strong> ${general.creditos || 'N/A'}</p>
                                <p><strong>Horas Teoría:</strong> ${general.horas_teoria || 'N/A'}</p>
                                <p><strong>Horas Práctica:</strong> ${general.horas_practica || 'N/A'}</p>
                                <p><strong>Sesiones:</strong> ${general.sesiones || 'N/A'}</p>
                                <p><strong>Semanas:</strong> ${general.semanas || 'N/A'}</p>
                                <p><strong>Carácter:</strong> ${general.caracter || 'N/A'}</p>
                            </div>
                        </div>
                        
                        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
                            <h3 style="margin: 0 0 10px 0; color: #ffc107;">🎯 Propósito</h3>
                            <p style="margin: 0;">${general.proposito || 'No especificado'}</p>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                                <h3 style="margin: 0 0 10px 0; color: #856404;">📚 Secciones Completadas</h3>
                                <p>✅ Competencias: ${(() => {
                                    
                                    let totalCompetencias = 0;
                                    if (competencias && typeof competencias === 'object') {
                                        Object.values(competencias).forEach(unidadComp => {
                                            if (Array.isArray(unidadComp)) {
                                                totalCompetencias += unidadComp.length;
                                            }
                                        });
                                    }
                                    return totalCompetencias > 0 ? `${totalCompetencias} competencias` : 'Sin datos';
                                })()}</p>
                                <p>✅ Unidades: ${(() => {
                                    if (unidades && unidades.unidades_detalle && Array.isArray(unidades.unidades_detalle)) {
                                        return `${unidades.unidades_detalle.length} unidades`;
                                    } else if (unidades && unidades.unidades) {
                                        return `${unidades.unidades} unidades`;
                                    }
                                    return 'Sin datos';
                                })()}</p>
                                <p>✅ Productos: ${(() => {
                                    
                                    let totalProductos = 0;
                                    if (productos && typeof productos === 'object') {
                                        Object.values(productos).forEach(unidadProd => {
                                            if (Array.isArray(unidadProd)) {
                                                totalProductos += unidadProd.length;
                                            }
                                        });
                                    }
                                    return totalProductos > 0 ? `${totalProductos} productos` : 'Sin datos';
                                })()}</p>
                                <p>✅ Cronograma: ${(() => {
                                    if (cronograma && Array.isArray(cronograma.cronograma)) {
                                        return `${cronograma.cronograma.length} sesiones`;
                                    } else if (cronograma && cronograma.sesiones) {
                                        return `${cronograma.sesiones} sesiones`;
                                    }
                                    return 'Sin datos';
                                })()}</p>
                                <p>✅ Referencias: ${(() => {
                                    let totalReferencias = 0;
                                    if (referencias && typeof referencias === 'object') {
                                        if (Array.isArray(referencias.libros)) totalReferencias += referencias.libros.length;
                                        if (Array.isArray(referencias.articulos)) totalReferencias += referencias.articulos.length;
                                        if (Array.isArray(referencias.web)) totalReferencias += referencias.web.length;
                                    }
                                    return totalReferencias > 0 ? `${totalReferencias} referencias` : 'Sin datos';
                                })()}</p>
                            </div>
                            <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; border-left: 4px solid #17a2b8;">
                                <h3 style="margin: 0 0 10px 0; color: #0c5460;">ℹ️ Metadatos</h3>
                                <p><strong>Finalizado:</strong> ${(() => {
                                    if (metadatos.fecha_finalizacion) {
                                        const fechaObj = new Date(metadatos.fecha_finalizacion);
                                        const dia = fechaObj.getDate();
                                        const mes = fechaObj.toLocaleString('es-ES', { month: 'short' });
                                        const anio = fechaObj.getFullYear();
                                        const hora = fechaObj.getHours().toString().padStart(2, '0');
                                        const minutos = fechaObj.getMinutes().toString().padStart(2, '0');
                                        return `${dia} ${mes} ${anio}, ${hora}:${minutos}`;
                                    }
                                    return 'N/A';
                                })()}</p>
                                <p><strong>Versión:</strong> ${general.version || 'N/A'}</p>
                                <p><strong>Estado:</strong> ${metadatos.estado || 'N/A'}</p>
                            </div>
                        </div>
                        
                        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #dee2e6;">
                            <button id="cargarDesdePreview" style="background: #28a745; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; margin-right: 10px;">
                                📥 Cargar en Formulario
                            </button>
                            <button id="cerrarPreview" style="background: #6c757d; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px;">
                                ❌ Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        document.getElementById('closePreviewModal').addEventListener('click', cerrarPreviewModal);
        document.getElementById('cerrarPreview').addEventListener('click', cerrarPreviewModal);
        document.getElementById('cargarDesdePreview').addEventListener('click', () => {
            cerrarPreviewModal();
            confirmarCargarRegistro();
        });
        
        document.getElementById('previewModal').addEventListener('click', (e) => {
            if (e.target.id === 'previewModal') {
                cerrarPreviewModal();
            }
        });
    }
    
    function cerrarPreviewModal() {
        const modal = document.getElementById('previewModal');
        if (modal) {
            modal.remove();
        }
    }
    
    function confirmarCargarRegistro() {
        if (filaSeleccionada === null || !registrosDisponibles[filaSeleccionada]) {
            mostrarMensaje('❌ Por favor selecciona una fila primero', 'error');
            return;
        }
        
        const registro = registrosDisponibles[filaSeleccionada];
        const general = registro.general || {};
        
        const modalHTML = `
            <div id="confirmModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                <div style="background: white; width: 90%; max-width: 500px; border-radius: 12px; padding: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                    <div style="background: #dc3545; color: white; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
                        <h2 style="margin: 0; font-size: 20px;">⚠️ Confirmación Requerida</h2>
                    </div>
                    <div style="padding: 20px; color: #333; text-align: center;">
                        <p style="font-size: 16px; margin-bottom: 20px;">
                            ¿Estás seguro de que quieres cargar este registro? 
                            <strong>Se sobrescribirán todos los datos actuales del formulario.</strong>
                        </p>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #007bff;">
                            <h4 style="margin: 0 0 10px 0; color: #007bff;">📋 Registro seleccionado:</h4>
                            <p style="margin: 5px 0;"><strong>Asignatura:</strong> ${general.asignatura || 'N/A'}</p>
                            <p style="margin: 5px 0;"><strong>Código:</strong> ${general.codigo || 'N/A'}</p>
                            <p style="margin: 5px 0;"><strong>Docente:</strong> ${general.docente || 'N/A'}</p>
                            <p style="margin: 5px 0;"><strong>Maestría:</strong> ${general.maestria || 'N/A'}</p>
                        </div>
                        <div style="display: flex; gap: 10px; justify-content: center;">
                            <button id="confirmarCarga" style="background: #28a745; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px;">
                                ✅ Sí, Cargar Datos
                            </button>
                            <button id="cancelarCarga" style="background: #6c757d; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px;">
                                ❌ Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        document.getElementById('confirmarCarga').addEventListener('click', () => {
            cerrarConfirmModal();
            llenarFormularioDesdeHistorial();
        });
        
        document.getElementById('cancelarCarga').addEventListener('click', cerrarConfirmModal);
        
        document.getElementById('confirmModal').addEventListener('click', (e) => {
            if (e.target.id === 'confirmModal') {
                cerrarConfirmModal();
            }
        });
    }
    
    function cerrarConfirmModal() {
        const modal = document.getElementById('confirmModal');
        if (modal) {
            modal.remove();
        }
    }

    cargarDatos().then(datos => {
        if (datos && Object.keys(datos).length > 0) {
            mostrarMensaje(`📋 Datos cargados: ${datos.asignatura || 'Curso sin nombre'}`, 'success');
        }
    });
    
    function configurarEstadisticas() {
        const estadisticasBtn = document.getElementById('verEstadisticas');
        if (estadisticasBtn) {
            estadisticasBtn.addEventListener('click', mostrarEstadisticas);
        }
    }
    
    async function mostrarEstadisticas() {
        try {
            mostrarMensaje('📈 Cargando estadísticas...', 'info');
            
            const response = await fetch('/api/estadisticas_historial');
            const data = await response.json();
            
            if (data.success) {
                const stats = data.estadisticas;
                
                const modalHTML = `
                    <div id="estadisticasModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                        <div style="background: white; width: 95%; max-width: 1000px; max-height: 85%; overflow-y: auto; border-radius: 12px; padding: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                            <div style="position: sticky; top: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
                                <h2 style="margin: 0; font-size: 24px;">📈 Estadísticas del Historial</h2>
                                <button id="closeStatsModal" style="background: none; border: none; color: white; font-size: 28px; cursor: pointer; padding: 0; line-height: 1;">&times;</button>
                            </div>
                            <div style="padding: 20px; color: #333;">
                                <!-- Resumen general -->
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <div style="background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); color: white; padding: 20px; border-radius: 12px; display: inline-block;">
                                        <h3 style="margin: 0; font-size: 18px;">📊 Total de Registros</h3>
                                        <p style="margin: 10px 0 0 0; font-size: 36px; font-weight: bold;">${stats.total_registros}</p>
                                    </div>
                                </div>
                                
                                <!-- Grid de estadísticas -->
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px;">
                                    <!-- Maestrías -->
                                    <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 5px solid #6c5ce7;">
                                        <h3 style="margin: 0 0 15px 0; color: #6c5ce7; font-size: 18px;">🎓 Por Maestría</h3>
                                        <div style="max-height: 200px; overflow-y: auto;">
                                            ${Object.entries(stats.maestrias).map(([maestria, count]) => `
                                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                                                    <span style="font-weight: 500; color: #333;">${maestria}</span>
                                                    <span style="background: #6c5ce7; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">${count}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                    
                                    <!-- Docentes -->
                                    <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 5px solid #a29bfe;">
                                        <h3 style="margin: 0 0 15px 0; color: #a29bfe; font-size: 18px;">👨‍🏫 Por Docente</h3>
                                        <div style="max-height: 200px; overflow-y: auto;">
                                            ${Object.entries(stats.docentes).map(([docente, count]) => `
                                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                                                    <span style="font-weight: 500; color: #333;">${docente}</span>
                                                    <span style="background: #a29bfe; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">${count}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                    
                                    <!-- Modalidades -->
                                    <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 5px solid #fd79a8;">
                                        <h3 style="margin: 0 0 15px 0; color: #fd79a8; font-size: 18px;">💻 Por Modalidad</h3>
                                        <div style="max-height: 200px; overflow-y: auto;">
                                            ${Object.entries(stats.modalidades).map(([modalidad, count]) => `
                                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                                                    <span style="font-weight: 500; color: #333;">${modalidad}</span>
                                                    <span style="background: #fd79a8; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">${count}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                    
                                    <!-- Actividad por mes -->
                                    <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 5px solid #00b894;">
                                        <h3 style="margin: 0 0 15px 0; color: #00b894; font-size: 18px;">📅 Actividad Mensual</h3>
                                        <div style="max-height: 200px; overflow-y: auto;">
                                            ${Object.entries(stats.por_mes).sort().map(([mes, count]) => `
                                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                                                    <span style="font-weight: 500; color: #333;">${mes}</span>
                                                    <span style="background: #00b894; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">${count}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Botones de acción -->
                                <div style="text-align: center; padding-top: 20px; border-top: 2px solid #e9ecef;">
                                    <button id="exportarEstadisticas" style="background: #00b894; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; margin-right: 10px;">
                                        📊 Exportar Estadísticas
                                    </button>
                                    <button id="cerrarEstadisticas" style="background: #74b9ff; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px;">
                                        ✅ Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                document.body.insertAdjacentHTML('beforeend', modalHTML);
                
                document.getElementById('closeStatsModal').addEventListener('click', cerrarEstadisticasModal);
                document.getElementById('cerrarEstadisticas').addEventListener('click', cerrarEstadisticasModal);
                document.getElementById('exportarEstadisticas').addEventListener('click', () => exportarEstadisticasCSV(stats));
                
                document.getElementById('estadisticasModal').addEventListener('click', (e) => {
                    if (e.target.id === 'estadisticasModal') {
                        cerrarEstadisticasModal();
                    }
                });
                
                mostrarMensaje('✅ Estadísticas cargadas exitosamente', 'success');
                
            } else {
                mostrarMensaje('❌ Error al cargar estadísticas', 'error');
            }
        } catch (error) {
            console.error('Error al mostrar estadísticas:', error);
            mostrarMensaje('❌ Error al cargar estadísticas', 'error');
        }
    }
    
    function cerrarEstadisticasModal() {
        const modal = document.getElementById('estadisticasModal');
        if (modal) {
            modal.remove();
        }
    }
    
    function exportarEstadisticasCSV(stats) {
        try {
            let csvContent = 'Tipo,Categoria,Cantidad\n';
            
            Object.entries(stats.maestrias).forEach(([maestria, count]) => {
                csvContent += `"Maestría","${maestria}","${count}"\n`;
            });
            
            Object.entries(stats.docentes).forEach(([docente, count]) => {
                csvContent += `"Docente","${docente}","${count}"\n`;
            });
            
            Object.entries(stats.modalidades).forEach(([modalidad, count]) => {
                csvContent += `"Modalidad","${modalidad}","${count}"\n`;
            });
            
            Object.entries(stats.por_mes).forEach(([mes, count]) => {
                csvContent += `"Mes","${mes}","${count}"\n`;
            });
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            const fecha = new Date().toISOString().split('T')[0];
            link.download = `estadisticas_silabos_${fecha}.csv`;
            link.href = url;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            mostrarMensaje('📊 Estadísticas exportadas exitosamente', 'success');
            
        } catch (error) {
            console.error('Error al exportar estadísticas:', error);
            mostrarMensaje('❌ Error al exportar estadísticas', 'error');
        }
    }
    
    function configurarPaginacion() {
        registrosFiltrados = [...registrosDisponibles];
        paginaActual = 1;
        mostrarPagina(1);
    }
    
    function mostrarPagina(numeroPagina) {
        paginaActual = numeroPagina;
        const inicio = (numeroPagina - 1) * registrosPorPagina;
        const fin = inicio + registrosPorPagina;
        const registrosPagina = registrosFiltrados.slice(inicio, fin);
        
        const totalPaginas = Math.ceil(registrosFiltrados.length / registrosPorPagina);
        
        const tbody = document.querySelector('#historialTable tbody');
        if (tbody) {
            tbody.innerHTML = '';
            
            registrosPagina.forEach((registro, index) => {
                const indiceOriginal = registrosDisponibles.indexOf(registro);
                const general = registro.general || {};
                const metadatos = registro.metadatos || {};
                let fechaFinalizacion = 'N/A';
                if (metadatos.fecha_finalizacion) {
                    const fechaObj = new Date(metadatos.fecha_finalizacion);
                    const dia = fechaObj.getDate();
                    const mes = fechaObj.toLocaleString('es-ES', { month: 'short' });
                    const anio = fechaObj.getFullYear();
                    const hora = fechaObj.getHours().toString().padStart(2, '0');
                    const minutos = fechaObj.getMinutes().toString().padStart(2, '0');
                    fechaFinalizacion = `${dia} ${mes} ${anio}, ${hora}:${minutos}`;
                }
                
                const backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
                
                const fila = `
                    <tr class="historial-row" data-index="${indiceOriginal}" style="background-color: ${backgroundColor}; border-bottom: 1px solid #dee2e6; cursor: pointer; transition: background-color 0.2s ease;">
                        <td style="padding: 12px; border-right: 1px solid #dee2e6; color: #333; font-weight: 500;">${general.asignatura || 'Sin nombre'}</td>
                        <td style="padding: 12px; border-right: 1px solid #dee2e6; color: #666;">${general.codigo || 'N/A'}</td>
                        <td style="padding: 12px; border-right: 1px solid #dee2e6; color: #666;">${general.docente || 'N/A'}</td>
                        <td style="padding: 12px; border-right: 1px solid #dee2e6; color: #666;">${general.maestria || 'N/A'}</td>
                        <td style="padding: 12px; border-right: 1px solid #dee2e6; color: #666;">2025-${general.semestre || 'N/A'}</td>
                        <td style="padding: 12px; color: #28a745; font-weight: 500;">${fechaFinalizacion}</td>
                    </tr>
                `;
                
                tbody.innerHTML += fila;
            });
            
            configurarSeleccionFilas();
        }
        
        actualizarControlesPaginacion(numeroPagina, totalPaginas);
        actualizarContadorRegistros(inicio, fin);
        
        setTimeout(() => guardarPreferenciasUsuario(), 100);
    }
    
    function actualizarContadorRegistros(inicio, fin) {
        const contadorElement = document.querySelector('.finalizar-container p strong');
        if (contadorElement) {
            const mostrandoDesde = registrosFiltrados.length > 0 ? inicio + 1 : 0;
            const mostrandoHasta = Math.min(fin, registrosFiltrados.length);
            contadorElement.textContent = `${mostrandoDesde}-${mostrandoHasta} de ${registrosFiltrados.length}`;
            
            const parrafoContador = contadorElement.parentElement;
            if (parrafoContador) {
                parrafoContador.innerHTML = `
                    📊 Mostrando <strong>${mostrandoDesde}-${mostrandoHasta} de ${registrosFiltrados.length}</strong> registros
                    ${registrosFiltrados.length !== registrosDisponibles.length ? 
                        `(filtrado de ${registrosDisponibles.length} total)` : ''}
                `;
            }
        }
    }
    
    function actualizarControlesPaginacion(paginaActual, totalPaginas) {
        let paginacionHTML = '';
        
        if (totalPaginas > 1) {
            paginacionHTML = `
                <div id="paginacionControles" style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-top: 2px solid #007bff;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button id="paginaPrimera" ${paginaActual === 1 ? 'disabled' : ''} 
                                style="background: ${paginaActual === 1 ? '#6c757d' : '#007bff'}; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: ${paginaActual === 1 ? 'not-allowed' : 'pointer'}; font-size: 14px;"
                                title="Primera página">
                            ⏪ Primera
                        </button>
                        <button id="paginaAnterior" ${paginaActual === 1 ? 'disabled' : ''} 
                                style="background: ${paginaActual === 1 ? '#6c757d' : '#007bff'}; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: ${paginaActual === 1 ? 'not-allowed' : 'pointer'}; font-size: 14px;"
                                title="Página anterior">
                            ← Anterior
                        </button>
                    </div>
                    
                    <div style="display: flex; gap: 5px; align-items: center;">
            `;
            
            let paginasAMostrar = [];
            const maxBotones = 7;
            
            if (totalPaginas <= maxBotones) {
                for (let i = 1; i <= totalPaginas; i++) {
                    paginasAMostrar.push(i);
                }
            } else {
                if (paginaActual <= 4) {
                    paginasAMostrar = [1, 2, 3, 4, 5, '...', totalPaginas];
                } else if (paginaActual >= totalPaginas - 3) {
                    paginasAMostrar = [1, '...', totalPaginas - 4, totalPaginas - 3, totalPaginas - 2, totalPaginas - 1, totalPaginas];
                } else {
                    paginasAMostrar = [1, '...', paginaActual - 1, paginaActual, paginaActual + 1, '...', totalPaginas];
                }
            }
            
            paginasAMostrar.forEach((pagina) => {
                if (pagina === '...') {
                    paginacionHTML += `
                        <span style="padding: 8px 4px; color: #6c757d; font-weight: bold;">...</span>
                    `;
                } else if (pagina === paginaActual) {
                    paginacionHTML += `
                        <button class="pagina-numero pagina-activa" data-pagina="${pagina}" 
                                style="background: #007bff; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; min-width: 40px; box-shadow: 0 2px 4px rgba(0,123,255,0.3);">
                            ${pagina}
                        </button>
                    `;
                } else {
                    paginacionHTML += `
                        <button class="pagina-numero" data-pagina="${pagina}" 
                                style="background: white; color: #007bff; border: 1px solid #007bff; padding: 8px 12px; border-radius: 6px; cursor: pointer; min-width: 40px; transition: all 0.2s ease;"
                                onmouseover="this.style.background='#007bff'; this.style.color='white';"
                                onmouseout="this.style.background='white'; this.style.color='#007bff';">
                            ${pagina}
                        </button>
                    `;
                }
            });
            
            paginacionHTML += `
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button id="paginaSiguiente" ${paginaActual === totalPaginas ? 'disabled' : ''} 
                                style="background: ${paginaActual === totalPaginas ? '#6c757d' : '#007bff'}; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: ${paginaActual === totalPaginas ? 'not-allowed' : 'pointer'}; font-size: 14px;"
                                title="Página siguiente">
                            Siguiente →
                        </button>
                        <button id="paginaUltima" ${paginaActual === totalPaginas ? 'disabled' : ''} 
                                style="background: ${paginaActual === totalPaginas ? '#6c757d' : '#007bff'}; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: ${paginaActual === totalPaginas ? 'not-allowed' : 'pointer'}; font-size: 14px;"
                                title="Última página">
                            Última ⏩
                        </button>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 10px; margin-left: 20px; padding-left: 20px; border-left: 1px solid #dee2e6;">
                        <span style="color: #6c757d; font-size: 14px;">Ir a:</span>
                        <input type="number" id="irAPagina" min="1" max="${totalPaginas}" value="${paginaActual}" 
                               style="width: 60px; padding: 6px 8px; border: 1px solid #dee2e6; border-radius: 4px; text-align: center; font-size: 14px;">
                        <button id="botonIrAPagina" style="background: #28a745; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 14px;"
                                title="Ir a la página especificada">
                            Ir
                        </button>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 10px; color: #6c757d; font-size: 14px;">
                    Página ${paginaActual} de ${totalPaginas} | ${registrosPorPagina} registros por página
                </div>
            `;
        }
        
        let paginacionContainer = document.getElementById('paginacionContainer');
        if (!paginacionContainer) {
            paginacionContainer = document.createElement('div');
            paginacionContainer.id = 'paginacionContainer';
            const botonesContainer = document.querySelector('.finalizar-botones');
            if (botonesContainer) {
                botonesContainer.parentNode.insertBefore(paginacionContainer, botonesContainer);
            } else {
                document.querySelector('.finalizar-container').appendChild(paginacionContainer);
            }
        }
        
        paginacionContainer.innerHTML = paginacionHTML;
        
        if (totalPaginas > 1) {
            document.getElementById('paginaPrimera')?.addEventListener('click', () => {
                if (paginaActual > 1) {
                    mostrarPagina(1);
                }
            });
            
            document.getElementById('paginaAnterior')?.addEventListener('click', () => {
                if (paginaActual > 1) {
                    mostrarPagina(paginaActual - 1);
                }
            });
            
            document.getElementById('paginaSiguiente')?.addEventListener('click', () => {
                if (paginaActual < totalPaginas) {
                    mostrarPagina(paginaActual + 1);
                }
            });
            
            document.getElementById('paginaUltima')?.addEventListener('click', () => {
                if (paginaActual < totalPaginas) {
                    mostrarPagina(totalPaginas);
                }
            });
            
            document.querySelectorAll('.pagina-numero').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const pagina = parseInt(e.target.getAttribute('data-pagina'));
                    if (!isNaN(pagina)) {
                        mostrarPagina(pagina);
                    }
                });
            });
            
            const inputIrAPagina = document.getElementById('irAPagina');
            const botonIrAPagina = document.getElementById('botonIrAPagina');
            
            botonIrAPagina?.addEventListener('click', () => {
                const paginaDestino = parseInt(inputIrAPagina.value);
                if (paginaDestino >= 1 && paginaDestino <= totalPaginas) {
                    mostrarPagina(paginaDestino);
                } else {
                    mostrarMensaje('❌ Número de página inválido', 'error');
                    inputIrAPagina.value = paginaActual;
                }
            });
            
            inputIrAPagina?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    botonIrAPagina.click();
                }
            });
            
            const navegacionTecladoHandler = function(e) {
               
                if (document.querySelector('#historialTable') && !document.querySelector('#previewModal, #confirmModal, #estadisticasModal')) {
                    
                    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
                        return;
                    }
                    
                    if (e.key === 'ArrowLeft' && paginaActual > 1) {
                        e.preventDefault();
                        mostrarPagina(paginaActual - 1);
                    } else if (e.key === 'ArrowRight' && paginaActual < totalPaginas) {
                        e.preventDefault();
                        mostrarPagina(paginaActual + 1);
                    } else if (e.key === 'Home') {
                        e.preventDefault();
                        mostrarPagina(1);
                    } else if (e.key === 'End') {
                        e.preventDefault();
                        mostrarPagina(totalPaginas);
                    } else if (e.key >= '1' && e.key <= '9') {
                        const paginaDeseada = parseInt(e.key);
                        if (paginaDeseada <= totalPaginas) {
                            e.preventDefault();
                            mostrarPagina(paginaDeseada);
                        }
                    }
                }
            };
            
            document.removeEventListener('keydown', window.navegacionTecladoHandler);
            
            document.addEventListener('keydown', navegacionTecladoHandler);
            window.navegacionTecladoHandler = navegacionTecladoHandler;
        }
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            verHistorialBtn.click();
        }
        
        if (e.key === 'Escape') {
            const modales = ['previewModal', 'confirmModal', 'estadisticasModal'];
            modales.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.remove();
                }
            });
        }
        
        if (e.key === 'Enter') {
            const confirmBtn = document.getElementById('confirmarCarga');
            const cargarBtn = document.getElementById('cargarDesdePreview');
            
            if (confirmBtn && confirmBtn.offsetParent !== null) {
                confirmBtn.click();
            } else if (cargarBtn && cargarBtn.offsetParent !== null) {
                cargarBtn.click();
            }
        }
    });
    
    function agregarAyudaContextual() {
        const ayudas = {
            'verHistorialBtn': {
                titulo: 'Ver Historial',
                texto: 'Accede a todos los sílabos completados anteriormente. Puedes filtrar, buscar y restaurar cualquier registro.',
                posicion: 'bottom'
            },
            'filtroAsignatura': {
                titulo: 'Filtrar por Asignatura',
                texto: 'Escribe el nombre de la asignatura para filtrar los resultados. La búsqueda es en tiempo real.',
                posicion: 'bottom'
            },
            'exportarCSV': {
                titulo: 'Exportar a CSV',
                texto: 'Descarga los registros filtrados en formato CSV para análisis externo.',
                posicion: 'bottom'
            },
            'verEstadisticas': {
                titulo: 'Ver Estadísticas',
                texto: 'Muestra un resumen estadístico de todos los sílabos completados.',
                posicion: 'bottom'
            }
        };
        
        Object.entries(ayudas).forEach(([id, config]) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.setAttribute('data-ayuda', JSON.stringify(config));
                elemento.addEventListener('mouseenter', mostrarAyuda);
                elemento.addEventListener('mouseleave', ocultarAyuda);
            }
        });
    }
    
    function mostrarAyuda(e) {
        const config = JSON.parse(e.target.getAttribute('data-ayuda'));
        const tooltip = document.createElement('div');
        tooltip.id = 'tooltip-ayuda';
        tooltip.style.cssText = `
            position: absolute;
            background: #333;
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10002;
            max-width: 250px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            pointer-events: none;
        `;
        
        tooltip.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">${config.titulo}</div>
            <div>${config.texto}</div>
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = e.target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top, left;
        
        if (config.posicion === 'bottom') {
            top = rect.bottom + 10;
            left = rect.left + (rect.width - tooltipRect.width) / 2;
        } else {
            top = rect.top - tooltipRect.height - 10;
            left = rect.left + (rect.width - tooltipRect.width) / 2;
        }
        
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
    }
    
    function ocultarAyuda() {
        const tooltip = document.getElementById('tooltip-ayuda');
        if (tooltip) {
            tooltip.remove();
        }
    }
    
    agregarAyudaContextual();
    
    function guardarPreferenciasUsuario() {
        const preferencias = {
            filtroAsignatura: document.getElementById('filtroAsignatura')?.value || '',
            filtroDocente: document.getElementById('filtroDocente')?.value || '',
            filtroMaestria: document.getElementById('filtroMaestria')?.value || '',
            registrosPorPagina: registrosPorPagina,
            paginaActual: paginaActual,
            timestamp: Date.now()
        };
        
        localStorage.setItem('historialPreferencias', JSON.stringify(preferencias));
    }
    
    function cargarPreferenciasUsuario() {
        const preferencias = localStorage.getItem('historialPreferencias');
        if (preferencias) {
            try {
                const prefs = JSON.parse(preferencias);
             
                const tiempoTranscurrido = Date.now() - (prefs.timestamp || 0);
                const unaHora = 60 * 60 * 1000;
                
                if (tiempoTranscurrido > unaHora) {
                    limpiarPreferenciasUsuario();
                    return;
                }
                
                setTimeout(() => {
                    const filtroAsignatura = document.getElementById('filtroAsignatura');
                    const filtroDocente = document.getElementById('filtroDocente');
                    const filtroMaestria = document.getElementById('filtroMaestria');
                    
                    if (filtroAsignatura && prefs.filtroAsignatura) {
                        filtroAsignatura.value = prefs.filtroAsignatura;
                    }
                    if (filtroDocente && prefs.filtroDocente) {
                        filtroDocente.value = prefs.filtroDocente;
                    }
                    if (filtroMaestria && prefs.filtroMaestria) {
                        filtroMaestria.value = prefs.filtroMaestria;
                    }
                    
                    if (prefs.filtroAsignatura || prefs.filtroDocente || prefs.filtroMaestria) {
                        if (filtroAsignatura) {
                            filtroAsignatura.dispatchEvent(new Event('input'));
                        }
                        
                    
                        setTimeout(() => {
                            if (prefs.paginaActual && prefs.paginaActual > 1) {
                                const totalPaginas = Math.ceil(registrosFiltrados.length / registrosPorPagina);
                                const paginaAIr = Math.min(prefs.paginaActual, totalPaginas);
                                if (paginaAIr > 1 && paginaAIr <= totalPaginas) {
                                    mostrarPagina(paginaAIr);
                                }
                            }
                        }, 300);
                    } else if (prefs.paginaActual && prefs.paginaActual > 1) {
                        const totalPaginas = Math.ceil(registrosDisponibles.length / registrosPorPagina);
                        const paginaAIr = Math.min(prefs.paginaActual, totalPaginas);
                        if (paginaAIr > 1 && paginaAIr <= totalPaginas) {
                            mostrarPagina(paginaAIr);
                        }
                    }
                }, 200);
                
            } catch (error) {
                console.error('Error al cargar preferencias:', error);
                limpiarPreferenciasUsuario();
            }
        }
    }
    function limpiarPreferenciasUsuario() {
        localStorage.removeItem('historialPreferencias');
    }
    
    cargarPreferenciasUsuario();
});
