document.addEventListener('DOMContentLoaded', function() {
    // Obtener el token desde localStorage
    const token = localStorage.getItem("access_token");
    
    if (!token) {
        console.error("No se encontró el token de acceso.");
        return;
    }
    
    fetch('http://127.0.0.1:8000/categorias/listar', {
        method: 'GET',
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la solicitud al backend');
        }
        return response.json();
    })
    .then(categories => {
        const categorySelect = document.getElementById('product-category'); // Asegúrate de que coincida con el id del select en tu HTML
        if (!categorySelect) {
            console.error("No se encontró el elemento de selección de categoría con id 'product-category'");
            return;
        }
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    })
    .catch(error => {
        console.error("Error al cargar las categorías:", error);
    });

    // Función para redirigir a WhatsApp con un mensaje predefinido
    async function redirectToWhatsApp(productName) {
        try {
            const response = await fetch(`http://127.0.0.1:8000/productos/whatsapp_redirect?product_name=${encodeURIComponent(productName)}`);
            if (!response.ok) {
                throw new Error(`Error al redirigir a WhatsApp: ${response.statusText}`);
            }
            const data = await response.json();
            window.open(data.url, "_blank");
        } catch (error) {
            console.error("Error en la redirección a WhatsApp:", error);
        }
    }
});
