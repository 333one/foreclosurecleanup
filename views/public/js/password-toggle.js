"use strict";

let password__toggle = document.getElementsByClassName('password__toggle');

// Display the toggles if Js is active.
for (let i = 0; i < password__toggle.length; i++) {
    password__toggle[i].style.display = 'block';
}

function setUpToggles(coreID, secondID, thirdID) {

    document.getElementById(`${ coreID }Eye`).addEventListener('click', function(event) {

        if (document.getElementById(`${ coreID }Eye`).getAttribute('src') === "images/eye-slash-solid.svg") {

            setToRegularEye(coreID);

            if (document.getElementById(`${ secondID }Eye`)) {
                setToRegularEye(secondID);
            }

            if (document.getElementById(`${ thirdID }Eye`)) {
                setToRegularEye(thirdID);
            }

        } else {

            setToSlashEye(coreID);

            if (document.getElementById(`${ secondID }Eye`)) {
                setToSlashEye(secondID);
            }

            if (document.getElementById(`${ thirdID }Eye`)) {
                setToSlashEye(thirdID);
            }

        }
    
    });

}

function setToRegularEye(elementID) {

    document.getElementById(`${ elementID }Eye`).setAttribute('src', 'images/eye-regular.svg');
    document.getElementById(elementID).setAttribute('type', 'text');

}

function setToSlashEye(elementID) {

    document.getElementById(`${ elementID }Eye`).setAttribute('src', 'images/eye-slash-solid.svg');
    document.getElementById(elementID).setAttribute('type', 'password');

}