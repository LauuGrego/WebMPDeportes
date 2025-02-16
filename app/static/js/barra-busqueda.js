const API_URL = "http://127.0.0.1:8000/productos/buscar";

// Función para obtener productos con filtros
async function fetchProducts(filters = {}) {
    try {
        // Construir la URL con los parámetros de búsqueda
        const url = new URL(API_URL);
        Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined && filters[key] !== "") {
                url.searchParams.append(key, filters[key]);
            }
        });

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
                <img src="${product.image_url}" alt="${product.name}">
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

// Cargar productos al iniciar la página
document.addEventListener("DOMContentLoaded", () => {
    fetchProducts(); // Cargar todos los productos inicialmente

    // Cargar categorías dinámicamente en el filtro
    loadCategories();

    // Barra de búsqueda
    const searchInput = document.getElementById("search-name");
    searchInput.addEventListener("input", () => {
        const searchQuery = searchInput.value.trim();
        const filters = getFilters();
        filters.name = searchQuery; // Agregar el nombre a los filtros
        fetchProducts(filters);
    });

    // Formulario de filtros
    const searchFiltersForm = document.getElementById("search-filters");
    searchFiltersForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Evitar recargar la página
        const filters = getFilters();
        fetchProducts(filters);
    });
});

// Función para obtener los valores de los filtros
function getFilters() {
    return {
        name: document.getElementById("search-name").value,
        min_price: document.getElementById("min-price").value,
        max_price: document.getElementById("max-price").value,
        type: document.getElementById("search-type").value,
        category: document.getElementById("search-category").value,
        size: document.getElementById("search-size").value,
    };
}

// Función para cargar categorías en el filtro
async function loadCategories() {
    try {
        const response = await fetch("http://127.0.0.1:8000/listar");
        if (!response.ok) {
            throw new Error("Error al obtener las categorías");
        }

        const categories = await response.json();
        const categorySelect = document.getElementById("search-category");

        // Limpiar y agregar opciones
        categorySelect.innerHTML = '<option value="">Todas las categorías</option>';
        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar categorías:", error);
    }
}

function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

const searchInput = document.getElementById("search-name");
searchInput.addEventListener("input", debounce(() => {
    const searchQuery = searchInput.value.trim();
    const filters = getFilters();
    filters.name = searchQuery;
    fetchProducts(filters);
}));