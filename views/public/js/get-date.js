'use strict';

var year;

year = new Date().getFullYear();

if (document.querySelector('#copyright')) {
    document.querySelector('#copyright').innerHTML = '&copy; ' + year + ' Pro Journal, LLC - All Rights Reserved';
} else {
    document.querySelector('#narrowScreen_copyright').innerHTML = '&copy; ' + year + ' Pro Journal, LLC - All Rights Reserved';
}