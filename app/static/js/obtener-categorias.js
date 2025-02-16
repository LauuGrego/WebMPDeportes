async function loadCategories() {
    try {
        // Obtener las categorías del backend
        const response = await fetch("http://127.0.0.1:8000/categorias/listar");
        if (!response.ok) {
            throw new Error("Error al obtener las categorías");
        }

        const categories = await response.json();

        // Seleccionar el elemento <select>
        const categorySelect = document.getElementById("category");

        // Limpiar el <select> (excepto la primera opción)
        categorySelect.innerHTML = '<option value="">Seleccione una categoría</option>';

        // Agregar las categorías como opciones
        categories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category.name; // Usar el nombre de la categoría como valor
            option.textContent = category.name;
            categorySelect.appendChild(option);
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