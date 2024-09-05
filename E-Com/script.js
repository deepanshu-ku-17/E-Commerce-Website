// Global variables
let displayedProducts = [];
let cart = [];
let wishlist = [];
let addresses = [];

let userProfile = {
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "+1 234 567 8900",
    address: "123 Fashion St, Style City, 12345"
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    const paymentMethods = document.querySelectorAll('.payment-method');
    const applyGiftCardBtn = document.getElementById('apply-gift-card');

    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            // Remove active class from all methods
            paymentMethods.forEach(m => m.classList.remove('active'));
            // Add active class to clicked method
            this.classList.add('active');
            
            const paymentType = this.dataset.method;
            console.log(`Selected payment method: ${paymentType}`);
            // Here you would typically show different payment forms based on the selected method
        });
    });
    
    loadUserProfile();
    displayedProducts = [...products];
    renderProducts();
    loadCart();
    updateCartCount();
    loadWishlist();

    setupEventListeners();

    if (window.location.pathname.includes('cart.html')) {
        loadCartItems();
    }

    if (window.location.pathname.includes('wishlist.html')) {
        loadWishlistItems();
    }

    if (window.location.pathname.includes('profile.html')) {
        loadProfileInfo();
        setupProfileEditing();
    }

    if (window.location.pathname.includes('address.html')) {
        console.log('Address page detected, setting up listeners');
        loadAddressPage();
        setupAddressPageListeners();
    }
});

function setupEventListeners() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const placeOrderBtn = document.getElementById('place-order');

    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performSearch();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
    }

    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', checkout);
    }
}

function setupAddressPageListeners() {
    const addNewAddressBtn = document.getElementById('add-new-address');
    const continueToPaymentBtn = document.getElementById('continue-to-payment');
    const modal = document.getElementById('address-modal');
    const closeBtn = modal ? modal.querySelector('.close') : null;
    const newAddressForm = document.getElementById('new-address-form');
    const addressTypeBtns = document.querySelectorAll('.address-type-btn');
    const addressList = document.getElementById('address-list');

    if (addressList) {
        addressList.addEventListener('click', function(e) {
            if (e.target.classList.contains('edit-address')) {
                const addressId = e.target.dataset.id;
                editAddress(addressId);
            } else if (e.target.classList.contains('remove-address')) {
                const addressId = e.target.dataset.id;
                removeAddress(addressId);
            }
        });
    }

    if (addNewAddressBtn) {
        addNewAddressBtn.addEventListener('click', function() {
            console.log('Add New Address button clicked');
            showAddressForm();
        });
    } else {
        console.error('Add New Address button not found');
    }

    if (continueToPaymentBtn) {
        continueToPaymentBtn.addEventListener('click', function() {
            console.log('Continue to Payment button clicked');
            proceedToPayment();
        });
    } else {
        console.error('Continue to Payment button not found');
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeAddressModal);
    }

    if (newAddressForm) {
        newAddressForm.addEventListener('submit', saveNewAddress);
    }

    addressTypeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            addressTypeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            closeAddressModal();
        }
    });
}

// Product rendering functions
function renderProducts() {
    const productsContainer = document.getElementById('product-list');
    if (productsContainer) {
        productsContainer.innerHTML = '';
        displayedProducts.forEach(product => {
            const productElement = createProductElement(product);
            productsContainer.appendChild(productElement);
        });
    }
}

function createProductElement(product) {
    const productDiv = document.createElement('div');
    productDiv.classList.add('product');
    productDiv.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">₹${product.price.toFixed(2)}</p>
            <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
            <button class="add-to-wishlist" onclick="addToWishlist(${product.id})">Add to Wishlist</button>
        </div>
    `;
    return productDiv;
}

// Cart functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCart();
        updateCartTotal();
        showNotification(`${product.name} added to cart!`);
    }
}

function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index !== -1) {
        const removedItem = cart.splice(index, 1)[0];
        updateCart();
        updateCartTotal();
        showNotification(`${removedItem.name} removed from cart`);
        if (window.location.pathname.includes('cart.html')) {
            loadCartItems();
        }
    }
}

function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

function loadCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        } else {
            cart.forEach(item => {
                const itemElement = createCartItemElement(item);
                cartItemsContainer.appendChild(itemElement);
            });
        }
        updateCartTotal();
        
        if (cartSummary) {
            const details = calculateCartDetails();
            cartSummary.innerHTML = `
                <h3>PRICE DETAILS</h3>
                <div>Total MRP: ₹${details.cartTotal.toFixed(2)}</div>
                <div>Discount on MRP: -₹${details.discount.toFixed(2)}</div>
                <div>Platform Fee: ₹${details.platformFee.toFixed(2)}</div>
                <div>Total Amount: ₹${details.totalAmount.toFixed(2)}</div>
            `;
        }
    }
}


function createCartItemElement(item) {
    const itemElement = document.createElement('div');
    itemElement.classList.add('cart-item');
    itemElement.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="item-details">
            <h3>${item.name}</h3>
            <p>Size: ${item.size || 'N/A'}</p>
            <p>Qty: ${item.quantity}</p>
            <p>₹${(item.price * item.quantity).toFixed(2)}</p>
        </div>
        <div class="item-actions">
            <button onclick="removeFromCart(${item.id})">Remove</button>
            <button onclick="moveToWishlist(${item.id})">Move to Wishlist</button>
        </div>
    `;
    return itemElement;
}

// Wishlist functions
function addToWishlist(productId) {
    const product = products.find(p => p.id === productId);
    if (product && !wishlist.some(item => item.id === productId)) {
        wishlist.push(product);
        showNotification(`${product.name} added to wishlist!`);
        saveWishlist();
        if (window.location.pathname.includes('wishlist.html')) {
            loadWishlistItems();
        }
    }
}

function removeFromWishlist(productId) {
    const index = wishlist.findIndex(item => item.id === productId);
    if (index !== -1) {
        const removedItem = wishlist.splice(index, 1)[0];
        showNotification(`${removedItem.name} removed from wishlist`);
        saveWishlist();
        loadWishlistItems();
    }
}

function moveToWishlist(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        removeFromCart(productId);
        addToWishlist(productId);
        showNotification(`${item.name} moved to wishlist`);
        loadCartItems();
    }
}

function saveWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function loadWishlist() {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
        wishlist = JSON.parse(savedWishlist);
    }
}

function loadWishlistItems() {
    const wishlistContainer = document.getElementById('wishlist-items');
    if (wishlistContainer) {
        wishlistContainer.innerHTML = '';
        if (wishlist.length === 0) {
            wishlistContainer.innerHTML = '<div class="empty-wishlist"><p>Your wishlist is empty.</p><a href="index.html#products">Continue Shopping</a></div>';
        } else {
            wishlist.forEach(item => {
                const wishlistItem = createWishlistItem(item);
                wishlistContainer.appendChild(wishlistItem);
            });
        }
    }
}

function createWishlistItem(item) {
    const itemElement = document.createElement('div');
    itemElement.classList.add('wishlist-item');
    itemElement.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="wishlist-item-image">
        <div class="wishlist-item-info">
            <div class="wishlist-item-details">
                <h3 class="wishlist-item-name">${item.name}</h3>
                <p class="wishlist-item-price">₹${item.price.toFixed(2)}</p>
            </div>
            <div class="wishlist-item-actions">
                <button class="move-to-bag" onclick="moveToCart(${item.id})">Move to Bag</button>
                <button class="remove-from-wishlist" onclick="removeFromWishlist(${item.id})">Remove</button>
            </div>
        </div>
    `;
    return itemElement;
}

function moveToCart(productId) {
    const product = wishlist.find(item => item.id === productId);
    if (product) {
        addToCart(productId);
        removeFromWishlist(productId);
        showNotification(`${product.name} moved to bag!`);
    }
}

// Address functions
function loadAddressPage() {
    if (addresses.length === 0) {
        addresses.push({
            id: Date.now(),
            name: 'John Doe',
            address: '123 Main St, Anytown, ST 12345',
            phone: '123-456-7890',
            type: 'Home'
        });
    }
    loadAddresses();
    updatePriceDetails();
    setDeliveryDate();
}

function loadAddresses() {
    const addressList = document.getElementById('address-list');
    if (addressList) {
        addressList.innerHTML = '';
        addresses.forEach(address => {
            const addressElement = createAddressElement(address);
            addressList.appendChild(addressElement);
        });
    }
}

function createAddressElement(address) {
    const addressElement = document.createElement('div');
    addressElement.classList.add('address-item');
    addressElement.innerHTML = `
        <div class="address-type">${address.type}</div>
        <h3>${address.name}</h3>
        <p>${address.address}</p>
        <p>Mobile: ${address.phone}</p>
        <div class="address-actions">
            <button class="edit-address" data-id="${address.id}">EDIT</button>
            <button class="remove-address" data-id="${address.id}">REMOVE</button>
        </div>
    `;
    return addressElement;
}

function showAddressForm() {
    console.log('showAddressForm called');
    const modal = document.getElementById('address-modal');
    if (modal) {
        modal.style.display = 'block';
    } else {
        console.error('Address modal not found');
    }
}

function closeAddressModal() {
    const modal = document.getElementById('address-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function saveNewAddress(e) {
    e.preventDefault();
    const newAddress = {
        id: Date.now(),
        name: document.getElementById('new-name').value,
        phone: document.getElementById('new-phone').value,
        pincode: document.getElementById('new-pincode').value,
        address: document.getElementById('new-address').value,
        locality: document.getElementById('new-locality').value,
        city: document.getElementById('new-city').value,
        state: document.getElementById('new-state').value,
        type: document.querySelector('.address-type-btn.active').dataset.type
    };
    
    addresses.push(newAddress);
    loadAddresses();
    closeAddressModal();
    showNotification('New address added successfully!');
}

function editAddress(addressId) {
    console.log('Editing address with ID:', addressId);
    const address = addresses.find(addr => addr.id == addressId);
    if (address) {
        document.getElementById('new-name').value = address.name;
        document.getElementById('new-phone').value = address.phone;
        document.getElementById('new-address').value = address.address;
        document.querySelectorAll('.address-type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === address.type);
        });
        showAddressForm();
        const form = document.getElementById('new-address-form');
        form.onsubmit = function(e) {
            e.preventDefault();
            updateAddress(addressId);
        };
    }
}

function updateAddress(addressId) {
    const updatedAddress = {
        id: addressId,
        name: document.getElementById('new-name').value,
        phone: document.getElementById('new-phone').value,
        address: document.getElementById('new-address').value,
        // Add more fields as necessary
    };
    
    const index = addresses.findIndex(addr => addr.id == addressId);
    if (index !== -1) {
        addresses[index] = updatedAddress;
        loadAddresses();
        closeAddressModal();
        showNotification('Address updated successfully!');
    }
}

function removeAddress(addressId) {
    console.log('Removing address with ID:', addressId);
    if (confirm('Are you sure you want to remove this address?')) {
        addresses = addresses.filter(addr => addr.id != addressId);
        loadAddresses();
        showNotification('Address removed successfully!');
    }
}

function removeAddress(addressId) {
    if (confirm('Are you sure you want to remove this address?')) {
        addresses = addresses.filter(addr => addr.id != addressId);
        loadAddresses();
        showNotification('Address removed successfully!');
    }
}

function updatePriceDetails() {
    const priceBreakdown = document.getElementById('price-breakdown');
    if (priceBreakdown) {
        let totalMRP = 0;
        let totalDiscount = 0;
        const platformFee = 20.00;
        
        cart.forEach(item => {
            totalMRP += item.price * item.quantity;
            totalDiscount += (item.price * 0.1) * item.quantity; // Assuming 10% discount
        });
        
        const totalAmount = totalMRP - totalDiscount + platformFee;
        
        priceBreakdown.innerHTML = `
            <div><span>Total MRP</span><span>₹${totalMRP.toFixed(2)}</span></div>
            <div><span>Discount on MRP</span><span>-₹${totalDiscount.toFixed(2)}</span></div>
            <div><span>Platform Fee</span><span>₹${platformFee.toFixed(2)}</span></div>
            <div><span>Shipping Fee</span><span>FREE</span></div>
            <div><strong>Total Amount</strong><strong>₹${totalAmount.toFixed(2)}</strong></div>
        `;
    }
}

function setDeliveryDate() {
    const deliveryDate = document.getElementById('delivery-date');
    if (deliveryDate) {
        const date = new Date();
        date.setDate(date.getDate() + 5); // Delivery in 5 days
        deliveryDate.textContent = date.toDateString();
    }
}

function proceedToPayment() {
    console.log('proceedToPayment called');
    if (addresses.length > 0) {
        window.location.href = 'payment.html';
    } else {
        showNotification('Please add a delivery address.', 'error');
    }
}

// Profile functions
function loadUserProfile() {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        userProfile = JSON.parse(savedProfile);
    }
}

function loadProfileInfo() {
    loadUserProfile();
    const profileInfo = document.getElementById('profile-info');
    if (profileInfo) {
        profileInfo.innerHTML = `
            <p><strong>Name:</strong> ${userProfile.name}</p>
            <p><strong>Email:</strong> ${userProfile.email}</p>
            <p><strong>Phone:</strong> ${userProfile.phone}</p>
            <p><strong>Address:</strong> ${userProfile.address}</p>
        `;
    }
}

function setupProfileEditing() {
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const editProfileForm = document.getElementById('edit-profile-form');
    const profileForm = document.getElementById('profile-form');
    const cancelEditBtn = document.getElementById('cancel-edit');

    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            console.log('Edit profile button clicked');
            editProfileForm.style.display = 'block';
            document.getElementById('name').value = userProfile.name;
            document.getElementById('email').value = userProfile.email;
            document.getElementById('phone').value = userProfile.phone;
            document.getElementById('address').value = userProfile.address;
        });
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', function() {
            editProfileForm.style.display = 'none';
        });
    }

    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            userProfile.name = document.getElementById('name').value;
            userProfile.email = document.getElementById('email').value;
            userProfile.phone = document.getElementById('phone').value;
            userProfile.address = document.getElementById('address').value;
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
            loadProfileInfo();
            editProfileForm.style.display = 'none';
            showNotification('Profile updated successfully!');
        });
    }
}

// Search function
function performSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    console.log('Searching for:', searchTerm);
    displayedProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );
    console.log('Filtered products:', displayedProducts);
    renderProducts();
}

// Utility functions
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

function loadRecommendedProducts() {
    const recommendedContainer = document.querySelector('.recommendations');
    if (recommendedContainer) {
        const recommendedItems = products
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);

        const recommendedHTML = `
            <h2>You may also like:</h2>
            <div class="recommended-products">
                ${recommendedItems.map(item => `
                    <div class="recommended-product">
                        <img src="${item.image}" alt="${item.name}">
                        <h4>${item.name}</h4>
                        <p>₹${item.price.toFixed(2)}</p>
                        <button onclick="addToCart(${item.id})">Add to Cart</button>
                    </div>
                `).join('')}
            </div>
        `;

        recommendedContainer.innerHTML = recommendedHTML;
    }
}

function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty');
    } else {
        window.location.href = 'address.html';
    }
}

function calculateCartDetails() {
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = Math.round(cartTotal * 0.65); // 65% discount
    const platformFee = 20;
    const totalAmount = cartTotal - discount + platformFee;

    return {
        cartTotal,
        discount,
        platformFee,
        totalAmount
    };
}


function updateCartTotal() {
    const details = calculateCartDetails();
    localStorage.setItem('cartDetails', JSON.stringify(details));
    console.log('Saved Cart Details:', details);

    const totalElement = document.getElementById('cart-total');
    if (totalElement) {
        totalElement.textContent = `Total: ₹${details.totalAmount.toFixed(2)}`;
    }

    // Update cart summary if it exists
    const cartSummary = document.getElementById('cart-summary');
    if (cartSummary) {
        cartSummary.innerHTML = `
            <h3>PRICE DETAILS</h3>
            <div>Total MRP: ₹${details.cartTotal.toFixed(2)}</div>
            <div>Discount on MRP: -₹${details.discount.toFixed(2)}</div>
            <div>Platform Fee: ₹${details.platformFee.toFixed(2)}</div>
            <div>Total Amount: ₹${details.totalAmount.toFixed(2)}</div>
        `;
    }
}
