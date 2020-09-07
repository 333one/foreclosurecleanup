"use strict"

document.getElementById('narrowScreen__button').style.backgroundColor = 'var(--grey192)';
document.getElementById('narrowScreen__button').disabled = true;
document.getElementById('narrowScreen__button').style.cursor = 'default';

if(document.getElementById('email')) document.getElementById('email').addEventListener('keyup', checkForSuccess);
if(document.getElementById('password')) document.getElementById('password').addEventListener('keyup', checkForSuccess);
if(document.getElementById('passwordConfirm')) document.getElementById('passwordConfirm').addEventListener('keyup', checkForSuccess);
if(document.getElementById('termsOfUse')) document.getElementById('termsOfUse').addEventListener('change', checkForSuccess);

function checkForSuccess() {

    if(
        emailCheck() === 'passed' &&
        passwordCheck() === 'passed' &&
        passwordConfirmCheck() === 'passed' && 
        termsOfUseCheck() === 'passed'
    ) {

        document.getElementById('narrowScreen__button').style.backgroundColor = 'var(--grey32)';
        document.getElementById('narrowScreen__button').disabled = false;
        document.getElementById('narrowScreen__button').style.cursor = 'pointer';

        if(document.getElementById('email')) {
            document.getElementById('targetEmailLabel').classList.remove('-errorColor');
            document.getElementById('email').classList.remove('-errorBorder');
            if (document.getElementById('targetEmailErrorMessage')) document.getElementById('targetEmailErrorMessage').innerHTML = '';
        }

        if(document.getElementById('password')) {
            document.getElementById('targetPasswordLabel').classList.remove('-errorColor');
            document.getElementById('targetPasswordContainer').classList.remove('-errorBorder');
            if (document.getElementById('targetPasswordErrorMessage')) document.getElementById('targetPasswordErrorMessage').innerHTML = '';
        }

        if(document.getElementById('passwordConfirm')) {
            document.getElementById('targetPasswordConfirmLabel').classList.remove('-errorColor');
            document.getElementById('targetPasswordConfirmContainer').classList.remove('-errorBorder');
            if (document.getElementById('targetPasswordConfirmErrorMessage')) document.getElementById('targetPasswordConfirmErrorMessage').innerHTML = '';
        }

        if(document.getElementById('termsOfUse')) {
            document.getElementById('termsOfUseUnit').classList.remove('-errorBorderCheckbox');
            if (document.getElementById('targetTermsOfUseErrorMessage')) document.getElementById('targetTermsOfUseErrorMessage').innerHTML = '';
        }
    } else {

        document.getElementById('narrowScreen__button').style.backgroundColor = 'var(--grey192)';
        document.getElementById('narrowScreen__button').disabled = true;
        document.getElementById('narrowScreen__button').style.cursor = 'default';

    }
}

function emailCheck() {

    if(!document.getElementById('email')) return 'passed';

    if(
        document.getElementById('email').value.length > 4 &&
        document.getElementById('email').value.includes('@') &&
        document.getElementById('email').value.includes('.') ||
        document.getElementById('email') === null
    ) {
        return 'passed';
    }
    
    return 'failed';
}

function passwordCheck() {

    if(!document.getElementById('password')) return 'passed';

    if(document.getElementById('password')) {
        if(document.getElementById('password').value) {
            return 'passed';
        }
    }   

    return 'failed';
}

function passwordConfirmCheck() {

    if(!document.getElementById('passwordConfirm')) return 'passed';

    if(document.getElementById('passwordConfirm')) {
        if(document.getElementById('password').value === document.getElementById('passwordConfirm').value) {
            return 'passed';
        }
    }   

    return 'failed';
}

function termsOfUseCheck() {

    if(!document.getElementById('termsOfUse')) return 'passed';

    if(document.getElementById('passwordConfirm')) {
        if(document.getElementById('termsOfUse').checked) {
            return 'passed';
        }
    }   

    return 'failed';
}