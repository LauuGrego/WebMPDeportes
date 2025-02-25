
document.addEventListener("DOMContentLoaded", function() {
    // Si hay un hash en la URL, desplazarse suavemente a ese elemento
    if (window.location.hash) {
      const targetElement = document.querySelector(window.location.hash);
      if (targetElement) {
        // Usamos un pequeño timeout para esperar a que se renderice el contenido
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  });