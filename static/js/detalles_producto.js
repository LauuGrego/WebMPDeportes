document.addEventListener("DOMContentLoaded", () => {
  const detalleContainer = document.getElementById("producto-detalle");
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    detalleContainer.innerHTML = "<p class='error-mensaje'>ID de producto no proporcionado.</p>";
    return;
  }

  const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSj1ZyiyFIKdJ1HkQCu1911NkQ6GLLV87Vz0KHbMi1Sf4ZJioVPiQvzo0jxzKGH-g/pub?output=csv";

  Papa.parse(SHEET_URL, {
    download: true,
    header: true,
    complete: function (results) {
      const data = results.data;
      const product = data.find(p => p.id === productId);

      if (!product) {
        detalleContainer.innerHTML = "<p class='error-mensaje'>Producto no encontrado.</p>";
        return;
      }

      const productImage = product.image_url || 'https://res.cloudinary.com/demo/image/upload/v1/products/default-product.jpg';

      // Formatear talles y crear botones minimalistas
      let sizesArray = [];
      if (product.size) {
          if (Array.isArray(product.size)) {
            sizesArray = product.size;
          } else if (typeof product.size === "string") {
            sizesArray = product.size.split(",").map(s => s.trim());
          }
      }
      const sizeButtons = sizesArray.map(s => {
        const num = Number(s);
        const label = !isNaN(num) ? (num % 1 === 0 ? num.toFixed(0) : num.toFixed(1)) : s;
        return `<button class="talle-btn" type="button" data-size="${s}">${label}</button>`;
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
          <p class="producto-precio">$${Number(product.price || 0).toLocaleString("es-AR")}</p>
          <p class="producto-stock">Stock: ${product.stock}</p>
          <div class="producto-size">Talles Disponibles: ${sizeButtons}</div>
          <p class="producto-descripcion">${product.description}</p>
          <div class="producto-acciones">
            <a href="https://wa.me/543445417684?text=¡Hola! Quiero saber más info acerca de ${product.name}." class="boton-whatsapp" target="_blank">
              <i class="fab fa-whatsapp"></i> Consultar por WhatsApp
            </a>
            <button class="boton-volver">Volver</button>
          </div>
        </div>
      </div>
    `;
      detalleContainer.innerHTML = productHTML;

      // Handle size selection
      let selectedSize = null;
      document.querySelectorAll('.talle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.talle-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedSize = btn.dataset.size;
        });
      });

      // Handle add to cart
      const addToCartBtn = document.querySelector('.boton-agregar-carrito');
      if (addToCartBtn) {
        addToCartBtn.addEventListener('click', async () => {
          if (!selectedSize && sizesArray.length > 0) {
            showToast('Por favor selecciona un talle', 'warning');
            return;
          }
          
          const success = await addProductToCart(product.id, selectedSize, 1);
          if (success) {
            // Visual feedback
            addToCartBtn.innerHTML = '<i class="fas fa-check"></i> Agregado';
            setTimeout(() => {
              addToCartBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Agregar al Carrito';
            }, 2000);
          }
        });
      }

      // Manejar volver para restaurar scroll
      const volverBtn = document.querySelector('.boton-volver');
      if (volverBtn) {
        volverBtn.addEventListener('click', () => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            window.location.href = "../catalogo/catalogo.html";
          }
        });
      }
      
      // Update cart count display
      updateCartCountDisplay();
    },
    error: function (err) {
        console.error("Error al cargar los detalles del producto:", err);
        detalleContainer.innerHTML = "<p class='error-mensaje'>Error al cargar los detalles del producto.</p>";
    }
  });
});