"use strict"

document.getElementById('narrowScreen__button').style.backgroundColor = 'var(--grey192)';
document.getElementById('narrowScreen__button').disabled = true;
document.getElementById('narrowScreen__button').style.cursor = 'default';

addEventListener('load', checkForSuccess);

if(document.getElementById('email')) document.getElementById('email').addEventListener('keyup', checkForEmailSuccess);


if(document.getElementById('password')) document.getElementById('password').addEventListener('keyup', checkForSuccess);
if(document.getElementById('passwordConfirm')) document.getElementById('passwordConfirm').addEventListener('keyup', checkForSuccess);
if(document.getElementById('termsOfUse')) document.getElementById('termsOfUse').addEventListener('change', checkForSuccess); 

function checkForEmailSuccess() {

    if(
        document.getElementById('email').value.length > 4 &&
        document.getElementById('email').value.includes('@') &&
        document.getElementById('email').value.includes('.')
    ) {
        document.getElementById('targetEmailLabel').classList.remove('-errorColor');
        document.getElementById('targetEmailBorder').classList.remove('-errorBorder');
        document.getElementById('targetEmailErrorMessage').innerHTML = '';
    }
}

// function checkForSuccess() {

//     if(
//         document.getElementById('email').value.length > 4 &&
//         document.getElementById('email').value.includes('@') &&
//         document.getElementById('email').value.includes('.') &&
//         document.getElementById('targetEmailErrorMessage') !== undefined &&
//         document.getElementById('password').value &&
//         document.getElementById('targetPasswordErrorMessage') !== undefined &&
//         document.getElementById('password').value === document.getElementById('passwordConfirm').value && 
//         document.getElementById('termsOfUse').checked
//     ) {
//         document.getElementById('narrowScreen__button').style.backgroundColor = 'var(--grey32)';
//         document.getElementById('narrowScreen__button').disabled = false;
//         document.getElementById('narrowScreen__button').style.cursor = 'pointer';
//     }

//     else {
//         document.getElementById('narrowScreen__button').style.backgroundColor = 'var(--grey224)';
//         document.getElementById('narrowScreen__button').disabled = true;
//         document.getElementById('narrowScreen__button').style.cursor = 'default';
//     }

// }