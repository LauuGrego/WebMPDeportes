document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.querySelector(".header__search-input");
  const searchButton = document.querySelector(".btn--ghost.header__search-btn");
  const productContainer = document.querySelector(".catalog__grid");

  if (!searchInput || !searchButton || !productContainer) {
    console.error("Elementos del DOM no encontrados. Verifica las clases en el HTML.");
    return;
  }

  async function searchProducts() {
    const query = searchInput.value.trim();
    let url = query === "" 
      ? "https://webmpdeportes-production.up.railway.app/productos/listar?page=1&limit=12"
      : `https://webmpdeportes-production.up.railway.app/productos/listar?search=${encodeURIComponent(query)}&page=1&limit=12`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al obtener los productos: ${response.statusText}`);
      }
      let data = await response.json();
      // Si la respuesta es { products: [...] }
      let products = Array.isArray(data) ? data : data.products;
      displayProducts(products);
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      productContainer.innerHTML = "<p>Error al cargar los productos.</p>";
    }
  }

  function displayProducts(products) {
    productContainer.innerHTML = ""; // Limpiar productos previos

    if (!products || !Array.isArray(products) || products.length === 0) {
      productContainer.innerHTML = "<p>No se encontraron productos.</p>";
      return;
    }

    products.forEach(product => {
      const productCard = document.createElement("div");
      productCard.classList.add("catalog__card");

      const productImage = product.image_url || 'https://res.cloudinary.com/demo/image/upload/v1/products/default-product.jpg';
      const formattedPrice = product.price
        ? `$${product.price.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "Consultar";

      productCard.innerHTML = `
        <div class="catalog__card-image">
          <img src="${productImage}" alt="${product.name}">
        </div>
        <div class="catalog__card-details">
          <h3 class="catalog__card-title">${product.name}</h3>
          <p class="catalog__card-price">${formattedPrice}</p>
          <div class="catalog__card-actions">
            <a href="https://wa.me/3445417684/?text=¡Hola! Quiero saber más info acerca de ${product.name}." class="catalog__card-button" target="_blank">
              <i class="fab fa-whatsapp"></i> Consultar
            </a>
            <button class="catalog__details-button" onclick="window.location.href='../productos/producto.html?id=${product.id}'">
              Ver detalles
            </button>
          </div>
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

  // Cargar productos iniciales al entrar en la página
  searchProducts();
});
