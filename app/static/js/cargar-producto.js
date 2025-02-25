document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("add-product-form");
  
    form.addEventListener("submit", async (event) => {
      event.preventDefault(); // Evita el refresco de la página
  
      // Obtiene los valores del formulario usando los nuevos IDs
      const name = document.getElementById("product-name").value.trim();
      const price = parseFloat(document.getElementById("product-price").value.trim());
      const type = document.getElementById("product-type").value.trim();
      const size = document.getElementById("product-size").value.trim().split(',').map(s => s.trim());
      const description = document.getElementById("product-description").value.trim();
      const stock = parseInt(document.getElementById("product-stock").value.trim());
      const imageUrl = document.getElementById("product-image").value.trim();
      const categoryName = document.getElementById("product-category").value.trim();
  
      // Validaciones básicas
      if (!name || !price || !type || !size || !description || !stock) {
        alert("Por favor, completa todos los campos.");
        return;
      }
  
      // Obtiene el token de autenticación desde localStorage
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
            "Authorization": `Bearer ${token}`,
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
  