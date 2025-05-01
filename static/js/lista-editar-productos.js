// lista-editar-productos.js
document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem('access_token');
  if (!token) {
    console.error("No se ha encontrado el token de autenticación.");
    return;
  }

  let currentPage = 1; // Track the current page
  const productsPerPage = 10; // Number of products per page

  // Function to load products from the API
  async function loadProducts(searchQuery = '', page = 1) {
    try {
      let url = `http://127.0.0.1:8000/productos/listar?page=${page}&limit=${productsPerPage}`;
      if (searchQuery) {
        url += `&name=${encodeURIComponent(searchQuery)}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error al cargar los productos');
      const products = await response.json();

      const productListElement = document.getElementById('product-list');
      if (page === 1) {
        productListElement.innerHTML = ''; // Clear previous products only on the first page
      }

      if (products.length === 0 && page === 1) {
        productListElement.innerHTML = '<p>No se encontraron productos.</p>';
        document.getElementById('load-more-button').style.display = 'none';
        return;
      }

      products.forEach(product => {
        const productImage = product.image_url || '/static/images/default-product.png'; // Use Cloudinary image URL or fallback

        const productItem = document.createElement('li');
        productItem.innerHTML = `
          <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.description || 'Sin descripción'}</p>
            <img src="${productImage}" alt="${product.name}" class="product-image">
          </div>
          <div class="product-actions">
            <button class="btn-edit" data-id="${product.id}">Editar</button>
            <button class="btn-delete" data-id="${product.id}">Eliminar</button>
          </div>
        `;
        productListElement.appendChild(productItem);
      });

      // Show or hide the "Ver más" button based on the number of products returned
      const loadMoreButton = document.getElementById('load-more-button');
      if (products.length < productsPerPage) {
        loadMoreButton.style.display = 'none';
      } else {
        loadMoreButton.style.display = 'block';
      }
    } catch (error) {
      console.error('Error al cargar los productos:', error);
    }
  }

  // Event listener for the "Ver más" button
  document.getElementById('load-more-button').addEventListener('click', () => {
    currentPage++;
    loadProducts('', currentPage);
  });

  // Load the first page of products on page load
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

          <label>Talles:</label>
          <div id="edit-size-buttons" class="size-buttons">
            ${generateSizeButtons(product.size || [])}
          </div>

          <label>Stock:</label>
          <input type="number" id="edit-stock" value="${product.stock}" required>

          <label>Imagen:</label>
          <input type="file" id="edit-image" accept="image/*">
          <div style="position: relative; display: inline-block;">
            <img id="edit-image-preview" style="max-width: 200px; margin-top: 10px;" />
            <button type="button" id="remove-image-preview" class="remove-image-button" style="display: none;">❌</button>
          </div>

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

    // Seleccionar botones de talles actuales
    const selectedSizes = product.size || [];
    document.querySelectorAll('#edit-size-buttons .size-button').forEach(button => {
      if (selectedSizes.includes(button.textContent.trim())) {
        button.classList.add('selected');
      }
      button.addEventListener('click', () => {
        button.classList.toggle('selected');
      });
    });

    fetch(`http://127.0.0.1:8000/categorias/buscar-por-id/${product.category_id}`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(currentCategory => {
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
              // Agregar la categoría actual como la primera opción
              const currentOption = document.createElement('option');
              currentOption.value = currentCategory.name;
              currentOption.textContent = currentCategory.name;
              currentOption.selected = true;
              select.appendChild(currentOption);

              // Agregar las demás categorías
              categories.forEach(cat => {
                if (cat.name !== currentCategory.name) {
                  const option = document.createElement('option');
                  option.value = cat.name;
                  option.textContent = cat.name;
                  select.appendChild(option);
                }
              });
            }
          })
          .catch(err => console.error("Error al cargar categorías para edición:", err));
      })
      .catch(err => console.error("Error al buscar la categoría actual:", err));

    // Evento para previsualizar la imagen seleccionada
    document.getElementById('edit-image').addEventListener('change', () => {
      const file = document.getElementById('edit-image').files[0];
      const preview = document.getElementById('edit-image-preview');
      const removeButton = document.getElementById('remove-image-preview');
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          preview.src = e.target.result;
          removeButton.style.display = 'block'; // Mostrar el botón
        };
        reader.readAsDataURL(file);
      } else {
        preview.src = "";
        removeButton.style.display = 'none'; // Ocultar el botón
      }
    });

    // Evento para eliminar la imagen previsualizada
    document.getElementById('remove-image-preview').addEventListener('click', () => {
      const preview = document.getElementById('edit-image-preview');
      const fileInput = document.getElementById('edit-image');
      const removeButton = document.getElementById('remove-image-preview');
      preview.src = "";
      fileInput.value = ""; // Limpiar el input de archivo
      removeButton.style.display = 'none'; // Ocultar el botón
    });

    // Evento para guardar cambios
    document.getElementById('save-edit').addEventListener('click', () => {
      const updatedProduct = new FormData();
      updatedProduct.append("name", document.getElementById('edit-name').value.trim());
      updatedProduct.append("description", document.getElementById('edit-description').value.trim());
      updatedProduct.append("type", document.getElementById('edit-type').value.trim());
      const selectedSizes = Array.from(document.querySelectorAll('#edit-size-buttons button.selected'))
        .map(button => button.textContent.trim());
      updatedProduct.append("size", selectedSizes.join(','));
      updatedProduct.append("stock", parseInt(document.getElementById('edit-stock').value));
      const imageFile = document.getElementById('edit-image').files[0];
      if (imageFile) {
        updatedProduct.append("image", imageFile, `${document.getElementById('edit-name').value.trim().replace(/\s+/g, "_")}.jpg`);
      }
      updatedProduct.append("category_name", document.getElementById('edit-category').value.trim());

      // Validar campos obligatorios
      if (!updatedProduct.get("name") || !updatedProduct.get("type") || isNaN(updatedProduct.get("stock"))) {
        alert("Por favor, completa los campos obligatorios correctamente.");
        return;
      }

      fetch(`http://127.0.0.1:8000/productos/actualizar/${product.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: updatedProduct
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

  // Función para generar botones de talles
  function generateSizeButtons(selectedSizes) {
    const sizes = [
      "S", "M", "L", "XL", "XXL", "XXXL",
      ...Array.from({ length: 51 }, (_, i) => (22 + i * 0.5).toFixed(1))
    ];
    return sizes.map(size => `
      <button type="button" class="size-button ${selectedSizes.includes(size) ? 'selected' : ''}">
        ${size}
      </button>
    `).join('');
  }
});
