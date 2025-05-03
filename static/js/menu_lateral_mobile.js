document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector('.header__menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('overlay');

  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    if (overlay) {
      overlay.classList.toggle('active');
    }
  });

  // Cierra el menú al hacer clic en el overlay
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    });
  }

  // Al hacer clic en cualquier enlace dentro del menú lateral, se cierra el menú
  const sidebarLinks = document.querySelectorAll('.sidebar a, .mobile-nav a');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      sidebar.classList.remove('active');
      if (overlay) {
        overlay.classList.remove('active');
      }
    });
  });
});
