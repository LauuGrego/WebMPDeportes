// URL del backend
const API_URL = "https://webmpdeportes.onrender.com/productos/obtener_por_id";

document.addEventListener('DOMContentLoaded', async () => {
  const productId = localStorage.getItem('selectedProductId');
  
  if (!productId) {
    alert('No se ha seleccionado ningún producto');
    window.location.href = 'catalogo.html';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${productId}`);
    if (!response.ok) {
      throw new Error('Error al obtener los detalles del producto');
    }
    
    const product = await response.json();
    
    // Mostrar los datos del producto
    document.getElementById('product-name').textContent = product.name;
    //document.getElementById('product-price').textContent = `$${product.price}`;
    document.getElementById('product-stock').textContent = `Cantidad Disponibles: ${product.stock}`;
    document.getElementById('product-size').textContent = `Talles Disponibles: ${product.size}`;
    document.getElementById('product-description').textContent = product.description || 'Descripción no disponible';
    
    // Configurar la imagen (ajusta según tu estructura de imágenes)
    const imageElement = document.getElementById('product-image');
    imageElement.src = `/products_image/${product.name.replace(/\s+/g, '_')}.jpg`;
    imageElement.alt = product.name;
    
    // Configurar el botón de WhatsApp
    document.getElementById('whatsapp-button').addEventListener('click', () => {
      redirectToWhatsApp(product.name);
    });
    
  } catch (error) {
    console.error('Error:', error);
    document.querySelector('.product-detail-container').innerHTML = `
      <div class="error-message">
        <p>Error al cargar los detalles del producto</p>
        <button onclick="window.location.href='catalogo.html'">Volver al catálogo</button>
      </div>
    `;
  }
});

// Función para redirigir a WhatsApp (similar a la del catálogo)
async function redirectToWhatsApp(productName) {
  try {
    const encodedProductName = encodeURIComponent(productName);
    const response = await fetch(`${API_URL}/whatsapp_redirect?product_name=${encodedProductName}`);
    
    if (!response.ok) {
      throw new Error(`Error al redirigir a WhatsApp: ${response.statusText}`);
    }
    
    const data = await response.json();
    window.open(data.url, "_blank");
  } catch (error) {
    console.error("Error en la redirección a WhatsApp:", error);
    alert("Error al intentar redirigir a WhatsApp");
  }
}