document.addEventListener('DOMContentLoaded', () => {
    const modal       = document.getElementById('loginModal');
    const overlay     = document.getElementById('modalOverlay');
    const btnClose    = document.getElementById('closeModal');
    const btnOpens    = document.querySelectorAll('.open-login-modal');
    const loginForm   = document.getElementById('loginForm');

    btnOpens.forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            const mobileOverlay = document.getElementById('overlay');
            mobileOverlay.classList.remove('active');
            document.body.classList.remove('nav-open');
            modal.classList.add('show');
        });
    });

    btnClose.addEventListener('click', () => modal.classList.remove('show'));
    overlay.addEventListener('click', () => modal.classList.remove('show'));

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Add loading indicator
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Cargando...';

        try {
            const response = await fetch('https://webmpdeportes-production.up.railway.app/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ username, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error en el inicio de sesión');
            }

            const data = await response.json();
            localStorage.setItem('authToken', data.access_token); // Store token in localStorage
            alert('Inicio de sesión exitoso');
            modal.classList.remove('show'); // Close modal
            window.location.href = 'static/editor/agregar-product.html'; // Ensure correct redirection
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Credenciales incorrectas o error en el servidor');
        } finally {
            // Remove loading indicator
            submitButton.disabled = false;
            submitButton.textContent = 'Iniciar sesión';
        }
    });
});
