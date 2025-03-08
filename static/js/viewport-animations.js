document.addEventListener("DOMContentLoaded", () => {
    const animatedElements = document.querySelectorAll(".animate__animated");

    animatedElements.forEach(element => {
        // Obtiene las clases de animación
        const animationClasses = [...element.classList].filter(cls => cls.startsWith("animate__"));

        // Oculta el elemento antes de que entre en el viewport
        element.classList.add("hidden");
        element.classList.remove(...animationClasses);

        // Configuración del Intersection Observer
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    element.classList.remove("hidden"); // Hace visible el elemento
                    element.classList.add("animate__animated", ...animationClasses); // Activa la animación
                    observer.unobserve(element); // Deja de observar después de la animación
                }
            });
        }, { threshold: 0.2 });

        observer.observe(element);
    });
});
