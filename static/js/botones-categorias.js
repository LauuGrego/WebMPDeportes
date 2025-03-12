document.addEventListener("DOMContentLoaded", function () {
  const categoriesContainer = document.getElementById("categories-buttons");
  const productContainer = document.querySelector(".catalog__cards");

  // Obtener las categorías al cargar la página
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
      const response = await fetch(`https://webmpdeportes.onrender.com/productos/buscar?category=${encodeURIComponent(category)}`);
      if (!response.ok) {
        throw new Error("Error al obtener los productos");
      }
      const products = await response.json();
      
      displayProducts(products);

      // Desplazar suavemente a la sección de productos
      productContainer.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Error en la búsqueda por categoría:", error);
    }
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

      const imageFormat = getImageFormat(product.image_url);

      productCard.innerHTML = `
        <div class="catalog__card-image" data-format="${imageFormat}">
          <img src="${product.image_url}" alt="${product.name}">
        </div>
        <div class="catalog__card-details">
          <h3 class="catalog__card-title">${product.name}</h3>
          <p class="catalog__card-description">${product.description || "Descripción no disponible"}</p>
          <p class="catalog__card-size">Talles Disponibles: ${product.size || "Sin Stock"}</p>
          <p class="catalog__card-stock">Cantidad Disponible: ${product.stock}</p>
          <p class="catalog__card-click">Click para ver más</p>
          <button class="whatsapp-button" onclick="redirectToWhatsApp('${product.name}')">Consultar Disponibilidad</button>
        </div>
      `;

      productContainer.appendChild(productCard);
    });
  }

  // Función para determinar el formato de la imagen
  function getImageFormat(imageUrl) {
    const img = new Image();
    img.src = imageUrl;
    if (img.width > img.height) {
      return "horizontal";
    } else if (img.width < img.height) {
      return "vertical";
    } else {
      return "square";
    }
  }
 // Función para redirigir a WhatsApp con un mensaje predefinido
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
  // Cargar las categorías al inicio
  fetchCategories();
});
