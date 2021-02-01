let stripePublicKey = 'pk_test_51HEOocGrZ0PJhhAlNhkIzlORHG9nInW3q3eo9gxbQh83Wf3WLs81W6Suv8fhkZHqygdaJOZuMNgncaNZ4oO313Xd00jiTHDN8e';
let stripe = Stripe(stripePublicKey);

let checkoutButton = document.getElementById('checkout-button');
checkoutButton.addEventListener('click', checkoutSequence);

function checkoutSequence() {

    fetch('/create-checkout-session', {
        method: 'POST',
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(session) {
        console.log(session);
        return stripe.redirectToCheckout({ sessionId: session.id });
    })
    .then(function(result) {
        if (result.error) {
            alert(result.error.message);
        }
    })
    .catch(function(error) {
        console.error('Error:', error);
    });
}