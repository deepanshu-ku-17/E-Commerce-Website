document.addEventListener('DOMContentLoaded', function() {
    updatePriceSummary();
    const paymentMethods = document.querySelectorAll('.payment-method');
    const applyGiftCardBtn = document.getElementById('apply-gift-card');


    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            const methodName = this.textContent.split('Offers')[0].trim();
            console.log("Payment method clicked:", methodName);
            paymentMethods.forEach(m => m.classList.remove('active'));
            this.classList.add('active');
            showPaymentForm(methodName);
        });
    });

    if (applyGiftCardBtn) {
        applyGiftCardBtn.addEventListener('click', function() {
            alert('Gift card application feature coming soon!');
        });
    }

    document.getElementById('continueToHome').addEventListener('click', redirectToHome);

    // Hide the confirmation modal initially
    const confirmationModal = document.getElementById('orderConfirmation');
    if (confirmationModal) {
        confirmationModal.style.display = 'none';
    }
});

function updatePriceSummary() {
    const cartDetails = JSON.parse(localStorage.getItem('cartDetails'));
    if (!cartDetails) {
        console.error('Cart details not found in localStorage');
        return;
    }

    document.getElementById('total-mrp').textContent = `₹${cartDetails.cartTotal.toFixed(2)}`;
    document.getElementById('discount-mrp').textContent = `-₹${cartDetails.discount.toFixed(2)}`;
    document.getElementById('platform-fee').textContent = `₹${cartDetails.platformFee.toFixed(2)}`;
    document.getElementById('total-amount').textContent = `₹${cartDetails.totalAmount.toFixed(2)}`;

    console.log('Updated price summary with:', cartDetails);
}




function showPaymentForm(paymentType) {
    document.querySelectorAll('.payment-form').forEach(form => form.style.display = 'none');
    
    const formId = paymentType.toLowerCase().replace(/\s+/g, '-') + '-form';
    const form = document.getElementById(formId);
    if (form) {
        form.style.display = 'block';
    } else {
        alert("Payment form for " + paymentType + " is coming soon!");
    }
}

function confirmPayment(method) {
    const confirmationModal = document.getElementById('orderConfirmation');
    if (confirmationModal) {
        confirmationModal.style.display = 'flex';
    } else {
        alert(`Order placed successfully using ${method}! Redirecting to home page...`);
        setTimeout(redirectToHome, 2000);
    }
    
    localStorage.removeItem('cart');
    localStorage.removeItem('cartTotal');
}

function redirectToHome() {
    window.location.href = 'index.html';
}

window.onclick = function(event) {
    const modal = document.getElementById('orderConfirmation');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Add event listeners for payment confirmation buttons
document.getElementById('confirm-cash')?.addEventListener('click', () => confirmPayment('Cash On Delivery'));
document.getElementById('confirm-upi')?.addEventListener('click', () => confirmPayment('UPI'));
document.getElementById('confirm-card')?.addEventListener('click', () => confirmPayment('Credit/Debit Card'));
