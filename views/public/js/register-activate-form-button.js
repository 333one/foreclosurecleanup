'use strict';

// setup

document.getElementById('narrowScreen__button').style.backgroundColor = 'var(--grey192)';
document.getElementById('narrowScreen__button').style.color = 'var(--white)';
document.getElementById('narrowScreen__button').disabled = true;
document.getElementById('narrowScreen__button').style.cursor = 'default';

document.getElementById('newEmail').addEventListener('input', function() {
    checkForSuccess('newEmail', 'newPassword', 'confirmationPassword', 'privacyPolicyTermsOfService');
});

document.getElementById('newPassword').addEventListener('input', function() {
    checkForSuccess('newEmail', 'newPassword', 'confirmationPassword', 'privacyPolicyTermsOfService');
});

document.getElementById('confirmationPassword').addEventListener('input', function() {
    checkForSuccess('newEmail', 'newPassword', 'confirmationPassword', 'privacyPolicyTermsOfService');
});

document.getElementById('privacyPolicyTermsOfService').addEventListener('input', function() {
    checkForSuccess('newEmail', 'newPassword', 'confirmationPassword', 'privacyPolicyTermsOfService');
});

// core functionality

function checkForSuccess(primaryEmail, primaryPassword, secondaryPassword, checkBox) {

    if (
        primaryEmailCheck(primaryEmail) === 'passed' &&
        primaryPasswordCheck(primaryPassword) === 'passed' &&
        secondaryPasswordCheck(primaryPassword, secondaryPassword) === 'passed' && 
        checkBoxCheck(checkBox) === 'passed'
    ) {

        document.getElementById('narrowScreen__button').style.backgroundColor = 'var(--grey32)';
        document.getElementById('narrowScreen__button').style.color = 'var(--gold)';
        document.getElementById('narrowScreen__button').disabled = false;
        document.getElementById('narrowScreen__button').style.cursor = 'pointer';

        if (document.getElementById(`target${ primaryEmail }Error`)) {

            document.getElementById(primaryEmail).classList.remove('-errorBorder');
            document.getElementById(`target${ primaryEmail }Error`).innerHTML = '';

        }

        if (document.getElementById(`target${ primaryPassword }Error`)) {

            document.getElementById(`target${ primaryPassword }Container`).classList.remove('-errorBorder');
            document.getElementById(`target${ primaryPassword }Error`).innerHTML = '';

        }

        if (document.getElementById(`target${ secondaryPassword }Error`)) {

            document.getElementById(`target${ secondaryPassword }Container`).classList.remove('-errorBorder');
            document.getElementById(`target${ secondaryPassword }Error`).innerHTML = '';

        }

        if (document.getElementById(`target${ checkBox }Error`)) {

            document.getElementById(`target${ checkBox }Container`).classList.remove('-errorBorderCheckbox');
            document.getElementById(`target${ checkBox }Error`).innerHTML = '';
            
        }

    } else {

        document.getElementById('narrowScreen__button').style.backgroundColor = 'var(--grey192)';
        document.getElementById('narrowScreen__button').style.color = 'var(--white)';
        document.getElementById('narrowScreen__button').disabled = true;
        document.getElementById('narrowScreen__button').style.cursor = 'default';

    }

}

function getIsEmailValid(primaryEmail) {

    if (
        document.getElementById(primaryEmail).value.length > 4 &&
        document.getElementById(primaryEmail).value.includes('@') &&
        document.getElementById(primaryEmail).value.includes('.') 
    ) {
        return true;
    }

    return false;

}

function primaryEmailCheck(primaryEmail) {

    let isEmailValid = getIsEmailValid(primaryEmail);

    if (isEmailValid === true) return 'passed';
    return 'failed';

}

function primaryPasswordCheck(primaryPassword) {

    let score = getScore(primaryPassword);

    if (score >= 2) return 'passed';

    return 'failed';

}

function secondaryPasswordCheck(primaryPassword, secondaryPassword) {

    let score = getScore(primaryPassword);

    let primaryIdValue = getValue(primaryPassword);
    let secondaryIdValue = getValue(secondaryPassword);

    if (primaryIdValue === secondaryIdValue && score >= 2) return 'passed';

    return 'failed';

}

function checkBoxCheck(checkBox) {

    if (document.getElementById(checkBox).checked) return 'passed';

    return 'failed';

}