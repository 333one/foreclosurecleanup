"use strict";

// errors

let eventArray = ['keyup', 'paste', 'focus', 'blur'];

eventArray.forEach(function(event) {

    document.getElementById('changedPassword').addEventListener(event, function() {
        primaryPerspectiveRemoveError('changedPassword', 'confirmationPassword');
    }); 

});

eventArray.forEach(function(event) {

    document.getElementById('confirmationPassword').addEventListener(event, function() {
        secondaryPerspectiveRemoveError('changedPassword', 'confirmationPassword');
    }); 

});

// match

addEventListener('load', function() {
    matchIt('changedPassword', 'confirmationPassword');
}); 

eventArray.forEach(function(event) {

    document.getElementById('changedPassword').addEventListener(event, function() {
        matchIt('changedPassword', 'confirmationPassword');
    }); 

});

eventArray.forEach(function(event) {

    document.getElementById('confirmationPassword').addEventListener(event, function() {
        matchIt('changedPassword', 'confirmationPassword');
    }); 

});

// meter

addEventListener('load', function() {
    passwordMeter('changedPassword');
});

eventArray.forEach(function(event) {

    document.getElementById('changedPassword').addEventListener(event, function() {
        passwordMeter('changedPassword');
    });

});