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

// Función para mostrar productos en el catálogo
function displayProducts(products) {
  productContainer.innerHTML = ""; // Limpiar productos previos

  if (products.length === 0) {
    productContainer.innerHTML = "<p>No se encontraron productos para este tipo.</p>";
    return;
  }

  products.forEach(product => {
    const productCard = document.createElement("div");
    productCard.classList.add("catalog__card", "animate__animated", "animate__fadeInUp");

    productCard.innerHTML = `
      <div class="catalog__card-image">
        <img src="${product.image_url}" alt="${product.name}">
      </div>
      <div class="catalog__card-details">
        <h3 class="catalog__card-title">${product.name}</h3>
        <p class="catalog__card-description">${product.description || "Descripción no disponible"}</p>
        <p class="catalog__card-size">Talles Disponibles: ${product.size || "Sin Stock"}</p>
        <p class="catalog__card-stock">Cantidad Disponible: ${product.stock}</p>
        <p class="catalog__card-click">Click para ver más</p>
        <button class="whatsapp-button" onclick="redirectToWhatsApp('${product.name}')">Consultar Disponibilidad</button>
      </div>
    `;

    productContainer.appendChild(productCard);
  });
}

// Función para redirigir a WhatsApp con un mensaje predefinido
async function redirectToWhatsApp(productName) {
  try {
    const response = await fetch(`https://webmpdeportes.onrender.com/productos/whatsapp_redirect?product_name=${encodeURIComponent(productName)}`);
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

// Cargar productos al inicio
fetchProducts();
