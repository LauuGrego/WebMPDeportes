// Variables globales
let currentPage = 1;
const productsPerPage = 10;
let isLoading = false;
let currentSearchTerm = ""; // Guarda el término de búsqueda actual

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
      // Si hay búsqueda, seguir buscando productos relacionados
      if (currentSearchTerm) {
        await searchProducts(currentSearchTerm, true);
      } else {
        await fetchProducts(currentPage, true);
      }
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

    // Mostrar aviso de cargando productos solo si no es append
    if (!append) {
      const tbody = document.querySelector('.products-table tbody');
      tbody.innerHTML = `<tr><td colspan="6">Cargando productos...</td></tr>`;
    }

    const response = await fetch(`https://webmpdeportes.onrender.com/productos/listar?page=${page}&limit=${productsPerPage}`, {
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
  } catch (error) {
    console.error('Error:', error);
    isLoading = false;
  }
}

// Función para buscar productos (con paginación y aviso de carga)
async function searchProducts(searchTerm, append = false) {
  try {
    if (isLoading) return;
    isLoading = true;
    currentSearchTerm = searchTerm;

    // Mostrar aviso de cargando productos solo si no es append
    if (!append) {
      const tbody = document.querySelector('.products-table tbody');
      tbody.innerHTML = `<tr><td colspan="6">Cargando productos...</td></tr>`;
      currentPage = 1;
    }

    const response = await fetch(`https://webmpdeportes.onrender.com/productos/listar?search=${encodeURIComponent(searchTerm)}&page=${currentPage}&limit=${productsPerPage}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    if (!response.ok) throw new Error('Error al buscar productos');
    const { products, totalPages } = await response.json();
    renderProducts(products, append);

    if (currentPage < totalPages) {
      addLoadMoreButton();
    } else {
      document.querySelector('.pagination').innerHTML = "";
    }

    isLoading = false;
  } catch (error) {
    console.error('Error:', error);
    isLoading = false;
  }
}

// Función para renderizar productos
function renderProducts(products, append = false) {
  const tbody = document.querySelector('.products-table tbody');
  if (!append) tbody.innerHTML = "";

  const rows = products.map(product => {
    // Siempre usar la URL Cloudinary por defecto si no hay imagen
    const imageUrl = product.image_url || 'https://res.cloudinary.com/demo/image/upload/v1/products/default-product.jpg';
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
  for (let size = 18.0; size <= 47.0; size += 0.5) {
    const display = size.toFixed(1); // Fuerza 1 decimal
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
}

// Manejo de selección/deselección de talles
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('size-button')) {
    e.preventDefault();
    const size = e.target.dataset.size;
    const input = document.getElementById('selected-sizes');
    let selected = input.value ? input.value.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (e.target.classList.contains('selected')) {
      // Deseleccionar
      e.target.classList.remove('selected');
      selected = selected.filter(s => s !== size);
    } else {
      // Seleccionar
      e.target.classList.add('selected');
      if (!selected.includes(size)) selected.push(size);
    }
    input.value = selected.join(',');
  }
});

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

async function openEditModal(productId) {
  try {
    const response = await fetch(`https://webmpdeportes.onrender.com/productos/obtener_por_id/${productId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    if (!response.ok) throw new Error('Error al obtener los datos del producto');
    
    const product = await response.json();
    const form = document.getElementById('editForm');

    // Resetear formulario y limpiar selecciones previas
    form.reset();
    document.getElementById('selected-sizes').value = '';
    document.querySelectorAll('.size-button.selected').forEach(btn => {
      btn.classList.remove('selected');
    });

    // Llenar datos básicos
    form.elements.name.value = product.name;
    form.elements.type.value = product.type;
    form.elements.stock.value = product.stock;
    form.elements.price.value = product.price;
    form.elements.description.value = product.description;

    // Inicializar botones de talles
    initializeSizeButtons();

    // Preseleccionar talles existentes
    if (product.size) {
      // Normalizar los talles (manejar tanto arrays como strings separados por comas)
      const sizesArray = Array.isArray(product.size) 
        ? product.size.map(s => s.toString().trim())
        : product.size.split(',').map(s => s.trim());
      let selectedSizes = [];
      document.querySelectorAll('.size-button').forEach(button => {
        const buttonSize = button.dataset.size.toString().trim();
        // Comparar ignorando mayúsculas/minúsculas
        if (sizesArray.map(s => s.toUpperCase()).includes(buttonSize.toUpperCase())) {
          button.classList.add('selected');
          selectedSizes.push(button.dataset.size);
        }
      });
      document.getElementById('selected-sizes').value = selectedSizes.join(',');
    }

    // Categoría: cargar y seleccionar la actual
    await populateCategorySelect(product.category_id);

    // Imagen
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.innerHTML = "";
    if (product.image_url) {
      const img = document.createElement('img');
      img.src = product.image_url;
      img.alt = "Imagen actual del producto";
      img.classList.add('preview-image');
      imagePreview.appendChild(img);
    }

    form.dataset.productId = productId;
    document.getElementById('editModal').style.display = 'block';
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar los datos del producto');
  }
}

// Función para obtener y listar categorías
async function populateCategorySelect(selectedCategoryId = null) {
  try {
    const response = await fetch('https://webmpdeportes.onrender.com/categorias/listar-public', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    if (!response.ok) throw new Error('Error al obtener categorías');
    
    const categories = await response.json();
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '<option value="">Seleccionar...</option>';

    categories.forEach(category => {
      // El backend devuelve "_id", no "id"
      const option = document.createElement('option');
      option.value = category._id || category.id;
      option.textContent = category.name;

      if (selectedCategoryId && (category._id === selectedCategoryId || category.id === selectedCategoryId)) {
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
  
  // 1) Sube la imagen (si el usuario seleccionó una)
  let imageUrl;
  const fileInput = document.getElementById('productImageInput');
  if (fileInput.files.length > 0) {
    try {
      imageUrl = await uploadImageToCloudinary(fileInput.files[0]);
    } catch (err) {
      console.error("Error subiendo imagen:", err);
      return alert("No se pudo subir la imagen");
    }
  }

  const formData = new FormData();
  formData.append("name",        form.elements.name.value);
  formData.append("type",        form.elements.type.value);
  formData.append("stock",       form.elements.stock.value);
  formData.append("price",       form.elements.price.value);
  formData.append("description", form.elements.description.value);
  // Cambia a "category_id" para coincidir con el backend
  formData.append("category_id", form.elements.category.value);
  formData.append("size",        document.getElementById('selected-sizes').value);
  if (imageUrl) formData.append("image_url", imageUrl);

  try {
    const resp = await fetch(
      `https://webmpdeportes.onrender.com/productos/actualizar/${productId}`,
      {
        method:  'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      }
    );
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Error ${resp.status}: ${text}`);
    }

    alert('✅ Producto actualizado con éxito');
    closeEditModal();

    // Refresca la lista (siempre desde la página 1, o la que toque)
    await fetchProducts(1);
  }
  catch(err) {
    console.error("Error al actualizar:", err);
    if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
      alert('No se pudo conectar con el servidor. Verifique su conexión o que el backend esté en funcionamiento.');
    } else {
      alert(`No se pudo actualizar el producto:\n${err.message}`);
    }
  }
}


// Eliminar producto
async function deleteProduct(productId) {
  if (!confirm("¿Está seguro que desea eliminar este producto?")) return;

  try {
    const response = await fetch(`https://webmpdeportes.onrender.com/productos/eliminar/${productId}`, {
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
  // Inicializar botones de talles
  initializeSizeButtons();

  // Mostrar aviso de cargando productos al entrar
  const tbody = document.querySelector('.products-table tbody');
  tbody.innerHTML = `<tr><td colspan="6">Cargando productos...</td></tr>`;

  // Cargar productos
  fetchProducts(currentPage);

  // Configurar formulario
  document.getElementById('editForm').addEventListener('submit', saveProductChanges);
});

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
  currentPage = 1;
  currentSearchTerm = searchTerm;
  if (searchTerm === "") {
    fetchProducts();
  } else {
    searchProducts(searchTerm);
  }
}, 300));