document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("add-product-form");

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Evita el refresco de la página

        const categoryName = document.getElementById("name").value.trim();

        if (!categoryName) {
            alert("El nombre de la categoría no puede estar vacío.");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/categorias/agregar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Agrega el token de autenticación si es necesario
                    // "Authorization": "Bearer TU_TOKEN"
                },
                body: JSON.stringify({ name: categoryName }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Categoría agregada con éxito!");
                form.reset(); // Limpia el formulario
            } else {
                alert(`Error: ${data.detail}`);
            }
        } catch (error) {
            console.error("Error al agregar categoría:", error);
            alert("Hubo un problema al conectar con el servidor.");
        }
    });
});