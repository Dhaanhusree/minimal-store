// ─── STATE ─────────────────
let cart = [];

// ─── PERSISTENCE ─────────────────
function saveCart() {
  localStorage.setItem('minimal-store-cart', JSON.stringify(cart));
}

function loadCart() {
  const stored = localStorage.getItem('minimal-store-cart');
  if (stored) {
    cart = JSON.parse(stored);
  } else {
    cart = [];
  }
}

loadCart();

// ─── DOM SELECTION ─────────────────
const productGrid = document.getElementById('product-grid');
const productDetail = document.getElementById('product-detail');
const cartToggle = document.getElementById('cart-toggle');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartClose = document.getElementById('cart-close');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotalPrice = document.getElementById('cart-total-price');
const navLinks = document.querySelectorAll('.nav-link');
const searchInput = document.getElementById('search-input');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutOverlay = document.getElementById('checkout-overlay');
const checkoutModal = document.getElementById('checkout-modal');
const checkoutClose = document.getElementById('checkout-close');
const checkoutItems = document.getElementById('checkout-items');
const checkoutTotal = document.getElementById('checkout-total');
const checkoutForm = document.getElementById('checkout-form');
const successOverlay = document.getElementById('success-overlay');
const successModal = document.getElementById('success-modal');
const successClose = document.getElementById('success-close');
const orderNumberSpan = document.getElementById('order-number');

// ─── RENDER PRODUCT GRID ─────────────────
function renderProducts(category = 'all') {
  const filtered = category === 'all' 
    ? products 
    : products.filter(p => p.category === category);
  
  renderFilteredProducts(filtered);
}

function renderFilteredProducts(productArray) {
  productGrid.innerHTML = '';
  
  if (productArray.length === 0) return;
  
  productArray.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" loading="lazy">
      <div class="product-card-body">
        <span class="category-tag">${product.category}</span>
        <h3>${product.name}</h3>
        <p class="price">$${product.price.toFixed(2)}</p>
      </div>
    `;
    
    card.addEventListener('click', () => {
      showProductDetail(product.id);
    });
    
    productGrid.appendChild(card);
  });
}

// ─── SEARCH ─────────────────
function handleSearch(query) {
  const searchTerm = query.toLowerCase().trim();
  const activeCategory = document.querySelector('.nav-link.active').dataset.category;
  
  let results = activeCategory === 'all' 
    ? [...products] 
    : products.filter(p => p.category === activeCategory);
  
  if (searchTerm !== '') {
    results = results.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  }
  
  renderFilteredProducts(results);
  
  if (results.length === 0) {
    productGrid.innerHTML = `
      <div class="no-results">
        <p>No products found for "${query}"</p>
        <p class="no-results-hint">Try a different search term</p>
      </div>
    `;
  }
}

// ─── PRODUCT DETAIL ─────────────────
function showProductDetail(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  productDetail.innerHTML = `
    <button id="back-btn" class="back-btn">← Back to Store</button>
    <div class="detail-container">
      <img src="${product.image}" alt="${product.name}">
      <div class="detail-info">
        <h2>${product.name}</h2>
        <p class="price">$${product.price.toFixed(2)}</p>
        <p class="description">${product.description}</p>
        <button id="add-to-cart-btn" class="add-to-cart-btn">Add to Cart</button>
      </div>
    </div>
  `;
  
  productGrid.classList.add('hidden');
  productDetail.classList.remove('hidden');
  
  document.getElementById('back-btn').addEventListener('click', () => {
    productDetail.classList.add('hidden');
    productGrid.classList.remove('hidden');
  });
  
  document.getElementById('add-to-cart-btn').addEventListener('click', () => {
    addToCart(productId);
  });
}

// ─── CART FUNCTIONS ─────────────────
function addToCart(productId) {
  const existing = cart.find(item => item.productId === productId);
  
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ productId: productId, quantity: 1 });
  }
  
  saveCart();
  updateCartUI();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.productId !== productId);
  saveCart();
  updateCartUI();
}

function increaseQuantity(productId) {
  const item = cart.find(item => item.productId === productId);
  if (item) {
    item.quantity += 1;
    saveCart();
    updateCartUI();
  }
}

function decreaseQuantity(productId) {
  const item = cart.find(item => item.productId === productId);
  if (item) {
    item.quantity -= 1;
    if (item.quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    saveCart();
    updateCartUI();
  }
}

function getCartTotal() {
  return cart.reduce((total, item) => {
    const product = products.find(p => p.id === item.productId);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}

function getCartItemCount() {
  return cart.reduce((count, item) => count + item.quantity, 0);
}

// ─── UPDATE CART UI ─────────────────
function updateCartUI() {
  const count = getCartItemCount();
  cartCount.textContent = count;
  cartTotalPrice.textContent = `$${getCartTotal().toFixed(2)}`;
  
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
  } else {
    cartItems.innerHTML = cart.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return '';
      
      return `
        <div class="cart-item">
          <img src="${product.image}" alt="${product.name}">
          <div class="cart-item-info">
            <h4>${product.name}</h4>
            <div class="cart-item-quantity">
              <button class="qty-btn minus" data-product-id="${product.id}">−</button>
              <span class="qty-value">${item.quantity}</span>
              <button class="qty-btn plus" data-product-id="${product.id}">+</button>
            </div>
            <span class="cart-item-price">
              $${(product.price * item.quantity).toFixed(2)}
            </span>
          </div>
          <button class="cart-item-remove" data-product-id="${product.id}">×</button>
        </div>
      `;
    }).join('');
    
    // Remove button listeners
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const productId = parseInt(btn.dataset.productId);
        removeFromCart(productId);
      });
    });
    
    // Quantity button listeners
    document.querySelectorAll('.qty-btn.plus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const productId = parseInt(btn.dataset.productId);
        increaseQuantity(productId);
      });
    });
    
    document.querySelectorAll('.qty-btn.minus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const productId = parseInt(btn.dataset.productId);
        decreaseQuantity(productId);
      });
    });
  }
}

// ─── CART TOGGLE ─────────────────
function openCart() {
  cartSidebar.classList.remove('hidden');
  cartOverlay.classList.remove('hidden');
  updateCartUI();
}

function closeCart() {
  cartSidebar.classList.add('hidden');
  cartOverlay.classList.add('hidden');
}

// ─── CHECKOUT ─────────────────
function openCheckout() {
  if (cart.length === 0) return;
  closeCart();
  
  checkoutItems.innerHTML = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return '';
    return `
      <div class="checkout-item">
        <span>
          <span class="checkout-item-name">${product.name}</span>
          <span class="checkout-item-qty">× ${item.quantity}</span>
        </span>
        <span class="checkout-item-price">$${(product.price * item.quantity).toFixed(2)}</span>
      </div>
    `;
  }).join('');
  
  checkoutTotal.textContent = `$${getCartTotal().toFixed(2)}`;
  checkoutOverlay.classList.remove('hidden');
  checkoutModal.classList.remove('hidden');
}

function closeCheckout() {
  checkoutOverlay.classList.add('hidden');
  checkoutModal.classList.add('hidden');
  checkoutForm.reset();
}

function placeOrder(customerData) {
  const orderNumber = Math.floor(100000 + Math.random() * 900000);
  orderNumberSpan.textContent = orderNumber;
  
  console.log('Order placed:', {
    orderNumber,
    customer: customerData,
    items: cart,
    total: getCartTotal()
  });
  
  closeCheckout();
  successOverlay.classList.remove('hidden');
  successModal.classList.remove('hidden');
  
  cart = [];
  saveCart();
  updateCartUI();
  
  productDetail.classList.add('hidden');
  productGrid.classList.remove('hidden');
  renderProducts();
}

// ─── EVENT LISTENERS ─────────────────
cartToggle.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

checkoutBtn.addEventListener('click', openCheckout);
checkoutClose.addEventListener('click', closeCheckout);
checkoutOverlay.addEventListener('click', closeCheckout);

checkoutForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const customerData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    address: document.getElementById('address').value,
    city: document.getElementById('city').value,
    zip: document.getElementById('zip').value
  };
  placeOrder(customerData);
});

successClose.addEventListener('click', () => {
  successOverlay.classList.add('hidden');
  successModal.classList.add('hidden');
});

searchInput.addEventListener('input', (e) => {
  handleSearch(e.target.value);
});

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    const category = link.dataset.category;
    productDetail.classList.add('hidden');
    productGrid.classList.remove('hidden');
    renderProducts(category);
    searchInput.value = ''; // Clear search when changing category
  });
});

// ─── INITIAL RENDER ─────────────────
renderProducts();
updateCartUI();