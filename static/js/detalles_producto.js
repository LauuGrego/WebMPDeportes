document.addEventListener("DOMContentLoaded", async () => {
  const detalleContainer = document.getElementById("producto-detalle");
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    detalleContainer.innerHTML = "<p class='error-mensaje'>ID de producto no proporcionado.</p>";
    return;
  }

  try {
    const response = await fetch(`https://webmpdeportes.onrender.com/productos/detalle/${productId}`);
    if (!response.ok) throw new Error("Error al obtener los detalles del producto.");
    const product = await response.json();

    const productImage = product.image_url || 'https://res.cloudinary.com/demo/image/upload/v1/products/default-product.jpg';

    // Formatear talles y crear botones minimalistas
    let formattedSizes = product.size;
    let sizesArray = [];
    if (Array.isArray(product.size)) {
      sizesArray = product.size;
    } else if (typeof product.size === "string") {
      sizesArray = product.size.split(",").map(s => s.trim());
    }
    const sizeButtons = sizesArray.map(s => {
      const num = Number(s);
      const label = !isNaN(num) ? (num % 1 === 0 ? num.toFixed(0) : num.toFixed(1)) : s;
      return `<button class="talle-btn" type="button">${label}</button>`;
    }).join(" ");

    const productHTML = `
      <div class="producto-main">
        <div class="producto-gallery">
          <img src="${productImage}" alt="${product.name}" class="producto-imagen" />
          <div class="producto-thumbs">
            <!-- Si hay más imágenes, aquí irían miniaturas -->
            <img src="${productImage}" alt="${product.name}" class="producto-thumb selected" />
          </div>
        </div>
        <div class="producto-info">
          <span class="producto-categoria">${product.type}</span>
          <h1 class="producto-titulo">${product.name}</h1>
          <p class="producto-precio">$${product.price}</p>
          <p class="producto-stock">Stock: ${product.stock}</p>
          <div class="producto-size">Talles Disponibles: ${sizeButtons}</div>
          <p class="producto-descripcion">${product.description}</p>
          <div class="producto-acciones">
            <a href="https://wa.me/3445417684?text=¡Hola! Quiero saber más info acerca de ${product.name}." class="boton-whatsapp" target="_blank">
              <i class="fab fa-whatsapp"></i> Consultar por WhatsApp
            </a>
            <button class="boton-volver" id="volverCatalogoBtn">Volver</button>
          </div>
        </div>
      </div>
    `;
    detalleContainer.innerHTML = productHTML;

    // Manejar volver para restaurar scroll
    const volverBtn = document.getElementById('volverCatalogoBtn');
    if (volverBtn) {
      volverBtn.addEventListener('click', () => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = "../catalogo/catalogo.html";
        }
      });
    }
  } catch (error) {
    console.error("Error al cargar los detalles del producto:", error);
    detalleContainer.innerHTML = "<p class='error-mensaje'>Error al cargar los detalles del producto.</p>";
  }
});
