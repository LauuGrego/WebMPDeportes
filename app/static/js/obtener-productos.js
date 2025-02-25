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

    const products = await response.json();
    displayProducts(products);
  } catch (error) {
    console.error(error);
  }
}

// Función para mostrar productos en el catálogo
function displayProducts(products) {
  // Seleccionamos el contenedor usando la clase BEM actual
  const catalogContainer = document.querySelector(".catalog__cards");
  catalogContainer.innerHTML = ""; // Limpiar catálogo antes de agregar nuevos productos

  products.forEach((product) => {
    const productCard = document.createElement("div");
    // Usamos la clase BEM para la tarjeta de producto y añadimos las animaciones
    productCard.classList.add("catalog__card", "animate__animated", "animate__fadeInUp");

    productCard.innerHTML = `
      <div class="catalog__card-image">
        <img src="${product.image_url}" alt="${product.name}">
      </div>
      <div class="catalog__card-details">
        <h3 class="catalog__card-title">${product.name}</h3>
        <p class="catalog__card-description">${product.description || "Descripción no disponible"}</p>
        <p class="catalog__card-price">$${product.price.toFixed(2)}</p>
        <p class="catalog__card-stock">Cantidad Disponible: ${product.stock}</p>
      </div>
    `;
    catalogContainer.appendChild(productCard);
  });
}

// Cargar los productos cuando se inicie la página
document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
});
