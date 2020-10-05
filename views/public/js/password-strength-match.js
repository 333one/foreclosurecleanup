"use strict"

var meterContainer = document.getElementById('passwordMeterContainer');
var box1 = document.getElementById('passwordMeterBox1');
var box2 = document.getElementById('passwordMeterBox2');
var box3 = document.getElementById('passwordMeterBox3');
var box4 = document.getElementById('passwordMeterBox4');
var box5 = document.getElementById('passwordMeterBox5');
var meterLabel = document.getElementById('passwordMeterLabel');

var matchLabel = document.getElementById('passwordMatchLabel');

meterContainer.style.display = "block";

function matchIt(passwordValue, passwordConfirmValue) {
    
    if (passwordValue === passwordConfirmValue) {
        matchLabel.style.display = 'block';
        matchLabel.innerHTML = 'Match ✔';
        matchLabel.style.color = 'rgb(18, 163, 18)';

    } else {
        matchLabel.style.display = 'none';

    }
}

function passwordErrorRemove() {

    document.getElementById('targetPasswordLabel').classList.remove('-errorColor');
    document.getElementById('targetPasswordContainer').classList.remove('-errorBorder');
    if (document.getElementById('targetPasswordErrorMessage')) {
        document.getElementById('targetPasswordErrorMessage').innerText = '';
    }
};

function passwordConfirmErrorRemove() {
    
    document.getElementById('targetPasswordConfirmLabel').classList.remove('-errorColor');
    document.getElementById('targetPasswordConfirmContainer').classList.remove('-errorBorder');
    if (document.getElementById('targetPasswordConfirmErrorMessage')) {
        document.getElementById('targetPasswordConfirmErrorMessage').innerText = '';
    }
};

function passwordError() {

    let score = document.getElementById('password').value === '' ? 'empty' : zxcvbn(document.getElementById('password').value).score;

    let passwordValue = document.getElementById('password').value;
    let passwordConfirmValue = document.getElementById('passwordConfirm').value;
    let errorType = document.getElementById('password').getAttribute('data-errortype');

    if (passwordValue && (errorType === 'empty' || errorType === 'tooLong')) {

        passwordErrorRemove();
    }

    if (errorType === 'weak' && score >= 2) {

        passwordErrorRemove();
    }

    if (score >= 2 && passwordValue === passwordConfirmValue) {

        passwordConfirmErrorRemove();
    }
}

function passwordConfirmError() {

    let score = document.getElementById('password').value === '' ? 'empty' : zxcvbn(document.getElementById('password').value).score;

    let passwordValue = document.getElementById('password').value;
    let passwordConfirmValue = document.getElementById('passwordConfirm').value;
    let errorType = document.getElementById('passwordConfirm').getAttribute('data-errortype');

    if (passwordConfirmValue && errorType === 'empty') {

        passwordConfirmErrorRemove();
    }

    if (passwordValue === passwordConfirmValue && score >= 2) {

        passwordConfirmErrorRemove();
    }
}

function passwordKeyupLoad() {

    let score = document.getElementById('password').value === '' ? 'empty' : zxcvbn(document.getElementById('password').value).score;

    let passwordValue = document.getElementById('password').value;
    let passwordConfirmValue = document.getElementById('passwordConfirm').value;

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

            matchLabel.style.display = 'none';
            break;
        case 1:
            meterLabel.innerHTML = 'Weak';
            meterLabel.style.color = 'rgb(212, 20, 30)';
            box1.style.backgroundColor = 'rgb(212, 20, 30)';
            box1.style.borderColor = 'rgb(212, 20, 30)';
            box2.style.backgroundColor = 'rgb(212, 20, 30)';
            box2.style.borderColor = 'rgb(212, 20, 30)';
            box3.style.backgroundColor = 'rgb(255, 255, 255)';
            box3.style.borderColor = 'rgb(224, 224, 224)';
            box4.style.backgroundColor = 'rgb(255, 255, 255)';
            box4.style.borderColor = 'rgb(224, 224, 224)';
            box5.style.backgroundColor = 'rgb(255, 255, 255)';
            box5.style.borderColor = 'rgb(224, 224, 224)';

            matchLabel.style.display = 'none';
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

            matchIt(passwordValue, passwordConfirmValue);
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

            matchIt(passwordValue, passwordConfirmValue);
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

            matchIt(passwordValue, passwordConfirmValue);
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

            matchLabel.style.display = 'none';
            break;
    }
}

function passwordConfirmKeyupLoad() {

    let score = document.getElementById('password').value === '' ? 'empty' : zxcvbn(document.getElementById('password').value).score;

    let passwordValue = document.getElementById('password').value;
    let passwordConfirmValue = document.getElementById('passwordConfirm').value;

    switch(score) {
        case 0:
            matchLabel.style.display = 'none';
            break;
        case 1:
            matchLabel.style.display = 'none';
            break;
        case 2:
            matchIt(passwordValue, passwordConfirmValue);
            break;
        case 3:
            matchIt(passwordValue, passwordConfirmValue);
            break;
        case 4:
            matchIt(passwordValue, passwordConfirmValue);
            break;
        default:
            matchLabel.style.display = 'none';
            break;
    }    
}

addEventListener('load', passwordKeyupLoad);
addEventListener('load', passwordConfirmKeyupLoad);

document.getElementById('password').addEventListener('keyup', passwordKeyupLoad); 
document.getElementById('passwordConfirm').addEventListener('keyup', passwordConfirmKeyupLoad);

document.getElementById('password').addEventListener('keyup', passwordError); 
document.getElementById('passwordConfirm').addEventListener('keyup', passwordConfirmError); 