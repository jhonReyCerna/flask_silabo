document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-competencias');
    const competenciasContainer = document.getElementById('competencias-container');
    const mensaje = document.getElementById('mensaje');
    const mensajeSinUnidades = document.getElementById('mensaje-sin-unidades');
    
    let unidadesDisponibles = [];
    let competenciasGuardadas = [];
    let contadorGlobalCompetencias = 1; 
    cargarUnidadesYCompetencias();

    form.addEventListener('submit', guardarCompetencias);

    function cargarUnidadesYCompetencias() {
        fetch('/api/cargar_unidades_para_competencias')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.unidades && data.unidades.length > 0) {
                    unidadesDisponibles = data.unidades;
                    cargarCompetenciasGuardadas();
                } else {
                    mostrarMensajeSinUnidades();
                }
            })
            .catch(error => {
                console.error('Error al cargar unidades:', error);
                mostrarMensajeSinUnidades();
            });
    }

    function cargarCompetenciasGuardadas() {
        fetch('/api/cargar_competencias')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.competencias) {
                    competenciasGuardadas = data.competencias;
                    actualizarContadorGlobal();
                }
                generarFormulariosCompetencias();
            })
            .catch(error => {
                console.error('Error al cargar competencias guardadas:', error);
                generarFormulariosCompetencias();
            });
    }

    function actualizarContadorGlobal() {
        let maxCodigo = 0;
        competenciasGuardadas.forEach(unidadComp => {
            if (unidadComp.competencias) {
                unidadComp.competencias.forEach(comp => {
                    if (comp.codigo) {
                        const match = comp.codigo.match(/(\d+)$/);
                        if (match) {
                            maxCodigo = Math.max(maxCodigo, parseInt(match[1]));
                        }
                    }
                });
            }
        });
        contadorGlobalCompetencias = maxCodigo + 1;
    }

    function mostrarMensajeSinUnidades() {
        mensajeSinUnidades.style.display = 'block';
        form.style.display = 'none';
    }

    function generarFormulariosCompetencias() {
        if (!unidadesDisponibles || unidadesDisponibles.length === 0) {
            mostrarMensajeSinUnidades();
            return;
        }

        mensajeSinUnidades.style.display = 'none';
        form.style.display = 'block';
        competenciasContainer.innerHTML = '';

        unidadesDisponibles.forEach((unidad, index) => {
            const unidadCard = crearFormularioUnidad(unidad, index + 1);
            competenciasContainer.appendChild(unidadCard);
        });

        if (competenciasGuardadas.length > 0) {
            cargarDatosGuardados();
        }
    }

    function crearFormularioUnidad(unidad, numero) {
        const unidadDiv = document.createElement('div');
        unidadDiv.className = 'unidad-card';
        unidadDiv.dataset.unidad = numero;

        unidadDiv.innerHTML = `
            <div class="unidad-header">
                🎯 Competencias para Unidad ${numero}: ${unidad.nombre || `Unidad ${numero}`}
            </div>
            <div class="unidad-content">
                <div class="info-competencias">
                    <p><strong>Sesiones:</strong> ${unidad.sesiones || 'N/A'}</p>
                    <p><strong>Logro:</strong> ${unidad.logro || 'N/A'}</p>
                </div>
                
                <div class="competencias-controls">
                    <label>Número de competencias (1-4):</label>
                    <select id="num_competencias_${numero}" class="select-num-competencias" data-unidad="${numero}">
                        <option value="1">1 competencia</option>
                        <option value="2">2 competencias</option>
                        <option value="3">3 competencias</option>
                        <option value="4">4 competencias</option>
                    </select>
                    <button type="button" class="btn btn-secondary" onclick="generarCompetenciasUnidad(${numero})">
                        Generar Formularios
                    </button>
                </div>
                
                <div id="competencias_unidad_${numero}" class="competencias-unidad">
                    <!-- Las competencias se generarán aquí -->
                </div>
            </div>
        `;

        return unidadDiv;
    }

    window.generarCompetenciasUnidad = function(numeroUnidad) {
        const selectNum = document.getElementById(`num_competencias_${numeroUnidad}`);
        const numCompetencias = parseInt(selectNum.value);
        const container = document.getElementById(`competencias_unidad_${numeroUnidad}`);
        
        container.innerHTML = '';
        
        for (let i = 1; i <= numCompetencias; i++) {
            const competenciaDiv = crearFormularioCompetencia(numeroUnidad, i);
            container.appendChild(competenciaDiv);
        }
        
        mostrarMensaje(`Formularios de competencias generados para la Unidad ${numeroUnidad}`, 'exito');
    };

    function crearFormularioCompetencia(numeroUnidad, numeroCompetencia) {
        const competenciaDiv = document.createElement('div');
        competenciaDiv.className = 'competencia-item';
        competenciaDiv.dataset.unidad = numeroUnidad;
        competenciaDiv.dataset.competencia = numeroCompetencia;

        const codigo = `RAE${contadorGlobalCompetencias} (CE${contadorGlobalCompetencias})`;
        contadorGlobalCompetencias++;

        competenciaDiv.innerHTML = `
            <div class="competencia-header">
                Competencia ${numeroCompetencia} - ${codigo}
            </div>
            <div class="competencia-content">
                <input type="hidden" name="codigo_unidad_${numeroUnidad}_comp_${numeroCompetencia}" value="${codigo}">
                
                <div class="form-row">
                    <label for="titulo_unidad_${numeroUnidad}_comp_${numeroCompetencia}">Título:</label>
                    <input type="text" 
                           id="titulo_unidad_${numeroUnidad}_comp_${numeroCompetencia}" 
                           name="titulo_unidad_${numeroUnidad}_comp_${numeroCompetencia}"
                           placeholder="Título de la competencia..." 
                           required>
                </div>
                
                <div class="form-row">
                    <label for="descripcion_unidad_${numeroUnidad}_comp_${numeroCompetencia}">Descripción:</label>
                    <textarea id="descripcion_unidad_${numeroUnidad}_comp_${numeroCompetencia}" 
                              name="descripcion_unidad_${numeroUnidad}_comp_${numeroCompetencia}"
                              rows="3" 
                              placeholder="Descripción detallada de la competencia..."
                              required></textarea>
                </div>
            </div>
        `;

        return competenciaDiv;
    }

    function cargarDatosGuardados() {
        competenciasGuardadas.forEach(unidadComp => {
            const numeroUnidad = unidadComp.unidad_numero;
            const competencias = unidadComp.competencias || [];
            
            if (competencias.length > 0) {
                const selectNum = document.getElementById(`num_competencias_${numeroUnidad}`);
                if (selectNum) {
                    selectNum.value = competencias.length.toString();
                    generarCompetenciasUnidad(numeroUnidad);
                    
                    setTimeout(() => {
                        competencias.forEach((comp, index) => {
                            const numeroCompetencia = index + 1;
                            const codigoInput = document.querySelector(`input[name="codigo_unidad_${numeroUnidad}_comp_${numeroCompetencia}"]`);
                            const tituloInput = document.getElementById(`titulo_unidad_${numeroUnidad}_comp_${numeroCompetencia}`);
                            const descripcionTextarea = document.getElementById(`descripcion_unidad_${numeroUnidad}_comp_${numeroCompetencia}`);
                            
                            if (codigoInput) codigoInput.value = comp.codigo || '';
                            if (tituloInput) tituloInput.value = comp.titulo || '';
                            if (descripcionTextarea) descripcionTextarea.value = comp.descripcion || '';
                            
                            const competenciaDiv = codigoInput?.closest('.competencia-item');
                            if (competenciaDiv) {
                                const header = competenciaDiv.querySelector('.competencia-header');
                                if (header) {
                                    header.textContent = `Competencia ${numeroCompetencia} - ${comp.codigo}`;
                                }
                            }
                        });
                    }, 100);
                }
            }
        });
    }

    function guardarCompetencias(event) {
        event.preventDefault();

        // Recopilar datos de todas las competencias
        const unidadesCompetencias = [];
        
        unidadesDisponibles.forEach((unidad, index) => {
            const numeroUnidad = index + 1;
            const competenciasContainer = document.getElementById(`competencias_unidad_${numeroUnidad}`);
            
            if (competenciasContainer && competenciasContainer.children.length > 0) {
                const competenciasUnidad = [];
                
                Array.from(competenciasContainer.children).forEach((competenciaDiv, compIndex) => {
                    const numeroCompetencia = compIndex + 1;
                    
                    const codigo = document.querySelector(`input[name="codigo_unidad_${numeroUnidad}_comp_${numeroCompetencia}"]`)?.value || '';
                    const titulo = document.getElementById(`titulo_unidad_${numeroUnidad}_comp_${numeroCompetencia}`)?.value || '';
                    const descripcion = document.getElementById(`descripcion_unidad_${numeroUnidad}_comp_${numeroCompetencia}`)?.value || '';
                    
                    if (titulo.trim() && descripcion.trim()) {
                        competenciasUnidad.push({
                            codigo: codigo,
                            titulo: titulo.trim(),
                            descripcion: descripcion.trim()
                        });
                    }
                });
                
                if (competenciasUnidad.length > 0) {
                    unidadesCompetencias.push({
                        unidad_numero: numeroUnidad,
                        unidad_nombre: unidad.nombre || `Unidad ${numeroUnidad}`,
                        competencias: competenciasUnidad
                    });
                }
            }
        });

        // Validar que hay al menos una competencia
        if (unidadesCompetencias.length === 0) {
            mostrarMensaje('Debes definir al menos una competencia para guardar', 'error');
            return;
        }

        // Enviar datos al servidor
        const formData = new FormData();
        formData.append('competencias_data', JSON.stringify(unidadesCompetencias));
        
        fetch('/guardar_competencias', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarMensaje(data.message, 'exito');
                competenciasGuardadas = unidadesCompetencias;
            } else {
                mostrarMensaje(data.message || 'Error al guardar competencias', 'error');
            }
        })
        .catch(error => {
            mostrarMensaje('Error al guardar competencias: ' + error.message, 'error');
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
        
        // Hacer scroll hacia el mensaje
        mensaje.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }
});
