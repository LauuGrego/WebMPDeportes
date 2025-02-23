// URL del backend
const API_URL = "http://127.0.0.1:8000/productos/listar";

// Función para obtener productos del backend
async function fetchProducts(searchQuery = "") {
    try {
        let url = API_URL;
        if (searchQuery) {
            url += `?name=${encodeURIComponent(searchQuery)}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Error al obtener los productos");
        }

        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error(error);
    }
}

// Función para mostrar productos en el catálogo
function displayProducts(products) {
    const catalogContainer = document.querySelector(".product-cards");
    catalogContainer.innerHTML = ""; // Limpiar catálogo antes de agregar nuevos productos

    products.forEach((product) => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card", "animate__animated", "animate__fadeInUp");

        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image_url}" alt="${product.name}">
            </div>
            <div class="product-details">
                <h3>${product.name}</h3>
                <p class="product-description">${product.description || "Descripción no disponible"}</p>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <p class="product-description">Cantidad Disponible : ${product.stock}</p>
        `;
        catalogContainer.appendChild(productCard);
    });
}

// Cargar los productos cuando se inicie la página
document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
});

