let currentPage = 1;
const productsPerPage = 10;
let isLoading = false;
let hasMoreProducts = true;

const debounce = (func, delay) => {
  let debounceTimeout;
  return (...args) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => func(...args), delay);
  };
};

// Función para agregar el botón "Ver más"
function addLoadMoreButton() {
    const catalogCards = document.getElementById('catalogCards');
    const existingButton = document.querySelector('.load-more-button');
    if (existingButton) return; // Evitar duplicar el botón

    const button = document.createElement('button');
    button.textContent = "Ver mas";
    button.classList.add('load-more-button');
    button.addEventListener('click', async () => {
        button.disabled = true; // Deshabilitar mientras se cargan productos
        button.textContent = "Cargando...";
        currentPage++;
        const searchInput = document.querySelector('.header__search-input');
        const searchQuery = searchInput ? searchInput.value.trim() : '';
        await loadProducts(searchQuery, currentPage);
        button.disabled = false; // Habilitar nuevamente
        button.textContent = "Ver mas";
    });
    catalogCards.insertAdjacentElement('afterend', button);
}

// Modificar loadProducts para manejar el botón "Ver más"
async function loadProducts(searchQuery = '', page = 1) {
    if (isLoading || !hasMoreProducts) return;
    isLoading = true;

    try {
        const url = new URL('http://127.0.0.1:8000/productos/listar');
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

        if (page >= totalPages) {
            hasMoreProducts = false;
            document.querySelector('.load-more-button')?.remove();
        } else if (page === 1) {
            addLoadMoreButton();
        }

        const catalogCards = document.getElementById('catalogCards');
        if (page === 1) catalogCards.innerHTML = '';

        if (products.length === 0 && page === 1) {
            catalogCards.innerHTML = '<p>No se encontraron productos.</p>';
            return;
        }

        products.forEach(product => {
            const productImage = product.image_path || 'https://res.cloudinary.com/demo/image/upload/v1/products/default-product.jpg';

            const productCard = `
              <div class="card">
                <img src="${productImage}" alt="${product.name}" class="card__image" />
                <div class="card__info">
                  <h2 class="card__title">${product.name}</h2>
                  <p class="card__description">${product.description}</p>
                  <div class="card__footer">
                    
                    <div class="card__buttons">
                      <button class="ver-detalles-btn" data-product-id="${product.id}">Ver detalles</button>
                      <a href="https://wa.me/3445417684/?text=¡Hola! Quiero saber más info acerca de ${product.name}." class="card__whatsapp" target="_blank" aria-label="Consultar por WhatsApp">
                        <i class="fab fa-whatsapp"></i> Consultar
                      </a>
                    </div>
                  </div>
                </div>
              </div>`;
            catalogCards.insertAdjacentHTML('beforeend', productCard);
        });

        // Add event listener for "Ver Detalles" buttons
        document.querySelectorAll('.ver-detalles-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.productId;
                window.location.href = `../productos/producto.html?id=${productId}`;
            });
        });
    } catch (error) {
        console.error('Error al cargar los productos:', error);
    } finally {
        isLoading = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.header__search-input');
    loadProducts();

    searchInput.addEventListener('input', debounce(() => {
        const searchQuery = searchInput.value.trim();
        currentPage = 1; // Reset current page when a new search is performed
        hasMoreProducts = true; // Reset hasMoreProducts when a new search is performed
        loadProducts(searchQuery, currentPage);
    }, 300)); // 300ms debounce delay
});
