// URL del backend
const API_URL = "http://127.0.0.1:8000/productos/buscar";

// Función para obtener productos del backend
async function fetchProducts(searchQuery = "") {
    try {
        let url = API_URL;
        if (searchQuery) {
            url += `?name=${encodeURIComponent(searchQuery)}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Error al obtener los productos");
        }

        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error(error);
    }
}

// Función para abrir el modal de edición
function openEditModal(product) {
    // Crear el modal de edición
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Editar Producto</h2>
            <form id="edit-product-form">
                <label for="edit-name">Nombre:</label>
                <input type="text" id="edit-name" value="${product.name}" required>

                <label for="edit-description">Descripción:</label>
                <textarea id="edit-description" required>${product.description}</textarea>

                <label for="edit-price">Precio:</label>
                <input type="number" id="edit-price" value="${product.price}" required>

                <label for="edit-category">Categoría:</label>
                <input type="text" id="edit-category" value="${product.category_name}" required>

                <label for="edit-size">Tallas (separadas por comas):</label>
                <input type="text" id="edit-size" value="${product.size.join(", ")}">

                <button type="submit" class="btn-primary">Guardar Cambios</button>
            </form>
        </div>
    `;

    // Agregar el modal al body
    document.body.appendChild(modal);

    // Cerrar el modal al hacer clic en la "X"
    modal.querySelector(".close").addEventListener("click", () => {
        modal.remove();
    });

    // Manejar el envío del formulario de edición
    const editForm = modal.querySelector("#edit-product-form");
    editForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const updatedProduct = {
            name: document.getElementById("edit-name").value,
            description: document.getElementById("edit-description").value,
            price: parseFloat(document.getElementById("edit-price").value),
            category_name: document.getElementById("edit-category").value,
            size: document.getElementById("edit-size").value.split(",").map(s => s.trim()),
        };

        try {
            const response = await fetch(`http://127.0.0.1:8000/actualizar/${product.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedProduct),
            });

            if (!response.ok) {
                throw new Error("Error al actualizar el producto");
            }

            const result = await response.json();
            console.log("Producto actualizado:", result);
            alert("Producto actualizado correctamente");
            modal.remove();
            fetchProducts(); // Recargar la lista de productos
        } catch (error) {
            console.error("Error:", error);
            alert("Hubo un error al actualizar el producto");
        }
    });
}

// Función para deshabilitar un producto
async function disableProduct(productId) {
    if (confirm("¿Estás seguro de que quieres deshabilitar este producto?")) {
        try {
            const response = await fetch(`http://127.0.0.1:8000/deshabilitar/${productId}`, {
                method: "PUT",
            });

            if (!response.ok) {
                throw new Error("Error al deshabilitar el producto");
            }

            const result = await response.json();
            console.log("Producto deshabilitado:", result);
            alert("Producto deshabilitado correctamente");
            fetchProducts(); // Recargar la lista de productos
        } catch (error) {
            console.error("Error:", error);
            alert("Hubo un error al deshabilitar el producto");
        }
    }
}

// Función para mostrar productos en la lista
function displayProducts(products) {
    const productList = document.getElementById("product-list");
    productList.innerHTML = ""; // Limpiar la lista antes de agregar nuevos productos

    products.forEach((product) => {
        const productItem = document.createElement("li");
        productItem.className = "product-item animate__animated animate__fadeInLeft";

        // Imagen del producto
        const productImage = document.createElement("img");
        productImage.src = product.image;
        productImage.alt = product.name;
        productImage.className = "product-image";

        // Nombre del producto
        const productName = document.createElement("h3");
        productName.textContent = product.name;
        productName.className = "product-name";

        // Descripción del producto
        const productDescription = document.createElement("p");
        productDescription.textContent = product.description;
        productDescription.className = "product-description";

        // Precio del producto
        const productPrice = document.createElement("span");
        productPrice.textContent = `$${product.price}`;
        productPrice.className = "product-price";

        // Botones de acciones (editar y eliminar)
        const productActions = document.createElement("div");
        productActions.className = "product-actions";

        // Botón de editar (ícono de lápiz)
        const btnEdit = document.createElement("button");
        btnEdit.className = "btn-edit";
        btnEdit.innerHTML = '<i class="fas fa-pencil-alt"></i>';

        // Botón de eliminar (ícono de basura)
        const btnDelete = document.createElement("button");
        btnDelete.className = "btn-delete";
        btnDelete.innerHTML = '<i class="fas fa-trash-alt"></i>';

        // Agregar botones al contenedor de acciones
        productActions.appendChild(btnEdit);
        productActions.appendChild(btnDelete);

        // Agregar elementos al ítem del producto
        productItem.appendChild(productImage);
        productItem.appendChild(productName);
        productItem.appendChild(productDescription);
        productItem.appendChild(productPrice);
        productItem.appendChild(productActions);

        // Agregar el ítem a la lista
        productList.appendChild(productItem);
    });

    btnEdit.addEventListener("click", () => {
        openEditModal(product); // Abrir el modal de edición con los datos del producto
    });

    btnDelete.addEventListener("click", () => {
        disableProduct(product.id); // Deshabilitar el producto
    });
}

// Cargar los productos cuando se inicie la página
document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
});