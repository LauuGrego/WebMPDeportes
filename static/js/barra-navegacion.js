document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.querySelector(".header__search-input");
  const searchButton = document.querySelector(".btn--primary");
  const productContainer = document.querySelector(".catalog__cards");

  async function searchProducts() {
    const query = searchInput.value.trim();
    let url = query === "" 
      ? "http://localhost:8000/productos/listar" 
      : `http://localhost:8000/productos/buscar?name=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Error al obtener los productos");
      }
      
      const products = await response.json();
      displayProducts(products); // Mostrar todos los productos de una vez
      productContainer.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Error en la búsqueda:", error);
    }
  }

  function displayProducts(products) {
    productContainer.innerHTML = ""; // Limpiar productos previos

    if (products.length === 0) {
      productContainer.innerHTML = "<p>No se encontraron productos.</p>";
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

  // Eventos de búsqueda
  searchButton.addEventListener("click", searchProducts);
  searchInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      searchProducts();
    }
  });

  // Cargar productos iniciales
  searchProducts();
});
