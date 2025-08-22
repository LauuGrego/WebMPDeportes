// Add to cart functionality for product pages
document.addEventListener('DOMContentLoaded', function() {
    // Add cart count to header if it exists
    updateCartCountDisplay();
    
    // Add event listeners for "Add to Cart" buttons
    addCartButtonListeners();
});

function updateCartCountDisplay() {
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = count;
        cartCountElement.style.display = count > 0 ? 'block' : 'none';
    }
}

function addCartButtonListeners() {
    // For catalog page - add to cart buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.add-to-cart-btn')) {
            e.preventDefault();
            const button = e.target.closest('.add-to-cart-btn');
            const productId = button.dataset.productId;
            
            if (productId) {
                addProductToCart(productId);
            }
        }
    });
}

async function addProductToCart(productId, selectedSize = null, quantity = 1) {
    try {
        // Check if user is logged in
        const token = localStorage.getItem('authToken');
        if (!token) {
            showLoginModal();
            return false;
        }

        // Get product details
        const response = await fetch(`https://webmpdeportes-production.up.railway.app/productos/obtener_por_id/${productId}`);
        if (!response.ok) {
            throw new Error('Error al obtener el producto');
        }
        
        const product = await response.json();
        
        // Add to local cart
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const exists = cart.some(item => item.id === product.id && item.selectedSize === selectedSize);
            if (!exists) {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image_url: product.image_url || 'https://res.cloudinary.com/demo/image/upload/v1/products/default-product.jpg',
                    quantity: 1,
                    selectedSize: selectedSize,
                    addedAt: new Date().toISOString()
                });
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCountDisplay();
                showToast('Producto agregado al carrito', 'success');
                return true;
            } else {
                showToast('Este producto ya está en el carrito', 'warning');
                return false;
            }
        return true;
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Error al agregar el producto al carrito', 'error');
        return false;
    }
}

function showLoginModal() {
    // Create and show login modal if it doesn't exist
    let modal = document.getElementById('loginModal');
    if (!modal) {
        modal = createLoginModal();
        document.body.appendChild(modal);
    }
    modal.classList.add('show');
}

function createLoginModal() {
    const modal = document.createElement('div');
    modal.id = 'loginModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal__overlay" onclick="hideLoginModal()"></div>
        <div class="modal__content">
            <button class="modal__close" onclick="hideLoginModal()" aria-label="Cerrar">&times;</button>
            <div class="login-card">
                <h1 class="login-title">Iniciar Sesión</h1>
                <p class="login-subtitle">Inicia sesión para agregar productos al carrito</p>
                <form id="loginForm" class="login-form">
                    <div class="form-group">
                        <label for="username">Usuario:</label>
                        <input type="text" id="username" name="username" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Contraseña:</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit" class="btn btn--primary login-btn">Ingresar</button>
                </form>
            </div>
        </div>
    `;

    // Add login form handler
    modal.querySelector('#loginForm').addEventListener('submit', handleLogin);
    
    return modal;
}

function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const submitButton = e.target.querySelector('button[type="submit"]');

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
        localStorage.setItem('authToken', data.access_token);
        hideLoginModal();
        showToast('Inicio de sesión exitoso', 'success');
        
        // Clear form
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        
    } catch (error) {
        console.error('Error:', error);
        showToast(error.message || 'Credenciales incorrectas', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Ingresar';
    }
}

function showToast(message, type = 'success') {
    // Create toast if it doesn't exist
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="toast-icon"></i>
                <span class="toast-message"></span>
            </div>
        `;
        document.body.appendChild(toast);
    }

    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');

    // Set icon based on type
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle'
    };

    toastIcon.className = `toast-icon ${icons[type] || icons.success}`;
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;

    // Show toast
    toast.classList.add('show');

    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Make functions globally available
window.addProductToCart = addProductToCart;
window.showLoginModal = showLoginModal;
window.hideLoginModal = hideLoginModal;
window.updateCartCountDisplay = updateCartCountDisplay;