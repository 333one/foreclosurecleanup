"use strict";

if (document.querySelector('#searchZipCodeError')) {

    document.querySelector('#searchZipCode').addEventListener('input', function() {

        let zipCode = document.querySelector('#searchZipCode').value;

        let isZipCodeNumber = !isNaN(zipCode) && zipCode !== '' ? true : false;

        if (isZipCodeNumber === true) {
            removeSearchError('#searchZipCodeContainer', '#searchZipCodeError');
        }

    });

}

if (document.querySelector('#searchRadiusError')) {

    let idArray = ['#miles10', '#miles25', '#miles50'];

    idArray.forEach(function(element) {

        document.querySelector(element).addEventListener('change', function() {
            removeSearchError('#searchRadiusContainer', '#searchRadiusError');
        });

    });

}

if (document.querySelector('#searchServicesError')) {

    let idArray = [ 
        '#boardingSecuring',
        '#debrisRemovalTrashout',
        '#evictionManagement',
        '#fieldInspection',
        '#handymanGeneralMaintenance',
        '#landscapeMaintenance',
        '#lockChanges',
        '#overseePropertyRehabilitation',
        '#poolMaintenance',
        '#propertyCleaning',
        '#winterizations'
    ];

    idArray.forEach(function(element) {

        document.querySelector(element).addEventListener('change', function() {
            removeSearchError('#searchServicesContainer', '#searchServicesError');
        });

    });

}

if (document.querySelector('#targetPrivacyTermsError')) {

    document.querySelector('#privacyTerms').addEventListener('change', function() {
        removeSearchError('#privacyTermsContainer', '#targetPrivacyTermsError');
    });

}

function removeSearchError(container, error) {

    document.querySelector(container).classList.remove('-borderError');
    document.querySelector(container).classList.add('-borderClear');
    document.querySelector(container).classList.add('-marginBottomFour');

    document.querySelector(error).style.display = 'none';

}