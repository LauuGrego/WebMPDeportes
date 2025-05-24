document.addEventListener("DOMContentLoaded", async () => {
    const categorySelect = document.getElementById("category");

    try {
        const response = await fetch("https://webmpdeportes.onrender.com/categorias/listar-public");
        const categories = await response.json();

        categories.forEach(category => {
            console.log("Categoría recibida:", category);
            const option = document.createElement("option");
            option.value = category._id; // Usar ID de MongoDB como valor
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar categorías:", error);
    }
});

// Cloudinary config
const CLOUD_NAME = "dotxvd5dc";
const UPLOAD_PRESET = "marcapasos_images";

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

// Manejo de envío del formulario
document.getElementById("productForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const authToken = localStorage.getItem("authToken");

    // Categoría seleccionada
    const categoryValue = document.getElementById("category").value;
    if (!categoryValue) {
        alert("Seleccioná una categoría válida.");
        return;
    }
    formData.set("category", categoryValue);

    // Obtener talles seleccionados de los botones
    const selectedSizes = Array.from(form.querySelectorAll('.size-button.selected'))
        .map(button => button.dataset.size);

    // Verificar si hay talles seleccionados
    if (selectedSizes.length === 0) {
        alert("Seleccioná al menos un talle.");
        return; // Evitar que se envíe el formulario
    }

    formData.set("size", selectedSizes);  // No es necesario hacer join(",") porque ya es un array

    try {
        // Subir imagen
        const imageInput = document.getElementById("image-upload");
        if (imageInput.files.length > 0) {
            const imageUrl = await uploadImageToCloudinary(imageInput.files[0]);
            formData.set("image_url", imageUrl);
        }

        // Debug: mostrar el contenido del FormData
        console.log("FormData being sent:");
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        const response = await fetch("https://webmpdeportes.onrender.com/productos/agregar", {
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

        // Limpiar selección de talles
        document.querySelectorAll('.size-button.selected').forEach(button => {
            button.classList.remove('selected');
        });

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

    // Solo mostrar la primera imagen seleccionada y evitar duplicados
    const file = files[0];
    // Si ya existe una imagen previa igual, no la agregues de nuevo
    if (previewContainer.firstChild && previewContainer.firstChild.tagName === 'IMG') {
        // Si la imagen ya es la misma, no la agregues otra vez
        if (previewContainer.firstChild.src) {
            // No hacer nada si la imagen ya está
            return;
        }
    }
    if (!file.type.startsWith("image/")) {
        console.error(`El archivo ${file.name} no es una imagen.`);
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        previewContainer.innerHTML = ""; // Siempre limpiar antes de agregar
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
}

// Asignar el evento a input de tipo file
document.getElementById("image-upload").addEventListener("change", handleFileSelect);
