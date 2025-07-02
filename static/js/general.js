document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-general');
    const horasTeoria = document.getElementById('horas_teoria_entry');
    const horasPractica = document.getElementById('horas_practica_entry');
    const creditos = document.getElementById('creditos_entry');
    const mensaje = document.getElementById('mensaje');
    const horarioSelect = document.getElementById('horario_entry');
    const horarioPersonalizado = document.getElementById('horario-personalizado');
    const diasCheckboxes = document.querySelectorAll('input[name="dias_personalizados"]');
    const mensajeDias = document.getElementById('mensaje-dias');
    const modalidadSelect = document.getElementById('modalidad_entry');
    const linkVirtual = document.getElementById('link-virtual');
    const linkVirtualInput = document.getElementById('link_virtual_entry');
    const correoInput = document.getElementById('correo_entry');

    function calcularCreditos() {
        const teoria = parseInt(horasTeoria.value) || 0;
        const practica = parseInt(horasPractica.value) || 0;
        const totalHoras = teoria + practica;
        
        const totalCreditos = Math.floor(totalHoras / 4);
        creditos.value = totalCreditos;
    }

    // Función para manejar la visibilidad del horario personalizado
    function manejarHorarioPersonalizado() {
        if (horarioSelect.value === 'Horario: Personalizado') {
            horarioPersonalizado.style.display = 'block';
        } else {
            horarioPersonalizado.style.display = 'none';
            // Limpiar selecciones de días cuando no es personalizado
            diasCheckboxes.forEach(checkbox => checkbox.checked = false);
        }
    }

    // Función para manejar la visibilidad del link virtual
    function manejarModalidadVirtual() {
        if (modalidadSelect.value === 'Virtual') {
            linkVirtual.style.display = 'block';
            linkVirtualInput.required = true;
        } else {
            linkVirtual.style.display = 'none';
            linkVirtualInput.required = false;
            linkVirtualInput.value = ''; // Limpiar el campo cuando no es virtual
        }
    }

    // Función para validar correo con dominios específicos
    function validarCorreo(email) {
        if (!email) return false;
        
        const dominiosPermitidos = ['@gmail.com', '@unacvirtual.edu.pe'];
        const emailLowerCase = email.toLowerCase();
        
        return dominiosPermitidos.some(dominio => emailLowerCase.endsWith(dominio));
    }

    // Función para mostrar mensaje de validación de correo
    function mostrarValidacionCorreo(esValido) {
        // Remover mensaje anterior si existe
        const mensajeAnterior = document.getElementById('mensaje-correo');
        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }
        
        // Crear nuevo mensaje
        const mensaje = document.createElement('small');
        mensaje.id = 'mensaje-correo';
        mensaje.style.display = 'block';
        mensaje.style.marginTop = '5px';
        mensaje.style.fontSize = '12px';
        
        if (esValido) {
            mensaje.textContent = '✅ Correo válido';
            mensaje.style.color = '#28a745';
        } else {
            mensaje.textContent = '❌ Solo se permiten correos @gmail.com o @unacvirtual.edu.pe';
            mensaje.style.color = '#dc3545';
        }
        
        // Insertar después del input de correo
        correoInput.parentNode.appendChild(mensaje);
    }

    // Función para validar selección de días
    function validarSeleccionDias() {
        const diasSeleccionados = Array.from(diasCheckboxes).filter(cb => cb.checked);
        const cantidad = diasSeleccionados.length;
        
        if (horarioSelect.value === 'Horario: Personalizado') {
            if (cantidad < 2) {
                mensajeDias.textContent = `Selecciona al menos 2 días (tienes ${cantidad})`;
                mensajeDias.style.color = '#dc3545';
                return false;
            } else if (cantidad > 4) {
                mensajeDias.textContent = `Máximo 4 días permitidos (tienes ${cantidad})`;
                mensajeDias.style.color = '#dc3545';
                // Desmarcar el último checkbox seleccionado
                event.target.checked = false;
                return false;
            } else {
                const diasNombres = diasSeleccionados.map(cb => cb.value).join(', ');
                mensajeDias.textContent = `Días seleccionados: ${diasNombres}`;
                mensajeDias.style.color = '#28a745';
                return true;
            }
        }
        return true;
    }

    // Event listeners
    horarioSelect.addEventListener('change', manejarHorarioPersonalizado);
    modalidadSelect.addEventListener('change', manejarModalidadVirtual);
    
    // Validación de correo en tiempo real
    correoInput.addEventListener('input', function() {
        const email = this.value.trim();
        if (email) {
            const esValido = validarCorreo(email);
            mostrarValidacionCorreo(esValido);
        } else {
            // Remover mensaje si el campo está vacío
            const mensajeAnterior = document.getElementById('mensaje-correo');
            if (mensajeAnterior) {
                mensajeAnterior.remove();
            }
        }
    });
    
    diasCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function(event) {
            const diasSeleccionados = Array.from(diasCheckboxes).filter(cb => cb.checked);
            
            // Si se intenta seleccionar más de 4, no permitir
            if (diasSeleccionados.length > 4) {
                event.target.checked = false;
                validarSeleccionDias();
                return;
            }
            
            validarSeleccionDias();
        });
    });

    horasTeoria.addEventListener('input', calcularCreditos);
    horasPractica.addEventListener('input', calcularCreditos);

    // Inicializar
    calcularCreditos();
    manejarHorarioPersonalizado();
    manejarModalidadVirtual();

    function mostrarMensaje(texto, tipo = 'info') {
        mensaje.style.display = 'block';
        mensaje.className = `mensaje ${tipo}`;
        mensaje.textContent = texto;
        
        setTimeout(() => {
            mensaje.style.display = 'none';
        }, 5000);
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar correo antes de enviar
        const email = correoInput.value.trim();
        if (!validarCorreo(email)) {
            mostrarMensaje('❌ El correo debe ser @gmail.com o @unacvirtual.edu.pe', 'error');
            return;
        }
        
        // Validar horario personalizado antes de enviar
        if (horarioSelect.value === 'Horario: Personalizado') {
            const diasSeleccionados = Array.from(diasCheckboxes).filter(cb => cb.checked);
            if (diasSeleccionados.length < 2 || diasSeleccionados.length > 4) {
                mostrarMensaje('❌ Debe seleccionar entre 2 y 4 días para el horario personalizado', 'error');
                return;
            }
        }
        
        // Validar link virtual si se seleccionó modalidad virtual
        if (modalidadSelect.value === 'Virtual') {
            const linkVirtual = linkVirtualInput.value.trim();
            if (!linkVirtual) {
                mostrarMensaje('❌ Debe ingresar el link de la clase virtual', 'error');
                return;
            }
            // Validar que sea una URL válida
            try {
                new URL(linkVirtual);
            } catch {
                mostrarMensaje('❌ El link de la clase virtual debe ser una URL válida', 'error');
                return;
            }
        }
        
        mostrarMensaje('Guardando datos...', 'info');
        
        const formData = new FormData(form);
        
        fetch(form.action, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarMensaje('✅ Datos guardados correctamente', 'success');
                console.log('Datos guardados:', data.datos);
            } else {
                mostrarMensaje('❌ Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarMensaje('❌ Error de conexión al guardar los datos', 'error');
        });
    });

    fetch('/api/cargar_general')
        .then(response => response.json())
        .then(data => {
            if (data && Object.keys(data).length > 0) {
                console.log('Datos cargados:', data);
                calcularCreditos();
            }
        })
        .catch(error => {
            console.error('Error al cargar datos:', error);
        });
});
