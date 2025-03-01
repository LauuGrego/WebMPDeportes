document.addEventListener("DOMContentLoaded", function () {
    const typesContainer = document.getElementById("types-buttons");
    const productContainer = document.querySelector(".catalog__cards");
  
    // Función para obtener los tipos de productos desde el backend
    async function fetchTypes() {
      try {
        const response = await fetch("http://localhost:8000/productos/listar/tipos", {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
          throw new Error("Error al obtener los tipos de productos");
        }
        const types = await response.json();
        displayTypeButtons(types);
      } catch (error) {
        console.error("Error cargando los tipos de productos:", error);
      }
    }
  
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
        const response = await fetch(`http://localhost:8000/productos/buscar?type=${encodeURIComponent(type)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
          throw new Error("Error al obtener los productos");
        }
        const products = await response.json();
        displayProducts(products);
        // Desplazar la vista suavemente hacia el contenedor de productos
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
          </div>
        `;
        productContainer.appendChild(productCard);
      });
    }
  
    // Llamar a la función para cargar los tipos de productos al inicio
    fetchTypes();
  });
  