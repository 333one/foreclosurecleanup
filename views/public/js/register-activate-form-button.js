'use strict';

// setup

document.getElementById('button__submit').style.backgroundColor = 'var(--grey192)';
document.getElementById('button__submit').style.color = 'var(--white)';
document.getElementById('button__submit').disabled = true;
document.getElementById('button__submit').style.cursor = 'default';

document.getElementById('newEmail').addEventListener('input', function() {
    checkForSuccess('newEmail', 'newPassword', 'confirmationPassword', 'privacyTerms');
});

document.getElementById('newPassword').addEventListener('input', function() {
    checkForSuccess('newEmail', 'newPassword', 'confirmationPassword', 'privacyTerms');
});

document.getElementById('confirmationPassword').addEventListener('input', function() {
    checkForSuccess('newEmail', 'newPassword', 'confirmationPassword', 'privacyTerms');
});

document.getElementById('privacyTerms').addEventListener('input', function() {
    checkForSuccess('newEmail', 'newPassword', 'confirmationPassword', 'privacyTerms');
});

// core functionality

function checkForSuccess(primaryEmail, primaryPassword, secondaryPassword, checkBox) {

    if (
        primaryEmailCheck(primaryEmail) === 'passed' &&
        primaryPasswordCheck(primaryPassword) === 'passed' &&
        secondaryPasswordCheck(primaryPassword, secondaryPassword) === 'passed' && 
        checkBoxCheck(checkBox) === 'passed'
    ) {

        document.getElementById('button__submit').style.backgroundColor = 'var(--grey32)';
        document.getElementById('button__submit').style.color = 'var(--gold)';
        document.getElementById('button__submit').disabled = false;
        document.getElementById('button__submit').style.cursor = 'pointer';

        if (document.getElementById(`target${ primaryEmail }Error`)) {

            document.getElementById(primaryEmail).classList.remove('-borderError');
            document.getElementById(`target${ primaryEmail }Error`).innerHTML = '';

        }

        if (document.getElementById(`target${ primaryPassword }Error`)) {

            document.getElementById(`target${ primaryPassword }Container`).classList.remove('-borderError');
            document.getElementById(`target${ primaryPassword }Error`).innerHTML = '';

        }

        if (document.getElementById(`target${ secondaryPassword }Error`)) {

            document.getElementById(`target${ secondaryPassword }Container`).classList.remove('-borderError');
            document.getElementById(`target${ secondaryPassword }Error`).innerHTML = '';

        }

        if (document.getElementById(`target${ checkBox }Error`)) {

            document.getElementById(`target${ checkBox }Container`).classList.remove('-borderError');
            document.getElementById(`target${ checkBox }Error`).innerHTML = '';
            
        }

    } else {

        document.getElementById('button__submit').style.backgroundColor = 'var(--grey192)';
        document.getElementById('button__submit').style.color = 'var(--white)';
        document.getElementById('button__submit').disabled = true;
        document.getElementById('button__submit').style.cursor = 'default';

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