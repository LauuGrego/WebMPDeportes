document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("add-product-form");

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Evita el refresco de la página

        // Obtiene los valores del formulario
        const name = document.getElementById("name").value.trim();
        const price = parseFloat(document.getElementById("price").value.trim());
        const type = document.getElementById("type").value.trim();
        const size = document.getElementById("size").value.trim().split(',').map(s => s.trim());
        const description = document.getElementById("description").value.trim();
        const stock = parseInt(document.getElementById("stock").value.trim());
        const imageUrl = document.getElementById("image_url").value.trim();
        const categoryName = document.getElementById("category").value.trim();
        

        // Validaciones
        if (!name || !price || !type || !size || !description || !stock) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        // Obtiene el token de localStorage
        const token = localStorage.getItem("access_token");

        if (!token) {
            alert("No se ha encontrado el token de autenticación.");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/productos/agregar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,  // Agrega el token de autenticación en la cabecera
                },
                body: JSON.stringify({
                    name: name,
                    price: price,
                    type: type,
                    size: size,
                    description: description,
                    stock: stock,
                    image_url: imageUrl,
                    category_name: categoryName,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Producto agregado con éxito!");
                form.reset(); // Limpia el formulario
            } else {
                alert(`Error: ${data.detail}`);
            }
        } catch (error) {
            console.error("Error al agregar producto:", error);
            alert("Hubo un problema al conectar con el servidor.");
        }
    });
});
