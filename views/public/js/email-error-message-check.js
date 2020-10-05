"use strict"

document.getElementById('email').addEventListener('keyup', removeErrorMessage);

function removeErrorMessage() {
    if (
        document.getElementById('email').value.length > 4 &&
        document.getElementById('email').value.includes('@') &&
        document.getElementById('email').value.includes('.')
    ) {
        document.getElementById('targetEmailLabel').classList.remove('-errorColor'); 
        document.getElementById('email').classList.remove('-errorBorder'); 
        document.getElementById('targetEmailErrorMessage').innerHTML = '';
        document.getElementById('email').removeEventListener('keyup', removeErrorMessage);
    }
}