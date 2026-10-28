// ПОДКЛЮЧЕНИЕ FIREBASE

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD5ize11n0eG3FvljZqd-9wGzmzYZD4i0M",
    authDomain: "flora-shop-9042e.firebaseapp.com",
    projectId: "flora-shop-9042e",
    storageBucket: "flora-shop-9042e.firebasestorage.app",
    messagingSenderId: "1051945470733",
    appId: "1:1051945470733:web:4c775f979fe6c9b097fe44",
    measurementId: "G-QKQ72VZ6LM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// БАЗА ДАННЫХ ТОВАРОВ

const products = [
    { id: 1, name: "Букет из красных роз", price: 3200, category: "Букеты", image: "https://i.pinimg.com/736x/fc/84/42/fc8442d784ec99c162a41c4da4b10c95.jpg" },
    { id: 2, name: "Букет из белых роз", price: 4500, category: "Букеты", image: "https://i.pinimg.com/736x/bf/8d/57/bf8d57a722328bbe99f9d7676784a506.jpg" },
    { id: 3, name: "Бордовые шары, 9 шт.", price: 1500, category: "Шары", image: "https://i.pinimg.com/736x/dc/fd/6b/dcfd6b5f5875216fd61abf3c2c13dc49.jpg" },
    { id: 4, name: "Открытка", price: 350, category: "Открытки", image: "https://i.pinimg.com/736x/e3/37/9b/e3379b6c56038d53b3a5e2acb5993968.jpg" },
    { id: 5, name: "Авторский букет", price: 3900, category: "Букеты", image: "https://i.pinimg.com/736x/91/6d/82/916d82daf5271442ced2e590fe13c791.jpg" },
    { id: 6, name: "Синие шары, 5 шт.", price: 900, category: "Шары", image: "https://i.pinimg.com/1200x/aa/df/81/aadf817c7197aecb682d97c76cc56792.jpg" },
    { id: 7, name: "Букет из кремовых пионов", price: 6800, category: "Букеты", image: "https://i.pinimg.com/736x/6b/08/4d/6b084d78b45d12c338840abf59e17406.jpg" },
    { id: 8, name: "Свадебный букет", price: 9000, category: "Букеты", image: "https://i.pinimg.com/736x/5e/9c/9a/5e9c9a9be63738eb55f3c4781e6e6986.jpg" }
];

let cart = JSON.parse(localStorage.getItem('floraCart')) || [];
let currentUser = null;

// НАВИГАЦИЯ

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    if (pageId === 'cart') renderCart();
    if (pageId === 'products') renderProducts();
}

function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

// ТОВАРЫ

function renderProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
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
                    ${inCart ? `✓ В корзине (${quantity})` : 'В корзину'}
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

// КОРЗИНА

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('floraCart', JSON.stringify(cart));
    updateCartCount();
    renderProducts();
    showNotification(`${product.name} добавлен в корзину`);
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').innerText = totalItems;
}

function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="text-align: center; color: #798da6; padding: 40px;">Ваша корзина пуста. Добавьте немного красоты.</p>';
        totalPriceElement.innerText = '0';
        return;
    }

    cartContainer.innerHTML = '';
    let total = 0;

    cart.forEach((item) => {
        total += item.price * item.quantity;
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-info">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <div class="cart-item-quantity">Количество: ${item.quantity} шт.</div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 20px;">
                <div style="display: flex; align-items: center; gap: 10px; border: 1px solid #798da6; padding: 5px;">
                    <button onclick="decreaseQuantity(${item.id})" style="background: none; border: none; color: #490b1a; font-size: 20px; cursor: pointer; width: 30px; height: 30px; font-weight: bold;">−</button>
                    <span style="font-size: 16px; color: #142841; min-width: 30px; text-align: center;">${item.quantity}</span>
                    <button onclick="increaseQuantity(${item.id})" style="background: none; border: none; color: #490b1a; font-size: 20px; cursor: pointer; width: 30px; height: 30px; font-weight: bold;">+</button>
                </div>
                <span class="cart-item-price">${(item.price * item.quantity).toLocaleString()} ₽</span>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">×</button>
            </div>
        `;
        cartContainer.appendChild(itemElement);
    });

    totalPriceElement.innerText = total.toLocaleString();
}

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
            removeFromCart(productId);
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('floraCart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
    renderProducts();
}

// ОФОРМЛЕНИЕ ЗАКАЗА (с отправкой в Firebase)

async function checkout() {
    if (cart.length === 0) {
        alert('Ваша корзина пуста');
        return;
    }

    if (!currentUser) {
        alert('Для оформления заказа, пожалуйста, войдите в аккаунт или зарегистрируйтесь.');
        showPage('login');
        return;
    }

    try {
        // Получаем имя и телефон из localStorage
        const userName = localStorage.getItem('floraUserName') || 'Неизвестно';
        const userPhone = localStorage.getItem('floraUserPhone') || 'Неизвестно';

        const order = {
            userId: currentUser.uid,
            userName: userName,
            userPhone: userPhone,
            userEmail: currentUser.email,
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            createdAt: new Date().toISOString(),
            status: 'new'
        };

        await addDoc(collection(db, "orders"), order);

        alert(`Спасибо за заказ, ${userName}! Мы свяжемся с вами по номеру ${userPhone} в ближайшее время.`);
        
        cart = [];
        localStorage.setItem('floraCart', JSON.stringify(cart));
        updateCartCount();
        renderCart();
        renderProducts();
    } catch (error) {
        console.error("Ошибка при оформлении заказа:", error);
        alert('Произошла ошибка при оформлении заказа. Попробуйте ещё раз.');
    }
}

// АВТОРИЗАЦИЯ ЧЕРЕЗ FIREBASE
// ==========================================
async function register() {
    const name = document.getElementById('register-name').value.trim();
    const phone = document.getElementById('register-phone').value.trim();

    if (!name || !phone) {
        alert('Пожалуйста, заполните все поля');
        return;
    }

    try {
        const email = phone.replace(/\D/g, '') + '@flora-shop.com';
        const password = 'flora' + phone.replace(/\D/g, '').slice(-6);

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        await addDoc(collection(db, "users"), {
            uid: userCredential.user.uid,
            name: name,
            phone: phone,
            email: email,
            createdAt: new Date().toISOString()
        });

        // Сохраняем имя и телефон в localStorage
        localStorage.setItem('floraUserName', name);
        localStorage.setItem('floraUserPhone', phone);

        alert(`Добро пожаловать, ${name}! Ваш аккаунт создан.`);
        document.getElementById('register-name').value = '';
        document.getElementById('register-phone').value = '';
        showPage('home');
    } catch (error) {
        console.error("Ошибка регистрации:", error);
        if (error.code === 'auth/email-already-in-use') {
            alert('Этот номер уже зарегистрирован. Пожалуйста, войдите.');
            showLoginForm();
        } else {
            alert('Ошибка при регистрации: ' + error.message);
        }
    }
}

async function login() {
    const phone = document.getElementById('login-phone').value.trim();

    if (!phone || phone.length < 10) {
        alert('Пожалуйста, введите корректный номер телефона');
        return;
    }

    try {
        const email = phone.replace(/\D/g, '') + '@flora-shop.com';
        const password = 'flora' + phone.replace(/\D/g, '').slice(-6);

               await signInWithEmailAndPassword(auth, email, password);
        
        // Получаем имя и телефон из базы данных
        const usersQuery = query(collection(db, "users"), where("email", "==", email));
        const usersSnapshot = await getDocs(usersQuery);
        
        if (!usersSnapshot.empty) {
            const userData = usersSnapshot.docs[0].data();
            localStorage.setItem('floraUserName', userData.name);
            localStorage.setItem('floraUserPhone', userData.phone);
        }
        
        alert('С возвращением!');
        document.getElementById('login-phone').value = '';
        showPage('home');
    } catch (error) {
        console.error("Ошибка входа:", error);
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            const registerNow = confirm('Аккаунт с таким номером не найден. Хотите зарегистрироваться?');
            if (registerNow) {
                document.getElementById('register-phone').value = phone;
                showRegisterForm();
            }
        } else {
            alert('Ошибка при входе: ' + error.message);
        }
    }
}

async function logout() {
    await signOut(auth);
    showPage('home');
}

function setupAuthListener() {
    const authBtn = document.getElementById('auth-btn');

    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            authBtn.innerText = 'Выйти';
            authBtn.onclick = logout;
        } else {
            currentUser = null;
            authBtn.innerText = 'Вход';
            authBtn.onclick = () => showPage('login');
        }
    });
}

// УВЕДОМЛЕНИЯ
// ==========================================
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; top: 100px; right: 30px; background-color: #490b1a; color: #e5ded2;
        padding: 20px 30px; font-family: 'Montserrat', sans-serif; font-size: 12px;
        letter-spacing: 1px; z-index: 1000; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
}

// ЗАПУСК
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartCount();
    setupAuthListener();
});
// Делаем функции глобальными (для onclick в HTML)
window.showPage = showPage;
window.showRegisterForm = showRegisterForm;
window.showLoginForm = showLoginForm;
window.addToCart = addToCart;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.removeFromCart = removeFromCart;
window.checkout = checkout;
window.register = register;
window.login = login;
window.logout = logout;