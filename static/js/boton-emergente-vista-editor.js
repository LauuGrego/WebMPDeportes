document.addEventListener("DOMContentLoaded", () => {
    // Selecciona los elementos necesarios
    const openLoginBtn = document.getElementById("open-login");
    const closeLoginBtn = document.getElementById("close-login");
    const closeLoginBtnX = document.querySelector(".modal__close--login");
    const loginModal = document.getElementById("login-modal");
    const loginForm = document.querySelector("#login-modal form");

    // Verifica que los elementos existan antes de agregar los event listeners
    if (openLoginBtn) {
        openLoginBtn.addEventListener("click", () => {
            loginModal.style.display = "flex";
        });
    }

    if (closeLoginBtn) {
        closeLoginBtn.addEventListener("click", () => {
            loginModal.style.display = "none";
        });
    }

    if (closeLoginBtnX) {
        closeLoginBtnX.addEventListener("click", () => {
            loginModal.style.display = "none";
        });
    }

    window.addEventListener("click", (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = "none";
        }
    });

    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const formData = new URLSearchParams();
            formData.append("username", loginForm.username.value);
            formData.append("password", loginForm.password.value);

            try {
                const response = await fetch("http://127.0.0.1:8000/usuarios/login", {
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
                window.location.href = "/static/editor/inicio.html";

            } catch (error) {
                alert(error.message);
            }
        });
    }
});

