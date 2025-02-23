document.addEventListener("DOMContentLoaded", function () {
    const categoriesContainer = document.getElementById("categories-buttons");
    const productContainer = document.querySelector(".product-cards");

    async function fetchCategories() {
        try {
            const response = await fetch("http://localhost:8000/categorias/listar-public");
            if (!response.ok) {
                throw new Error("Error al obtener las categorías");
            }
            
            const categories = await response.json();
            displayCategoryButtons(categories);
        } catch (error) {
            console.error("Error cargando categorías:", error);
        }
    }

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

    async function fetchProductsByCategory(category) {
        try {
            const response = await fetch(`http://localhost:8000/productos/buscar?category=${encodeURIComponent(category)}`);
            if (!response.ok) {
                throw new Error("Error al obtener los productos");
            }
            
            const products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error("Error en la búsqueda por categoría:", error);
        }
    }

    function displayProducts(products) {
        productContainer.innerHTML = ""; // Limpiar productos previos

        if (products.length === 0) {
            productContainer.innerHTML = "<p>No se encontraron productos en esta categoría.</p>";
            return;
        }

        products.forEach(product => {
            const productCard = document.createElement("div");
            productCard.classList.add("product-card");

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

            productContainer.appendChild(productCard);
        });
    }

    fetchCategories(); // Cargar las categorías al inicio
});

