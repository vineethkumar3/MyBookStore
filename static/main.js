// main.js

// === COMMON: Cart data from localStorage ===
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || {};
}
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// === HOME PAGE (buyNow, increase, decrease) ===
function buyNow(btn) {
    const actionDiv = btn.parentElement;
    const bookId = actionDiv.dataset.id;
    const cart = getCart();
    cart[bookId] = 1;
    saveCart(cart);
    renderButton(actionDiv, bookId, 1);

    syncCartToServer(bookId, 1);
}


function increase(btn) {
    const countSpan = btn.parentElement.querySelector(".count");
    const bookId = btn.parentElement.dataset.id;
    const cart = getCart();
    cart[bookId] = (cart[bookId] || 1) + 1;
    saveCart(cart);
    countSpan.textContent = cart[bookId];

    syncCartToServer(bookId, cart[bookId]);
}


function decrease(btn) {
    const countSpan = btn.parentElement.querySelector(".count");
    const bookId = btn.parentElement.dataset.id;
    const cart = getCart();

    if (cart[bookId] > 1) {
        cart[bookId] -= 1;
        saveCart(cart);
        countSpan.textContent = cart[bookId];
        syncCartToServer(bookId, cart[bookId]);
    } else {
        delete cart[bookId];
        saveCart(cart);
        btn.parentElement.innerHTML = `<button onclick="buyNow(this)">Buy Now</button>`;
        syncCartToServer(bookId, 0); // to remove from DB
    }
}

function renderButton(div, id, count) {
    div.innerHTML = `
        <button onclick="decrease(this)">-</button>
        <span class="count">${count}</span>
        <button onclick="increase(this)">+</button>
    `;
}

// === HOME PAGE: Render cart state on page load
function initHomePage() {
    const cart = getCart();
    document.querySelectorAll(".action").forEach(div => {
        const id = div.dataset.id;
        if (cart[id]) {
            renderButton(div, id, cart[id]);
        } else {
            div.innerHTML = `<button onclick="buyNow(this)">Buy Now</button>`;
        }
    });
}

// === CART PAGE: Render cart items and totals
function initCartPage(books) {
    const cart = getCart();
    const cartContainer = document.getElementById("cart-items");
    let total = 0;

    if (!cartContainer) return;

    if (Object.keys(cart).length === 0) {
        cartContainer.innerHTML = "<h3 style='text-align:center;'>Your cart is empty 😕</h3>";
    } else {
        Object.keys(cart).forEach(id => {
            const book = books.find(b => b.id == id);
            const qty = cart[id];
            if (book) {
                const subtotal = book.price * qty;
                total += subtotal;
                cartContainer.innerHTML += `
                    <div class="book-card">
                        <img src="${book.image}" alt="${book.title}">
                        <h4>${book.title}</h4>
                        <p>Price: $${book.price.toFixed(2)}</p>
                        <p>Quantity: ${qty}</p>
                        <p><strong>Subtotal: $${subtotal.toFixed(2)}</strong></p>
                    </div>
                `;
            }
        });

        cartContainer.innerHTML += `
            <div style="text-align: center; margin-top: 20px;">
                <h2>Total: $${total.toFixed(2)}</h2>
            </div>
        `;
    }
}

// === CHECKOUT PAGE
function submitPayment(e) {
    e.preventDefault();
    localStorage.removeItem('cart');
    document.getElementById('success').style.display = 'block';
    document.getElementById('invoice-link')?.style?.setProperty("display", "block");
    document.getElementById('home-link')?.style?.setProperty("display", "block");
}

function submitPayment(e) {
    e.preventDefault();
    const cart = getCart();
    fetch("/save-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cart)
    }).then(res => res.json())
      .then(data => {
          if (data.status === 'success') {
              localStorage.removeItem('cart');
              document.getElementById('success').style.display = 'block';
              document.getElementById('invoice-link')?.style?.setProperty("display", "block");
              document.getElementById('home-link')?.style?.setProperty("display", "block");
          }
      });
}

function syncCartToServer(bookId, quantity) {
    fetch("/update-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: bookId, quantity: quantity })
    });
}
function getUserCartKey() {
    return `cart_${localStorage.getItem('user_email') || 'guest'}`;
}

function getCart() {
    return JSON.parse(localStorage.getItem(getUserCartKey())) || {};
}

function saveCart(cart) {
    localStorage.setItem(getUserCartKey(), JSON.stringify(cart));
}
