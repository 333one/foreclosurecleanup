"use strict"

// errors

document.getElementById('newPassword').addEventListener('keyup', function() {
    primaryPerspectiveRemoveError('newPassword', 'confirmationPassword');
}); 

document.getElementById('confirmationPassword').addEventListener('keyup', function() {
    secondaryPerspectiveRemoveError('newPassword', 'confirmationPassword');
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

document.getElementById('newPassword').addEventListener('keyup', function() {
    matchIt('newPassword', 'confirmationPassword');
}); 

document.getElementById('confirmationPassword').addEventListener('keyup', function() {
    matchIt('newPassword', 'confirmationPassword');
}); 

// meter

addEventListener('load', function() {
    passwordMeter('newPassword');
});

document.getElementById('newPassword').addEventListener('keyup', function(){
    passwordMeter('newPassword');
}); 