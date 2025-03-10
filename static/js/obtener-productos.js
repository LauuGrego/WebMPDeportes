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
    // Barajamos los productos aleatoriamente
    products = shuffleArray(products);

    displayProducts(products);
  } catch (error) {
    console.error(error);
  }
}

// Función para barajar un array (algoritmo Fisher-Yates)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Función para mostrar productos en el catálogo
function displayProducts(products) {
  const catalogContainer = document.querySelector(".catalog__cards");
  catalogContainer.innerHTML = ""; // Limpiar catálogo antes de agregar nuevos productos

  if (products.length === 0) {
    catalogContainer.innerHTML = "<p>No se encontraron productos.</p>";
    return;
  }

  products.forEach((product) => {
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
    catalogContainer.appendChild(productCard);
  });
}
  // Función para redirigir a WhatsApp con un mensaje predefinido
  function redirectToWhatsApp(productName) {
    const message = `¡Hola! Quiero saber más info acerca de ${productName}`;
    const whatsappUrl = `https://wa.me/3445417684?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
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
