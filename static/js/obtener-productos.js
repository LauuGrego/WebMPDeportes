// URL del backend
const API_URL = "https://webmpdeportes.onrender.com/productos/listar";

// Función para obtener productos del backend
async function fetchProducts(searchQuery = "") {
  try {
    let url = API_URL;
    if (searchQuery) {
      url += `?name=${encodeURIComponent(searchQuery)}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error al obtener los productos");
    }

    let products = await response.json();
    displayProducts(products);
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
function displayProducts(products) {
  const productContainer = document.querySelector(".catalog__grid");
  productContainer.innerHTML = ""; // Limpiar productos previos

  if (products.length === 0) {
    productContainer.innerHTML = "<p>No se encontraron productos.</p>";
    return;
  }

  products.forEach(product => {
    const productCard = document.createElement("div");
    productCard.classList.add("catalog__card");

    productCard.innerHTML = `
      <div class="catalog__card-image">
        <img src="https://webmpdeportes.onrender.com/products_image/${product.name.replace(/\s+/g, "_")}.jpg" alt="${product.name}">
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
}

// Función para redirigir a WhatsApp con un mensaje predefinido
async function redirectToWhatsApp(productName) {
  try {
    const encodedProductName = encodeURIComponent(productName);
    const response = await fetch(`https://webmpdeportes.onrender.com/productos/whatsapp_redirect?product_name=${encodedProductName}`);
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

// Cargar productos al inicio
fetchProducts();
