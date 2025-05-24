document.addEventListener("DOMContentLoaded", async () => {
    const sidebarCategories = document.getElementById("sidebarCategories");
    const catalogCards = document.getElementById("catalogCards");
    const loadingSpinner = document.createElement("div");
    loadingSpinner.className = "loading-spinner";
    loadingSpinner.innerHTML = `<div class="spinner"></div>`;
    catalogCards.insertAdjacentElement("afterend", loadingSpinner);

    let currentPage = 1;
    let productsPerPage = 5 * getColumnsCount(); // 5 filas por página
    let isLoading = false;
    let hasMoreProducts = true;
    let lastColumnsCount = getColumnsCount();
    let loadedProductIds = new Set(); // <-- Añadido para evitar duplicados

    function getColumnsCount() {
      // Detecta el número de columnas del grid según el ancho de pantalla
      if (window.innerWidth <= 600) return 2; // 2 columnas en mobile
      if (window.innerWidth <= 900) return 2;
      return 4; // 4 columnas en desktop (ajustado para que coincida con el CSS)
    }

    function updateProductsPerPage() {
      productsPerPage = 5 * getColumnsCount();
    }

    window.addEventListener('resize', () => {
      // Solo recarga si cambia el número de columnas (evita recarga en scroll mobile)
      const newColumnsCount = getColumnsCount();
      if (newColumnsCount !== lastColumnsCount && catalogCards.children.length > 0) {
        lastColumnsCount = newColumnsCount;
        updateProductsPerPage();
        currentPage = 1;
        hasMoreProducts = true;
        catalogCards.innerHTML = "";
        loadProductsWithPagination(lastParams, currentPage);
      }
    });

    let lastParams = "";

    // Elimina la paginación por scroll
    // window.addEventListener("scroll", ...) -- ELIMINADO

    // Botón "Ver más" para paginación manual
    function addLoadMoreButton(params) {
      let existingButton = document.querySelector('.load-more-button');
      if (existingButton) existingButton.remove();

      const button = document.createElement('button');
      button.textContent = "Ver más";
      button.classList.add('load-more-button', 'catalog__card-button');
      button.style.margin = "2rem auto";
      button.style.display = "block";
      button.addEventListener('click', async () => {
        button.disabled = true;
        button.textContent = "Cargando...";
        currentPage++;
        await loadProductsWithPagination(params, currentPage);
        button.disabled = false;
        button.textContent = "Ver más";
      });
      catalogCards.parentNode.insertBefore(button, catalogCards.nextSibling);
    }

    function removeLoadMoreButton() {
      const existingButton = document.querySelector('.load-more-button');
      if (existingButton) existingButton.remove();
    }

    async function loadProductsWithPagination(params = "", page = 1) {
      if (isLoading || !hasMoreProducts) return;
      isLoading = true;
      loadingSpinner.style.display = "flex";
      if (page === 1) {
        // Mostrar solo el aviso, sin productos previos
        catalogCards.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:180px;"><p style="font-size:1.2rem;">Cargando productos...</p></div>';
        loadedProductIds.clear(); // Limpiar IDs cargados en nueva búsqueda/filtro
      } else {
        // Para paginación, muestra aviso dentro del botón
        const loadMoreBtn = document.querySelector('.load-more-button');
        if (loadMoreBtn) {
          loadMoreBtn.disabled = true;
          loadMoreBtn.innerHTML = '<span style="display:flex;align-items:center;justify-content:center;"><span class="spinner" style="margin-right:8px;width:18px;height:18px;border:2px solid #fff;border-top:2px solid #f39c12;border-radius:50%;display:inline-block;animation:spin 0.8s linear infinite;"></span>Cargando productos...</span>';
        }
      }

      try {
        updateProductsPerPage();
        let url;
        const pageSize = productsPerPage;
        if (params) {
          url = `http://127.0.0.1:8000/productos/buscar_por_categoria_o_tipo?${params}&page=${page}&limit=${pageSize}`;
        } else {
          url = `http://127.0.0.1:8000/productos/listar?page=${page}&limit=${pageSize}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error fetching products: ${response.statusText}`);
        }
        const data = await response.json();
        const products = data.products || [];
        const totalPages = data.totalPages || 1;

        if (page === 1) {
          // Limpiar productos previos solo al inicio
          catalogCards.innerHTML = "";
          hasMoreProducts = true;
          removeLoadMoreButton();
        }

        if (products.length === 0 && page === 1) {
          catalogCards.innerHTML = "<p>No se encontraron productos.</p>";
          removeLoadMoreButton();
          return;
        }

        products.forEach(product => {
          if (loadedProductIds.has(product.id)) return; // Evita duplicados
          loadedProductIds.add(product.id);
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

        if (page < totalPages && products.length === pageSize) {
          addLoadMoreButton(params);
          hasMoreProducts = true;
        } else {
          removeLoadMoreButton();
          hasMoreProducts = false;
        }
      } catch (error) {
        console.error("Error loading products:", error);
        removeLoadMoreButton();
      } finally {
        isLoading = false;
        loadingSpinner.style.display = "none";
        // Restaurar el texto del botón si existe
        const loadMoreBtn = document.querySelector('.load-more-button');
        if (loadMoreBtn) {
          loadMoreBtn.disabled = false;
          loadMoreBtn.textContent = "Ver más";
        }
      }
    }

    // Cambia el evento de búsqueda para que solo busque cuando se presiona el botón de buscar
    const searchInput = document.querySelector('.header__search-input');
    const searchButton = document.querySelector('.btn--ghost.header__search-btn');
    if (searchButton) {
      searchButton.addEventListener('click', async () => {
        sessionStorage.setItem('catalogScroll', window.scrollY);
        updateProductsPerPage();
        const searchQuery = searchInput.value.trim();
        currentPage = 1;
        hasMoreProducts = true;
        catalogCards.innerHTML = "";
        loadedProductIds.clear();

        if (searchQuery) {
          // Buscar por texto: usar /productos/buscar
          const url = `http://127.0.0.1:8000/productos/buscar?name=${encodeURIComponent(searchQuery)}&page=${currentPage}&limit=${productsPerPage}`;
          await loadProductsWithDirectUrl(url, currentPage);
        } else {
          // Sin texto: listar todos
          await loadProductsWithPagination("", currentPage);
        }
      });
    }

    // Permite buscar con Enter
    if (searchInput) {
      searchInput.addEventListener('keypress', (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          if (searchButton) searchButton.click();
        }
      });
    }

    // Nueva función para búsqueda directa por texto
    async function loadProductsWithDirectUrl(url, page = 1) {
      if (isLoading || !hasMoreProducts) return;
      isLoading = true;
      loadingSpinner.style.display = "flex";
      if (page === 1) {
        catalogCards.innerHTML = '<p class="loading-message">Cargando productos...</p>';
        loadedProductIds.clear();
      }
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error fetching products: ${response.statusText}`);
        const data = await response.json();
        const products = Array.isArray(data) ? data : (data.products || []);
        const totalPages = data.totalPages || 1;

        if (page === 1) {
          catalogCards.innerHTML = "";
          hasMoreProducts = true;
          removeLoadMoreButton();
        }

        if (products.length === 0 && page === 1) {
          catalogCards.innerHTML = "<p>No se encontraron productos.</p>";
          removeLoadMoreButton();
          return;
        }

        products.forEach(product => {
          if (loadedProductIds.has(product.id)) return;
          loadedProductIds.add(product.id);
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

        if (page < totalPages && products.length === pageSize) {
          addLoadMoreButton(params);
          hasMoreProducts = true;
        } else {
          removeLoadMoreButton();
          hasMoreProducts = false;
        }
      } catch (error) {
        console.error("Error loading products:", error);
        removeLoadMoreButton();
      } finally {
        isLoading = false;
        loadingSpinner.style.display = "none";
        const loadMoreBtn = document.querySelector('.load-more-button');
        if (loadMoreBtn) {
          loadMoreBtn.disabled = false;
          loadMoreBtn.textContent = "Ver más";
        }
      }
    }

    try {
      const categoriesResponse = await fetch("http://127.0.0.1:8000/categorias/listar-public");
      if (!categoriesResponse.ok) {
        throw new Error(`Error fetching categories: ${categoriesResponse.statusText}`);
      }
      const categories = await categoriesResponse.json();

      sidebarCategories.innerHTML = "";
      categories.forEach(category => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="#" class="sidebar__link" data-category="${category.name}">${category.name}</a>`;
        sidebarCategories.appendChild(li);
      });

      const typesResponse = await fetch("http://127.0.0.1:8000/productos/listar/tipos");
      if (!typesResponse.ok) {
        throw new Error(`Error fetching product types: ${typesResponse.statusText}`);
      }
      const types = await typesResponse.json();

      const typesTitle = document.createElement("h2");
      typesTitle.classList.add("sidebar__title");
      typesTitle.textContent = "Tipos de Productos";
      sidebarCategories.parentElement.appendChild(typesTitle);

      const typesList = document.createElement("ul");
      typesList.classList.add("sidebar__list");
      types.forEach(type => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="#" class="sidebar__link" data-type="${type}">${type}</a>`;
        typesList.appendChild(li);
      });
      sidebarCategories.parentElement.appendChild(typesList);

      document.querySelectorAll(".sidebar__link").forEach(link => {
        link.addEventListener("click", async (event) => {
          event.preventDefault();
          const overlay = document.getElementById("overlay");
          const sidebar = document.querySelector(".sidebar");
          overlay.classList.remove("active");
          sidebar.classList.remove("active");

          // Hacer scroll al principio de la página
          window.scrollTo(0, 0);

          // Guardar scroll antes de filtrar
          sessionStorage.setItem('catalogScroll', window.scrollY);

          const category = link.dataset.category;
          const type = link.dataset.type;

          const params = new URLSearchParams();
          if (category) params.append("category", category);
          if (type) params.append("type", type);

          try {
              catalogCards.innerHTML = "";
              updateProductsPerPage();
              currentPage = 1;
              hasMoreProducts = true;
              loadedProductIds.clear(); // Limpiar IDs cargados en nuevo filtro
              await loadProductsWithPagination(params.toString(), currentPage);
          } catch (error) {
              console.error("Error loading products:", error);
          }
        });
      });
    } catch (error) {
      console.error("Error loading sidebar data:", error);
    }

    // Restaurar scroll si existe
    const savedScroll = sessionStorage.getItem('catalogScroll');
    if (savedScroll !== null) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScroll, 10));
        sessionStorage.removeItem('catalogScroll');
      }, 50);
    }

    document.querySelectorAll(".mobile-nav-link").forEach(link => {
      link.addEventListener("click", () => {
        const overlay = document.getElementById("overlay");
        const sidebar = document.querySelector(".sidebar");
        overlay.classList.remove("active");
        sidebar.classList.remove("active");
      });
    });
});

/* Agrega animación spinner si no existe en tu CSS */
if (!document.getElementById('pagination-spinner-style')) {
  const style = document.createElement('style');
  style.id = 'pagination-spinner-style';
  style.innerHTML = `
    @keyframes spin { 100% { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
}
