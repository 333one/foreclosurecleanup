'use strict';

let patternCompanyCity = /^[A-Z\-\' ]+$/;
let patternCompanyStreet = /^[A-Z0-9 ]+$/;
let patternCompanyStreetTwo = /^[A-Z0-9\-\# ]+$/;
let patternCompanyZip = /^[0-9]+$/;

characterBlocker('companyCity', patternCompanyCity);
characterBlocker('companyStreet', patternCompanyStreet);
characterBlocker('companyStreetTwo', patternCompanyStreetTwo);
characterBlocker('companyZip', patternCompanyZip);