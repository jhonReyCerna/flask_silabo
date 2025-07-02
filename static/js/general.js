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

    function manejarHorarioPersonalizado() {
        if (horarioSelect.value === 'Horario: Personalizado') {
            horarioPersonalizado.style.display = 'block';
        } else {
            horarioPersonalizado.style.display = 'none';
            diasCheckboxes.forEach(checkbox => checkbox.checked = false);
        }
    }

    function manejarModalidadVirtual() {
        if (modalidadSelect.value === 'Virtual') {
            linkVirtual.style.display = 'block';
            linkVirtualInput.required = true;
        } else {
            linkVirtual.style.display = 'none';
            linkVirtualInput.required = false;
            linkVirtualInput.value = ''; 
        }
    }

    function validarCorreo(email) {
        if (!email) return false;
        
        const dominiosPermitidos = ['@gmail.com', '@unacvirtual.edu.pe'];
        const emailLowerCase = email.toLowerCase();
        
        return dominiosPermitidos.some(dominio => emailLowerCase.endsWith(dominio));
    }

    function mostrarValidacionCorreo(esValido) {
        const mensajeAnterior = document.getElementById('mensaje-correo');
        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }
        
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
        
        correoInput.parentNode.appendChild(mensaje);
    }

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

    horarioSelect.addEventListener('change', manejarHorarioPersonalizado);
    modalidadSelect.addEventListener('change', manejarModalidadVirtual);
    
    correoInput.addEventListener('input', function() {
        const email = this.value.trim();
        if (email) {
            const esValido = validarCorreo(email);
            mostrarValidacionCorreo(esValido);
        } else {
            const mensajeAnterior = document.getElementById('mensaje-correo');
            if (mensajeAnterior) {
                mensajeAnterior.remove();
            }
        }
    });
    
    diasCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function(event) {
            const diasSeleccionados = Array.from(diasCheckboxes).filter(cb => cb.checked);
            
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
        
        const email = correoInput.value.trim();
        if (!validarCorreo(email)) {
            mostrarMensaje('❌ El correo debe ser @gmail.com o @unacvirtual.edu.pe', 'error');
            return;
        }
        
        if (horarioSelect.value === 'Horario: Personalizado') {
            const diasSeleccionados = Array.from(diasCheckboxes).filter(cb => cb.checked);
            if (diasSeleccionados.length < 2 || diasSeleccionados.length > 4) {
                mostrarMensaje('❌ Debe seleccionar entre 2 y 4 días para el horario personalizado', 'error');
                return;
            }
        }
        
        if (modalidadSelect.value === 'Virtual') {
            const linkVirtual = linkVirtualInput.value.trim();
            if (!linkVirtual) {
                mostrarMensaje('❌ Debe ingresar el link de la clase virtual', 'error');
                return;
            }
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
