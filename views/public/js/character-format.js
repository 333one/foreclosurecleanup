"use strict";

function letterInputOnly(id) {

    document.getElementById(id).addEventListener('keypress', function(event) {

        var x = document.getElementById(id).value || '';
        var spaceValue = x.match(/ /g);
        var spaceAllowed = spaceValue === null ? true : false;
        var quoteValue = x.match(/'/g);
        var quoteAllowed = quoteValue === null ? true : false;

        if(/[a-zA-Z' ]/.test(event.key) === false ||
            / /.test(event.key) === true && spaceAllowed === false ||
            /'/.test(event.key) === true && quoteAllowed === false) {
            event.preventDefault();
        }

    });
}

if(document.getElementById('firstName')) {
    letterInputOnly('firstName');
}

if(document.getElementById('lastName')) {
    letterInputOnly('lastName');
}