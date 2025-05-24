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
          ${product.image ? `<img src="/products_image/${product.name.replace(/\s+/g, "_")}.jpg" alt="${product.name}" class="img-responsive"/>` : "<p>Sin imagen</p>"}
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
    // Mostrar aviso de carga
    productList.innerHTML = "<li>Cargando productos...</li>";
    let url = query === ""
      ? "http://127.0.0.1:8000/productos/listar"
      : `http://127.0.0.1:8000/productos/buscar?name=${encodeURIComponent(query)}&type=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al obtener los productos: ${response.statusText}`);
      }
      // Si es listar, obtener products del objeto, si es buscar, es un array
      let data = await response.json();
      let products = Array.isArray(data) ? data : data.products;
      displayProducts(products);
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      productList.innerHTML = "<li>Error al cargar los productos.</li>";
    }
  }

  // Asignamos eventos al botón y al input (con Enter)
  searchButton.addEventListener("click", searchProducts);
  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      searchProducts();
    }
  });

  // Cargar productos iniciales al entrar en la página
  searchProducts();
});
