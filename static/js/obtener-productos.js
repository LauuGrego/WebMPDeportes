let currentPage = 1;
const productsPerPage = 20; // 5 filas x 4 columnas
let isLoading = false;
let hasMoreProducts = true;

const debounce = (func, delay) => {
  let debounceTimeout;
  return (...args) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => func(...args), delay);
  };
};

function addLoadMoreButton() {
    const catalogCards = document.getElementById('catalogCards');
    let existingButton = document.querySelector('.load-more-button');
    if (existingButton) existingButton.remove(); // Siempre lo agregamos al final

    const button = document.createElement('button');
    button.textContent = "Ver más";
    button.classList.add('load-more-button', 'catalog__card-button');
    button.style.margin = "2rem auto";
    button.style.display = "block";
    button.addEventListener('click', async () => {
        button.disabled = true;
        button.textContent = "Cargando...";
        currentPage++;
        const searchInput = document.querySelector('.header__search-input');
        const searchQuery = searchInput ? searchInput.value.trim() : '';
        await loadProducts(searchQuery, currentPage);
        button.disabled = false;
        button.textContent = "Ver más";
    });
    catalogCards.parentNode.insertBefore(button, catalogCards.nextSibling);
}

function removeLoadMoreButton() {
    const existingButton = document.querySelector('.load-more-button');
    if (existingButton) existingButton.remove();
}

async function loadProducts(searchQuery = '', page = 1) {
    if (isLoading || !hasMoreProducts) return;
    isLoading = true;

    const catalogCards = document.getElementById('catalogCards');
    // Aviso centrado
    if (page === 1) {
        catalogCards.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:180px;"><p style="font-size:1.2rem;">Cargando productos...</p></div>';
    } else {
        catalogCards.insertAdjacentHTML('beforeend', '<div id="loading-msg" style="display:flex;justify-content:center;align-items:center;height:180px;"><p style="font-size:1.2rem;">Cargando productos...</p></div>');
    }

    try {
        const url = new URL('https://webmpdeportes-production.up.railway.app/productos/listar');
        url.searchParams.append('page', page);
        url.searchParams.append('limit', productsPerPage);
        if (searchQuery) url.searchParams.append('search', searchQuery);

        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 400) {
                console.error('Bad Request: Check query parameters.');
                document.getElementById('catalogCards').innerHTML = '<p>Error: Solicitud incorrecta. Verifique los parámetros de búsqueda.</p>';
            }
            throw new Error('Error al cargar los productos');
        }

        const { products, totalPages } = await response.json();

        if (page === 1) {
            catalogCards.innerHTML = '';
            hasMoreProducts = true;
            removeLoadMoreButton();
        }

        if (!products || products.length === 0) {
            if (page === 1) catalogCards.innerHTML = '<p>No se encontraron productos.</p>';
            removeLoadMoreButton();
            return;
        }

        // Quitar aviso de cargando antes de insertar productos
        const loadingMsg = document.getElementById('loading-msg');
        if (loadingMsg) loadingMsg.remove();

        products.slice(0, productsPerPage).forEach(product => {
            const productImage = product.image_url || 'https://res.cloudinary.com/demo/image/upload/v1/products/default-product.jpg';
            const formattedPrice = product.price
                ? `$${product.price.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "Consultar";
            const productCard = `
              <div class="catalog__card">
                <div class="catalog__card-image">
                  <img src="${productImage}" alt="${product.name}">
                </div>
                <div class="catalog__card-details">
                  <h3 class="catalog__card-title">${product.name}</h3>
                  <p class="catalog__card-price">${formattedPrice}</p>
                  <div class="catalog__card-actions">
                    <button class="catalog__details-button" data-product-id="${product.id}">
                      Ver detalles
                    </button>
                    <a href="https://wa.me/3445417684/?text=¡Hola! Quiero saber más info acerca de ${product.name}." class="catalog__card-button" target="_blank">
                      <i class="fab fa-whatsapp"></i> Consultar
                    </a>
                  </div>
                </div>
              </div>`;
            catalogCards.insertAdjacentHTML('beforeend', productCard);
        });

        document.querySelectorAll('.catalog__details-button').forEach(button => {
            button.addEventListener('click', (event) => {
                // Guardar scroll antes de ir a detalles
                sessionStorage.setItem('catalogScroll', window.scrollY);
                const productId = event.target.dataset.productId;
                window.location.href = `../productos/producto.html?id=${productId}`;
            });
        });

        // El botón "Ver más" siempre debe estar después de los productos
        if (page < totalPages && products.length === productsPerPage) {
            addLoadMoreButton();
            hasMoreProducts = true;
        } else {
            removeLoadMoreButton();
            hasMoreProducts = false;
        }
    } catch (error) {
        console.error('Error al cargar los productos:', error);
        removeLoadMoreButton();
    } finally {
        isLoading = false;
        // Quitar aviso de cargando si quedó
        const loadingMsg = document.getElementById('loading-msg');
        if (loadingMsg) loadingMsg.remove();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.header__search-input');
    const searchButton = document.querySelector('.btn--ghost.header__search-btn');

    function reloadProducts() {
        const searchQuery = searchInput.value.trim();
        currentPage = 1;
        hasMoreProducts = true;
        loadProducts(searchQuery, currentPage);
    }

    // Solo buscar cuando se presiona el botón o Enter
    if (searchButton) {
      searchButton.addEventListener('click', reloadProducts);
    }
    if (searchInput) {
      searchInput.addEventListener('keypress', (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          reloadProducts();
        }
      });
    }

    // Cargar productos generales al iniciar la página
    loadProducts();

    // Restaurar scroll si existe
    const savedScroll = sessionStorage.getItem('catalogScroll');
    if (savedScroll !== null) {
        setTimeout(() => {
            window.scrollTo(0, parseInt(savedScroll, 10));
            sessionStorage.removeItem('catalogScroll');
        }, 50);
    }
});
