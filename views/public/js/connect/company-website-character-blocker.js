'use strict';

let patternCompanyWebsite = /^[A-Z0-9\-\.\_\~\:\/]+$/;

characterBlocker('companyWebsite', patternCompanyWebsite);