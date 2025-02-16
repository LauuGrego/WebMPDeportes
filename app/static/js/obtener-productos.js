// URL del backend
const API_URL = "http://127.0.0.1:8000/productos/buscar";

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
        const productCard = `
            <div class="card animate__animated animate__fadeInLeft">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <span class="price">$${product.price}</span>
                <div class="card-buttons">
                    <button class="btn-primary animate__animated animate__pulse animate__infinite">Comprar</button>
                    <button class="btn-secondary" onclick="openProductModal('${product.id}')">Ver más</button>
                </div>
            </div>
        `;
        catalogContainer.innerHTML += productCard;
    });
}

// Cargar los productos cuando se inicie la página
document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
});
