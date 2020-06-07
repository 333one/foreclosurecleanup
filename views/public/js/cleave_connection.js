"use strict";

new Cleave('#phone', {
    phone: true,
    delimiter: ['-'],
    phoneRegionCode: 'US'
});