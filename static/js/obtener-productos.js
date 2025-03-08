// URL del backend
const API_URL = "http://127.0.0.1:8000/productos/listar";

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
      </div>
    `;
    catalogContainer.appendChild(productCard);
  });
}

// Cargar productos al inicio
fetchProducts();
