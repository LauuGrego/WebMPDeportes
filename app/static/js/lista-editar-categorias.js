// URL del backend
const API_URL = "http://127.0.0.1:8000/categorias";

// Función para cargar las categorías
async function loadCategories() {
    try {
        // Obtener las categorías del backend
        const response = await fetch(`${API_URL}/listar`);
        if (!response.ok) {
            throw new Error("Error al obtener las categorías");
        }

        const categories = await response.json();

        // Seleccionar el contenedor de la lista de categorías
        const categoryList = document.getElementById("category-list");

        // Limpiar la lista antes de agregar nuevas categorías
        categoryList.innerHTML = "";

        // Agregar las categorías a la lista
        categories.forEach((category) => {
            const categoryItem = document.createElement("li");
            categoryItem.className = "category-item";

            // Nombre de la categoría
            const categoryName = document.createElement("span");
            categoryName.className = "category-name";
            categoryName.textContent = category.name;

            // Botón de eliminar (ícono de basura)
            const btnDelete = document.createElement("button");
            btnDelete.className = "btn-delete";
            btnDelete.innerHTML = '<i class="fas fa-trash-alt"></i>';

            // Agregar evento al botón de eliminar
            btnDelete.addEventListener("click", async () => {
                if (confirm(`¿Estás seguro de que quieres eliminar la categoría "${category.name}"?`)) {
                    try {
                        const response = await fetch(`${API_URL}/eliminar/${encodeURIComponent(category.name)}`, {
                            method: "DELETE",
                        });

                        if (!response.ok) {
                            throw new Error("Error al eliminar la categoría");
                        }

                        const result = await response.json();
                        console.log("Categoría eliminada:", result);
                        alert(result.detail); // Mostrar mensaje de éxito
                        loadCategories(); // Recargar la lista de categorías
                    } catch (error) {
                        console.error("Error:", error);
                        alert("Hubo un error al eliminar la categoría");
                    }
                }
            });

            // Agregar nombre y botón de eliminar al ítem de la categoría
            categoryItem.appendChild(categoryName);
            categoryItem.appendChild(btnDelete);

            // Agregar el ítem a la lista
            categoryList.appendChild(categoryItem);
        });
    } catch (error) {
        console.error("Error al cargar las categorías:", error);
        alert("Hubo un error al cargar las categorías");
    }
}

// Cargar las categorías cuando la página se cargue
document.addEventListener("DOMContentLoaded", () => {
    loadCategories();
});