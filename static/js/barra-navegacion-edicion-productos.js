document.addEventListener("DOMContentLoaded", () => {
  // Seleccionamos los elementos de la barra de búsqueda y el contenedor de productos
  const searchInput = document.querySelector(".hero__search-input");
  const searchButton = document.querySelector(".hero__search-button");
  const productList = document.getElementById("product-list");

  // Función para desplazar la vista hacia el contenedor de productos
  function scrollToProducts() {
    if (productList) {
      productList.scrollIntoView({ behavior: "smooth" });
    }
  }

  // Función para mostrar los productos en la lista
  function displayProducts(products) {
    productList.innerHTML = ""; // Limpiar la lista
    if (products.length === 0) {
      productList.innerHTML = "<li>No se encontraron productos.</li>";
      return;
    }
    products.forEach(product => {
      const li = document.createElement("li");
      li.classList.add("product-item");
      li.innerHTML = `
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-description">${product.description || "Sin descripción"}</p>
          <p class="product-price">Precio: $${product.price}</p>
          <p class="product-type">Tipo: ${product.type}</p>
          <p class="product-size">Talles: ${Array.isArray(product.size) ? product.size.join(", ") : "No especificado"}</p>
          <p class="product-stock">Stock: ${product.stock}</p>
          <p class="product-category">Categoría: ${product.category_id || "No especificado"}</p>
        </div>
        <div class="product-image">
          ${product.image_url ? `<img src="${product.image_url}" alt="${product.name}" class="img-responsive"/>` : "<p>Sin imagen</p>"}
        </div>
        <div class="product-actions">
          <button class="btn-edit" data-id="${product.id || product._id}"><i class="fas fa-edit"></i> Editar</button>
          <button class="btn-delete" data-id="${product.id || product._id}"><i class="fas fa-trash-alt"></i> Eliminar</button>
        </div>
      `;
      productList.appendChild(li);
    });
  }

  // Función principal para buscar productos
  async function searchProducts() {
    const query = searchInput.value.trim();
    // Si el campo está vacío, se obtienen todos los productos
    const url = query 
      ? `https://webmpdeportes.onrender.com/productos/buscar?name=${encodeURIComponent(query)}`
      : "https://webmpdeportes.onrender.com/productos/listar";

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error("Error al obtener los productos");
      }
      const products = await response.json();
      displayProducts(products);
      scrollToProducts();
    } catch (error) {
      console.error("Error en la búsqueda:", error);
    }
  }

  // Asignamos eventos al botón y al input (con Enter)
  searchButton.addEventListener("click", searchProducts);
  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      searchProducts();
    }
  });
});
