// Variables globales
let currentPage = 1;
const productsPerPage = 10;
let isLoading = false;

// Función para mostrar spinner de carga
function showLoadingSpinner() {
  const spinner = document.getElementById('loadingSpinner');
  if (spinner) spinner.style.display = 'block';
}

// Función para ocultar spinner de carga
function hideLoadingSpinner() {
  const spinner = document.getElementById('loadingSpinner');
  if (spinner) spinner.style.display = 'none';
}

// Función para agregar botón "Ver más"
function addLoadMoreButton() {
  const paginationContainer = document.querySelector('.pagination');
  paginationContainer.innerHTML = "";
  const button = document.createElement('button');
  button.textContent = "Ver más";
  button.classList.add('load-more-button');
  button.addEventListener('click', async () => {
    if (!isLoading) {
      button.disabled = true;
      button.textContent = "Cargando...";
      currentPage++;
      await fetchProducts(currentPage, true);
      button.disabled = false;
      button.textContent = "Ver más";
    }
  });
  paginationContainer.appendChild(button);
}

// Función para obtener productos
async function fetchProducts(page = 1, append = false) {
  try {
    if (isLoading) return;
    isLoading = true;
    showLoadingSpinner();

    const response = await fetch(`webmpdeportes-production.up.railway.app/productos/listar?page=${page}&limit=${productsPerPage}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) throw new Error('Error al obtener los productos');
    
    const { products, totalPages } = await response.json();
    renderProducts(products, append);

    if (page < totalPages) {
      addLoadMoreButton();
    } else {
      document.querySelector('.pagination').innerHTML = "";
    }

    isLoading = false;
    hideLoadingSpinner();
  } catch (error) {
    console.error('Error:', error);
    isLoading = false;
    hideLoadingSpinner();
  }
}

// Función para renderizar productos
function renderProducts(products, append = false) {
  const tbody = document.querySelector('.products-table tbody');
  if (!append) tbody.innerHTML = "";

  const rows = products.map(product => {
    const imageUrl = product.image_path || 'https://res.cloudinary.com/demo/image/upload/v1/products/default-product.jpg';
    return `
      <tr>
        <td>${product.name}</td>
        <td>${product.category_name || 'Sin categoría'}</td>
        <td>${product.type}</td>
        <td>${product.stock}</td>
        <td><img src="${imageUrl}" alt="Imagen del producto" class="product-preview"></td>
        <td>
          <button class="btn-edit" onclick="openEditModal('${product.id}')"><i class="fas fa-edit"></i></button>
          <button class="btn-delete" onclick="deleteProduct('${product.id}')"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `;
  }).join('');
  tbody.insertAdjacentHTML('beforeend', rows);
}

// Función para inicializar botones de talles
function initializeSizeButtons() {
  const numericSizesContainer = document.getElementById('numeric-sizes');
  const letterSizesContainer = document.getElementById('letter-sizes');
  
  // Limpiar contenedores
  numericSizesContainer.innerHTML = '';
  letterSizesContainer.innerHTML = '';
  
  // Generar talles numéricos del 1 al 8
  for (let size = 1; size <= 8; size++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'size-button';
    btn.dataset.size = size;
    btn.textContent = size;
    numericSizesContainer.appendChild(btn);
  }

  // Generar talles numéricos del 18 al 47 en incrementos de 0.5
  for (let size = 18; size <= 47; size += 0.5) {
    const display = Number.isInteger(size) ? size : size.toFixed(1);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'size-button';
    btn.dataset.size = display;
    btn.textContent = display;
    numericSizesContainer.appendChild(btn);
  }

  // Generar talles de letras
  ['S', 'M', 'L', 'XL', 'XXL'].forEach(size => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'size-button';
    btn.dataset.size = size;
    btn.textContent = size;
    letterSizesContainer.appendChild(btn);
  });

  // Manejar selección de talles
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('size-button')) {
      const size = e.target.dataset.size;
      const input = document.getElementById('selected-sizes');
      const selected = new Set(input.value ? input.value.split(',') : []);
      
      // Toggle selección
      e.target.classList.toggle('selected');
      if (selected.has(size)) {
        selected.delete(size);
      } else {
        selected.add(size);
      }
      
      // Actualizar campo oculto
      input.value = Array.from(selected).join(',');
    }
  });
}

// Función para preseleccionar talles al editar
function preselectSizeButtons(selectedSizes) {
  if (!selectedSizes) return;
  
  // Convertir a array si es string
  const sizesArray = Array.isArray(selectedSizes) ? 
                    selectedSizes : 
                    selectedSizes.split(',');
  
  // Seleccionar todos los botones de talles
  const allSizeButtons = document.querySelectorAll('.size-button');
  
  allSizeButtons.forEach(button => {
    // Comparar ignorando mayúsculas/minúsculas y espacios
    const buttonSize = button.dataset.size.trim().toUpperCase();
    const isSelected = sizesArray.some(size => 
      size.trim().toUpperCase() === buttonSize
    );
    
    // Marcar como seleccionado si corresponde
    if (isSelected) {
      button.classList.add('selected');
    }
  });
}

// Función para abrir modal de edición
async function openEditModal(productId) {
  try {
    const response = await fetch(`webmpdeportes-production.up.railway.app/productos/obtener_por_id/${productId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    if (!response.ok) throw new Error('Error al obtener producto');
    
    const product = await response.json();
    const form = document.getElementById('editForm');
    form.reset();

    // Llenar datos básicos
    form.elements.name.value = product.name;
    form.elements.type.value = product.type;
    form.elements.stock.value = product.stock;
    form.elements.price.value = product.price;
    form.elements.description.value = product.description;

    // Llenar categoría
    await populateCategorySelect(product.category_id);

    // Mostrar imagen
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.innerHTML = "";
    if (product.image_path) {
      const img = document.createElement('img');
      img.src = product.image_path;
      img.alt = "Imagen actual del producto";
      img.classList.add('preview-image');
      imagePreview.appendChild(img);
    }

    // Preseleccionar talles
    if (product.size) {
      preselectSizeButtons(product.size);
      document.getElementById('selected-sizes').value = 
        Array.isArray(product.size) ? product.size.join(',') : product.size;
    }

    form.dataset.productId = productId;
    document.getElementById('editModal').style.display = 'block';
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar el producto para editar');
  }
}

// Función para obtener y listar categorías
async function populateCategorySelect(selectedCategoryId = null) {
  try {
    const response = await fetch('webmpdeportes-production.up.railway.app/categorias/listar-public', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    if (!response.ok) throw new Error('Error al obtener categorías');
    
    const categories = await response.json();
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '<option value="">Seleccionar...</option>';

    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;

      if (selectedCategoryId && category.id === selectedCategoryId) {
        option.selected = true;
      }

      categorySelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// Cerrar modal de edición
function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
}

// Subir imagen a Cloudinary
async function uploadImageToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Error al subir imagen");
  return (await response.json()).secure_url;
}

// Guardar cambios del producto
async function saveProductChanges(event) {
  event.preventDefault();
  const form = event.target;
  const productId = form.dataset.productId;

  const formData = new FormData(form);
  const priceInput = form.elements.price.value.replace(/\./g, '').replace(',', '.');
  if (priceInput) formData.set('price', parseFloat(priceInput).toFixed(2));

  // Subir imagen si hay una nueva
  const imageInput = document.getElementById('productImageInput');
  if (imageInput.files.length > 0) {
    try {
      const imageUrl = await uploadImageToCloudinary(imageInput.files[0]);
      formData.set('image_url', imageUrl);
    } catch (error) {
      console.error("Error al subir imagen:", error);
      alert("Error al subir la imagen");
      return;
    }
  }

  // Agregar categoría
  const categorySelect = document.getElementById('category');
  if (categorySelect.value) {
    formData.append('category_name', categorySelect.options[categorySelect.selectedIndex].text);
  }

  // Agregar talles seleccionados
  const selectedSizes = document.getElementById('selected-sizes').value;
  if (selectedSizes) {
    formData.set('size', selectedSizes);
  }

  try {
    const response = await fetch(`webmpdeportes-production.up.railway.app/productos/actualizar/${productId}`, {
      method: 'PUT',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    if (!response.ok) throw new Error('Error al actualizar producto');
    
    alert('Producto actualizado con éxito');
    closeEditModal();
    fetchProducts();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Eliminar producto
async function deleteProduct(productId) {
  if (!confirm("¿Está seguro que desea eliminar este producto?")) return;

  try {
    const response = await fetch(`webmpdeportes-production.up.railway.app/productos/eliminar/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    if (!response.ok) throw new Error('Error al eliminar producto');
    
    alert('Producto eliminado con éxito');
    fetchProducts();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Previsualizar imagen
document.getElementById('productImageInput').addEventListener('change', function(event) {
  const imagePreview = document.getElementById('imagePreview');
  imagePreview.innerHTML = "";

  Array.from(event.target.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.classList.add('preview-image');
      imagePreview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
});

// Cerrar modal al hacer click fuera
window.onclick = function(event) {
  const modal = document.getElementById('editModal');
  if (event.target == modal) modal.style.display = 'none';
};

// Configuración Cloudinary
const CLOUD_NAME = "dotxvd5dc";
const UPLOAD_PRESET = "marcapasos_images";

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  // Spinner
  const spinner = document.createElement('div');
  spinner.id = 'loadingSpinner';
  spinner.innerHTML = '<div class="spinner"></div>';
  document.body.appendChild(spinner);

  // Inicializar botones de talles
  initializeSizeButtons();
  
  // Cargar productos
  fetchProducts(currentPage).finally(() => hideLoadingSpinner());
  
  // Configurar formulario
  document.getElementById('editForm').addEventListener('submit', saveProductChanges);
});

// Función para buscar productos
async function searchProducts(searchTerm) {
  try {
    const response = await fetch(`webmpdeportes-production.up.railway.app/productos/listar?search=${encodeURIComponent(searchTerm)}&limit=${productsPerPage}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    if (!response.ok) throw new Error('Error al buscar productos');
    const { products } = await response.json();
    renderProducts(products);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Función debounce para búsqueda
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Evento de búsqueda
document.querySelector('.header__search-input').addEventListener('input', debounce(function(event) {
  const searchTerm = event.target.value.trim();
  searchTerm === "" ? fetchProducts() : searchProducts(searchTerm);
}, 300));