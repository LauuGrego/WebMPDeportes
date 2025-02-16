document.addEventListener("DOMContentLoaded", () => {
    const addProductForm = document.getElementById("add-product-form");

    addProductForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Evita que el formulario se envíe de forma tradicional

        // Obtener los datos del formulario
        const formData = new FormData(addProductForm);
        const productData = {
            name: formData.get("name"),
            price: parseFloat(formData.get("price")), // Convertir a número
            type: formData.get("type"),
            size: formData.get("size").split(",").map(s => s.trim()), // Convertir a array
            description: formData.get("description"),
            stock: parseInt(formData.get("stock")), // Convertir a número
            image_url: formData.get("image_url"),
            category_name: formData.get("category_name")
        };

        try {
            // Enviar los datos al backend
            const response = await fetch("http://127.0.0.1:8000/productos/agregar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                throw new Error("Error al agregar el producto");
            }

            const result = await response.json();
            console.log("Producto agregado:", result);

            // Mostrar un mensaje de éxito o redirigir al usuario
            alert("Producto agregado correctamente");
            addProductForm.reset(); // Limpiar el formulario
        } catch (error) {
            console.error("Error:", error);
            alert("Hubo un error al agregar el producto");
        }
    });
});