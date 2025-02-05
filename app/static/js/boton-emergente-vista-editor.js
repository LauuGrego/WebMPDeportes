// Selecciona los elementos necesarios
const openLoginBtn = document.getElementById('open-login');
const closeLoginBtn = document.getElementById('close-login');
const loginModal = document.getElementById('login-modal');

// Muestra la ventana emergente
openLoginBtn.addEventListener('click', () => {
    loginModal.style.display = 'flex'; // Cambia el display a 'flex' para centrar
});

// Cierra la ventana emergente
closeLoginBtn.addEventListener('click', () => {
    loginModal.style.display = 'none';
});

// Cierra la ventana al hacer clic fuera de la tarjeta
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
});
