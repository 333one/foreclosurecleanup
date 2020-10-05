"use strict";

var password__toggle = document.getElementsByClassName('password__toggle');

for (var i = 0; i < password__toggle.length; i++) {
    password__toggle[i].style.display = 'block';
}

document.getElementById('password__eye').addEventListener('click', function(e) {
    if (document.getElementById('password__eye').getAttribute('src') === "images/eye-slash-solid.svg") {
        document.getElementById('password__eye').setAttribute('src', 'images/eye-regular.svg');
        document.getElementById('password').setAttribute('type', 'text');
        if (document.getElementById('password__eyeConfirm')) {
            document.getElementById('password__eyeConfirm').setAttribute('src', 'images/eye-regular.svg');
            document.getElementById('passwordConfirm').setAttribute('type', 'text');
        }        
        if (document.getElementById('password__eyeCurrent')) {
            document.getElementById('password__eyeCurrent').setAttribute('src', 'images/eye-regular.svg');
            document.getElementById('passwordCurrent').setAttribute('type', 'text');
        }
    } else {
        document.getElementById('password__eye').setAttribute('src', 'images/eye-slash-solid.svg');
        document.getElementById('password').setAttribute('type', 'password');
        if (document.getElementById('password__eyeConfirm')) {
            document.getElementById('password__eyeConfirm').setAttribute('src', 'images/eye-slash-solid.svg');
            document.getElementById('passwordConfirm').setAttribute('type', 'password');
        } 
        if (document.getElementById('password__eyeCurrent')) {
            document.getElementById('password__eyeCurrent').setAttribute('src', 'images/eye-slash-solid.svg');
            document.getElementById('passwordCurrent').setAttribute('type', 'password');
        }
    }
});

if (document.getElementById('password__eyeConfirm')) {
    document.getElementById('password__eyeConfirm').addEventListener('click', function(e) {
        if (document.getElementById('password__eyeConfirm').getAttribute('src') === "images/eye-slash-solid.svg") {
            document.getElementById('password__eyeConfirm').setAttribute('src', 'images/eye-regular.svg');
            document.getElementById('password__eye').setAttribute('src', 'images/eye-regular.svg');
            document.getElementById('passwordConfirm').setAttribute('type', 'text');
            document.getElementById('password').setAttribute('type', 'text');
            if (document.getElementById('password__eyeCurrent')) {
                document.getElementById('password__eyeCurrent').setAttribute('src', 'images/eye-regular.svg');
                document.getElementById('passwordCurrent').setAttribute('type', 'text');
            }
        } else {
            document.getElementById('password__eyeConfirm').setAttribute('src', 'images/eye-slash-solid.svg');
            document.getElementById('password__eye').setAttribute('src', 'images/eye-slash-solid.svg');
            document.getElementById('passwordConfirm').setAttribute('type', 'password');
            document.getElementById('password').setAttribute('type', 'password');
            if (document.getElementById('password__eyeCurrent')) {
                document.getElementById('password__eyeCurrent').setAttribute('src', 'images/eye-slash-solid.svg');
                document.getElementById('passwordCurrent').setAttribute('type', 'password');
            }
        }
    });
}

if (document.getElementById('password__eyeCurrent')) {
    document.getElementById('password__eyeCurrent').addEventListener('click', function(e) {
        if (document.getElementById('password__eyeCurrent').getAttribute('src') === "images/eye-slash-solid.svg") {
            document.getElementById('password__eyeCurrent').setAttribute('src', 'images/eye-regular.svg');
            document.getElementById('password__eye').setAttribute('src', 'images/eye-regular.svg');
            document.getElementById('passwordCurrent').setAttribute('type', 'text');
            document.getElementById('password').setAttribute('type', 'text');
            if (document.getElementById('password__eyeConfirm')) {
                document.getElementById('password__eyeConfirm').setAttribute('src', 'images/eye-regular.svg');
                document.getElementById('passwordConfirm').setAttribute('type', 'text');
            }
        } else {
            document.getElementById('password__eyeCurrent').setAttribute('src', 'images/eye-slash-solid.svg');
            document.getElementById('password__eye').setAttribute('src', 'images/eye-slash-solid.svg');
            document.getElementById('passwordCurrent').setAttribute('type', 'password');
            document.getElementById('password').setAttribute('type', 'password');
            if (document.getElementById('password__eyeConfirm')) {
                document.getElementById('password__eyeConfirm').setAttribute('src', 'images/eye-slash-solid.svg');
                document.getElementById('passwordConfirm').setAttribute('type', 'password');
            }
        }
    });
}