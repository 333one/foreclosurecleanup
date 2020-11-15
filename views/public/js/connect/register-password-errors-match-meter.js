"use strict"

// errors

let eventArray = ['keyup', 'paste', 'focus', 'blur'];

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

document.getElementById('termsOfUse').addEventListener('change', function() {

    if (document.getElementById('termsOfUse').checked && document.getElementById('targetTermsOfUseError')) {
        removeError('termsOfUse');
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