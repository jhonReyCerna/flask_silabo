document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-unidades');
    const sesionesInput = document.getElementById('sesiones');
    const unidadesInput = document.getElementById('unidades');
    const generarBtn = document.getElementById('generar-unidades');
    const restablecerBtn = document.getElementById('restablecer-unidades');
    const guardarBtn = document.querySelector('button[type="submit"]');
    const unidadesContainer = document.getElementById('unidades-container');
    const mensaje = document.getElementById('mensaje');
    
    const modalOverlay = document.getElementById('modal-restablecer');
    const modalConfirm = document.getElementById('modal-confirm');
    const modalCancel = document.getElementById('modal-cancel');

    let camposBloqueados = false;

    cargarDatosGuardados();

    generarBtn.addEventListener('click', generarFormulariosUnidades);
    restablecerBtn.addEventListener('click', mostrarModalRestablecer);
    modalConfirm.addEventListener('click', confirmarRestablecimiento);
    modalCancel.addEventListener('click', cerrarModal);
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            cerrarModal();
        }
    });
    form.addEventListener('submit', guardarUnidades);
    sesionesInput.addEventListener('input', actualizarSesiones);
    unidadesInput.addEventListener('input', limpiarFormulariosExistentes);
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            cerrarModal();
        }
    });

    function cargarDatosGuardados() {
        fetch('/api/cargar_unidades')
            .then(response => response.json())
            .then(data => {
                if (data.sesiones) {
                    sesionesInput.value = data.sesiones;
                }
                if (data.unidades) {
                    unidadesInput.value = data.unidades;
                }
                if (data.unidades_detalle) {
                    generarFormulariosUnidades();
                    cargarDetallesUnidades(data.unidades_detalle);
                }
            })
            .catch(error => {
                console.log('No hay datos previos guardados');
            });
    }

    function generarFormulariosUnidades() {
        const numUnidades = parseInt(unidadesInput.value);
        const numSesiones = parseInt(sesionesInput.value);

        if (!numUnidades || numUnidades < 2 || numUnidades > 4) {
            mostrarMensaje('Por favor, selecciona entre 2 y 4 unidades', 'error');
            return;
        }

        if (!numSesiones || numSesiones < 1 || numSesiones > 16) {
            mostrarMensaje('Por favor, selecciona entre 1 y 16 sesiones', 'error');
            return;
        }

        unidadesContainer.innerHTML = '';
        
        for (let i = 1; i <= numUnidades; i++) {
            const unidadCard = crearFormularioUnidad(i, numSesiones, numUnidades);
            unidadesContainer.appendChild(unidadCard);
        }

        bloquearCamposBasicos();
        
        guardarBtn.style.display = 'block';
        mostrarMensaje('Formularios de unidades generados correctamente. Los campos básicos están bloqueados.', 'exito');
        
        unidadesContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    function crearFormularioUnidad(numero, totalSesiones, totalUnidades) {
        const unidadDiv = document.createElement('div');
        unidadDiv.className = 'unidad-card';
        unidadDiv.dataset.unidad = numero;

        const sesionesBase = Math.floor(totalSesiones / totalUnidades);
        const sesionesExtra = totalSesiones % totalUnidades;
        const sesionesUnidad = sesionesBase + (numero <= sesionesExtra ? 1 : 0);

        unidadDiv.innerHTML = `
            <div class="unidad-header">
                📚 Unidad ${numero} de ${totalUnidades}
            </div>
            <div class="unidad-content">
                <div class="form-row">
                    <label for="nombre_unidad_${numero}">Nombre de la Unidad:</label>
                    <input type="text" id="nombre_unidad_${numero}" name="nombre_unidad_${numero}" 
                           maxlength="2000" placeholder="Ej: Fundamentos teóricos..." required>
                </div>
                
                <div class="form-row">
                    <label for="sesiones_unidad_${numero}">Número de Sesiones:</label>
                    <input type="number" id="sesiones_unidad_${numero}" name="sesiones_unidad_${numero}" 
                           min="1" max="${totalSesiones}" value="${sesionesUnidad}" required>
                    <small style="color: #666; font-size: 12px;">Sugerido: ${sesionesUnidad} sesiones</small>
                </div>
                
                <div class="form-row">
                    <label for="logro_unidad_${numero}">Indicador(es) de logro:</label>
                    <textarea id="logro_unidad_${numero}" name="logro_unidad_${numero}" 
                              rows="6" maxlength="10000" placeholder="Describe los indicadores de logro de esta unidad..."
                              required></textarea>
                </div>
                
                <div class="form-row">
                    <label for="instrumentos_unidad_${numero}">Instrumentos de Evaluación:</label>
                    <div id="instrumentos_container_${numero}" class="instrumentos-container">
                        <div class="instrumento-item">
                            <input type="text" name="instrumento_unidad_${numero}[]" 
                                   placeholder="Ej: Examen parcial, Proyecto grupal, etc..." required>
                            <button type="button" class="btn-eliminar-instrumento" onclick="eliminarInstrumento(this)">❌</button>
                        </div>
                    </div>
                    <button type="button" class="btn-agregar-instrumento" onclick="agregarInstrumento(${numero})">➕ Agregar Instrumento</button>
                </div>
            </div>
        `;

        const sesionesUnidadInput = unidadDiv.querySelector(`#sesiones_unidad_${numero}`);
        sesionesUnidadInput.addEventListener('input', validarDistribucionSesiones);

        return unidadDiv;
    }

    function validarDistribucionSesiones() {
        const totalSesiones = parseInt(sesionesInput.value);
        const unidadCards = document.querySelectorAll('.unidad-card');
        let sumaActual = 0;

        unidadCards.forEach(card => {
            const numero = card.dataset.unidad;
            const input = card.querySelector(`#sesiones_unidad_${numero}`);
            if (input && input.value) {
                sumaActual += parseInt(input.value);
            }
        });

        if (sumaActual > totalSesiones) {
            mostrarMensaje(`La suma de sesiones (${sumaActual}) excede el total disponible (${totalSesiones})`, 'error');
        } else if (sumaActual === totalSesiones) {
            mostrarMensaje(`Distribución correcta: ${sumaActual}/${totalSesiones} sesiones`, 'exito');
        } else {
            mensaje.style.display = 'none';
        }
    }

    function cargarDetallesUnidades(unidadesDetalle) {
        unidadesDetalle.forEach((unidad, index) => {
            const numero = index + 1;
            const card = document.querySelector(`[data-unidad="${numero}"]`);
            if (card) {
                card.querySelector(`#nombre_unidad_${numero}`).value = unidad.nombre || '';
                card.querySelector(`#sesiones_unidad_${numero}`).value = unidad.sesiones || '';
                card.querySelector(`#logro_unidad_${numero}`).value = unidad.logro || '';
                
                if (unidad.instrumentos && Array.isArray(unidad.instrumentos)) {
                    const container = card.querySelector(`#instrumentos_container_${numero}`);
                    container.innerHTML = ''; 
                    
                    unidad.instrumentos.forEach((instrumento, idx) => {
                        const instrumentoDiv = document.createElement('div');
                        instrumentoDiv.className = 'instrumento-item';
                        instrumentoDiv.innerHTML = `
                            <input type="text" name="instrumento_unidad_${numero}[]" 
                                   value="${instrumento}" placeholder="Ej: Examen parcial, Proyecto grupal, etc..." required>
                            <button type="button" class="btn-eliminar-instrumento" onclick="eliminarInstrumento(this)">❌</button>
                        `;
                        container.appendChild(instrumentoDiv);
                    });
                }
            }
        });
    }

    function guardarUnidades(event) {
        event.preventDefault();

        const totalSesiones = parseInt(sesionesInput.value);
        const unidadCards = document.querySelectorAll('.unidad-card');
        let sumaActual = 0;

        unidadCards.forEach(card => {
            const numero = card.dataset.unidad;
            const input = card.querySelector(`#sesiones_unidad_${numero}`);
            if (input && input.value) {
                sumaActual += parseInt(input.value);
            }
        });

        if (sumaActual !== totalSesiones) {
            mostrarMensaje(`Error: La suma de sesiones (${sumaActual}) debe ser igual al total (${totalSesiones})`, 'error');
            return;
        }

        const sesionesDisabled = sesionesInput.disabled;
        const unidadesDisabled = unidadesInput.disabled;
        sesionesInput.disabled = false;
        unidadesInput.disabled = false;

        const formData = new FormData(form);
        
        fetch('/guardar_unidades', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            sesionesInput.disabled = sesionesDisabled;
            unidadesInput.disabled = unidadesDisabled;
            
            if (data.success) {
                mostrarMensaje(data.message, 'exito');
                setTimeout(function() {
                    window.location.reload();
                }, 600); 
            } else {
                mostrarMensaje(data.message, 'error');
            }
        })
        .catch(error => {
            sesionesInput.disabled = sesionesDisabled;
            unidadesInput.disabled = unidadesDisabled;
            mostrarMensaje('Error al guardar los datos: ' + error.message, 'error');
        });
    }

    function mostrarMensaje(texto, tipo) {
        mensaje.textContent = texto;
        mensaje.className = `mensaje ${tipo}`;
        mensaje.style.display = 'block';
        
        if (tipo === 'exito') {
            setTimeout(() => {
                mensaje.style.display = 'none';
            }, 5000);
        }
    }

    window.agregarInstrumento = function(numeroUnidad) {
        const container = document.getElementById(`instrumentos_container_${numeroUnidad}`);
        const nuevoInstrumento = document.createElement('div');
        nuevoInstrumento.className = 'instrumento-item';
        nuevoInstrumento.innerHTML = `
            <input type="text" name="instrumento_unidad_${numeroUnidad}[]" 
                   placeholder="Ej: Examen parcial, Proyecto grupal, etc..." required>
            <button type="button" class="btn-eliminar-instrumento" onclick="eliminarInstrumento(this)">❌</button>
        `;
        container.appendChild(nuevoInstrumento);
    };

    window.eliminarInstrumento = function(boton) {
        const instrumentoItem = boton.parentNode;
        const container = instrumentoItem.parentNode;
        
        if (container.children.length > 1) {
            instrumentoItem.remove();
        } else {
            mostrarMensaje('Debe haber al menos un instrumento de evaluación por unidad', 'error');
        }
    };

    function bloquearCamposBasicos() {
        sesionesInput.disabled = true;
        unidadesInput.disabled = true;
        generarBtn.style.display = 'none';
        restablecerBtn.style.display = 'inline-block';
        camposBloqueados = true;
    }

    function desbloquearCamposBasicos() {
        sesionesInput.disabled = false;
        unidadesInput.disabled = false;
        generarBtn.style.display = 'inline-block';
        restablecerBtn.style.display = 'none';
        camposBloqueados = false;
    }

    function mostrarModalRestablecer() {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function cerrarModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    function confirmarRestablecimiento() {
        unidadesContainer.innerHTML = '';
        
        desbloquearCamposBasicos();
        
        guardarBtn.style.display = 'none';
        
        sesionesInput.value = '12';
        unidadesInput.value = '3';
        
        cerrarModal();
        
        setTimeout(() => {
            mostrarMensaje('✅ Formulario restablecido. Puedes modificar sesiones y unidades nuevamente.', 'exito');
        }, 300);
    }

    function actualizarSesiones() {
        if (!camposBloqueados) {
            if (unidadesContainer.children.length > 0) {
                mostrarMensaje('Cambio detectado. Haz clic en "Generar Formularios" para actualizar', 'error');
                guardarBtn.style.display = 'none';
            }
        }
    }

    function limpiarFormulariosExistentes() {
        if (!camposBloqueados) {
            if (unidadesContainer.children.length > 0) {
                unidadesContainer.innerHTML = '';
                guardarBtn.style.display = 'none';
                mostrarMensaje('Número de unidades cambiado. Genera los formularios nuevamente', 'error');
            }
        }
    }
});
