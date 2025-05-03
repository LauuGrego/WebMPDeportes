document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('login-modal');
    const btnClose = document.getElementById('close-login');
    const btnOpen = document.getElementById('open-login');
    const loginForm = document.querySelector('.modal__form');

    btnOpen.addEventListener('click', () => {
        modal.classList.add('show');
    });

    btnClose.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Cargando...';

        try {
            const response = await fetch('webmpdeportes-production.up.railway.app/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ username, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error en el inicio de sesión');
            }

            const data = await response.json();
            localStorage.setItem('authToken', data.access_token);
            alert('Inicio de sesión exitoso');
            modal.classList.remove('show');
            window.location.href = 'static/editor/agregar-product.html';
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Credenciales incorrectas o error en el servidor');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Iniciar sesión';
        }
    });
});
