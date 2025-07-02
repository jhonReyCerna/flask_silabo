document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-general');
    const horasTeoria = document.getElementById('horas_teoria_entry');
    const horasPractica = document.getElementById('horas_practica_entry');
    const creditos = document.getElementById('creditos_entry');
    const mensaje = document.getElementById('mensaje');

    function calcularCreditos() {
        const teoria = parseInt(horasTeoria.value) || 0;
        const practica = parseInt(horasPractica.value) || 0;
        const totalHoras = teoria + practica;
        
        const totalCreditos = Math.floor(totalHoras / 4);
        creditos.value = totalCreditos;
    }

    horasTeoria.addEventListener('input', calcularCreditos);
    horasPractica.addEventListener('input', calcularCreditos);

    calcularCreditos();

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
