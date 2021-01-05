"use strict";

if (document.querySelector('#searchZipCodeError')) {

    document.querySelector('#searchZipCode').addEventListener('change', function() {
        processSearchError('#searchZipCodeContainer', '#searchZipCodeError');
    });

}

if (document.querySelector('#searchRadiusError')) {

    let idArray = ['#miles10', '#miles25', '#miles50'];

    idArray.forEach(function(element) {

        document.querySelector(element).addEventListener('change', function() {
            processSearchError('#searchRadiusContainer', '#searchRadiusError');
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
            processSearchError('#searchServicesContainer', '#searchServicesError');
        });

    });

}

if (document.querySelector('#privacyTermsError')) {

    document.querySelector('#privacyTerms').addEventListener('change', function() {
        processSearchError('#privacyTermsContainer', '#privacyTermsError');
    });

}

function processSearchError(container, error) {
    document.querySelector(container).classList.remove('-borderError');
    document.querySelector(container).classList.add('-borderNoError');
    document.querySelector(container).classList.add('-bottomMarginLarge');

    document.querySelector(error).style.display = 'none';
}