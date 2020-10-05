"use strict";

new Cleave('#companyPhone', {
    phone: true,
    delimiter: ['-'],
    phoneRegionCode: 'US'
});