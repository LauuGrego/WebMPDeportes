// Selecciona los elementos necesarios
const openLoginBtn = document.getElementById("open-login");
const vistaEditorLink = document.getElementById("vista-editor-link");
const closeLoginBtn = document.querySelector(".modal__close--login");
const closeLoginBtnX = document.querySelector(".modal__close--login");
const loginModal = document.querySelector(".modal--login");
const loginForm = document.querySelector(".modal__form--login");

// Muestra la ventana emergente
openLoginBtn.addEventListener("click", () => {
    loginModal.style.display = "flex";
});

// Cierra la ventana emergente
closeLoginBtn.addEventListener("click", () => {
    loginModal.style.display = "none";
});

// Cierra la ventana emergente al hacer clic en la "X"
closeLoginBtnX.addEventListener("click", () => {
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
    event.preventDefault();

    const formData = new URLSearchParams();
    formData.append("username", loginForm.username.value);
    formData.append("password", loginForm.password.value);

    try {
        const response = await fetch("https://webmpdeportes.onrender.com/usuarios/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Error en el inicio de sesión");
        }

        const data = await response.json();
        localStorage.setItem("access_token", data.access_token);

        // Cierra el modal
        loginModal.style.display = "none";

        // Redirige al editor
        window.location.href = "./../editor/inicio.html";

    } catch (error) {
        alert(error.message);
    }
});
