document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.querySelector(".header__search-input");
  const searchButton = document.querySelector(".btn--primary");
  const productContainer = document.querySelector(".catalog__grid");

  if (!searchInput || !searchButton || !productContainer) {
    console.error("Elementos del DOM no encontrados. Verifica las clases en el HTML.");
    return;
  }

  async function searchProducts() {
    const query = searchInput.value.trim();
    let url = query === "" 
      ? "webmpdeportes-production.up.railway.app/productos/listar" 
      : `webmpdeportes-production.up.railway.app/productos/buscar?name=${encodeURIComponent(query)}&type=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al obtener los productos: ${response.statusText}`);
      }
      
      let products = await response.json();
      displayProducts(products);
      // productContainer.scrollIntoView({ behavior: "smooth" }); // Removed auto-scroll
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      productContainer.innerHTML = "<p>Error al cargar los productos.</p>";
    }
  }

  function displayProducts(products) {
    productContainer.innerHTML = ""; // Limpiar productos previos

    if (!products || products.length === 0) {
      productContainer.innerHTML = "<p>No se encontraron productos.</p>";
      return;
    }

    products.forEach(product => {
      const productCard = document.createElement("div");
      productCard.classList.add("catalog__card");

      productCard.innerHTML = `
        <div class="catalog__card-image">
          <img src="/products_image/${product.name.replace(/\s+/g, "_")}.jpg" alt="${product.name}">
        </div>
        <div class="catalog__card-details">
          <h3 class="catalog__card-title">${product.name}</h3>
          <p class="catalog__card-description">${product.description || "Descripción no disponible"}</p>
          <p class="catalog__card-stock">Stock: ${product.stock}</p>
          <div class="catalog__card-actions">
            <button class="catalog__card-button" onclick="redirectToWhatsApp('${product.name}')">
              <i class="fab fa-whatsapp"></i> Consultar
            </button>
            <button class="catalog__details-button" onclick="viewDetails('${product.id}')">
              Ver detalles
            </button>
          </div>
        </div>
      `;

      productContainer.appendChild(productCard);
    });
  }

  // Función para redirigir a WhatsApp con un mensaje predefinido
  async function redirectToWhatsApp(productName) {
    try {
      const response = await fetch(`webmpdeportes-production.up.railway.app/productos/whatsapp_redirect?product_name=${encodeURIComponent(productName)}`);
      if (!response.ok) {
        throw new Error(`Error al redirigir a WhatsApp: ${response.statusText}`);
      }
      const data = await response.json();
      window.open(data.url, "_blank");
    } catch (error) {
      console.error("Error en la redirección a WhatsApp:", error);
    }
  }

  // Nueva función para manejar el botón "Ver detalles"
  function viewDetails(productId) {
    console.log(`Ver detalles del producto con ID: ${productId}`);
    // Aquí puedes redirigir a una página de detalles o mostrar un modal
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

document.addEventListener("DOMContentLoaded", () => {
  // Verifica que los elementos del DOM existan antes de interactuar con ellos
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (!navToggle) {
    console.error("Elemento con la clase '.nav-toggle' no encontrado. Verifica el HTML.");
    return;
  }

  if (!navMenu) {
    console.error("Elemento con la clase '.nav-menu' no encontrado. Verifica el HTML.");
    return;
  }

  // Agregar evento para alternar la visibilidad del menú
  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("is-active");
  });
});
