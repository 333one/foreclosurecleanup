"use strict";

// errors

document.getElementById('changedPassword').addEventListener('keyup', function() {
    primaryPerspectiveRemoveError('changedPassword', 'confirmationPassword');
}); 

document.getElementById('confirmationPassword').addEventListener('keyup', function() {
    secondaryPerspectiveRemoveError('changedPassword', 'confirmationPassword');
}); 

// match

addEventListener('load', function() {
    matchIt('changedPassword', 'confirmationPassword');
}); 

document.getElementById('changedPassword').addEventListener('keyup', function() {
    matchIt('changedPassword', 'confirmationPassword');
}); 

document.getElementById('confirmationPassword').addEventListener('keyup', function() {
    matchIt('changedPassword', 'confirmationPassword');
}); 

// meter

addEventListener('load', function() {
    passwordMeter('changedPassword');
});

document.getElementById('changedPassword').addEventListener('keyup', function(){
    passwordMeter('changedPassword');
}); 