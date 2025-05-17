document.addEventListener("DOMContentLoaded", async () => {
    const sidebarCategories = document.getElementById("sidebarCategories");
    const catalogCards = document.getElementById("catalogCards");
    const loadingSpinner = document.createElement("div");
    loadingSpinner.className = "loading-spinner";
    loadingSpinner.innerHTML = `<div class="spinner"></div>`;
    catalogCards.insertAdjacentElement("afterend", loadingSpinner); // Place spinner after catalog cards
  
    let currentPage = 1;
    const productsPerPage = 10;
    let isLoading = false;
    let hasMoreProducts = true;
  
    async function loadProductsWithPagination(params = "", page = 1) {
      if (isLoading || !hasMoreProducts) return;
      isLoading = true;
      loadingSpinner.style.display = "flex"; // Show spinner
  
      try {
        // Construct the URL properly
        const baseUrl = "http://127.0.0.1:8000/productos/buscar_por_categoria_o_tipo";
        const url = params ? `${baseUrl}?${params}&page=${page}&limit=${productsPerPage}` : `${baseUrl}?page=${page}&limit=${productsPerPage}`;
  
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error fetching products: ${response.statusText}`);
        }
        const { products, totalPages } = await response.json();
  
        if (page >= totalPages) {
          hasMoreProducts = false;
        }
  
        products.forEach(product => {
          const imagePath = product.image_path || 'https://res.cloudinary.com/demo/image/upload/v1/products/default-product.jpg';
          const formattedPrice = product.price 
            ? product.price.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
            : "N/A";
          const card = `
            <div class="card">
              <img src="${imagePath}" alt="${product.name}" class="card__image">
              <div class="card__info">
                <h3 class="card__title">${product.name}</h3>
                <p class="card__description">${product.description}</p>
                <div class="card__footer">
                  <div class="card__buttons">
                    <button class="ver-detalles-btn" data-product-id="${product.id}">Ver Detalles</button>
                    <a href="https://wa.me/3445417684/?text=¡Hola! Quiero saber más info acerca de ${product.name}." class="card__whatsapp">WhatsApp</a>
                  </div>
                </div>
              </div>
            </div>`;
          catalogCards.insertAdjacentHTML('beforeend', card);
        });
  
        // Add event listener for "Ver Detalles" buttons
        document.querySelectorAll('.ver-detalles-btn').forEach(button => {
          button.addEventListener('click', (event) => {
            const productId = event.target.dataset.productId;
            window.location.href = `../detalle/detalle.html?id=${productId}`;
          });
        });
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        isLoading = false;
        loadingSpinner.style.display = "none"; // Hide spinner
      }
    }
  
    let debounceTimeout;
    const debounce = (func, delay) => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(func, delay);
    };
  
    const searchInput = document.querySelector('.header__search-input');
    searchInput.addEventListener('input', () => {
      debounce(() => {
        const searchQuery = searchInput.value.trim();
        currentPage = 1;
        hasMoreProducts = true;
        catalogCards.innerHTML = ""; // Clear catalog for new search
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        loadProductsWithPagination(params.toString(), currentPage);
      }, 300); // 300ms debounce delay
    });
  
    window.addEventListener("scroll", () => {
      const scrollThreshold = document.documentElement.scrollHeight - window.innerHeight - 100;
      if (window.scrollY >= scrollThreshold && !isLoading) {
        currentPage++;
        const params = new URLSearchParams();
        const activeCategory = document.querySelector(".sidebar__link[data-category].active");
        const activeType = document.querySelector(".sidebar__link[data-type].active");
        const searchQuery = searchInput.value.trim();
  
        if (activeCategory) params.append("category", activeCategory.dataset.category);
        if (activeType) params.append("type", activeType.dataset.type);
        if (searchQuery) params.append("search", searchQuery);
  
        loadProductsWithPagination(params.toString(), currentPage);
      }
    });
  
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
          overlay.classList.remove("active"); // Hide overlay
          sidebar.classList.remove("active"); // Close sidebar
  
          // Load results based on the link's data attributes
          const category = link.dataset.category;
          const type = link.dataset.type;
  
          const params = new URLSearchParams();
          if (category) params.append("category", category);
          if (type) params.append("type", type);
  
          try {
              catalogCards.innerHTML = ""; // Clear catalog for new results
              currentPage = 1;
              hasMoreProducts = true;
              await loadProductsWithPagination(params.toString(), currentPage);
          } catch (error) {
              console.error("Error loading products:", error);
          }
        });
      });
    } catch (error) {
      console.error("Error loading sidebar data:", error);
    }
  
    loadProductsWithPagination();
  
    document.querySelectorAll(".mobile-nav-link").forEach(link => {
      link.addEventListener("click", () => {
        const overlay = document.getElementById("overlay");
        const sidebar = document.querySelector(".sidebar");
        overlay.classList.remove("active"); // Hide overlay
        sidebar.classList.remove("active"); // Close sidebar
      });
    });
  });
  