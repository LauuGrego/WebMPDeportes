// lista-editar-productos.js
document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem('access_token');
  if (!token) {
    console.error("No se ha encontrado el token de autenticación.");
    return;
  }

  // Función para cargar productos desde la API
  function loadProducts() {
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
        productList.innerHTML = ""; // Limpiar lista

        products.forEach(product => {
          // Manejar _id de MongoDB y mostrar la primera imagen si existe
          const productId = product.id || product._id;
          const imageUrl = (product.image_url && product.image_url.length > 0) ? product.image_url[0] : null;

          const li = document.createElement('li');
          li.classList.add('product-item');
          li.innerHTML = `
            <div class="product-info">
              <h3 class="product-name">${product.name}</h3>
              <p class="product-description">${product.description || 'Sin descripción'}</p>
              <p class="product-type">Tipo: ${product.type}</p>
              <p class="product-size">Talles: ${Array.isArray(product.size) ? product.size.join(', ') : 'No especificado'}</p>
              <p class="product-stock">Stock: ${product.stock}</p>
              <p class="product-category">Categoría: ${product.category_id || 'No especificado'}</p>
            </div>
            <div class="product-image">
              ${imageUrl ? `<img src="${imageUrl}" alt="${product.name}" class="img-responsive"/>` : '<p>Sin imagen</p>'}
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
  }

  loadProducts();

  // Asignar eventos para editar y eliminar
  const productListElement = document.getElementById('product-list');
  if (productListElement) {
    productListElement.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-id]');
      if (!button) return;

      const productId = button.getAttribute('data-id');
      if (button.classList.contains('btn-delete')) {
        if (confirm('¿Estás seguro de que deseas deshabilitar este producto?')) {
          disableProduct(productId);
        }
      } else if (button.classList.contains('btn-edit')) {
        getProductById(productId);
      }
    });
  } else {
    console.error("No se encontró el elemento #product-list.");
  }

  // Función para deshabilitar un producto (por ejemplo, poniendo stock en 0)
  function disableProduct(productId) {
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

  // Función para obtener un producto y abrir el modal de edición
  function getProductById(productId) {
    fetch(`http://127.0.0.1:8000/productos/obtener_por_id/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.ok ? response.json() : Promise.reject('No se pudo obtener el producto'))
      .then(product => {
        // Asegurar que el ID esté definido en formato string
        product.id = product._id || product.id;
        openEditModal(product);
      })
      .catch(error => console.error('Error al obtener el producto:', error));
  }

  // Función para abrir el modal de edición
  function openEditModal(product) {
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

          <label>Tipo:</label>
          <input type="text" id="edit-type" value="${product.type}" required>

          <label>Talles (separados por comas):</label>
          <input type="text" id="edit-size" value="${Array.isArray(product.size) ? product.size.join(', ') : ''}">

          <label>Stock:</label>
          <input type="number" id="edit-stock" value="${product.stock}" required>

          <label>Imagen URL:</label>
          <input type="text" id="edit-image" value="${(product.image_url && product.image_url.length > 0) ? product.image_url[0] : ''}">

          <label>Categoría:</label>
          <select id="edit-category" required>
            <!-- Se llenará dinámicamente -->
          </select>

          <div class="form-actions">
            <button type="button" id="save-edit">Guardar</button>
            <button type="button" id="cancel-edit">Cancelar</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    // Rellenar el <select> de categorías
    fetch('http://127.0.0.1:8000/categorias/listar', {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(categories => {
        const select = document.getElementById('edit-category');
        if (select) {
          select.innerHTML = "";
          categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.name; // Usamos el nombre de la categoría
            option.textContent = cat.name;
            if (cat.name === (product.category_name || "")) {
              option.selected = true;
            }
            select.appendChild(option);
          });
          if (!select.value && select.options.length > 0) {
            select.selectedIndex = 0;
          }
        }
      })
      .catch(err => console.error("Error al cargar categorías para edición:", err));

    // Evento para guardar cambios
    document.getElementById('save-edit').addEventListener('click', () => {
      const updatedProduct = {
        name: document.getElementById('edit-name').value.trim(),
        description: document.getElementById('edit-description').value.trim(),
        type: document.getElementById('edit-type').value.trim(),
        size: document.getElementById('edit-size').value.split(',').map(s => s.trim()).filter(Boolean),
        stock: parseInt(document.getElementById('edit-stock').value),
        image_url: [document.getElementById('edit-image').value.trim()], // Enviamos un arreglo
        category_name: document.getElementById('edit-category').value.trim()
      };

      // Validar campos obligatorios
      if (!updatedProduct.name || !updatedProduct.type || isNaN(updatedProduct.stock)) {
        alert("Por favor, completa los campos obligatorios correctamente.");
        return;
      }

      fetch(`http://127.0.0.1:8000/productos/actualizar/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedProduct)
      })
        .then(response => {
          if (response.ok) {
            alert('Producto actualizado correctamente');
            window.location.reload();
          } else {
            return response.json().then(data => {
              throw new Error(data.detail || 'Error al actualizar');
            });
          }
        })
        .catch(error => console.error('Error:', error));
    });

    // Evento para cancelar edición y cerrar el modal
    document.getElementById('cancel-edit').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  }
});
