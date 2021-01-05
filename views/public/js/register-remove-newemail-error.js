'use strict'

document.getElementById('newEmail').addEventListener('keyup', function(){

    // Inside register-activate-form-button.js
    let isEmailValid = getIsEmailValid('newEmail');

    if (isEmailValid === true) {

        if(document.getElementById('targetNewEmailError')) {
            removeNewEmailError('newEmail');
        }
        
    }

});

function removeNewEmailError(elementId) {

    let uppercaseFirstLetter = elementId.charAt(0).toUpperCase() + elementId.slice(1);

    document.getElementById(elementId).classList.remove('-errorBorder');

    if (document.getElementById(`target${ uppercaseFirstLetter }Error`)) {
        document.getElementById(`target${ uppercaseFirstLetter }Error`).innerText = '';
    }

}