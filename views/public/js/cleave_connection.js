"use strict";

new Cleave('#businessPhone', {
    phone: true,
    delimiter: ['-'],
    phoneRegionCode: 'US'
});