document.addEventListener("DOMContentLoaded", function () {
  const categoriesContainer = document.getElementById("categories-buttons");
  const productContainer = document.querySelector(".catalog__cards");

  // Variables globales para controlar la paginación y el orden aleatorio
  let allProducts = [];
  const itemsPerPage = 6; // Número de productos a mostrar por "página"
  let currentItemsCount = itemsPerPage;
  let currentCategory = ""; // Almacena la categoría actual seleccionada

  async function fetchCategories() {
    try {
      const response = await fetch("http://localhost:8000/categorias/listar-public");
      if (!response.ok) {
        throw new Error("Error al obtener las categorías");
      }
      const categories = await response.json();
      displayCategoryButtons(categories);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  }

  function displayCategoryButtons(categories) {
    categoriesContainer.innerHTML = ""; // Limpiar botones previos
    categories.forEach(category => {
      const button = document.createElement("button");
      button.classList.add("category-button");
      button.textContent = category.name;
      button.addEventListener("click", () => fetchProductsByCategory(category.name));
      categoriesContainer.appendChild(button);
    });
  }

  async function fetchProductsByCategory(category) {
    currentCategory = category; // Guardamos la categoría seleccionada
    try {
      const response = await fetch(`http://localhost:8000/productos/buscar?category=${encodeURIComponent(category)}`);
      if (!response.ok) {
        throw new Error("Error al obtener los productos");
      }
      const products = await response.json();
      // Barajar los productos de forma aleatoria
      allProducts = shuffle(products);
      currentItemsCount = itemsPerPage; // Reiniciamos la cantidad de productos a mostrar
      displayProducts();

      // Desplazar la vista suavemente hacia la sección de productos
      productContainer.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Error en la búsqueda por categoría:", error);
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

  // Función para mostrar los productos con paginación
  function displayProducts() {
    productContainer.innerHTML = ""; // Limpiar productos previos

    if (allProducts.length === 0) {
      productContainer.innerHTML = "<p>No se encontraron productos en esta categoría.</p>";
      const loadMoreBtn = document.getElementById("loadMoreBtn");
      if (loadMoreBtn) loadMoreBtn.style.display = "none";
      return;
    }

    // Mostrar solo los productos hasta currentItemsCount
    const productsToShow = allProducts.slice(0, currentItemsCount);
    productsToShow.forEach(product => {
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
        </div>
      `;
      productContainer.appendChild(productCard);
    });

    // Mostrar u ocultar el botón "Ver más" según queden productos por mostrar
    let loadMoreBtn = document.getElementById("loadMoreBtn");
    if (!loadMoreBtn) {
      loadMoreBtn = document.createElement("button");
      loadMoreBtn.id = "loadMoreBtn";
      loadMoreBtn.classList.add("btn--primary");
      loadMoreBtn.textContent = "Ver más";
      productContainer.parentNode.appendChild(loadMoreBtn);
      loadMoreBtn.addEventListener("click", loadMore);
    }
    loadMoreBtn.style.display = currentItemsCount < allProducts.length ? "block" : "none";
  }

  // Función que incrementa la cantidad de productos mostrados y refresca el catálogo
  function loadMore() {
    currentItemsCount += itemsPerPage;
    displayProducts();
  }

  // Cargar las categorías al inicio
  fetchCategories();
});
