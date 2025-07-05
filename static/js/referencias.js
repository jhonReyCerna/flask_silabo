document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-referencias');
    const mensaje = document.getElementById('mensaje');
    
    let referenciasData = {
        libros: [],
        articulos: [],
        web: []
    };
    
    let contadores = {
        libros: 1,
        articulos: 1,
        web: 1
    };

    cargarReferenciasGuardadas();

    form.addEventListener('submit', guardarReferencias);

    function cargarReferenciasGuardadas() {
        fetch('/api/cargar_referencias')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.referencias) {
                    referenciasData = data.referencias;
                    actualizarContadores();
                    mostrarReferenciasGuardadas();
                } else {
                    agregarReferencia('libros');
                    agregarReferencia('articulos');
                    agregarReferencia('web');
                }
            })
            .catch(error => {
                console.error('Error al cargar referencias:', error);
                agregarReferencia('libros');
                agregarReferencia('articulos');
                agregarReferencia('web');
            });
    }

    function actualizarContadores() {
        contadores.libros = referenciasData.libros.length + 1;
        contadores.articulos = referenciasData.articulos.length + 1;
        contadores.web = referenciasData.web.length + 1;
    }

    function mostrarReferenciasGuardadas() {
        document.getElementById('libros-lista').innerHTML = '';
        document.getElementById('articulos-lista').innerHTML = '';
        document.getElementById('web-lista').innerHTML = '';

        referenciasData.libros.forEach((libro, index) => {
            crearFormularioReferencia('libros', index + 1, libro);
        });

        referenciasData.articulos.forEach((articulo, index) => {
            crearFormularioReferencia('articulos', index + 1, articulo);
        });

        referenciasData.web.forEach((web, index) => {
            crearFormularioReferencia('web', index + 1, web);
        });
    }

    window.agregarReferencia = function(tipo) {
        const numero = contadores[tipo];
        crearFormularioReferencia(tipo, numero);
        contadores[tipo]++;
    };

    function crearFormularioReferencia(tipo, numero, datos = null) {
        const container = document.getElementById(`${tipo}-lista`);
        const referenciaDiv = document.createElement('div');
        referenciaDiv.className = 'referencia-item';
        referenciaDiv.id = `${tipo}-${numero}`;

        let campos = '';
        let tipoSingular = tipo === 'libros' ? 'libro' : (tipo === 'articulos' ? 'articulo' : 'web');
        
        if (tipo === 'libros') {
            campos = `
                <div class="referencia-campos libro">
                    <div class="form-row">
                        <label for="${tipo}-apellido-${numero}">Apellido del Autor:</label>
                        <input type="text" id="${tipo}-apellido-${numero}" name="${tipo}[${numero-1}][apellido]" 
                               value="${datos ? datos.apellido || '' : ''}" placeholder="Ej: García" required>
                    </div>
                    <div class="form-row">
                        <label for="${tipo}-inicial-${numero}">Inicial del Nombre:</label>
                        <input type="text" id="${tipo}-inicial-${numero}" name="${tipo}[${numero-1}][inicial]" 
                               value="${datos ? datos.inicial || '' : ''}" placeholder="Ej: J." required>
                    </div>
                    <div class="form-row">
                        <label for="${tipo}-año-${numero}">Año:</label>
                        <input type="number" id="${tipo}-año-${numero}" name="${tipo}[${numero-1}][año]" 
                               value="${datos ? datos.año || '' : ''}" placeholder="2024" min="1900" max="2030" required>
                    </div>
                    <div class="form-row">
                        <label for="${tipo}-editorial-${numero}">Editorial:</label>
                        <input type="text" id="${tipo}-editorial-${numero}" name="${tipo}[${numero-1}][editorial]" 
                               value="${datos ? datos.editorial || '' : ''}" placeholder="Ej: McGraw-Hill" required>
                    </div>
                    <div class="form-row full-width">
                        <label for="${tipo}-titulo-${numero}">Título del Libro:</label>
                        <input type="text" id="${tipo}-titulo-${numero}" name="${tipo}[${numero-1}][titulo]" 
                               value="${datos ? datos.titulo || '' : ''}" placeholder="Título completo del libro" required>
                    </div>
                </div>
            `;
        } else if (tipo === 'articulos') {
            campos = `
                <div class="referencia-campos articulo">
                    <div class="form-row">
                        <label for="${tipo}-apellido1-${numero}">Apellido Autor 1:</label>
                        <input type="text" id="${tipo}-apellido1-${numero}" name="${tipo}[${numero-1}][apellido1]" 
                               value="${datos ? datos.apellido1 || '' : ''}" placeholder="Ej: García" required>
                    </div>
                    <div class="form-row">
                        <label for="${tipo}-inicial1-${numero}">Inicial Autor 1:</label>
                        <input type="text" id="${tipo}-inicial1-${numero}" name="${tipo}[${numero-1}][inicial1]" 
                               value="${datos ? datos.inicial1 || '' : ''}" placeholder="Ej: J." required>
                    </div>
                    <div class="form-row">
                        <label for="${tipo}-apellido2-${numero}">Apellido Autor 2:</label>
                        <input type="text" id="${tipo}-apellido2-${numero}" name="${tipo}[${numero-1}][apellido2]" 
                               value="${datos ? datos.apellido2 || '' : ''}" placeholder="Ej: López (opcional)">
                    </div>
                    <div class="form-row">
                        <label for="${tipo}-inicial2-${numero}">Inicial Autor 2:</label>
                        <input type="text" id="${tipo}-inicial2-${numero}" name="${tipo}[${numero-1}][inicial2]" 
                               value="${datos ? datos.inicial2 || '' : ''}" placeholder="Ej: M. (opcional)">
                    </div>
                    <div class="form-row">
                        <label for="${tipo}-año-${numero}">Año:</label>
                        <input type="number" id="${tipo}-año-${numero}" name="${tipo}[${numero-1}][año]" 
                               value="${datos ? datos.año || '' : ''}" placeholder="2024" min="1900" max="2030" required>
                    </div>
                    <div class="form-row">
                        <label for="${tipo}-revista-${numero}">Nombre de la Revista:</label>
                        <input type="text" id="${tipo}-revista-${numero}" name="${tipo}[${numero-1}][revista]" 
                               value="${datos ? datos.revista || '' : ''}" placeholder="Ej: Journal of Science" required>
                    </div>
                    <div class="form-row">
                        <label for="${tipo}-volumen-${numero}">Volumen:</label>
                        <input type="text" id="${tipo}-volumen-${numero}" name="${tipo}[${numero-1}][volumen]" 
                               value="${datos ? datos.volumen || '' : ''}" placeholder="Ej: 15" required>
                    </div>
                    <div class="form-row">
                        <label for="${tipo}-numero-${numero}">Número:</label>
                        <input type="text" id="${tipo}-numero-${numero}" name="${tipo}[${numero-1}][numero]" 
                               value="${datos ? datos.numero || '' : ''}" placeholder="Ej: 3" required>
                    </div>
                    <div class="form-row">
                        <label for="${tipo}-paginas-${numero}">Páginas:</label>
                        <input type="text" id="${tipo}-paginas-${numero}" name="${tipo}[${numero-1}][paginas]" 
                               value="${datos ? datos.paginas || '' : ''}" placeholder="Ej: 25-40" required>
                    </div>
                    <div class="form-row">
                        <label for="${tipo}-doi-${numero}">DOI:</label>
                        <input type="url" id="${tipo}-doi-${numero}" name="${tipo}[${numero-1}][doi]" 
                               value="${datos ? datos.doi || '' : ''}" placeholder="https://doi.org/10.1000/xxxxx" required>
                    </div>
                    <div class="form-row full-width">
                        <label for="${tipo}-titulo-${numero}">Título del Artículo:</label>
                        <input type="text" id="${tipo}-titulo-${numero}" name="${tipo}[${numero-1}][titulo]" 
                               value="${datos ? datos.titulo || '' : ''}" placeholder="Título completo del artículo" required>
                    </div>
                </div>
            `;
        } else if (tipo === 'web') {
            campos = `
                <div class="referencia-campos web">
                    <div class="form-row">
                        <label for="${tipo}-autor-${numero}">Autor:</label>
                        <input type="text" id="${tipo}-autor-${numero}" name="${tipo}[${numero-1}][autor]" 
                               value="${datos ? datos.autor || '' : ''}" placeholder="Ej: García, J." required>
                    </div>
                    <div class="form-row">
                        <label for="${tipo}-año-${numero}">Año:</label>
                        <input type="number" id="${tipo}-año-${numero}" name="${tipo}[${numero-1}][año]" 
                               value="${datos ? datos.año || '' : ''}" placeholder="2024" min="1900" max="2030" required>
                    </div>
                    <div class="form-row">
                        <label for="${tipo}-dia-${numero}">Día:</label>
                        <input type="number" id="${tipo}-dia-${numero}" name="${tipo}[${numero-1}][dia]" 
                               value="${datos ? datos.dia || '' : ''}" placeholder="15" min="1" max="31" required>
                    </div>
                    <div class="form-row">
                        <label for="${tipo}-mes-${numero}">Mes:</label>
                        <select id="${tipo}-mes-${numero}" name="${tipo}[${numero-1}][mes]" required>
                            <option value="">Seleccionar mes</option>
                            <option value="enero" ${datos && datos.mes === 'enero' ? 'selected' : ''}>Enero</option>
                            <option value="febrero" ${datos && datos.mes === 'febrero' ? 'selected' : ''}>Febrero</option>
                            <option value="marzo" ${datos && datos.mes === 'marzo' ? 'selected' : ''}>Marzo</option>
                            <option value="abril" ${datos && datos.mes === 'abril' ? 'selected' : ''}>Abril</option>
                            <option value="mayo" ${datos && datos.mes === 'mayo' ? 'selected' : ''}>Mayo</option>
                            <option value="junio" ${datos && datos.mes === 'junio' ? 'selected' : ''}>Junio</option>
                            <option value="julio" ${datos && datos.mes === 'julio' ? 'selected' : ''}>Julio</option>
                            <option value="agosto" ${datos && datos.mes === 'agosto' ? 'selected' : ''}>Agosto</option>
                            <option value="septiembre" ${datos && datos.mes === 'septiembre' ? 'selected' : ''}>Septiembre</option>
                            <option value="octubre" ${datos && datos.mes === 'octubre' ? 'selected' : ''}>Octubre</option>
                            <option value="noviembre" ${datos && datos.mes === 'noviembre' ? 'selected' : ''}>Noviembre</option>
                            <option value="diciembre" ${datos && datos.mes === 'diciembre' ? 'selected' : ''}>Diciembre</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <label for="${tipo}-sitio-${numero}">Sitio Web:</label>
                        <input type="text" id="${tipo}-sitio-${numero}" name="${tipo}[${numero-1}][sitio]" 
                               value="${datos ? datos.sitio || '' : ''}" placeholder="Ej: Wikipedia" required>
                    </div>
                    <div class="form-row full-width">
                        <label for="${tipo}-titulo-${numero}">Título de la Página:</label>
                        <input type="text" id="${tipo}-titulo-${numero}" name="${tipo}[${numero-1}][titulo]" 
                               value="${datos ? datos.titulo || '' : ''}" placeholder="Título de la página web" required>
                    </div>
                    <div class="form-row full-width">
                        <label for="${tipo}-url-${numero}">URL:</label>
                        <input type="url" id="${tipo}-url-${numero}" name="${tipo}[${numero-1}][url]" 
                               value="${datos ? datos.url || '' : ''}" placeholder="https://www.ejemplo.com" required>
                    </div>
                </div>
            `;
        }

        let tipoTexto = tipo === 'libros' ? 'Libro' : (tipo === 'articulos' ? 'Artículo' : 'Página Web');
        
        referenciaDiv.innerHTML = `
            <div class="referencia-header">
                <div class="referencia-numero">${tipoTexto} #${numero}</div>
                <button type="button" class="btn-eliminar-referencia" onclick="eliminarReferencia('${tipo}', ${numero})">
                    Eliminar
                </button>
            </div>
            ${campos}
        `;

        container.appendChild(referenciaDiv);
    }

    window.eliminarReferencia = function(tipo, numero) {
        const elemento = document.getElementById(`${tipo}-${numero}`);
        if (elemento) {
            elemento.remove();
            renumerarReferencias(tipo);
        }
    };

    function renumerarReferencias(tipo) {
        const container = document.getElementById(`${tipo}-lista`);
        const referencias = container.querySelectorAll('.referencia-item');
        
        referencias.forEach((referencia, index) => {
            const nuevoNumero = index + 1;
            const numeroElement = referencia.querySelector('.referencia-numero');
            let tipoTexto = tipo === 'libros' ? 'Libro' : (tipo === 'articulos' ? 'Artículo' : 'Página Web');
            numeroElement.textContent = `${tipoTexto} #${nuevoNumero}`;
            
            const campos = referencia.querySelectorAll('input, select');
            campos.forEach(campo => {
                const oldName = campo.name;
                const newName = oldName.replace(/\[\d+\]/, `[${index}]`);
                campo.name = newName;
                
                const oldId = campo.id;
                const newId = oldId.replace(/-\d+$/, `-${nuevoNumero}`);
                campo.id = newId;
            });
            
            const btnEliminar = referencia.querySelector('.btn-eliminar-referencia');
            btnEliminar.setAttribute('onclick', `eliminarReferencia('${tipo}', ${nuevoNumero})`);
            
            referencia.id = `${tipo}-${nuevoNumero}`;
        });
        
        contadores[tipo] = referencias.length + 1;
    }

    function guardarReferencias(event) {
        event.preventDefault();
        
        const formData = new FormData(form);
        const datos = {};
        
        for (let [key, value] of formData.entries()) {
            const keys = key.split(/[\[\]]+/).filter(k => k);
            let obj = datos;
            
            for (let i = 0; i < keys.length - 1; i++) {
                if (!obj[keys[i]]) {
                    obj[keys[i]] = {};
                }
                obj = obj[keys[i]];
            }
            
            obj[keys[keys.length - 1]] = value;
        }
        
        const referenciasFormateadas = {
            libros: datos.libros ? Object.values(datos.libros) : [],
            articulos: datos.articulos ? Object.values(datos.articulos) : [],
            web: datos.web ? Object.values(datos.web) : []
        };
        
        fetch('/guardar_referencias', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(referenciasFormateadas)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarMensaje('Referencias guardadas exitosamente', 'exito');
                referenciasData = referenciasFormateadas;
            } else {
                mostrarMensaje('Error al guardar las referencias: ' + (data.message || 'Error desconocido'), 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarMensaje('Error al guardar las referencias', 'error');
        });
    }

    function mostrarMensaje(texto, tipo) {
        mensaje.textContent = texto;
        mensaje.className = `mensaje ${tipo} mostrar`;
        
        setTimeout(() => {
            mensaje.classList.remove('mostrar');
        }, 5000);
    }
});
