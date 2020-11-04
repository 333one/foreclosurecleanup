'use strict';

var year;

year = new Date().getFullYear();

if (document.getElementById('copyright')) {
    document.getElementById('copyright').innerHTML = '&copy; ' + year + ' Foreclosure Cleanup.org - All Rights Reserved';
} else {
    document.getElementById('narrowScreen_copyright').innerHTML = '&copy; ' + year + ' Foreclosure Cleanup.org - All Rights Reserved';
}