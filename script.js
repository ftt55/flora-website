// БАЗА ДАННЫХ ТОВАРОВ с реальными фотографиями
const products = [
    { 
        id: 1, 
        name: "A bouquet of red roses", 
        price: 3200, 
        category: "Bouquets",
        image: "https://i.pinimg.com/736x/fc/84/42/fc8442d784ec99c162a41c4da4b10c95.jpg"
    },
    { 
        id: 2, 
        name: "A bouquet of white roses", 
        price: 4500, 
        category: "Bouquets",
        image: "https://i.pinimg.com/736x/bf/8d/57/bf8d57a722328bbe99f9d7676784a506.jpg"
    },
    { 
        id: 3, 
        name: "Burgundy balloons, 9 pcs.", 
        price: 1500, 
        category: "Balloons",
        image: "https://i.pinimg.com/736x/dc/fd/6b/dcfd6b5f5875216fd61abf3c2c13dc49.jpg"
    },
    { 
        id: 4, 
        name: "Postcard", 
        price: 350, 
        category: "Cards",
        image: "https://i.pinimg.com/736x/e3/37/9b/e3379b6c56038d53b3a5e2acb5993968.jpg"
    },
    { 
        id: 5, 
        name: "Author’s bouquet", 
        price: 3900, 
        category: "Bouquets",
        image: "https://i.pinimg.com/736x/91/6d/82/916d82daf5271442ced2e590fe13c791.jpg"
    },
    { 
        id: 6, 
        name: "Blue balloons, 5 pcs.", 
        price: 900, 
        category: "Balloons",
        image: "https://i.pinimg.com/1200x/aa/df/81/aadf817c7197aecb682d97c76cc56792.jpg"
    },
    { 
        id: 7, 
        name: "A bouquet of cream‑colored peonies", 
        price: 6800, 
        category: "Bouquets",
        image: "https://i.pinimg.com/736x/6b/08/4d/6b084d78b45d12c338840abf59e17406.jpg"
    },
    { 
        id: 8, 
        name: "Wedding bouquet", 
        price: 9000, 
        category: "Bouquets",
        image: "https://i.pinimg.com/736x/5e/9c/9a/5e9c9a9be63738eb55f3c4781e6e6986.jpg"
    }
];

// Корзина с количеством
let cart = JSON.parse(localStorage.getItem('floraCart')) || [];

// БАЗА ДАННЫХ ПОЛЬЗОВАТЕЛЕЙ (в localStorage)
let users = JSON.parse(localStorage.getItem('floraUsers')) || [];
let currentUser = localStorage.getItem('floraCurrentUser') || null;

// ФУНКЦИЯ ПЕРЕКЛЮЧЕНИЯ СТРАНИЦ

// Переключение между формами
function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    if (pageId === 'cart') {
        renderCart();
    }
    if (pageId === 'products') {
        renderProducts();
    }
}

// ОТРИСОВКА ТОВАРОВ
function renderProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        // Проверяем, есть ли товар в корзине и сколько его там
        const cartItem = cart.find(item => item.id === product.id);
        const inCart = cartItem ? true : false;
        const quantity = cartItem ? cartItem.quantity : 0;
        
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3>${product.name}</h3>
                <span class="price">${product.price.toLocaleString()} ₽</span>
                <button class="add-to-cart-btn ${inCart ? 'in-cart' : ''}" onclick="addToCart(${product.id})">
                    ${inCart ? `✓ In Cart (${quantity})` : 'Add to Cart'}
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

// ДОБАВЛЕНИЕ В КОРЗИНУ
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    // Если товар уже есть, просто увеличиваем его количество
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // Если нет, добавляем новый с количеством 1
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('floraCart', JSON.stringify(cart));
    updateCartCount();
    renderProducts(); // Обновляем кнопки на карточках
    showNotification(`${product.name} added to cart`);
}

// УВЕДОМЛЕНИЕ
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background-color: #d4a5a5;
        color: white;
        padding: 20px 30px;
        font-family: 'Montserrat', sans-serif;
        font-size: 12px;
        letter-spacing: 1px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// ОБНОВЛЕНИЕ СЧЕТЧИКА
function updateCartCount() {
    // Считаем не просто товары, а именно их количество (суммируем quantity)
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').innerText = totalItems;
}

// ОТРИСОВКА КОРЗИНЫ
function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="text-align: center; color: #798da6; padding: 40px;">Your cart is empty. Add some beauty.</p>';
        totalPriceElement.innerText = '0';
        return;
    }

    cartContainer.innerHTML = '';
    let total = 0;

    cart.forEach((item) => {
        total += item.price * item.quantity; // Умножаем цену на количество
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-info">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <div class="cart-item-quantity">Quantity: ${item.quantity} pcs</div>
                </div>
            </div>
            <div style="display: flex; align-items: center;">
                <span class="cart-item-price">${(item.price * item.quantity).toLocaleString()} ₽</span>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">×</button>
            </div>
        `;
        cartContainer.appendChild(itemElement);
    });

    totalPriceElement.innerText = total.toLocaleString();
}

//+-
function increaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += 1;
        localStorage.setItem('floraCart', JSON.stringify(cart));
        renderCart();
        updateCartCount();
        renderProducts();
    }
}

function decreaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (item.quantity > 1) {
            item.quantity -= 1;
            localStorage.setItem('floraCart', JSON.stringify(cart));
            renderCart();
            updateCartCount();
            renderProducts();
        } else {
            // Если количество равно 1, просто удаляем товар без лишних вопросов
            removeFromCart(productId);
        }
    }
}

// УДАЛЕНИЕ ИЗ КОРЗИНЫ
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('floraCart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
    renderProducts(); // Обновляем кнопки на странице товаров
}

// ОФОРМЛЕНИЕ ЗАКАЗА
function checkout() {
    if (cart.length === 0) {
        alert('Ваша корзина пуста');
        return;
    }
    
    // Проверяем, авторизован ли пользователь
    if (currentUser) {
        // Пользователь авторизован - оформляем заказ
        const user = users.find(u => u.phone === currentUser);
        const userName = user ? user.name : currentUser;
        
        alert(`Спасибо за заказ, ${userName}! Мы свяжемся с вами по номеру ${currentUser} в ближайшее время.`);
        
        // Очищаем корзину
        cart = [];
        localStorage.setItem('floraCart', JSON.stringify(cart));
        updateCartCount();
        renderCart();
        renderProducts();
    } else {
        // Пользователь НЕ авторизован - просим войти
        alert('Для оформления заказа пожалуйста, войдите в аккаунт или зарегистрируйтесь.');
        showPage('login');
        // Корзина сохраняется автоматически в localStorage
    }
}

// ==========================================
// АВТОРИЗАЦИЯ И РЕГИСТРАЦИЯ (Дописанная часть)
// ==========================================

function register() {
    const name = document.getElementById('register-name').value.trim();
    const phone = document.getElementById('register-phone').value.trim();
    
    if (!name || !phone) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    if (phone.length < 10) {
        alert('Пожалуйста, введите корректный номер телефона');
        return;
    }
    
    const existingUser = users.find(user => user.phone === phone);
    if (existingUser) {
        alert('Этот номер уже зарегистрирован. Пожалуйста, войдите.');
        showLoginForm();
        return;
    }
    
    const newUser = {
        id: Date.now(),
        name: name,
        phone: phone,
        registeredAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('floraUsers', JSON.stringify(users));
    
    currentUser = phone;
    localStorage.setItem('floraCurrentUser', currentUser);
    
    alert(`Добро пожаловать, ${name}! Ваш аккаунт создан.`);
    
    document.getElementById('register-name').value = '';
    document.getElementById('register-phone').value = '';
    checkAuthStatus();
    showPage('home');
}

function login() {
    const phone = document.getElementById('login-phone').value.trim();
    
    if (!phone || phone.length < 10) {
        alert('Пожалуйста, введите корректный номер телефона');
        return;
    }
    
    const user = users.find(u => u.phone === phone);
    
    if (!user) {
        const registerNow = confirm('Аккаунт с таким номером не найден. Хотите зарегистрироваться?');
        if (registerNow) {
            document.getElementById('register-phone').value = phone;
            showRegisterForm();
        }
        return;
    }
    
    currentUser = phone;
    localStorage.setItem('floraCurrentUser', currentUser);
    
    alert(`С возвращением, ${user.name}!`);
    document.getElementById('login-phone').value = '';
    checkAuthStatus();
    showPage('home');
}

function logout() {
    localStorage.removeItem('floraCurrentUser');
    currentUser = null;
    checkAuthStatus();
    showPage('home');
}

function checkAuthStatus() {
    const authBtn = document.getElementById('auth-btn');
    const statusText = document.getElementById('user-status');

    if (currentUser) {
        const user = users.find(u => u.phone === currentUser);
        const userName = user ? user.name : currentUser;
        
        authBtn.innerText = 'Выйти';
        authBtn.onclick = logout;
        if (statusText) statusText.innerText = 'Вы вошли как: ' + userName;
    } else {
        authBtn.innerText = 'Вход';
        authBtn.onclick = () => showPage('login');
        if (statusText) statusText.innerText = '';
    }
}

// ЗАПУСК ПРИ ЗАГРУЗКЕ САЙТА
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartCount();
    checkAuthStatus();
});