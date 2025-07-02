document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-unidades');
    const sesionesInput = document.getElementById('sesiones');
    const unidadesInput = document.getElementById('unidades');
    const generarBtn = document.getElementById('generar-unidades');
    const guardarBtn = document.querySelector('button[type="submit"]');
    const unidadesContainer = document.getElementById('unidades-container');
    const mensaje = document.getElementById('mensaje');

    // Cargar datos guardados al cargar la página
    cargarDatosGuardados();

    // Event listeners
    generarBtn.addEventListener('click', generarFormulariosUnidades);
    form.addEventListener('submit', guardarUnidades);
    sesionesInput.addEventListener('input', actualizarSesiones);
    unidadesInput.addEventListener('input', limpiarFormulariosExistentes);

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

        guardarBtn.style.display = 'block';
        mostrarMensaje('Formularios de unidades generados correctamente', 'exito');
        
        // Scroll suave hacia los formularios
        unidadesContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    function crearFormularioUnidad(numero, totalSesiones, totalUnidades) {
        const unidadDiv = document.createElement('div');
        unidadDiv.className = 'unidad-card';
        unidadDiv.dataset.unidad = numero;

        // Calcular sesiones sugeridas por unidad
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
                           placeholder="Ej: Fundamentos teóricos..." required>
                </div>
                
                <div class="form-row">
                    <label for="sesiones_unidad_${numero}">Número de Sesiones:</label>
                    <input type="number" id="sesiones_unidad_${numero}" name="sesiones_unidad_${numero}" 
                           min="1" max="${totalSesiones}" value="${sesionesUnidad}" required>
                    <small style="color: #666; font-size: 12px;">Sugerido: ${sesionesUnidad} sesiones</small>
                </div>
                
                <div class="form-row">
                    <label for="logro_unidad_${numero}">Logro de Unidad:</label>
                    <textarea id="logro_unidad_${numero}" name="logro_unidad_${numero}" 
                              rows="3" placeholder="Describe el logro principal de esta unidad..."
                              required></textarea>
                </div>
                
                <div class="form-row">
                    <label for="contenidos_unidad_${numero}">Contenidos Temáticos:</label>
                    <textarea id="contenidos_unidad_${numero}" name="contenidos_unidad_${numero}" 
                              rows="4" placeholder="Lista los temas principales de esta unidad..."
                              required></textarea>
                </div>
                
                <div class="form-row">
                    <label for="actividades_unidad_${numero}">Actividades de Aprendizaje:</label>
                    <textarea id="actividades_unidad_${numero}" name="actividades_unidad_${numero}" 
                              rows="3" placeholder="Describe las actividades principales..."
                              required></textarea>
                </div>
            </div>
        `;

        // Agregar listener para validar sesiones
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

    function actualizarSesiones() {
        // Si ya hay formularios generados, avisar que se deben regenerar
        if (unidadesContainer.children.length > 0) {
            mostrarMensaje('Cambio detectado. Haz clic en "Generar Formularios" para actualizar', 'error');
            guardarBtn.style.display = 'none';
        }
    }

    function limpiarFormulariosExistentes() {
        if (unidadesContainer.children.length > 0) {
            unidadesContainer.innerHTML = '';
            guardarBtn.style.display = 'none';
            mostrarMensaje('Número de unidades cambiado. Genera los formularios nuevamente', 'error');
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
                card.querySelector(`#contenidos_unidad_${numero}`).value = unidad.contenidos || '';
                card.querySelector(`#actividades_unidad_${numero}`).value = unidad.actividades || '';
            }
        });
    }

    function guardarUnidades(event) {
        event.preventDefault();

        // Validar distribución de sesiones antes de guardar
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

        const formData = new FormData(form);
        
        fetch('/guardar_unidades', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarMensaje(data.message, 'exito');
            } else {
                mostrarMensaje(data.message, 'error');
            }
        })
        .catch(error => {
            mostrarMensaje('Error al guardar los datos: ' + error.message, 'error');
        });
    }

    function mostrarMensaje(texto, tipo) {
        mensaje.textContent = texto;
        mensaje.className = `mensaje ${tipo}`;
        mensaje.style.display = 'block';
        
        // Auto-ocultar mensajes de éxito después de 5 segundos
        if (tipo === 'exito') {
            setTimeout(() => {
                mensaje.style.display = 'none';
            }, 5000);
        }
    }
});
