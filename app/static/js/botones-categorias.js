document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("http://localhost:8000/categorias/listar"); // Ruta ya existente
        const categories = await response.json();

        const categoriesContainer = document.querySelector(".categories");

        // Mantener el botón "Más populares"
        categoriesContainer.innerHTML = `<button class="category-btn active animate__animated animate__fadeInLeft">Más populares</button>`;

        // Agregar botones dinámicos con las categorías obtenidas
        categories.forEach(category => {
            const button = document.createElement("button");
            button.classList.add("category-btn", "animate__animated", "animate__fadeInLeft");
            button.textContent = category.name; // Acceder al nombre de la categoría
            categoriesContainer.appendChild(button);
        });

    } catch (error) {
        console.error("Error al cargar las categorías:", error);
    }
});