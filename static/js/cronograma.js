document.addEventListener('DOMContentLoaded', function() {
    let datosGeneral = null;
    let datosUnidades = null;
    let cronogramaGuardado = null;
    
    // Elementos del DOM
    const mensajeSinDatos = document.getElementById('mensaje-sin-datos');
    const formCronograma = document.getElementById('form-cronograma');
    const infoResumen = document.getElementById('info-resumen');
    const fechaInicioInput = document.getElementById('fecha-inicio');
    const btnGenerar = document.getElementById('generar-cronograma');
    const cronogramaContainer = document.getElementById('cronograma-container');
    const formButtons = document.getElementById('form-buttons');
    const mensaje = document.getElementById('mensaje');
    
    // Cargar datos al iniciar
    cargarDatos();
    
    // Event listeners
    btnGenerar.addEventListener('click', generarCronograma);
    document.getElementById('form-cronograma').addEventListener('submit', guardarCronograma);
    fechaInicioInput.addEventListener('change', function() {
        // Ocultar cronograma cuando se cambia la fecha
        cronogramaContainer.style.display = 'none';
        formButtons.style.display = 'none';
    });
    
    async function cargarDatos() {
        try {
            // Cargar datos generales
            const responseGeneral = await fetch('/api/cargar_general');
            const dataGeneral = await responseGeneral.json();
            
            // Cargar datos de unidades
            const responseUnidades = await fetch('/api/cargar_unidades_para_cronograma');
            const dataUnidades = await responseUnidades.json();
            
            // Cargar cronograma guardado (si existe)
            const responseCronograma = await fetch('/api/cargar_cronograma');
            const dataCronograma = await responseCronograma.json();
            
            // Asignar datos con manejo de diferentes formatos
            datosGeneral = dataGeneral.data || dataGeneral;
            datosUnidades = dataUnidades.data || dataUnidades;
            cronogramaGuardado = dataCronograma.data || dataCronograma;
            
            verificarDatosYMostrarFormulario();
            
        } catch (error) {
            console.error('Error cargando datos:', error);
            mostrarMensaje('Error al cargar los datos', 'error');
        }
    }
    
    function verificarDatosYMostrarFormulario() {
        // Extraer días del horario
        const diasSeleccionados = extraerDiasDelHorario();
        
        // Verificar si tenemos datos suficientes
        const tieneHorario = diasSeleccionados && diasSeleccionados.length > 0;
        const tieneUnidades = datosUnidades && datosUnidades.length > 0;
        const tieneSesiones = tieneUnidades && datosUnidades.some(unidad => unidad.sesiones && unidad.sesiones > 0);
        
        if (!tieneHorario || !tieneUnidades || !tieneSesiones) {
            mensajeSinDatos.style.display = 'block';
            formCronograma.style.display = 'none';
            return;
        }
        
        // Asignar días seleccionados para uso posterior
        datosGeneral.dias_seleccionados = diasSeleccionados;
        
        // Mostrar formulario y cargar información
        mensajeSinDatos.style.display = 'none';
        formCronograma.style.display = 'block';
        
        cargarInfoResumen();
        
        // Si hay cronograma guardado, cargar fecha y generar automáticamente
        if (cronogramaGuardado && cronogramaGuardado.fecha_inicio) {
            fechaInicioInput.value = cronogramaGuardado.fecha_inicio;
            generarCronograma();
        }
    }
    
    function extraerDiasDelHorario() {
        if (!datosGeneral || !datosGeneral.horario) {
            return [];
        }
        
        const horario = datosGeneral.horario;
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const diasSeleccionados = [];
        
        // Extraer días del texto del horario
        diasSemana.forEach((dia, index) => {
            if (horario.includes(dia)) {
                diasSeleccionados.push(index);
            }
        });
        
        return diasSeleccionados;
    }
    
    function cargarInfoResumen() {
        // Obtener días seleccionados del horario
        const diasSeleccionados = datosGeneral.dias_seleccionados || [];
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        
        let diasTexto = '';
        if (diasSeleccionados.length > 0) {
            diasTexto = diasSeleccionados.map(dia => diasSemana[dia]).join(', ');
        } else {
            // Fallback: mostrar el horario tal como está guardado
            diasTexto = datosGeneral.horario || 'No definido';
        }
        
        const totalSesiones = datosUnidades.reduce((total, unidad) => total + (unidad.sesiones || 0), 0);
        
        // Calcular horas por sesión según cantidad de días
        const numDias = diasSeleccionados.length;
        let horasPorSesion = 6; // Default
        switch (numDias) {
            case 2: horasPorSesion = 9; break;
            case 3: horasPorSesion = 6; break;
            case 4: horasPorSesion = 4; break;
            default: horasPorSesion = 6; break;
        }
        
        infoResumen.innerHTML = `
            <h4>📊 Resumen del Cronograma</h4>
            <ul>
                <li><strong>Días de clase:</strong> ${diasTexto}</li>
                <li><strong>Horas por sesión:</strong> ${horasPorSesion}h</li>
                <li><strong>Total de sesiones:</strong> ${totalSesiones}</li>
                <li><strong>Distribución por unidad:</strong></li>
            </ul>
            <ul style="margin-left: 20px;">
                ${datosUnidades.map(unidad => 
                    `<li>Unidad ${unidad.numero}: ${unidad.nombre} - ${unidad.sesiones} sesiones</li>`
                ).join('')}
            </ul>
        `;
    }
    
    function generarCronograma() {
        const fechaInicio = fechaInicioInput.value;
        if (!fechaInicio) {
            mostrarMensaje('Por favor selecciona una fecha de inicio', 'error');
            return;
        }
        
        const cronograma = calcularCronograma(fechaInicio);
        mostrarTablaCronograma(cronograma);
    }
    
    function calcularCronograma(fechaInicio) {
        const fecha = new Date(fechaInicio + 'T00:00:00');
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        
        // Usar los días seleccionados ya extraídos
        const diasSeleccionados = datosGeneral.dias_seleccionados || [];
        
        // Calcular horas por sesión según cantidad de días
        const numDias = diasSeleccionados.length;
        let horasPorSesion = 6; // Default
        switch (numDias) {
            case 2: horasPorSesion = 9; break;
            case 3: horasPorSesion = 6; break;
            case 4: horasPorSesion = 4; break;
            default: horasPorSesion = 6; break;
        }
        
        const cronograma = [];
        let sesionNumero = 1;
        
        // Iterar por cada unidad
        datosUnidades.forEach((unidad) => {
            const sesionesUnidad = unidad.sesiones || 0;
            
            // Generar sesiones para esta unidad
            for (let i = 0; i < sesionesUnidad; i++) {
                // Encontrar la siguiente fecha que coincida con los días seleccionados
                while (!diasSeleccionados.includes(fecha.getDay())) {
                    fecha.setDate(fecha.getDate() + 1);
                }
                
                cronograma.push({
                    sesion: sesionNumero,
                    unidad: unidad.numero || (datosUnidades.indexOf(unidad) + 1),
                    nombreUnidad: unidad.nombre || `Unidad ${unidad.numero || (datosUnidades.indexOf(unidad) + 1)}`,
                    dia: diasSemana[fecha.getDay()],
                    fecha: formatearFecha(new Date(fecha)),
                    horas: horasPorSesion
                });
                
                sesionNumero++;
                fecha.setDate(fecha.getDate() + 1);
            }
        });
        
        return cronograma;
    }
    
    function formatearFecha(fecha) {
        const opciones = { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        };
        return fecha.toLocaleDateString('es-ES', opciones);
    }
    
    function mostrarTablaCronograma(cronograma) {
        const cronogramaTbody = document.getElementById('cronograma-tbody');
        cronogramaTbody.innerHTML = '';
        
        cronograma.forEach(item => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td class="sesion-numero">${item.sesion}</td>
                <td>
                    <div><strong>Unidad ${item.unidad}</strong></div>
                    <div class="unidad-info">${item.nombreUnidad}</div>
                </td>
                <td class="dia-nombre">${item.dia}</td>
                <td class="fecha-valor">${item.fecha}</td>
                <td class="horas-valor">${item.horas}h</td>
            `;
            cronogramaTbody.appendChild(fila);
        });
        
        // Mostrar el contenedor y botones
        cronogramaContainer.style.display = 'block';
        formButtons.style.display = 'block';
        
        mostrarMensaje('Cronograma generado exitosamente', 'exito');
    }
    
    async function guardarCronograma(event) {
        event.preventDefault();
        
        const fechaInicio = fechaInicioInput.value;
        if (!fechaInicio) {
            mostrarMensaje('Por favor selecciona una fecha de inicio', 'error');
            return;
        }
        
        const cronograma = calcularCronograma(fechaInicio);
        
        try {
            const formData = new FormData();
            formData.append('fecha_inicio', fechaInicio);
            formData.append('cronograma', JSON.stringify(cronograma));
            
            const response = await fetch('/guardar_cronograma', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                mostrarMensaje(data.message, 'exito');
                cronogramaGuardado = {
                    fecha_inicio: fechaInicio,
                    cronograma: cronograma
                };
            } else {
                mostrarMensaje(data.message, 'error');
            }
            
        } catch (error) {
            console.error('Error al guardar cronograma:', error);
            mostrarMensaje('Error al guardar el cronograma', 'error');
        }
    }
    
    function mostrarMensaje(texto, tipo) {
        mensaje.textContent = texto;
        mensaje.className = `mensaje ${tipo}`;
        mensaje.style.display = 'block';
        
        setTimeout(() => {
            mensaje.style.display = 'none';
        }, 5000);
    }
});