'use strict';

var year;

year = new Date().getFullYear();

if(document.getElementById('copyright')) {
    document.getElementById('copyright').innerHTML = '<small>&copy; ' + year + ' Foreclosure Cleanup.org - All Rights Reserved</small>';
} else {
    document.getElementById('narrowScreen_copyright').innerHTML = '<small>&copy; ' + year + ' Foreclosure Cleanup.org - All Rights Reserved</small>';
}