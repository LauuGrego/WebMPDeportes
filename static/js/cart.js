document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const whatsappBtn = document.getElementById('whatsapp-btn');

    function getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    function setCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    async function fetchProductData(productId) {
        try {
            const res = await fetch(`https://webmpdeportes-production.up.railway.app/productos/obtener_por_id/${productId}`);
            if (!res.ok) return null;
            return await res.json();
        } catch {
            return null;
        }
    }

    async function renderCart() {
        const cart = getCart();
        cartItemsContainer.innerHTML = '';
        let total = 0;

        // Obtener todos los datos actualizados de los productos
        const productDataList = await Promise.all(cart.map(item => fetchProductData(item.id)));

        cart.forEach((item, idx) => {
            const productData = productDataList[idx];
            // Si no se pudo obtener, usa los datos del carrito como fallback
            const name = productData?.name || item.name || '';
            const image = productData?.image_url || item.image || '../images/no-image.png';
            const price = productData?.price !== undefined ? Number(productData.price) : (item.price !== undefined ? Number(item.price) : 0);
            const quantity = item.quantity || 1;
            const itemTotal = price * quantity;
            total += itemTotal;

            // const description = productData?.description || ''; // <--- NO mostrar descripción
            const stock = productData?.stock !== undefined ? productData.stock : '';
            const type = productData?.type || '';
            const size = productData?.size ? Array.isArray(productData.size) ? productData.size.join(', ') : productData.size : '';
            const category = productData?.category_name || '';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="${image}" alt="Imagen de ${name}" style="width:60px; height:60px; object-fit:contain; border-radius:8px; border:1px solid #eee;">
                </td>
                <td class="product-name">
                    <strong>${name}</strong>
                    <div style="font-size:0.9em; color:#888;">
                        ${type ? `<div>Tipo: ${type}</div>` : ''}
                        ${size ? `<div>Talles: ${size}</div>` : ''}
                        ${category ? `<div>Categoría: ${category}</div>` : ''}
                        ${stock !== '' ? `<div>Stock: ${stock}</div>` : ''}
                    </div>
                </td>
                <td>
                    <input type="number" min="1" value="${quantity}" data-idx="${idx}" class="quantity-input">
                </td>
                <td class="product-price">${price ? `$${price.toFixed(2)}` : 'Consultar'}</td>
                <td class="product-total">${price ? `$${itemTotal.toFixed(2)}` : '-'}</td>
                <td><button data-idx="${idx}" class="remove-btn">Eliminar</button></td>
            `;
            cartItemsContainer.appendChild(row);
        });

        cartTotal.textContent = total.toFixed(2);
    }

    cartItemsContainer.addEventListener('input', (e) => {
        if (e.target.classList.contains('quantity-input')) {
            const idx = e.target.dataset.idx;
            const cart = getCart();
            let newQty = parseInt(e.target.value) || 1;
            if (newQty < 1) newQty = 1;
            cart[idx].quantity = newQty;
            setCart(cart);

            // Actualizar solo la fila y el total, no toda la tabla
            const row = e.target.closest('tr');
            // Obtener precio unitario desde la celda correspondiente
            const priceCell = row.querySelector('.product-price');
            const priceText = priceCell.textContent.replace(/[^\d.,]/g, '').replace(',', '.');
            const price = parseFloat(priceText) || 0;
            const itemTotal = price * newQty;
            row.querySelector('.product-total').textContent = price ? `$${itemTotal.toFixed(2)}` : '-';

            // Actualizar el total general
            let total = 0;
            const allRows = cartItemsContainer.querySelectorAll('tr');
            allRows.forEach((tr, i) => {
                const qtyInput = tr.querySelector('.quantity-input');
                const priceCell = tr.querySelector('.product-price');
                const priceText = priceCell.textContent.replace(/[^\d.,]/g, '').replace(',', '.');
                const price = parseFloat(priceText) || 0;
                const qty = parseInt(qtyInput.value) || 1;
                total += price * qty;
            });
            cartTotal.textContent = total.toFixed(2);
        }
    });

    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const idx = e.target.dataset.idx;
            const cart = getCart();
            cart.splice(idx, 1);
            setCart(cart);
            renderCart();
        }
    });

    whatsappBtn.addEventListener('click', async () => {
        const cart = getCart();
        if (cart.length === 0) {
            alert('El carrito está vacío.');
            return;
        }

        // Obtener datos actualizados para mostrar precios correctos
        const productDataList = await Promise.all(cart.map(item => fetchProductData(item.id)));

        let total = 0;
        let message = '¡Hola! Quisiera realizar el siguiente pedido:%0A';
        cart.forEach((item, idx) => {
            const productData = productDataList[idx];
            const name = productData?.name || item.name || '';
            const price = productData?.price !== undefined ? Number(productData.price) : (item.price !== undefined ? Number(item.price) : 0);
            const quantity = item.quantity || 1;
            const itemTotal = price * quantity;
            total += itemTotal;
            message += `• ${name} x${quantity} - $${price.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} c/u%0A`;
        });
        message += `%0ATotal: $${total.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const phone = '3445417684'; // Cambia por tu número de WhatsApp si es necesario
        const url = `https://wa.me/${phone}?text=${message}`;
        window.open(url, '_blank');
    });

    renderCart();
});