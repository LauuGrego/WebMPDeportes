// URL del backend
const API_URL = "http://127.0.0.1:8000/productos/listar";

// Variables globales para controlar la paginación
let allProducts = [];
const itemsPerPage = 6; // Número de productos a mostrar por "página"
let currentItemsCount = itemsPerPage;

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
    // Barajamos los productos aleatoriamente
    allProducts = shuffle(products);
    displayProducts();
  } catch (error) {
    console.error(error);
  }
}

// Función para barajar un array (algoritmo Fisher-Yates)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Función para mostrar productos en el catálogo (solo los que se deben visualizar)
function displayProducts() {
  const catalogContainer = document.querySelector(".catalog__cards");
  catalogContainer.innerHTML = ""; // Limpiar catálogo antes de agregar nuevos productos

  // Se muestran solo los productos hasta currentItemsCount
  const productsToShow = allProducts.slice(0, currentItemsCount);
  productsToShow.forEach((product) => {
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

  // Mostrar u ocultar el botón "Ver más" según queden productos por mostrar
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (currentItemsCount < allProducts.length) {
    loadMoreBtn.style.display = "block";
  } else {
    loadMoreBtn.style.display = "none";
  }
}

// Función que incrementa la cantidad de productos mostrados y refresca el catálogo
function loadMore() {
  currentItemsCount += itemsPerPage;
  displayProducts();
}

// Al cargar el DOM, se obtienen los productos y se asigna el evento al botón "Ver más"
document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();

  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", loadMore);
  }
});
