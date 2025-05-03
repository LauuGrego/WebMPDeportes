document.addEventListener("DOMContentLoaded", async () => {
  const categorySelect = document.getElementById("category");
  const authToken = localStorage.getItem("authToken");

  try {
      const response = await fetch("https://webmpdeportes-production.up.railway.app/categorias/listar-public", {
          method: "GET",
          headers: {
              "Authorization": `Bearer ${authToken}`
          }
      });

      if (!response.ok) throw new Error("Error al obtener las categorías.");

      const categories = await response.json();
      categories.forEach(category => {
          const option = document.createElement("option");
          option.value = category.id;
          option.textContent = category.name;
          categorySelect.appendChild(option);
      });
  } catch (error) {
      console.error("Error al cargar las categorías:", error);
      alert("No se pudieron cargar las categorías.");
  }
});

// Configuración de Cloudinary
const CLOUD_NAME = "dotxvd5dc"; // ← reemplazar con tu Cloud Name
const UPLOAD_PRESET = "marcapasos_images"; // ← reemplazar con tu Upload Preset

async function uploadImageToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(url, {
      method: "POST",
      body: formData,
  });

  if (!response.ok) throw new Error("Error al subir imagen a Cloudinary");

  const data = await response.json();
  return data.secure_url;
}

document.getElementById("productForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const authToken = localStorage.getItem("authToken");

  // Procesar talles
  const sizes = Array.from(form.querySelectorAll('input[name="sizes"]:checked'))
      .map((checkbox) => checkbox.value)
      .join(",");
  formData.set("size", sizes);

  try {
      // Subir imagen a Cloudinary y obtener la URL
      const imageInput = document.getElementById("image-upload");
      if (imageInput.files.length > 0) {
          const imageUrl = await uploadImageToCloudinary(imageInput.files[0]);
          formData.set("image_url", imageUrl); // Enviar solo la URL al backend
      }

      // Log de depuración
      console.log("FormData being sent:");
      for (let [key, value] of formData.entries()) {
          console.log(`${key}: ${value}`);
      }

      const response = await fetch("https://webmpdeportes-production.up.railway.app/productos/agregar", {
          method: "POST",
          headers: {
              "Authorization": `Bearer ${authToken}`
          },
          body: formData,
      });

      if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response from server:", errorData);
          alert(`Error: ${errorData.detail}`);
          return;
      }

      const result = await response.json();
      alert("Producto cargado con éxito");
      console.log("Producto cargado:", result);

      form.reset();
      document.getElementById("image-preview").innerHTML = "";

  } catch (error) {
      console.error("Error al cargar el producto:", error);
      alert("Ocurrió un error al cargar el producto.");
  }
});

// Vista previa de imágenes
function handleFileSelect(event) {
  const files = event.target.files;
  const previewContainer = document.getElementById("image-preview");
  previewContainer.innerHTML = "";

  if (!files.length) {
      const message = document.createElement("p");
      message.textContent = "No se seleccionaron imágenes.";
      previewContainer.appendChild(message);
      return;
  }

  Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
          console.error(`El archivo ${file.name} no es una imagen.`);
          return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
          const img = document.createElement("img");
          img.src = e.target.result;
          img.alt = file.name;
          img.classList.add("preview-image");
          previewContainer.appendChild(img);
      };
      reader.onerror = () => {
          console.error(`Error al leer el archivo ${file.name}.`);
      };
      reader.readAsDataURL(file);
  });
}
