document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.querySelector(".header__search-input");
  const searchButton = document.querySelector(".btn--primary");
  const productContainer = document.querySelector(".catalog__cards");

  // Variables para controlar la paginación y orden aleatorio
  let allProducts = [];
  const itemsPerPage = 6;
  let currentItemsCount = itemsPerPage;

  async function searchProducts() {
    const name = searchInput.value.trim();
    let url = "";

    // Si no se ingresa nada, se obtienen todos los productos
    if (name === "") {
      url = "http://localhost:8000/productos/listar";
    } else {
      url = `http://localhost:8000/productos/buscar?name=${encodeURIComponent(name)}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Error al obtener los productos");
      }
      
      const products = await response.json();
      // Mezcla los productos de manera aleatoria
      allProducts = shuffle(products);
      currentItemsCount = itemsPerPage; // Reinicia la cantidad de items a mostrar
      displayProducts();

      // Desplaza suavemente hacia la sección del catálogo
      productContainer.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Error en la búsqueda:", error);
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

  function displayProducts() {
    productContainer.innerHTML = ""; // Limpiar productos previos

    if (allProducts.length === 0) {
      productContainer.innerHTML = "<p>No se encontraron productos.</p>";
      const loadMoreBtn = document.getElementById("loadMoreBtn");
      if (loadMoreBtn) {
        loadMoreBtn.style.display = "none";
      }
      return;
    }

    // Se muestran solo los productos hasta currentItemsCount
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

  function loadMore() {
    currentItemsCount += itemsPerPage;
    displayProducts();
  }

  searchButton.addEventListener("click", searchProducts);
  searchInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      searchProducts();
    }
  });
});
