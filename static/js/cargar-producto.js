document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("add-product-form");
  const imageInput = document.getElementById("product-image");
  const imagePreviewContainer = document.createElement("div");
  const imagePreview = document.createElement("img");
  const removeImageButton = document.createElement("button");

  imagePreviewContainer.classList.add("image-preview-container");
  imagePreview.classList.add("image-preview");
  removeImageButton.classList.add("remove-image-button");
  removeImageButton.textContent = "❌";

  imagePreviewContainer.appendChild(imagePreview);
  imagePreviewContainer.appendChild(removeImageButton);
  imageInput.parentNode.appendChild(imagePreviewContainer);

  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result;
        removeImageButton.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      imagePreview.src = "";
      removeImageButton.style.display = "none";
    }
  });

  removeImageButton.addEventListener("click", (e) => {
    e.preventDefault();
    imagePreview.src = "";
    imageInput.value = "";
    removeImageButton.style.display = "none";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Evita el refresco de la página

    // Obtiene los valores del formulario
    const name = document.getElementById("product-name").value.trim();
    const type = document.getElementById("product-type").value.trim();
    const size = document.getElementById("product-size").value.trim();
    const description = document.getElementById("product-description").value.trim();
    const stock = document.getElementById("product-stock").value.trim();
    const imageFile = document.getElementById("product-image").files[0];
    const categoryName = document.getElementById("product-category").value.trim();

    // Validaciones básicas
    if (!name || !type || !size || !description || isNaN(stock) || !imageFile) {
      alert("Por favor, completa todos los campos correctamente.");
      return;
    }

    // Obtiene el token de autenticación desde localStorage
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("No se ha encontrado el token de autenticación.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("type", type);
      formData.append("size", size); // Send as a comma-separated string
      formData.append("description", description);
      formData.append("stock", stock);
      formData.append("image", imageFile, `${name.replace(/\s+/g, "_")}.jpg`); // Renombrar archivo
      formData.append("category_name", categoryName);

      const response = await fetch("http://127.0.0.1:8000/productos/agregar", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert("Producto agregado con éxito!");
        form.reset(); // Limpia el formulario
        imagePreview.src = ""; // Limpia la vista previa de la imagen
        removeImageButton.style.display = "none"; // Oculta el botón de eliminar imagen
      } else {
        console.error("Error en la respuesta del servidor:", data);
        if (data.detail) {
          console.error("Errores de validación:", data.detail);
          alert(`Errores de validación: ${JSON.stringify(data.detail)}`);
        } else {
          alert(`Error: ${data.detail}`);
        }
      }
    } catch (error) {
      console.error("Error al agregar producto:", error);
      alert("Hubo un problema al conectar con el servidor.");
    }
  });
});
