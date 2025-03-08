document.addEventListener("DOMContentLoaded", function () {
  const categoriesContainer = document.getElementById("categories-buttons");
  const productContainer = document.querySelector(".catalog__cards");

  // Obtener las categorías al cargar la página
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

  // Función para mostrar los botones de categorías
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

  // Obtener productos por categoría
  async function fetchProductsByCategory(category) {
    try {
      const response = await fetch(`http://localhost:8000/productos/buscar?category=${encodeURIComponent(category)}`);
      if (!response.ok) {
        throw new Error("Error al obtener los productos");
      }
      const products = await response.json();
      
      // Barajar los productos antes de mostrarlos
      const shuffledProducts = shuffleArray(products);
      displayProducts(shuffledProducts);

      // Desplazar suavemente a la sección de productos
      productContainer.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Error en la búsqueda por categoría:", error);
    }
  }

  // **Función para barajar productos aleatoriamente (Fisher-Yates)**
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Intercambiar elementos
    }
    return array;
  }

  // Mostrar los productos en el contenedor
  function displayProducts(products) {
    productContainer.innerHTML = ""; // Limpiar productos previos

    if (products.length === 0) {
      productContainer.innerHTML = "<p>No se encontraron productos en esta categoría.</p>";
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
        </div>
      `;

      productContainer.appendChild(productCard);
    });
  }

  // Cargar las categorías al inicio
  fetchCategories();
});
