"use strict";

function characterBlocker(id, regExpPattern) {

    document.getElementById(id).addEventListener('keypress', function(event) {

        if (regExpPattern.test(event.key) === false) {
            event.preventDefault();
        }
    });
}

if (document.getElementById('companyName')) {
    let regExpPattern = new RegExp(patternCompanyName, 'i');
    characterBlocker('companyName', regExpPattern);
}

if (document.getElementById('companyDescription')) {
    let regExpPattern = new RegExp(patternCompanyDescription, 'i');
    characterBlocker('companyDescription', regExpPattern);
}

if (document.getElementById('companyWebsite')) {
    let regExpPattern = new RegExp(patternCompanyWebsite, 'i');
    characterBlocker('companyWebsite', regExpPattern);
}

if (document.getElementById('newEmail')) {
    let regExpPattern = new RegExp(patternEmail, 'i');
    characterBlocker('newEmail', regExpPattern);
}

if (document.getElementById('emailConfirmation')) {
    let regExpPattern = new RegExp(patternEmail, 'i');
    characterBlocker('emailConfirmation', regExpPattern);
}

if (document.getElementById('companyCity')) {
    let regExpPattern = new RegExp(patternCompanyCity, 'i');
    characterBlocker('companyCity', regExpPattern);
}

if (document.getElementById('companyStreet')) {
    let regExpPattern = new RegExp(patternCompanyStreet, 'i');
    characterBlocker('companyStreet', regExpPattern);
}

if (document.getElementById('companyStreetTwo')) {
    let regExpPattern = new RegExp(patternCompanyStreet, 'i');
    characterBlocker('companyStreetTwo', regExpPattern);
}

if (document.getElementById('companyZip')) {
    let regExpPattern = new RegExp(patternCompanyZip, 'i');
    characterBlocker('companyZip', regExpPattern);
}

if (document.getElementById('password')) {
    let regExpPattern = new RegExp(patternPassword, 'i');
    characterBlocker('password', regExpPattern);
}