//STATE
let cart=[];

//PERSISTENCE
function saveCart(){
    localStorage.setItem('minimal-store-cart', JSON.stringify(cart));
}
function loadCart(){
    const stored=localStorage.getItem('minimal-store-cart');
    if(stored){
        cart=JSON.parse(stored);
    }else{
        cart=[];
    }
}
loadCart();

const productGrid=document.getElementById('product-grid');
const productDetail = document.getElementById('product-detail');
const cartToggle = document.getElementById('cart-toggle');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartClose = document.getElementById('cart-close');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotalPrice = document.getElementById('cart-total-price');
const navLinks = document.querySelectorAll('.nav-link');

function renderProducts(category='all'){
    const filtered=category==='all' ? products : products.filter(p=>p.category===category);
    productGrid.innerHTML='';
    filtered.forEach(product=>{
        const card=document.createElement('div');
        card.classNAme='product-card';
        card.innerHTML= `
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <div class="product-card-body">
        <span class="category-tag">${product.category}</span>
        <h3>${product.name}</h3>
        <p class="price">$${product.price.toFixed(2)}</p>
      </div>
    `;
    
    // Clicking a card opens the detail view
    card.addEventListener('click', () => {
      showProductDetail(product.id);
    });
     productGrid.appendChild(card);
  });
}

//PRODUCT DETAIL
function showProductDetail(productId){
    const product=products.find(p=>p.id===productId);
    if (!product) return;

    productDetail.innerHTML=`
    <button id="back-btn" class="back-btn"><- Back to Store</button>
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

    //hide product grid and show detail
    productGrid.classList.add('hidden');
    productDetail.classList.remove('hidden');

    // Back button
    document.getElementById('back-btn').addEventListener('click', () => {
        prodectDetail.classList.add('hidden');
        productGrid.classList.remove('hidden');
    });

    // Add to cart button
    document.getElementById('add-to-cart-btn').addEventListener('click', () => {
        addToCart(product.id);
        alert('Added to cart!');
    });
}

//CART
function addToCart(productId){
    const existing=cart.find(item=>item.productId===productId);
    if(existing){
        existing.quantity++;
    }else{
        cart.push({productId, quantity:1});
    }
    saveCart();
    updateCArtUI();
}
function removeFromCart(productId){
    cart=cart.filter(item=>item.productId!==productId);
    saveCart();
    updateCartUI();
}
function getcartTotal(){
    return cart.reduce((total, item) => {
        const product = products.find(p => p.id === item.productId);
        return total + (product ? product.price * item.quantity : 0);
    }, 0);

}
function getCartItemCount(){
    return cart.reduce((count,item)=>count+item.quantity,0);
}
function updateCartUI(){
    const count=getCartItemCount();
    cartCount.textContent=count;
    cartTotalPrice.textContent=`$${getcartTotal().toFixed(2)}`;
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    } else {
        cartItems.innerHTML=cart.map(items=>{
            const product=products.find(p=>p.id===items.productId);
            if (!product) return '';
            return `
            <div class="cart-item">
                <img src="${product.image}" alt="${product.name}">
                <div class="cart-item-info">
                    <h4>${product.name}</h4>
                    <span class="cart-item-price">
                    $${product.price.toFixed(2)}*${items.quantity}
                    </span>
                </div>
                <button class="cart-item-remove" data-product-id="${product.id}">x</button>

            </div>
            `;
        }).join('');
        // Add event listeners for remove buttons
        document.querySelectorAll('.cart-item-remove').forEach(button => {
            btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent cart from closing
        const productId = parseInt(btn.dataset.productId);
        removeFromCart(productId);
      });
    });
  }
}

function openCart(){
    cartSidebar.classList.remove('hidden');
    cartOverlay.classList.remove('hidden');
    updateCartUI();
}
function closeCart(){
    cartSidebar.classList.add('hidden');
    cartOverlay.classList.add('hidden');
}
cartToggle.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

//CATEGORY FILTER
navLinks.forEach(link=>{
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        const category=link.dataset.category;
        productDetail.classList.add('hidden');
        productGrid.classList.remove('hidden');
        renderProducts(category);
    });
});

renderProducts();
updateCartUI();
