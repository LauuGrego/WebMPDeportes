document.addEventListener("DOMContentLoaded", async () => {
    // Obtener el token de autenticación del localStorage
    const token = localStorage.getItem("access_token");

    if (!token) {
        alert("No estás autenticado. Por favor inicia sesión.");
        window.location.href = "./../index.html"; // Redirige al inicio si no hay token
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/categorias/listar", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,  // Agregar el token en la cabecera
            },
        });

        const data = await response.json();

        if (response.ok) {
            const categoryList = document.getElementById("category-list");
            categoryList.innerHTML = ""; // Limpiar la lista antes de agregar las categorías

            // Recorrer las categorías y agregarlas al DOM
            data.forEach(category => {
                const li = document.createElement("li");

                // Nombre de la categoría
                const categoryName = document.createElement("span");
                categoryName.textContent = category.name;

                // Cesto de basura
                const deleteIcon = document.createElement("i");
                deleteIcon.classList.add("fas", "fa-trash-alt", "delete-icon");
                deleteIcon.addEventListener("click", async () => {
                    // Funcionalidad para eliminar la categoría
                    try {
                        const responseDelete = await fetch(`http://127.0.0.1:8000/categorias/eliminar/${category.name}`, {
                            method: "DELETE",
                            headers: {
                                "Authorization": `Bearer ${token}`,
                            },
                        });

                        if (responseDelete.ok) {
                            li.remove(); // Eliminar el item de la lista
                            alert(`Categoría '${category.name}' eliminada.`);
                        } else {
                            const data = await responseDelete.json();
                            alert(`Error: ${data.detail}`);
                        }
                    } catch (error) {
                        console.error("Error al eliminar categoría:", error);
                        alert("Hubo un problema al intentar eliminar la categoría.");
                    }
                });

                // Agregar el nombre y el ícono al item
                li.appendChild(categoryName);
                li.appendChild(deleteIcon);

                // Agregar el item a la lista
                categoryList.appendChild(li);
            });
        } else {
            alert(`Error: ${data.detail}`);
        }
    } catch (error) {
        console.error("Error al cargar las categorías:", error);
        alert("Hubo un problema al conectar con el servidor.");
    }
});
