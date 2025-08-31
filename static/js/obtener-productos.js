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

  const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSj1ZyiyFIKdJ1HkQCu1911NkQ6GLLV87Vz0KHbMi1Sf4ZJioVPiQvzo0jxzKGH-g/pub?output=csv";

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
          currentProducts = data.filter(p => p.category_name === cat);
          renderProducts();
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
          currentProducts = data.filter(p => p.type === tipo);
          renderProducts();
        });
        li.appendChild(a);
        sidebarTypes.appendChild(li);
      });

      // Render inicial
      currentProducts = data;
      renderProducts();

      // 👉 Función para renderizar cards con paginación
      function renderProducts() {
        catalogContainer.innerHTML = "";

        const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
        const end = start + PRODUCTS_PER_PAGE;
        const paginatedProducts = currentProducts.slice(start, end);

        paginatedProducts.forEach(prod => {
          const card = document.createElement("div");
          card.classList.add("catalog__card");

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
              <button class="add-to-cart-btn" data-id="${prod.id}">
                <i class="fas fa-cart-plus"></i> Agregar
              </button>
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
          }
        });
        paginationContainer.appendChild(nextBtn);
      }
    },
    error: function (err) {
      console.error("❌ Error cargando CSV:", err);
    }
  });
});
