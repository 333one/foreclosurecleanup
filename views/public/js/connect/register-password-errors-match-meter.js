'use strict';

// errors

let eventArray = ['input'];

eventArray.forEach(function(event) {

    document.getElementById('newPassword').addEventListener(event, function() {
        primaryPerspectiveRemoveError('newPassword', 'confirmationPassword');
    }); 

});

eventArray.forEach(function(event) {

    document.getElementById('confirmationPassword').addEventListener(event, function() {
        secondaryPerspectiveRemoveError('newPassword', 'confirmationPassword');
    }); 

});

document.getElementById('privacyPolicyTermsOfService').addEventListener('change', function() {

    if (document.getElementById('privacyPolicyTermsOfService').checked && document.getElementById('targetPrivacyPolicyTermsOfServiceError')) {
        removeError('privacyPolicyTermsOfService');
    }

}); 

// match

addEventListener('load', function() {
    matchIt('newPassword', 'confirmationPassword');
}); 

eventArray.forEach(function(event) {

    document.getElementById('newPassword').addEventListener(event, function() {
        matchIt('newPassword', 'confirmationPassword');
    }); 

});

eventArray.forEach(function(event) {

    document.getElementById('confirmationPassword').addEventListener(event, function() {
        matchIt('newPassword', 'confirmationPassword');
    }); 

});

// meter

addEventListener('load', function() {
    passwordMeter('newPassword');
});

eventArray.forEach(function(event) {

    document.getElementById('newPassword').addEventListener(event, function() {
        passwordMeter('newPassword');
    }); 

});