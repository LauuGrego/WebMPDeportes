document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('access_token');
    if (!token) {
        console.error("No se ha encontrado el token de autenticación.");
        return;
    }

    // Cargar productos desde la API
    fetch('http://127.0.0.1:8000/productos/listar', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la solicitud al backend');
        }
        return response.json();
    })
    .then(products => {
        const productList = document.getElementById('product-list');
        if (!productList) {
            console.error("No se encontró el elemento #product-list en el DOM.");
            return;
        }

        productList.innerHTML = ''; // Limpiar lista antes de agregar nuevos productos

        products.forEach(product => {
            const productId = product.id || product._id; // Manejar _id de MongoDB

            const li = document.createElement('li');
            li.classList.add('product-item');
            li.innerHTML = `
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description || 'Sin descripción'}</p>
                    <p class="product-price">Precio: $${product.price}</p>
                    <p class="product-type">Tipo: ${product.type}</p>
                    <p class="product-size">Talles: ${(Array.isArray(product.size) ? product.size.join(', ') : 'No especificado')}</p>
                    <p class="product-stock">Stock: ${product.stock}</p>
                    <p class="product-category">Categoría ID: ${product.category_id || 'No especificado'}</p>
                </div>
                <div class="product-image">
                    ${product.image_url ? `<img src="${product.image_url}" alt="${product.name}" class="img-responsive"/>` : '<p>Sin imagen</p>'}
                </div>
                <div class="product-actions">
                    <button class="btn-edit" data-id="${productId}"><i class="fas fa-edit"></i> Editar</button>
                    <button class="btn-delete" data-id="${productId}"><i class="fas fa-trash-alt"></i> Eliminar</button>
                </div>
            `;

            productList.appendChild(li);
        });
    })
    .catch(error => {
        console.error("Error al cargar los productos:", error);
    });

    // Manejo de eventos para editar y eliminar
    document.getElementById('product-list').addEventListener('click', (event) => {
        const button = event.target.closest('button[data-id]');
        if (!button) return;

        const productId = button.getAttribute('data-id');

        if (button.classList.contains('btn-delete')) {
            if (confirm('¿Estás seguro de que deseas deshabilitar este producto?')) {
                deshabilitarProducto(productId);
            }
        } else if (button.classList.contains('btn-edit')) {
            obtenerProductoPorId(productId);
        }
    });

    // Función para deshabilitar un producto
    function deshabilitarProducto(productId) {
        fetch(`http://127.0.0.1:8000/productos/deshabilitar/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.ok) {
                alert('Producto deshabilitado correctamente');
                window.location.reload();
            } else {
                throw new Error('Error al deshabilitar el producto');
            }
        })
        .catch(error => console.error('Error:', error));
    }

    // Función para obtener un producto y abrir el formulario de edición
    function obtenerProductoPorId(productId) {
        fetch(`http://127.0.0.1:8000/productos/obtener_por_id/${productId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.ok ? response.json() : Promise.reject('No se pudo obtener el producto'))
        .then(product => {
            product.id = product._id || product.id; // Asegurar ID
            abrirFormularioEdicion(product);
        })
        .catch(error => console.error('Error al obtener el producto:', error));
    }

    // Función para abrir formulario de edición
    function abrirFormularioEdicion(product) {
        if (!product.id) {
            console.error("El ID del producto no está definido:", product);
            return;
        }

        const modal = document.createElement('div');
        modal.classList.add('modal-overlay');
        modal.innerHTML = `
            <div class="edit-form">
                <h2>Editar Producto</h2>
                <form id="edit-product-form">
                    <label>Nombre:</label>
                    <input type="text" id="edit-name" value="${product.name}" required>

                    <label>Descripción:</label>
                    <input type="text" id="edit-description" value="${product.description || ''}">

                    <label>Precio:</label>
                    <input type="number" id="edit-price" value="${product.price}" required>

                    <label>Tipo:</label>
                    <input type="text" id="edit-type" value="${product.type}" required>

                    <label>Talles (separados por comas):</label>
                    <input type="text" id="edit-size" value="${Array.isArray(product.size) ? product.size.join(', ') : ''}">

                    <label>Stock:</label>
                    <input type="number" id="edit-stock" value="${product.stock}" required>

                    <label>Imagen URL:</label>
                    <input type="text" id="edit-image" value="${product.image_url || ''}">

                    <label>Categoría:</label>
                    <input type="text" id="edit-category" value="${product.category_id || ''}">

                    <div class="form-actions">
                        <button type="button" id="save-edit">Guardar</button>
                        <button type="button" id="cancel-edit">Cancelar</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('save-edit').addEventListener('click', () => {
            const updatedProduct = {
                name: document.getElementById('edit-name').value,
                description: document.getElementById('edit-description').value.trim(),
                price: parseFloat(document.getElementById('edit-price').value),
                type: document.getElementById('edit-type').value.trim(),
                size: document.getElementById('edit-size').value.split(',').map(s => s.trim()).filter(Boolean),
                stock: parseInt(document.getElementById('edit-stock').value),
                image_url: document.getElementById('edit-image').value.trim(),
                category_name: document.getElementById('edit-category').value.trim()
            };
        
            // Solo agregamos los campos que no están vacíos (o que han sido modificados)
            const name = document.getElementById('edit-name').value.trim();
            if (name) updatedProduct.name = name;
        
            const description = document.getElementById('edit-description').value.trim();
            if (description) updatedProduct.description = description;
        
            const price = parseFloat(document.getElementById('edit-price').value);
            if (!isNaN(price)) updatedProduct.price = price;
        
            const type = document.getElementById('edit-type').value.trim();
            if (type) updatedProduct.type = type;
        
            const size = document.getElementById('edit-size').value.split(',').map(s => s.trim()).filter(Boolean);
            if (size.length > 0) updatedProduct.size = size;
        
            const stock = parseInt(document.getElementById('edit-stock').value);
            if (!isNaN(stock)) updatedProduct.stock = stock;
        
            const image_url = document.getElementById('edit-image').value.trim();
            if (image_url) updatedProduct.image_url = image_url;
        
            const category_name = document.getElementById('edit-category').value.trim();
            if (category_name) updatedProduct.category_name = category_name;
        
            fetch(`http://127.0.0.1:8000/productos/actualizar/${product.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedProduct)
            })
            .then(response => response.ok ? alert('Producto actualizado correctamente') : Promise.reject('Error al actualizar'))
            .then(() => window.location.reload())
            .catch(error => console.error('Error:', error));
        });
        

        document.getElementById('cancel-edit').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }
});
