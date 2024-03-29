let stripePublicKey = 'pk_live_51HEOocGrZ0PJhhAlFPkh7ttIBO96cj6xCrhoroZIt7wgoxnqzcUCG7t8q4SckUSLkOyVbAp3zl5pQt5WZT0PRCzt00C4szHycL';
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