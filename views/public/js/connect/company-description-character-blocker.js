'use strict';

let patternCompanyDescription = /^[A-Z0-9\,\.\?\!\'\#\$\%\&\- ]+$/;

characterBlocker('companyDescription', patternCompanyDescription);