// URL del backend
const API_URL = "http://127.0.0.1:8000/productos/listar";

let currentPage = 1; // Track the current page
const productsPerPage = 10; // Number of products per page

// Función para obtener productos del backend
async function fetchProducts(searchQuery = "", page = 1) {
  try {
    let url = `${API_URL}?page=${page}&limit=${productsPerPage}`;
    if (searchQuery) {
      url += `&name=${encodeURIComponent(searchQuery)}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error al obtener los productos");
    }

    const products = await response.json();
    displayProducts(products, page);
  } catch (error) {
    console.error(error);
  }
}

// Función para ver detalles del producto (redirige a nueva página)
function viewDetails(productId) {
  // Guardar el ID del producto en localStorage para usarlo en la página de detalles
  localStorage.setItem('selectedProductId', productId);
  
  // Redirigir a la página de detalles
  window.location.href = './../productos/producto.html';
}

// Función para mostrar productos en el catálogo
function displayProducts(products, page) {
  const productContainer = document.querySelector(".catalog__grid");
  const loadMoreButton = document.getElementById("load-more-button");

  if (page === 1) {
    productContainer.innerHTML = ""; // Clear previous products only on the first page
  }

  if (products.length === 0 && page === 1) {
    productContainer.innerHTML = "<p>No se encontraron productos.</p>";
    loadMoreButton.style.display = "none"; // Hide the button if no products
    return;
  }

  products.forEach(product => {
    const productCard = document.createElement("div");
    productCard.classList.add("catalog__card");

    // Use Cloudinary image URL or fallback to a default image
    const productImage = product.image_url || '/static/images/default-product.png';

    productCard.innerHTML = `
      <div class="catalog__card-image">
        <img src="${productImage}" alt="${product.name}">
      </div>
      <div class="catalog__card-details">
        <h3 class="catalog__card-title">${product.name}</h3>
        <p class="catalog__card-description">${product.description || "Descripción no disponible"}</p>
        <div class="catalog__card-actions">
          <button class="catalog__card-button" onclick="redirectToWhatsApp('${product.name}')">
            <i class="fab fa-whatsapp"></i> Consultar
          </button>
          <button class="catalog__details-button" onclick="viewDetails('${product.id}')">
            Ver detalles
          </button>
        </div>
      </div>
    `;

    productContainer.appendChild(productCard);
  });

  // Show or hide the "Ver más" button based on the number of products returned
  if (products.length < productsPerPage) {
    loadMoreButton.style.display = "none";
  } else {
    loadMoreButton.style.display = "block";
  }
}

// Función para redirigir a WhatsApp con un mensaje predefinido
async function redirectToWhatsApp(productName) {
  try {
    const encodedProductName = encodeURIComponent(productName);
    const response = await fetch(`http://127.0.0.1:8000/productos/whatsapp_redirect?product_name=${encodedProductName}`);
    if (!response.ok) {
      throw new Error(`Error al redirigir a WhatsApp: ${response.statusText}`);
    }
    const data = await response.json();
    window.open(data.url, "_blank");
  } catch (error) {
    console.error("Error en la redirección a WhatsApp:", error);
  }
}

function getImageFormat(imageUrl) {
  const img = new Image();
  img.src = imageUrl;
  if (img.width > img.height) {
    return "horizontal";
  } else if (img.width < img.height) {
    return "vertical";
  } else {
    return "square";
  }
}

// Funcionalidad para cerrar el modal
document.addEventListener("click", function (event) {
  const modal = document.getElementById("product-details-modal");
  if (event.target.id === "close-product-modal" || event.target === modal) {
    modal.style.display = "none"; // Ocultar el modal
  }
});

// Event listener for the "Ver más" button
document.getElementById("load-more-button").addEventListener("click", () => {
  currentPage++;
  fetchProducts("", currentPage);
});

// Cargar productos al inicio
fetchProducts();
