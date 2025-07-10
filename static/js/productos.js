document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-productos');
    const productosContainer = document.getElementById('productos-container');
    const mensaje = document.getElementById('mensaje');
    const mensajeSinUnidades = document.getElementById('mensaje-sin-unidades');
    const restablecerBtn = document.getElementById('restablecer-productos');
    
    const modalOverlay = document.getElementById('modal-restablecer');
    const modalConfirm = document.getElementById('modal-confirm');
    const modalCancel = document.getElementById('modal-cancel');
    
    let unidadesDisponibles = [];
    let productosGuardados = [];
    let contadorGlobalProductos = 1; 
    let unidadesBloqueadas = new Set(); 
    
    cargarUnidadesYProductos();

    form.addEventListener('submit', guardarProductos);
    restablecerBtn.addEventListener('click', mostrarModalRestablecer);
    modalConfirm.addEventListener('click', confirmarRestablecimiento);
    modalCancel.addEventListener('click', cerrarModal);
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            cerrarModal();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            cerrarModal();
        }
    });

    function mostrarModalRestablecer() {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function cerrarModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    function confirmarRestablecimiento() {
        productosContainer.innerHTML = '';
        
        productosGuardados = [];
        contadorGlobalProductos = 1;
        unidadesBloqueadas.clear(); 
        
        restablecerBtn.style.display = 'none';
        
        generarFormulariosProductos();
        
        cerrarModal();
        
        setTimeout(() => {
            mostrarMensaje('✅ Formulario de productos restablecido. Todos los selectores están habilitados nuevamente.', 'exito');
        }, 300);
    }

    function cargarUnidadesYProductos() {
        fetch('/api/cargar_unidades_para_productos')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.unidades && data.unidades.length > 0) {
                    unidadesDisponibles = data.unidades;
                    cargarProductosGuardados();
                } else {
                    mostrarMensajeSinUnidades();
                }
            })
            .catch(error => {
                console.error('Error al cargar unidades:', error);
                mostrarMensajeSinUnidades();
            });
    }

    function cargarProductosGuardados() {
        fetch('/api/cargar_productos')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.productos) {
                    productosGuardados = data.productos;
                    actualizarContadorGlobal();
                }
                generarFormulariosProductos();
            })
            .catch(error => {
                console.error('Error al cargar productos guardados:', error);
                generarFormulariosProductos();
            });
    }

    function actualizarContadorGlobal() {
        let maxCodigo = 0;
        productosGuardados.forEach(unidadProd => {
            if (unidadProd.productos) {
                unidadProd.productos.forEach(prod => {
                    if (prod.codigo) {
                        const match = prod.codigo.match(/(\d+)$/);
                        if (match) {
                            maxCodigo = Math.max(maxCodigo, parseInt(match[1]));
                        }
                    }
                });
            }
        });
        contadorGlobalProductos = maxCodigo + 1;
    }

    function mostrarMensajeSinUnidades() {
        mensajeSinUnidades.style.display = 'block';
        form.style.display = 'none';
    }

    function generarFormulariosProductos() {
        if (!unidadesDisponibles || unidadesDisponibles.length === 0) {
            mostrarMensajeSinUnidades();
            return;
        }

        mensajeSinUnidades.style.display = 'none';
        form.style.display = 'block';
        productosContainer.innerHTML = '';

        unidadesDisponibles.forEach((unidad, index) => {
            const unidadCard = crearFormularioUnidad(unidad, index + 1);
            productosContainer.appendChild(unidadCard);
        });

        if (productosGuardados.length > 0) {
            cargarDatosGuardados();
            restablecerBtn.style.display = 'inline-block';
            
        }
    }

    function bloquearUnidad(numeroUnidad) {
        unidadesBloqueadas.add(numeroUnidad);
        const selector = document.getElementById(`num_productos_${numeroUnidad}`);
        const boton = document.querySelector(`button[onclick="generarProductosUnidad(${numeroUnidad})"]`);
        
        if (selector) selector.disabled = true;
        if (boton) boton.disabled = true;
    }
    
    function desbloquearUnidad(numeroUnidad) {
        unidadesBloqueadas.delete(numeroUnidad);
        const selector = document.getElementById(`num_productos_${numeroUnidad}`);
        const boton = document.querySelector(`button[onclick="generarProductosUnidad(${numeroUnidad})"]`);
        
        if (selector) selector.disabled = false;
        if (boton) boton.disabled = false;
    }
    
    function isUnidadBloqueada(numeroUnidad) {
        return unidadesBloqueadas.has(numeroUnidad);
    }

    function crearFormularioUnidad(unidad, numero) {
        const unidadDiv = document.createElement('div');
        unidadDiv.className = 'unidad-card';
        unidadDiv.dataset.unidad = numero;

        unidadDiv.innerHTML = `
            <div class="unidad-header">
                📦 Productos para Unidad ${numero}: ${unidad.nombre || `Unidad ${numero}`}
            </div>
            <div class="unidad-content">
                <div class="info-productos">
                    <p><strong>Sesiones:</strong> ${unidad.sesiones || 'N/A'}</p>
                    <p><strong>Logro:</strong> ${unidad.logro || 'N/A'}</p>
                </div>
                
                <div class="productos-controls">
                    <label>Número de productos (1-4):</label>
                    <select id="num_productos_${numero}" class="select-num-productos" data-unidad="${numero}">
                        <option value="1">1 producto</option>
                        <option value="2">2 productos</option>
                        <option value="3">3 productos</option>
                        <option value="4">4 productos</option>
                    </select>
                    <button type="button" class="btn btn-secondary" onclick="generarProductosUnidad(${numero})">
                        Generar Formularios
                    </button>
                </div>
                
                <div id="productos_unidad_${numero}" class="productos-unidad">
                    <!-- Los productos se generarán aquí -->
                </div>
            </div>
        `;

        return unidadDiv;
    }

    window.generarProductosUnidad = function(numeroUnidad) {
        if (isUnidadBloqueada(numeroUnidad)) return;
        
        const selectNum = document.getElementById(`num_productos_${numeroUnidad}`);
        const numProductos = parseInt(selectNum.value);
        const container = document.getElementById(`productos_unidad_${numeroUnidad}`);
        
        container.innerHTML = '';
        
        for (let i = 1; i <= numProductos; i++) {
            const productoDiv = crearFormularioProducto(numeroUnidad, i);
            container.appendChild(productoDiv);
        }
        
        restablecerBtn.style.display = 'inline-block';
        bloquearUnidad(numeroUnidad); 
        
        mostrarMensaje(`Formularios de productos generados para la Unidad ${numeroUnidad}`, 'exito');
    };

    function crearFormularioProducto(numeroUnidad, numeroProducto) {
        const productoDiv = document.createElement('div');
        productoDiv.className = 'producto-item';
        productoDiv.dataset.unidad = numeroUnidad;
        productoDiv.dataset.producto = numeroProducto;

        const codigo = `PA${contadorGlobalProductos} (C${contadorGlobalProductos})`;
        contadorGlobalProductos++;

        productoDiv.innerHTML = `
            <div class="producto-header">
                Producto ${numeroProducto} - ${codigo}
            </div>
            <div class="producto-content">
                <input type="hidden" name="codigo_unidad_${numeroUnidad}_prod_${numeroProducto}" value="${codigo}">
                
                <div class="form-row">
                    <label for="titulo_unidad_${numeroUnidad}_prod_${numeroProducto}">Título:</label>
                    <input type="text" 
                           id="titulo_unidad_${numeroUnidad}_prod_${numeroProducto}" 
                           name="titulo_unidad_${numeroUnidad}_prod_${numeroProducto}"
                           placeholder="Título del producto..." 
                           maxlength="2000"
                           required>
                </div>
                
                <div class="form-row">
                    <label for="descripcion_unidad_${numeroUnidad}_prod_${numeroProducto}">Descripción:</label>
                    <textarea id="descripcion_unidad_${numeroUnidad}_prod_${numeroProducto}" 
                              name="descripcion_unidad_${numeroUnidad}_prod_${numeroProducto}"
                              rows="8" 
                              maxlength="10000"
                              placeholder="Descripción detallada del producto..."
                              required></textarea>
                </div>
            </div>
        `;

        return productoDiv;
    }

    function cargarDatosGuardados() {
        productosGuardados.forEach(unidadProd => {
            const numeroUnidad = unidadProd.unidad_numero;
            const productos = unidadProd.productos || [];
            
            if (productos.length > 0) {
                const selectNum = document.getElementById(`num_productos_${numeroUnidad}`);
                if (selectNum) {
                    selectNum.value = productos.length.toString();
                    
                    const container = document.getElementById(`productos_unidad_${numeroUnidad}`);
                    container.innerHTML = '';
                    
                    for (let i = 1; i <= productos.length; i++) {
                        const productoDiv = crearFormularioProducto(numeroUnidad, i);
                        container.appendChild(productoDiv);
                    }
                    
                    bloquearUnidad(numeroUnidad);
                    
                    setTimeout(() => {
                        productos.forEach((prod, index) => {
                            const numeroProducto = index + 1;
                            const codigoInput = document.querySelector(`input[name="codigo_unidad_${numeroUnidad}_prod_${numeroProducto}"]`);
                            const tituloInput = document.getElementById(`titulo_unidad_${numeroUnidad}_prod_${numeroProducto}`);
                            const descripcionTextarea = document.getElementById(`descripcion_unidad_${numeroUnidad}_prod_${numeroProducto}`);
                            
                            if (codigoInput) codigoInput.value = prod.codigo || '';
                            if (tituloInput) tituloInput.value = prod.titulo || '';
                            if (descripcionTextarea) descripcionTextarea.value = prod.descripcion || '';
                        });
                    }, 100);
                }
            }
        });
    }

    function guardarProductos(event) {
        event.preventDefault();
        
        const unidadesProductos = [];
        
        unidadesDisponibles.forEach((unidad, index) => {
            const numeroUnidad = index + 1;
            const productosUnidad = document.getElementById(`productos_unidad_${numeroUnidad}`);
            
            if (productosUnidad && productosUnidad.children.length > 0) {
                const productos = [];
                
                for (let i = 0; i < productosUnidad.children.length; i++) {
                    const productoItem = productosUnidad.children[i];
                    const numeroProducto = i + 1;
                    
                    const codigoInput = document.querySelector(`input[name="codigo_unidad_${numeroUnidad}_prod_${numeroProducto}"]`);
                    const tituloInput = document.getElementById(`titulo_unidad_${numeroUnidad}_prod_${numeroProducto}`);
                    const descripcionTextarea = document.getElementById(`descripcion_unidad_${numeroUnidad}_prod_${numeroProducto}`);
                    
                    if (codigoInput && tituloInput && descripcionTextarea) {
                        const producto = {
                            codigo: codigoInput.value.trim(),
                            titulo: tituloInput.value.trim(),
                            descripcion: descripcionTextarea.value.trim()
                        };
                        
                        if (producto.codigo && producto.titulo && producto.descripcion) {
                            productos.push(producto);
                        } else {
                            mostrarMensaje(`Error: Todos los campos son obligatorios para el producto ${numeroProducto} de la unidad ${numeroUnidad}`, 'error');
                            return;
                        }
                    }
                }
                
                if (productos.length > 0) {
                    unidadesProductos.push({
                        unidad_numero: numeroUnidad,
                        unidad_nombre: unidad.nombre || `Unidad ${numeroUnidad}`,
                        productos: productos
                    });
                }
            }
        });
        
        if (unidadesProductos.length === 0) {
            mostrarMensaje('Error: Debes generar y completar al menos una unidad con productos', 'error');
            return;
        }
        
        for (const unidadProd of unidadesProductos) {
            if (unidadProd.productos.length < 1 || unidadProd.productos.length > 4) {
                mostrarMensaje(`Error: La unidad ${unidadProd.unidad_numero} debe tener entre 1 y 4 productos`, 'error');
                return;
            }
        }
        
        const formData = new FormData();
        formData.append('productos_data', JSON.stringify(unidadesProductos));
        
        form.classList.add('loading');
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Guardando...';
        submitBtn.disabled = true;
        
        fetch('/guardar_productos', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarMensaje(data.message || 'Productos guardados exitosamente', 'exito');
                productosGuardados = unidadesProductos;
            } else {
                mostrarMensaje(data.error || 'Error al guardar productos', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarMensaje('Error de conexión al guardar productos', 'error');
        })
        .finally(() => {
            form.classList.remove('loading');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
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
        
        mensaje.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});
