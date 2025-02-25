<<<<<<< HEAD
// Selecciona los elementos necesarios
const openLoginBtn = document.getElementById("open-login");
const closeLoginBtn = document.getElementById("close-login");
const loginModal = document.getElementById("login-modal");
const loginForm = document.querySelector("#login-modal form");

// Muestra la ventana emergente
openLoginBtn.addEventListener("click", () => {
    loginModal.style.display = "flex"; // Cambia el display a 'flex' para centrar
});

// Cierra la ventana emergente
closeLoginBtn.addEventListener("click", () => {
    loginModal.style.display = "none";
});

// Cierra la ventana al hacer clic fuera de la tarjeta
window.addEventListener("click", (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = "none";
    }
});

// Manejo del envío del formulario de login
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Evita la recarga de la página

    const formData = new FormData(loginForm);
    const username = formData.get("username");
    const password = formData.get("password");

    try {
        const response = await fetch("http://127.0.0.1:8000/usuarios/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({ username, password }),
        });

        if (!response.ok) {
            throw new Error("Usuario o contraseña incorrectos");
        }

        const data = await response.json();
        localStorage.setItem("access_token", data.access_token); // Guarda el token

        // Cierra la ventana emergente
        loginModal.style.display = "none";

        // Redirige a otra página
        window.location.href = "./editor/inicio.html"; // Cambia la ruta según tu necesidad
    } catch (error) {
        alert(error.message); // Muestra el error si falla el login
    }
});
=======
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
>>>>>>> fcbb013a6e421ae9310f98ac2227f1e8e347b22f
