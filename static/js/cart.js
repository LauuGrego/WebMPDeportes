// Cart functionality
class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.isLoggedIn = this.checkAuthStatus();
        this.init();
    }

    init() {
        this.updateCartDisplay();
        this.updateCartCount();
        this.bindEvents();
        
        // Check if user is logged in, if not show login modal
        if (!this.isLoggedIn) {
            this.showLoginModal();
        }
    }

    checkAuthStatus() {
        const token = localStorage.getItem('authToken');
        return !!token;
    }

    loadCart() {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartDisplay();
        this.updateCartCount();
    }

    addToCart(product, quantity = 1, selectedSize = null) {
        if (!this.isLoggedIn) {
            this.showLoginModal();
            return false;
        }

        const existingItemIndex = this.cart.findIndex(item => 
            item.id === product.id && item.selectedSize === selectedSize
        );

        if (existingItemIndex > -1) {
            this.cart[existingItemIndex].quantity += quantity;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url || 'https://res.cloudinary.com/demo/image/upload/v1/products/default-product.jpg',
                quantity: quantity,
                selectedSize: selectedSize,
                addedAt: new Date().toISOString()
            });
        }

        this.saveCart();
        this.showToast('Producto agregado al carrito', 'success');
        return true;
    }

    removeFromCart(productId, selectedSize = null) {
        this.cart = this.cart.filter(item => 
            !(item.id === productId && item.selectedSize === selectedSize)
        );
        this.saveCart();
        this.showToast('Producto eliminado del carrito', 'success');
    }

    updateQuantity(productId, selectedSize, newQuantity) {
        if (newQuantity <= 0) {
            this.removeFromCart(productId, selectedSize);
            return;
        }

        const item = this.cart.find(item => 
            item.id === productId && item.selectedSize === selectedSize
        );
        
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
        }
    }

    clearCart() {
        if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
            this.cart = [];
            this.saveCart();
            this.showToast('Carrito vaciado', 'success');
        }
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getCartItemCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    updateCartCount() {
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) {
            const count = this.getCartItemCount();
            cartCountElement.textContent = count;
            cartCountElement.style.display = count > 0 ? 'block' : 'none';
        }
    }

    updateCartDisplay() {
        const cartItemsContainer = document.getElementById('cartItems');
        const emptyCartContainer = document.getElementById('emptyCart');
        const subtotalElement = document.getElementById('subtotal');
        const totalElement = document.getElementById('total');

        if (!cartItemsContainer) return;

        if (this.cart.length === 0) {
            cartItemsContainer.style.display = 'none';
            if (emptyCartContainer) emptyCartContainer.style.display = 'flex';
            if (subtotalElement) subtotalElement.textContent = '$0.00';
            if (totalElement) totalElement.textContent = '$0.00';
            return;
        }

        cartItemsContainer.style.display = 'flex';
        if (emptyCartContainer) emptyCartContainer.style.display = 'none';

        cartItemsContainer.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-id="${item.id}" data-size="${item.selectedSize || ''}">
                <img src="${item.image_url}" alt="${item.name}" class="item-image">
                <div class="item-details">
                    <h3 class="item-name">${item.name}</h3>
                    <p class="item-price">$${item.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                    ${item.selectedSize ? `<span class="item-size">Talle: ${item.selectedSize}</span>` : ''}
                </div>
                <div class="item-actions">
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease-btn" data-id="${item.id}" data-size="${item.selectedSize || ''}" ${item.quantity <= 1 ? 'disabled' : ''}>
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99" 
                               data-id="${item.id}" data-size="${item.selectedSize || ''}">
                        <button class="quantity-btn increase-btn" data-id="${item.id}" data-size="${item.selectedSize || ''}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="remove-btn" data-id="${item.id}" data-size="${item.selectedSize || ''}">
                        <i class="fas fa-trash"></i>
                        Eliminar
                    </button>
                </div>
            </div>
        `).join('');

        // Update totals
        const total = this.getCartTotal();
        if (subtotalElement) subtotalElement.textContent = `$${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
        if (totalElement) totalElement.textContent = `$${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

        // Bind quantity control events
        this.bindQuantityEvents();
    }

    bindQuantityEvents() {
        // Decrease quantity buttons
        document.querySelectorAll('.decrease-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.closest('.decrease-btn').dataset.id;
                const selectedSize = e.target.closest('.decrease-btn').dataset.size;
                const item = this.cart.find(item => item.id === productId && item.selectedSize === selectedSize);
                if (item && item.quantity > 1) {
                    this.updateQuantity(productId, selectedSize, item.quantity - 1);
                }
            });
        });

        // Increase quantity buttons
        document.querySelectorAll('.increase-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.closest('.increase-btn').dataset.id;
                const selectedSize = e.target.closest('.increase-btn').dataset.size;
                const item = this.cart.find(item => item.id === productId && item.selectedSize === selectedSize);
                if (item) {
                    this.updateQuantity(productId, selectedSize, item.quantity + 1);
                }
            });
        });

        // Quantity input changes
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const productId = e.target.dataset.id;
                const selectedSize = e.target.dataset.size;
                const newQuantity = parseInt(e.target.value);
                if (newQuantity > 0 && newQuantity <= 99) {
                    this.updateQuantity(productId, selectedSize, newQuantity);
                } else {
                    e.target.value = 1;
                    this.updateQuantity(productId, selectedSize, 1);
                }
            });
        });

        // Remove item buttons
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.closest('.remove-btn').dataset.id;
                const selectedSize = e.target.closest('.remove-btn').dataset.size;
                this.removeFromCart(productId, selectedSize);
            });
        });
    }

    bindEvents() {
        // Clear cart button
        const clearCartBtn = document.getElementById('clearCartBtn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => this.clearCart());
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.processCheckout());
        }

        // WhatsApp order button
        const whatsappOrderBtn = document.getElementById('whatsappOrderBtn');
        if (whatsappOrderBtn) {
            whatsappOrderBtn.addEventListener('click', () => this.sendWhatsAppOrder());
        }

        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Modal close events
        const closeModal = document.getElementById('closeModal');
        const modalOverlay = document.getElementById('modalOverlay');
        if (closeModal) closeModal.addEventListener('click', () => this.hideLoginModal());
        if (modalOverlay) modalOverlay.addEventListener('click', () => this.hideLoginModal());
    }

    processCheckout() {
        if (this.cart.length === 0) {
            this.showToast('Tu carrito está vacío', 'warning');
            return;
        }

        // Here you would integrate with a payment processor
        // For now, we'll show a message
        this.showToast('Funcionalidad de pago en desarrollo', 'warning');
    }

    sendWhatsAppOrder() {
        if (this.cart.length === 0) {
            this.showToast('Tu carrito está vacío', 'warning');
            return;
        }

        let message = '¡Hola! Me gustaría hacer el siguiente pedido:\n\n';
        
        this.cart.forEach((item, index) => {
            message += `${index + 1}. ${item.name}\n`;
            if (item.selectedSize) message += `   Talle: ${item.selectedSize}\n`;
            message += `   Cantidad: ${item.quantity}\n`;
            message += `   Precio: $${item.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}\n`;
            message += `   Subtotal: $${(item.price * item.quantity).toLocaleString('es-AR', { minimumFractionDigits: 2 })}\n\n`;
        });

        const total = this.getCartTotal();
        message += `TOTAL: $${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}\n\n`;
        message += '¡Gracias!';

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/3445417684?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
    }

    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.add('show');
        }
    }

    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    async handleLogin(e) {
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
            this.isLoggedIn = true;
            this.hideLoginModal();
            this.showToast('Inicio de sesión exitoso', 'success');
            
            // Clear form
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            
        } catch (error) {
            console.error('Error:', error);
            this.showToast(error.message || 'Credenciales incorrectas', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Ingresar';
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
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
}

// Global cart manager instance
let cartManager;

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    cartManager = new CartManager();
});

// Function to add product to cart (to be called from other pages)
window.addToCart = function(product, quantity = 1, selectedSize = null) {
    if (!cartManager) {
        cartManager = new CartManager();
    }
    return cartManager.addToCart(product, quantity, selectedSize);
};

// Function to get cart count (for other pages)
window.getCartCount = function() {
    if (!cartManager) {
        cartManager = new CartManager();
    }
    return cartManager.getCartItemCount();
};

// Update cart count on other pages
window.updateCartCount = function() {
    if (!cartManager) {
        cartManager = new CartManager();
    }
    cartManager.updateCartCount();
};