document.addEventListener("DOMContentLoaded", function () {
  const typesContainer = document.getElementById("types-buttons");
  const productContainer = document.querySelector(".catalog__cards");

  // Función para crear botones para cada tipo
  function displayTypeButtons(types) {
    typesContainer.innerHTML = ""; // Limpiar botones previos
    types.forEach(type => {
      const button = document.createElement("button");
      button.classList.add("type-button");
      button.textContent = type;
      button.addEventListener("click", () => fetchProductsByType(type));
      typesContainer.appendChild(button);
    });
  }

  // Función para buscar productos filtrados por tipo
  async function fetchProductsByType(type) {
    try {
      const response = await fetch(`https://webmpdeportes.onrender.com/productos/buscar?type=${encodeURIComponent(type)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error("Error al obtener los productos");
      }
      let products = await response.json();

      // Barajar los productos antes de mostrarlos
      displayProducts(products);

      // Desplazar la vista suavemente hacia la sección de productos
      productContainer.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Error en la búsqueda por tipo:", error);
    }
  }

  // Función para mostrar los productos
  function displayProducts(products) {
    productContainer.innerHTML = ""; // Limpiar productos previos

    if (products.length === 0) {
      productContainer.innerHTML = "<p>No se encontraron productos para este tipo.</p>";
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
          <p class="catalog__card-click">Click para ver más</p>
          <button class="whatsapp-button" onclick="redirectToWhatsApp('${product.name}')">Consultar Disponibilidad</button>
        </div>
      `;

      productContainer.appendChild(productCard);
    });
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

  // Cargar los tipos de productos al inicio
  fetch("https://webmpdeportes.onrender.com/productos/listar/tipos", {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  })
    .then(response => response.json())
    .then(types => displayTypeButtons(types))
    .catch(error => console.error("Error cargando los tipos de productos:", error));
});
