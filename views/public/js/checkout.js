var stripe = Stripe(stripePublicKey);

var checkoutButton = document.getElementById('checkout-button');

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