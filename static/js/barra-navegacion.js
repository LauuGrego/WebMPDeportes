document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.querySelector(".header__search-input");
  const searchButton = document.querySelector(".btn--primary");
  const productContainer = document.querySelector(".catalog__cards");

  if (!searchInput || !searchButton || !productContainer) {
    console.error("Elementos del DOM no encontrados. Verifica las clases en el HTML.");
    return;
  }

  async function searchProducts() {
    const query = searchInput.value.trim();
    let url = query === "" 
      ? "https://webmpdeportes.onrender.com/productos/listar" 
      : `https://webmpdeportes.onrender.com/productos/buscar?name=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al obtener los productos: ${response.statusText}`);
      }
      
      let products = await response.json();
      console.log("Productos antes de barajar:", products); // Debug
      products = shuffleArray([...products]); // Asegurar que estamos barajando una copia y no mutando directamente
      console.log("Productos después de barajar:", products); // Debug

      displayProducts(products);
      productContainer.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      productContainer.innerHTML = "<p>Error al cargar los productos.</p>";
    }
  }

  // **Función para barajar productos aleatoriamente (Fisher-Yates)**
  function shuffleArray(array) {
    let shuffled = [...array]; // Crear una copia para evitar mutaciones inesperadas
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function displayProducts(products) {
    productContainer.innerHTML = ""; // Limpiar productos previos

    if (!products || products.length === 0) {
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
          <p class="catalog__card-click">Click para ver más</p>
          <button class="whatsapp-button" onclick="redirectToWhatsApp('${product.name}')">Consultar Disponibilidad</button>
        </div>
      `;

      productContainer.appendChild(productCard);
    });
  }
  // Función para redirigir a WhatsApp con un mensaje predefinido
  function redirectToWhatsApp(productName) {
    const message = `¡Hola! Quiero saber más info acerca de ${productName}`;
    const whatsappUrl = `https://wa.me/3445417684?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  }

  // Eventos de búsqueda
  searchButton.addEventListener("click", searchProducts);
  searchInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      searchProducts();
    }
  });

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


  // Cargar productos iniciales al entrar en la página
  searchProducts();
});
