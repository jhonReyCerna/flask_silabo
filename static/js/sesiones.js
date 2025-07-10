document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-sesiones');
    const sesionesContainer = document.getElementById('sesiones-container');
    const mensaje = document.getElementById('mensaje');
    const mensajeSinUnidades = document.getElementById('mensaje-sin-unidades');
    
    let unidadesDisponibles = [];
    let sesionesGuardadas = [];

    cargarUnidadesYSesiones();

    form.addEventListener('submit', guardarSesiones);

    function cargarUnidadesYSesiones() {
        fetch('/api/cargar_unidades_para_sesiones')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.unidades && data.unidades.length > 0) {
                    unidadesDisponibles = data.unidades;
                    cargarSesionesGuardadas();
                } else {
                    mostrarMensajeSinUnidades();
                }
            })
            .catch(error => {
                console.error('Error al cargar unidades:', error);
                mostrarMensajeSinUnidades();
            });
    }

    function cargarSesionesGuardadas() {
        fetch('/api/cargar_sesiones')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.sesiones) {
                    sesionesGuardadas = data.sesiones;
                }
                generarFormulariosSesiones();
            })
            .catch(error => {
                console.error('Error al cargar sesiones guardadas:', error);
                generarFormulariosSesiones();
            });
    }

    function mostrarMensajeSinUnidades() {
        mensajeSinUnidades.style.display = 'block';
        form.style.display = 'none';
    }

    function generarFormulariosSesiones() {
        if (!unidadesDisponibles || unidadesDisponibles.length === 0) {
            mostrarMensajeSinUnidades();
            return;
        }

        mensajeSinUnidades.style.display = 'none';
        form.style.display = 'block';
        sesionesContainer.innerHTML = '';

        let contadorSesionGlobal = 1;

        unidadesDisponibles.forEach((unidad, index) => {
            const numeroUnidad = index + 1;
            const sesionesUnidad = unidad.sesiones || 1;
            
            const unidadCard = crearFormularioUnidad(unidad, numeroUnidad, contadorSesionGlobal, sesionesUnidad);
            sesionesContainer.appendChild(unidadCard);
            
            contadorSesionGlobal += sesionesUnidad;
        });

        if (sesionesGuardadas.length > 0) {
            cargarDatosGuardados();
        }
    }

    function crearFormularioUnidad(unidad, numeroUnidad, inicioSesion, totalSesiones) {
        const unidadDiv = document.createElement('div');
        unidadDiv.className = 'unidad-card';
        unidadDiv.dataset.unidad = numeroUnidad;

        unidadDiv.innerHTML = `
            <div class="unidad-header">
                📅 Sesiones para Unidad ${numeroUnidad}: ${unidad.nombre || `Unidad ${numeroUnidad}`}
            </div>
            <div class="unidad-content">
                <div class="info-unidad">
                    <p><strong>Nombre:</strong> ${unidad.nombre || 'N/A'}</p>
                    <p><strong>Sesiones asignadas:</strong> ${totalSesiones}</p>
                    <p><strong>Logro de la unidad:</strong> ${unidad.logro || 'N/A'}</p>
                </div>
                
                <div id="sesiones_unidad_${numeroUnidad}" class="sesiones-unidad">
                    <!-- Las sesiones se generarán aquí -->
                </div>
            </div>
        `;

        const sesionesContainer = unidadDiv.querySelector(`#sesiones_unidad_${numeroUnidad}`);
        for (let i = 0; i < totalSesiones; i++) {
            const numeroSesionGlobal = inicioSesion + i;
            const numeroSesionLocal = i + 1;
            const sesionDiv = crearFormularioSesion(numeroUnidad, numeroSesionLocal, numeroSesionGlobal);
            sesionesContainer.appendChild(sesionDiv);
        }

        return unidadDiv;
    }

    function crearFormularioSesion(numeroUnidad, numeroSesionLocal, numeroSesionGlobal) {
        const sesionDiv = document.createElement('div');
        sesionDiv.className = 'sesion-item';
        sesionDiv.dataset.unidad = numeroUnidad;
        sesionDiv.dataset.sesion = numeroSesionLocal;

        sesionDiv.innerHTML = `
            <div class="sesion-header">
                <span class="sesion-numero">S${numeroSesionGlobal}</span>
                <span>Sesión ${numeroSesionLocal} de la Unidad ${numeroUnidad}</span>
            </div>
            <div class="sesion-content">
                <input type="hidden" name="numero_sesion_unidad_${numeroUnidad}_sesion_${numeroSesionLocal}" value="${numeroSesionGlobal}">
                
                <div class="form-row">
                    <label for="temario_unidad_${numeroUnidad}_sesion_${numeroSesionLocal}">Temario de la Sesión:</label>
                    <textarea id="temario_unidad_${numeroUnidad}_sesion_${numeroSesionLocal}" 
                              name="temario_unidad_${numeroUnidad}_sesion_${numeroSesionLocal}"
                              rows="6" 
                              maxlength="10000"
                              placeholder="Describe el temario y contenido que se desarrollará en esta sesión..."
                              required></textarea>
                </div>
            </div>
        `;

        return sesionDiv;
    }

    function cargarDatosGuardados() {
        sesionesGuardadas.forEach(unidadSes => {
            const numeroUnidad = unidadSes.unidad_numero;
            const sesiones = unidadSes.sesiones || [];
            
            sesiones.forEach((sesion, index) => {
                const numeroSesionLocal = index + 1;
                
                const temarioTextarea = document.getElementById(`temario_unidad_${numeroUnidad}_sesion_${numeroSesionLocal}`);
                
                if (temarioTextarea) temarioTextarea.value = sesion.temario || '';
            });
        });
    }

    function guardarSesiones(event) {
        event.preventDefault();

        const unidadesSesiones = [];
        
        unidadesDisponibles.forEach((unidad, index) => {
            const numeroUnidad = index + 1;
            const totalSesiones = unidad.sesiones || 1;
            const sesionesUnidad = [];
            
            for (let i = 1; i <= totalSesiones; i++) {
                const numeroSesion = document.querySelector(`input[name="numero_sesion_unidad_${numeroUnidad}_sesion_${i}"]`)?.value || '';
                const temario = document.getElementById(`temario_unidad_${numeroUnidad}_sesion_${i}`)?.value || '';
                
                if (temario.trim()) {
                    sesionesUnidad.push({
                        numero_sesion: parseInt(numeroSesion),
                        temario: temario.trim()
                    });
                }
            }
            
            if (sesionesUnidad.length > 0) {
                unidadesSesiones.push({
                    unidad_numero: numeroUnidad,
                    unidad_nombre: unidad.nombre || `Unidad ${numeroUnidad}`,
                    total_sesiones: totalSesiones,
                    sesiones: sesionesUnidad
                });
            }
        });

        if (unidadesSesiones.length === 0) {
            mostrarMensaje('Debes definir al menos una sesión para guardar', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('sesiones_data', JSON.stringify(unidadesSesiones));
        
        fetch('/guardar_sesiones', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarMensaje(data.message, 'exito');
                sesionesGuardadas = unidadesSesiones;
            } else {
                mostrarMensaje(data.message || 'Error al guardar sesiones', 'error');
            }
        })
        .catch(error => {
            mostrarMensaje('Error al guardar sesiones: ' + error.message, 'error');
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
        
        mensaje.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }
});
