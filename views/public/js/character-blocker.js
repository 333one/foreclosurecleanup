"use strict";

function characterBlocker(elementId, regExpPattern) {

    let regExp = new RegExp(regExpPattern, 'i');

    document.getElementById(elementId).addEventListener('keypress', function(event) {

        if (regExp.test(event.key) === false) {
            event.preventDefault();
        }
    });
}