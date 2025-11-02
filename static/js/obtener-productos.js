// catalogo.js
document.addEventListener("DOMContentLoaded", () => {
  const catalogContainer = document.querySelector(".catalog__grid");
  const sidebarCategories = document.querySelector("#sidebarCategories");
  const sidebarTypes = document.querySelector("#sidebarTypes");

  // 📌 Contenedor para la paginación
  const paginationContainer = document.createElement("div");
  paginationContainer.classList.add("pagination");
  catalogContainer.after(paginationContainer);

  const PRODUCTS_PER_PAGE = 12;
  let currentPage = 1;
  let currentProducts = [];
  let activeFilter = { type: null, value: null };

  const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSj1ZyiyFIKdJ1HkQCu1911NkQ6GLLV87Vz0KHbMi1Sf4ZJioVPiQvzo0jxzKGH-g/pub?output=csv";

  // Restore state
  const storedPage = sessionStorage.getItem('currentPage');
  if (storedPage) {
    currentPage = parseInt(storedPage, 10);
    sessionStorage.removeItem('currentPage');
  }
  const storedFilter = sessionStorage.getItem('activeFilter');
  if (storedFilter) {
    activeFilter = JSON.parse(storedFilter);
    sessionStorage.removeItem('activeFilter');
  }

  Papa.parse(SHEET_URL, {
    download: true,
    header: true,
    complete: function (results) {
      const data = results.data.filter(p => p.name && p.image_url);

      // 👉 Categorías únicas
      const categorias = [...new Set(data.map(item => item.category_name).filter(Boolean))];
      // 👉 Tipos únicos
      const tipos = [...new Set(data.map(item => item.type).filter(Boolean))];

      // Render Sidebar de Categorías
      categorias.forEach(cat => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = "#";
        a.textContent = cat;
        a.classList.add("sidebar__link");
        a.addEventListener("click", e => {
          e.preventDefault();
          currentPage = 1;
          activeFilter = { type: 'category', value: cat };
          applyFiltersAndRender();
        });
        li.appendChild(a);
        sidebarCategories.appendChild(li);
      });

      // Render Sidebar de Tipos
      tipos.forEach(tipo => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = "#";
        a.textContent = tipo;
        a.classList.add("sidebar__link");
        a.addEventListener("click", e => {
          e.preventDefault();
          currentPage = 1;
          activeFilter = { type: 'type', value: tipo };
          applyFiltersAndRender();
        });
        li.appendChild(a);
        sidebarTypes.appendChild(li);
      });

      // --- Búsqueda en la barra de navegación (integrada aquí para combinar con sidebar) ---
      const searchInput = document.querySelector('.header__search-input');
      const searchButton = document.querySelector('.header__search-btn');
      let searchQuery = '';

      function normalizeString(str) {
        return (str || '').toString().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
      }

      function matchesName(name, query) {
        if (!query) return true;
        const nameNorm = normalizeString(name || '');
        const tokens = query.trim().split(/\s+/).map(t => t.replace(/[^\w\-]/g, '')).filter(Boolean).map(normalizeString);
        return tokens.every(tok => nameNorm.includes(tok));
      }

      // Integrar búsqueda con los filtros laterales
      function applyFiltersAndRender() {
        // Filtrar por category/type (activeFilter) y por búsqueda (searchQuery)
        if (activeFilter.type === 'category') {
          currentProducts = data.filter(p => p.category_name === activeFilter.value && matchesName(p.name, searchQuery));
        } else if (activeFilter.type === 'type') {
          currentProducts = data.filter(p => p.type === activeFilter.value && matchesName(p.name, searchQuery));
        } else {
          currentProducts = data.filter(p => matchesName(p.name, searchQuery));
        }
        renderProducts();
      }

      if (searchButton && searchInput) {
        searchButton.addEventListener('click', (e) => {
          e.preventDefault();
          searchQuery = searchInput.value || '';
          currentPage = 1;
          applyFiltersAndRender();
        });
        searchInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            searchQuery = searchInput.value || '';
            currentPage = 1;
            applyFiltersAndRender();
          }
        });
      }

      // Render inicial
      applyFiltersAndRender();

      const storedScroll = sessionStorage.getItem('scrollPosition');
      if (storedScroll) {
          setTimeout(() => {
              window.scrollTo(0, parseInt(storedScroll, 10));
              sessionStorage.removeItem('scrollPosition');
          }, 100);
      }
    },
    error: function (err) {
      console.error("❌ Error cargando CSV:", err);
    }
  });

  catalogContainer.addEventListener('click', (e) => {
    const detailsButton = e.target.closest('.catalog__details-button');
    if (detailsButton) {
        sessionStorage.setItem('scrollPosition', window.scrollY);
        sessionStorage.setItem('currentPage', currentPage);
        if (activeFilter.type) {
            sessionStorage.setItem('activeFilter', JSON.stringify(activeFilter));
        }
        return; // Return to not trigger other handlers
    }

    const consultButton = e.target.closest('.catalog__card-button');
    if (consultButton) {
        const card = consultButton.closest('.catalog__card');
        const productId = card.dataset.id;
        const product = currentProducts.find(p => p.id === productId);
        if (product) {
            const whatsappUrl = `https://wa.me/543445417684?text=¡Hola! Quiero saber más info acerca de ${product.name}.`;
            window.open(whatsappUrl, '_blank');
        }
    }
  });

  // 👉 Función para renderizar cards con paginación
  function renderProducts() {
    catalogContainer.innerHTML = "";

    // Si no hay productos después de aplicar filtros/búsqueda, mostrar mensaje
    if (!currentProducts || currentProducts.length === 0) {
      catalogContainer.innerHTML = '<p>Productos no encontrados</p>';
      // Limpiar paginación si existe
      if (paginationContainer) paginationContainer.innerHTML = '';
      return;
    }

    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const end = start + PRODUCTS_PER_PAGE;
    const paginatedProducts = currentProducts.slice(start, end);

    paginatedProducts.forEach(prod => {
      const card = document.createElement("div");
      card.classList.add("catalog__card");
      card.dataset.id = prod.id;

      card.innerHTML = `
        <div class="catalog__card-image">
          <img src="${prod.image_url}" alt="${prod.name}">
        </div>
        <div class="catalog__card-details">
          <h3 class="catalog__card-title">${prod.name}</h3>
          <p class="catalog__card-price">
            $${Number(prod.price || 0).toLocaleString("es-AR")}
          </p>
        </div>
        <div class="catalog__card-actions">
          <button class="catalog__card-button">
            <i class="fab fa-whatsapp"></i> Consultar
          </button>
          <a href="../productos/producto.html?id=${prod.id}" class="catalog__details-button">
            <i class="fas fa-eye"></i> Ver Detalles
          </a>
        </div>
      `;

      catalogContainer.appendChild(card);
    });

    renderPagination();
  }

  // 👉 Render de la barra de paginación
  function renderPagination() {
    paginationContainer.innerHTML = "";
    const totalPages = Math.ceil(currentProducts.length / PRODUCTS_PER_PAGE);

    if (totalPages <= 1) return; // No mostrar paginación si hay solo 1 página

    // Botón "Anterior"
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "« Anterior";
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderProducts();
        window.scrollTo(0, 0);
      }
    });
    paginationContainer.appendChild(prevBtn);

    // Números de página
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement("button");
      pageBtn.textContent = i;
      if (i === currentPage) pageBtn.classList.add("active");
      pageBtn.addEventListener("click", () => {
        currentPage = i;
        renderProducts();
        window.scrollTo(0, 0);
      });
      paginationContainer.appendChild(pageBtn);
    }

    // Botón "Siguiente"
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Siguiente »";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderProducts();
        window.scrollTo(0, 0);
      }
    });
    paginationContainer.appendChild(nextBtn);
  }
});