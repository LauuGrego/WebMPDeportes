document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem("access_token");// Obtener el token desde localStorage (o sessionStorage si lo prefieres)
    

    fetch('http://127.0.0.1:8000/categorias/listar', {
        method: 'GET',
        headers: { "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la solicitud al backend');
        }
        return response.json();
    })
    .then(categories => {
        const categorySelect = document.getElementById('category');
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
});
