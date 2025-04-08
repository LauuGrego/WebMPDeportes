document.addEventListener("DOMContentLoaded", function () {
  const categoriesContainer = document.getElementById("categories-buttons");
  const productContainer = document.querySelector(".catalog__grid");
  const sidebarCategoriesContainer = document.querySelector(".sidebar__categories"); // New container for sidebar
  const headerCategoriesContainer = document.querySelector(".header__categories"); // New container for header

  // Fetch categories and display buttons
  async function fetchCategories() {
    try {
      const response = await fetch("https://webmpdeportes.onrender.com/categorias/listar-public");
      if (!response.ok) {
        throw new Error("Error al obtener las categorías");
      }
      const categories = await response.json();
      displayCategoryButtons(categories);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  }

  // Display category buttons in all containers
  function displayCategoryButtons(categories) {
    const sidebarCats = document.getElementById("categories-buttons");
    sidebarCats.innerHTML = "";
  
    categories.forEach(category => {
      const btn = document.createElement("button");
      btn.classList.add("category-button");
      btn.textContent = category.name;
      btn.addEventListener("click", () => fetchProductsByCategory(category.name));
      sidebarCats.appendChild(btn);
    });
  }

  // Fetch products by category
  async function fetchProductsByCategory(category) {
    try {
      const response = await fetch(`https://webmpdeportes.onrender.com/productos/buscar?category=${encodeURIComponent(category)}`);
      if (!response.ok) {
        throw new Error("Error al obtener los productos");
      }
      const products = await response.json();
      displayProducts(products);
    } catch (error) {
      console.error("Error en la búsqueda por categoría:", error);
    }
  }

  // Display products in the container
  function displayProducts(products) {
    productContainer.innerHTML = ""; // Clear previous products

    if (products.length === 0) {
      productContainer.innerHTML = "<p>No se encontraron productos en esta categoría.</p>";
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

  // Function to redirect to WhatsApp with a predefined message
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

  // New function to handle the "View Details" button
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

  // Load categories on page load
  fetchCategories();
});
