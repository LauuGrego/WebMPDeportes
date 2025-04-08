
    // Toggle del menú móvil
    const mobileFiltersBtn = document.querySelector('.mobile-filters-btn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-filters-overlay');
  
    // Función para cerrar el menú
    const closeMenu = () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    };
  
    // Abrir/cerrar menú con el botón de filtros
    mobileFiltersBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      overlay.classList.toggle('active');
    });
  
    // Cerrar menú al hacer clic en el overlay
    overlay.addEventListener('click', closeMenu);
  
    // Función para manejar clics en elementos dinámicos (Event Delegation)
    document.addEventListener('click', function(event) {
      // Solo en dispositivos móviles
      if (window.innerWidth >= 768) return;
      
      // Verificar si el clic fue en un botón de categoría o tipo
      if (event.target.closest('.category-button, .type-button')) {
        closeMenu();
      }
      
      // Verificar si el clic fue en un enlace del sidebar
      if (event.target.closest('.sidebar a')) {
        closeMenu();
      }
    });
  
    // Sincronizar eventos de ambos botones de login
    document.getElementById('open-login-mobile')?.addEventListener('click', () => {
      document.getElementById('open-login').click();
      closeMenu();
    });
 