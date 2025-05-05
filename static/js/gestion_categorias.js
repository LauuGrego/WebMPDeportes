if (!window.isGestionCategoriasInitialized) {
    window.isGestionCategoriasInitialized = true; // Prevent duplicate initialization

    document.addEventListener("DOMContentLoaded", async () => {
        const categoryList = document.getElementById("categoryList");
        const categoryForm = document.getElementById("categoryForm");
        const categoryNameInput = document.getElementById("categoryName");
        let isSubmitting = false; // Prevent duplicate submissions

        // Retrieve token from localStorage
        const token = localStorage.getItem("authToken");

        // Function to fetch and display categories
        async function loadCategories() {
            try {
                const response = await fetch("http://127.0.0.1:8000/categorias/listar", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) throw new Error("Error al cargar las categorías.");
                const categories = await response.json();

                categoryList.innerHTML = ""; // Clear existing rows
                categories.forEach(category => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td data-label="Nombre">${category.name}</td>
                        <td data-label="Acciones">
                            <button class="btn-delete" data-name="${category.name}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    categoryList.appendChild(row);
                });

                // Add delete event listeners
                document.querySelectorAll(".btn-delete").forEach(button => {
                    button.addEventListener("click", async (e) => {
                        const categoryName = e.target.closest("button").dataset.name;
                        if (confirm(`¿Estás seguro de eliminar la categoría "${categoryName}"?`)) {
                            await deleteCategory(categoryName);
                            loadCategories(); // Reload categories after deletion
                        }
                    });
                });
            } catch (error) {
                console.error(error);
                alert("Hubo un error al cargar las categorías.");
            }
        }

        // Function to delete a category
        async function deleteCategory(categoryName) {
            try {
                const response = await fetch(`http://127.0.0.1:8000/categorias/eliminar/${encodeURIComponent(categoryName)}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) throw new Error("Error al eliminar la categoría.");
                alert(`La categoría "${categoryName}" fue eliminada con éxito.`);
            } catch (error) {
                console.error(error);
                alert("Hubo un error al eliminar la categoría.");
            }
        }

        // Function to add a new category
        async function addCategory(categoryName) {
            try {
                const response = await fetch("http://127.0.0.1:8000/categorias/agregar", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ name: categoryName }),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    if (errorData.detail === "La categoría ya existe.") {
                        alert("La categoría ya existe. Por favor, ingresa un nombre diferente.");
                    } else {
                        throw new Error(errorData.detail || "Error al agregar la categoría.");
                    }
                    return;
                }
                alert(`La categoría "${categoryName}" fue agregada con éxito.`);
            } catch (error) {
                console.error(error);
                alert("Hubo un error al agregar la categoría.");
            }
        }

        // Handle form submission for adding a new category
        categoryForm.addEventListener("submit", async (e) => {
            console.log("Form submission triggered"); // Debug log
            e.preventDefault();
            if (isSubmitting) return; // Prevent duplicate submissions
            isSubmitting = true;

            const categoryName = categoryNameInput.value.trim();
            if (categoryName) {
                await addCategory(categoryName);
                categoryNameInput.value = ""; // Clear input field
                loadCategories(); // Reload categories after adding
            } else {
                alert("Por favor, ingresa un nombre de categoría válido.");
            }

            isSubmitting = false; // Reset submission flag
        });

        // Load categories on page load
        loadCategories();
    });
}