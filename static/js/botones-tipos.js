document.addEventListener("DOMContentLoaded", function () {
  const typesContainer = document.getElementById("types-buttons");
  const productContainer = document.querySelector(".catalog__grid");
  const hamburgerMenuTypes = document.querySelector("#hamburger-menu-content .header__types");

  // Fetch types and display buttons
  async function fetchTypes() {
    try {
      const response = await fetch("https://webmpdeportes.onrender.com/productos/listar/tipos");
      if (!response.ok) {
        throw new Error("Error al obtener los tipos de productos");
      }
      const types = await response.json();
      displayTypeButtons(types);
    } catch (error) {
      console.error("Error cargando los tipos de productos:", error);
    }
  }

  // Display type buttons in both containers
  function displayTypeButtons(types) {
    typesContainer.innerHTML = ""; // Clear previous buttons

    types.forEach(type => {
      const button = document.createElement("button");
      button.classList.add("type-button");
      button.textContent = type;
      button.addEventListener("click", () => fetchProductsByType(type));
      typesContainer.appendChild(button);
    });
  }

  // Fetch products by type
  async function fetchProductsByType(type) {
    try {
      const response = await fetch(`https://webmpdeportes.onrender.com/productos/buscar?type=${encodeURIComponent(type)}`);
      if (!response.ok) {
        throw new Error("Error al obtener los productos");
      }
      const products = await response.json();
      displayProducts(products);
    } catch (error) {
      console.error("Error en la búsqueda por tipo:", error);
    }
  }

  // Display products
  function displayProducts(products) {
    productContainer.innerHTML = ""; // Clear previous products

    if (products.length === 0) {
      productContainer.innerHTML = "<p>No se encontraron productos para este tipo.</p>";
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

  // Redirect to WhatsApp with predefined message
  async function redirectToWhatsApp(productName) {
    try {
      const response = await fetch(`https://webmpdeportes.onrender.com/productos/whatsapp_redirect?product_name=${encodeURIComponent(productName)}`);
      if (!response.ok) {
        throw new Error(`Error al redirigir a WhatsApp: ${response.statusText}`);
      }
      const data = await response.json();
      window.open(data.url, "_blank");
    } catch (error) {
      console.error("Error en la redirección a WhatsApp:", error);
    }
  }

  // Handle "View Details" button
  function viewDetails(productId) {
    const modal = document.getElementById("product-details-modal");
    const modalImage = modal.querySelector(".modal__image");
    const modalInfo = modal.querySelector(".modal__info");

    // Fetch product details dynamically
    fetch(`https://webmpdeportes.onrender.com/productos/detalles/${productId}`)
      .then(response => response.json())
      .then(product => {
        modalImage.innerHTML = `<img src="/products_image/${product.name.replace(/\s+/g, "_")}.jpg" alt="${product.name}">`;
        modalInfo.innerHTML = `
          <h2>${product.name}</h2>
          <p>${product.description || "Descripción no disponible"}</p>
          <p><strong>Stock:</strong> ${product.stock}</p>
          <button class="btn--primary" onclick="redirectToWhatsApp('${product.name}')">
            <i class="fab fa-whatsapp"></i> Consultar
          </button>
        `;
        modal.style.display = "flex"; // Show the modal
      })
      .catch(error => console.error("Error al cargar los detalles del producto:", error));
  }

  // Close modal functionality
  document.getElementById("close-product-modal").addEventListener("click", () => {
    document.getElementById("product-details-modal").style.display = "none";
  });

  // Load types on page load
  fetchTypes();
});
