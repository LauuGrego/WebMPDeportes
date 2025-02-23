document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector(".search-input");
    const searchButton = document.querySelector(".btn-primary");
    const productContainer = document.querySelector(".product-cards");

    async function searchProducts() {
        const name = searchInput.value.trim();

        if (name === "") {
            alert("Por favor, ingresa un nombre para buscar.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/productos/buscar?name=${encodeURIComponent(name)}`);
            if (!response.ok) {
                throw new Error("Error al obtener los productos");
            }
            
            const products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error("Error en la búsqueda:", error);
        }
    }

    function displayProducts(products) {
        productContainer.innerHTML = ""; // Limpiar productos previos

        if (products.length === 0) {
            productContainer.innerHTML = "<p>No se encontraron productos.</p>";
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

    searchButton.addEventListener("click", searchProducts);
    searchInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            searchProducts();
        }
    });
});

