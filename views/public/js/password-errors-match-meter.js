'use strict';

function getScore(elementId) {

    let score = document.getElementById(elementId).value === '' ? 0 : zxcvbn(document.getElementById(elementId).value).score;
    return score;

}

function getValue(elementId) {

    let value = document.getElementById(elementId).value;
    return value;

}

// errors

function primaryPerspectiveRemoveError(primaryId, secondaryId) {

    let score = getScore(primaryId);

    let primaryIdValue = getValue(primaryId);
    let secondaryIdValue = getValue(secondaryId);

    if (score >= 2) {
        removeError(primaryId);
    }

    if (score >= 2 && primaryIdValue === secondaryIdValue) {
        removeError(secondaryId);
    }

}

function removeError(elementId) {

    let uppercaseFirstLetter = elementId.charAt(0).toUpperCase() + elementId.slice(1);

    document.getElementById(`target${ uppercaseFirstLetter }Container`).classList.remove('-errorBorder');

    if (document.getElementById(`target${ uppercaseFirstLetter }Error`)) {
        document.getElementById(`target${ uppercaseFirstLetter }Error`).innerText = '';
    }

}

function secondaryPerspectiveRemoveError(primaryId, secondaryId) {

    let score = getScore(primaryId);

    let primaryIdValue = getValue(primaryId);
    let secondaryIdValue = getValue(secondaryId);

    if (score >= 2 && primaryIdValue === secondaryIdValue) {
        removeError(secondaryId);
    }

}

// match

let matchLabel = document.getElementById('passwordMatchLabel');

function matchIt(primaryId, secondaryId) {

    let score = getScore(primaryId);
    let primaryIdValue = getValue(primaryId);
    let secondaryIdValue = getValue(secondaryId);
    
    if (primaryIdValue === secondaryIdValue && score >= 2) {

        matchLabel.style.display = 'block';
        matchLabel.innerHTML = 'Match ✔';
        matchLabel.style.color = 'rgb(18, 163, 18)';

    } else {
        matchLabel.style.display = 'none';
    }
    
}

// meter

let meterContainer = document.getElementById('passwordMeterContainer').style.display = 'block';
let box1 = document.getElementById('passwordMeterBox1');
let box2 = document.getElementById('passwordMeterBox2');
let box3 = document.getElementById('passwordMeterBox3');
let box4 = document.getElementById('passwordMeterBox4');
let box5 = document.getElementById('passwordMeterBox5');
let meterLabel = document.getElementById('passwordMeterLabel');

function passwordMeter(primaryId) {

    let score = getScore(primaryId);
    let value = getValue(primaryId)

    // If input is empty don't rate password.
    if (score === 0 && value === '') score = null;

    switch(score) {
        case 0:
            meterLabel.innerHTML = 'Very Weak';
            meterLabel.style.color = 'rgb(212, 20, 30)';
            box1.style.backgroundColor = 'rgb(212, 20, 30)';
            box1.style.borderColor = 'rgb(212, 20, 30)';
            box2.style.backgroundColor = 'rgb(255, 255, 255)';
            box2.style.borderColor = 'rgb(224, 224, 224)';
            box3.style.backgroundColor = 'rgb(255, 255, 255)';
            box3.style.borderColor = 'rgb(224, 224, 224)';
            box4.style.backgroundColor = 'rgb(255, 255, 255)';
            box4.style.borderColor = 'rgb(224, 224, 224)';
            box5.style.backgroundColor = 'rgb(255, 255, 255)';
            box5.style.borderColor = 'rgb(224, 224, 224)';
            break;

        case 1:
            meterLabel.innerHTML = 'Weak';
            meterLabel.style.color = 'rgb(242, 100, 30)';
            box1.style.backgroundColor = 'rgb(242, 100, 30)';
            box1.style.borderColor = 'rgb(242, 100, 30)';
            box2.style.backgroundColor = 'rgb(242, 100, 30)';
            box2.style.borderColor = 'rgb(242, 100, 30)';
            box3.style.backgroundColor = 'rgb(255, 255, 255)';
            box3.style.borderColor = 'rgb(224, 224, 224)';
            box4.style.backgroundColor = 'rgb(255, 255, 255)';
            box4.style.borderColor = 'rgb(224, 224, 224)';
            box5.style.backgroundColor = 'rgb(255, 255, 255)';
            box5.style.borderColor = 'rgb(224, 224, 224)';
            break;

        case 2:
            meterLabel.innerHTML = 'OK';
            meterLabel.style.color = 'rgb(242, 166, 26)';
            box1.style.backgroundColor = 'rgb(242, 166, 26)';
            box1.style.borderColor = 'rgb(242, 166, 26)';
            box2.style.backgroundColor = 'rgb(242, 166, 26)';
            box2.style.borderColor = 'rgb(242, 166, 26)';
            box3.style.backgroundColor = 'rgb(242, 166, 26)';
            box3.style.borderColor = 'rgb(242, 166, 26)';
            box4.style.backgroundColor = 'rgb(255, 255, 255)';
            box4.style.borderColor = 'rgb(224, 224, 224)';
            box5.style.backgroundColor = 'rgb(255, 255, 255)';
            box5.style.borderColor = 'rgb(224, 224, 224)';
            break;

        case 3:
            meterLabel.innerHTML = 'Good';
            meterLabel.style.color = 'rgb(158, 182, 101)';
            box1.style.backgroundColor = 'rgb(158, 182, 101)';
            box1.style.borderColor = 'rgb(158, 182, 101)';
            box2.style.backgroundColor = 'rgb(158, 182, 101)';
            box2.style.borderColor = 'rgb(158, 182, 101)';
            box3.style.backgroundColor = 'rgb(158, 182, 101)';
            box3.style.borderColor = 'rgb(158, 182, 101)';
            box4.style.backgroundColor = 'rgb(158, 182, 101)';
            box4.style.borderColor = 'rgb(158, 182, 101)';
            box5.style.backgroundColor = 'rgb(255, 255, 255)';
            box5.style.borderColor = 'rgb(224, 224, 224)';
            break;

        case 4:
            meterLabel.innerHTML = 'Great';
            meterLabel.style.color = 'rgb(18, 163, 18)';
            box1.style.backgroundColor = 'rgb(18, 163, 18)';
            box1.style.borderColor = 'rgb(18, 163, 18)';
            box2.style.backgroundColor = 'rgb(18, 163, 18)';
            box2.style.borderColor = 'rgb(18, 163, 18)';
            box3.style.backgroundColor = 'rgb(18, 163, 18)';
            box3.style.borderColor = 'rgb(18, 163, 18)';
            box4.style.backgroundColor = 'rgb(18, 163, 18)';
            box4.style.borderColor = 'rgb(18, 163, 18)';
            box5.style.backgroundColor = 'rgb(18, 163, 18)';
            box5.style.borderColor = 'rgb(18, 163, 18)';
            break;

        default:
            meterLabel.innerHTML = '';
            meterLabel.style.color = 'rgb(255, 255, 255)';
            box1.style.backgroundColor = 'rgb(255, 255, 255)';
            box1.style.borderColor = 'rgb(224, 224, 224)';
            box2.style.backgroundColor = 'rgb(255, 255, 255)';
            box2.style.borderColor = 'rgb(224, 224, 224)';
            box3.style.backgroundColor = 'rgb(255, 255, 255)';
            box3.style.borderColor = 'rgb(224, 224, 224)';
            box4.style.backgroundColor = 'rgb(255, 255, 255)';
            box4.style.borderColor = 'rgb(224, 224, 224)';
            box5.style.backgroundColor = 'rgb(255, 255, 255)';
            box5.style.borderColor = 'rgb(224, 224, 224)';
            break;

    }

}