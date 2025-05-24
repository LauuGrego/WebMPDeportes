document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.querySelector(".header__search-input");
  const searchButton = document.querySelector(".btn--ghost.header__search-btn");
  const productContainer = document.querySelector(".catalog__grid");

  // Estado para paginación con botón
  let currentPage = 1;
  let currentQuery = "";
  let loadedProductIds = new Set();
  let isLastPage = false;


  if (!searchInput || !searchButton || !productContainer) {
    console.error("Elementos del DOM no encontrados. Verifica las clases en el HTML.");
    return;
  }

  async function searchProducts(reset = true) {
    if (reset) {
      currentPage = 1;
      loadedProductIds = new Set(); // Reinicia el Set para evitar duplicados en la primera búsqueda
      currentQuery = searchInput.value.trim();
      productContainer.innerHTML = "";
      isLastPage = false;
      window.scrollTo(0, 0); // Ir al principio de la página al buscar
    }
    // Mostrar aviso de cargando productos
    productContainer.innerHTML = "<p>Cargando productos...</p>";

    let url;
    const limit = 20;
    // Si la barra de búsqueda está vacía, listar productos normalmente
    if (!currentQuery) {
      url = `http://127.0.0.1:8000/productos/listar?page=${currentPage}&limit=${limit}`;
    } else {
      url = `http://127.0.0.1:8000/productos/buscar?name=${encodeURIComponent(currentQuery)}&page=${currentPage}&limit=${limit}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al obtener los productos: ${response.statusText}`);
      }
      let data = await response.json();
      let products;
      if (Array.isArray(data)) {
        products = data;
      } else if (Array.isArray(data.products)) {
        products = data.products;
      } else {
        products = [];
      }
      // Filtrar productos ya mostrados
      products = products.filter(p => !loadedProductIds.has(p.id));
      displayProducts(products);
      // No mostrar el botón "Ver más"
      isLastPage = true;
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      productContainer.innerHTML = "<p>Error al cargar los productos.</p>";
      // No mostrar el botón "Ver más"
    }
  }

  function displayProducts(products) {
    // Elimina cualquier aviso de "Cargando productos..." antes de mostrar productos
    if (productContainer.innerHTML.includes("Cargando productos")) {
      productContainer.innerHTML = "";
    }
    if (!products || !Array.isArray(products) || products.length === 0) {
      if (productContainer.innerHTML === "") {
        productContainer.innerHTML = "<p>No se encontraron productos.</p>";
      }
      return;
    }
    products.forEach(product => {
      if (loadedProductIds.has(product.id)) return; // Evita duplicados
      loadedProductIds.add(product.id);
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
            <button class="catalog__details-button" onclick="window.location.href='../productos/producto.html?id=${product.id}'">
              Ver detalles
            </button>
            <a href="https://wa.me/3445417684/?text=¡Hola! Quiero saber más info acerca de ${product.name}." class="catalog__card-button" target="_blank">
              <i class="fab fa-whatsapp"></i> Consultar
            </a>
          </div>
        </div>
      `;

      productContainer.appendChild(productCard);
    });
  }

  // Elimina la carga inicial automática de productos aquí
  // searchProducts(true);

  // Eventos de búsqueda
  searchButton.addEventListener("click", function () {
    searchProducts(true);
  });
  searchInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      productContainer.innerHTML = "";
      searchProducts(true);
    }
  });
});
