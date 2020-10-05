"use strict";

function letterNumberInputOnly(id) {

    document.getElementById(id).addEventListener('keypress', function(event) {

        var x = document.getElementById(id).value || '';
        var spaceValue = x.match(/ /gi);
        var spaceAllowed = spaceValue === null ? true : false;
        var quoteValue = x.match(/'/gi);
        var quoteAllowed = quoteValue === null ? true : false;

        if(/[A-Z0-9' ]/.test(event.key) === false ||
            / /.test(event.key) === true && spaceAllowed === false ||
            /'/.test(event.key) === true && quoteAllowed === false) {
            event.preventDefault();
        }

    });
}

function letterNumberPunctuationInputOnly(id) {

    document.getElementById(id).addEventListener('keypress', function(event) {

        var x = document.getElementById(id).value || '';
        var spaceValue = x.match(/ /gi);
        var spaceAllowed = spaceValue === null ? true : false;
        var quoteValue = x.match(/'/gi);
        var quoteAllowed = quoteValue === null ? true : false;

        if(/[A-Z0-9',.!?-+=$&() ]/.test(event.key) === false ||
            / /.test(event.key) === true && spaceAllowed === false ||
            /'/.test(event.key) === true && quoteAllowed === false) {
            event.preventDefault();
        }

    });
}

if(document.getElementById('companyName')) {
    letterNumberInputOnly('companyName');
}

if(document.getElementById('companyDescription')) {
    letterNumberPunctuationInputOnly('companyDescription');
}