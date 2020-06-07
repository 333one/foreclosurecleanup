"use strict"

document.getElementById('narrowScreen__button').style.backgroundColor = 'var(--grey192)';
document.getElementById('narrowScreen__button').disabled = true;
document.getElementById('narrowScreen__button').style.cursor = 'default';

addEventListener('load', checkForSuccess);

document.getElementById('email').addEventListener('keyup', checkForSuccess); 
document.getElementById('password').addEventListener('keyup', checkForSuccess);
document.getElementById('passwordConfirm').addEventListener('keyup', checkForSuccess);

function checkForSuccess() {

    if(
        document.getElementById('email').value &&
        document.getElementById('targetEmailErrorMessage') !== undefined &&
        document.getElementById('password').value &&
        document.getElementById('targetPasswordErrorMessage') !== undefined &&
        document.getElementById('password').value === document.getElementById('passwordConfirm').value
    ) {
        document.getElementById('narrowScreen__button').style.backgroundColor = 'var(--grey32)';
        document.getElementById('narrowScreen__button').disabled = false;
        document.getElementById('narrowScreen__button').style.cursor = 'pointer';
    }

    else {
        document.getElementById('narrowScreen__button').style.backgroundColor = 'var(--grey224)';
        document.getElementById('narrowScreen__button').disabled = true;
        document.getElementById('narrowScreen__button').style.cursor = 'default';
    }

}