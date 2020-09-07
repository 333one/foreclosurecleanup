var stripe = Stripe(stripePublicKey);

var underlinedCheckoutButton = document.getElementById('underlinedCheckoutButton');
var fadedCheckoutButtons = document.querySelectorAll('dashboard__unitCoveredLink');

underlinedCheckoutButton.addEventListener('click', checkoutSequence);
fadedCheckoutButtons.forEach( function(element) {
    element.addEventListener('click', checkoutSequence);
});

function checkoutSequence() {

    fetch('/create-checkout-session', {
        method: 'POST',
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(session) {
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

// checkoutButton.addEventListener('click', function() {

//     fetch('/create-checkout-session', {
//         method: 'POST',
//     })
//     .then(function(response) {
//         return response.json();
//     })
//     .then(function(session) {
//         return stripe.redirectToCheckout({ sessionId: session.id });
//     })
//     .then(function(result) {
//         if (result.error) {
//             alert(result.error.message);
//         }
//     })
//     .catch(function(error) {
//         console.error('Error:', error);
//     });
// });