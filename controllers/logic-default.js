const defaultValue = require('../models/default-values');
const logicUserAccounts = require('./logic-user-accounts')
const renderValue = require('../models/rendering-values');

exports.assembleCompanyStreet = function(companyCity, companyState, companyStreet, companyStreetTwo, companyZip) {

    let companyStreetLine1Line2 = !companyStreetTwo ? `${ companyStreet }<br>` : `${ companyStreet }<br>${ companyStreetTwo }<br>`;

    let companyStreetLine3 = `${ companyCity }, ${ companyState }, ${ companyZip }`;

    let companyStreetAssembled = `${ companyStreetLine1Line2 }${ companyStreetLine3 }`;

    return companyStreetAssembled;

}

exports.convertBooleanToString = function(objectToConvert, listOfPropertiesToCheck) {

    for (const value of listOfPropertiesToCheck) {

        if (objectToConvert[value] === true) objectToConvert[value] = 'true';
        if (objectToConvert[value] === false) objectToConvert[value] = 'false';
        
    }

    return objectToConvert;

}

exports.convertStringToBoolean = function(objectToConvert, listOfPropertiesToCheck) {

    for (const value of listOfPropertiesToCheck) {

        if (objectToConvert[value] === 'true') objectToConvert[value] = true;
        if (objectToConvert[value] === 'false') objectToConvert[value] = false;
        
    }

    return objectToConvert;

}

exports.getSearchAgainNamesValues = function(cleanedQueryWithBoolean) {

    let namesValues = {};

    namesValues.searchRadius = cleanedQueryWithBoolean.searchRadius;
    namesValues.searchZipCode = cleanedQueryWithBoolean.searchZipCode;
    namesValues.vendorSearchAgain = 'true';

    for (const value of defaultValue.listOfCompanyServices) {

        if (cleanedQueryWithBoolean[value] === true || cleanedQueryWithBoolean[value] === false) {
            namesValues[value] = cleanedQueryWithBoolean[value];
        }

    }

    return namesValues;

}

exports.processCompanyForViewing = function(accounts, accountType) {

    if (accounts.length === 0) return;

    for (const individualAccount of accounts) {

        for (const value of defaultValue.listOfCompanyServices) {

            if (individualAccount[value] === undefined) {
                individualAccount[value] = false;
            }
    
        }

    }

    for (const individualAccount of accounts) {

        let {
            boardingSecuring,
            debrisRemovalTrashout,
            evictionManagement,
            fieldInspection,
            handymanGeneralMaintenance,
            landscapeMaintenance,
            lockChanges,
            overseePropertyRehabilitation,
            poolMaintenance,
            propertyCleaning,
            winterizations
        } = individualAccount;
    
        let companyServicesAssembled = logicUserAccounts.assembleCompanyServices(
            boardingSecuring,
            debrisRemovalTrashout,
            evictionManagement,
            fieldInspection,
            handymanGeneralMaintenance,
            landscapeMaintenance,
            lockChanges,
            overseePropertyRehabilitation,
            poolMaintenance,
            propertyCleaning,
            winterizations
        );

        individualAccount.companyServicesAssembled = companyServicesAssembled;

        // This version is used for the telephone link.
        individualAccount.formattedPhone = removeDashesFromPhone(individualAccount.companyPhone);

        if (accountType === defaultValue.accountUpgrade) {

            // Add 2 slashes to the website if an http or https isn't included.  This makes the link work.
            individualAccount.companyWebsiteProcessed = addTwoSlashesIfNoPrefix(individualAccount.companyWebsite);

        }
    
    }

    return accounts;

}

exports.separateAccountTypes = function(searchResults, accountType) {

    let searchOutput = [];

    for (const value of searchResults) {

        if (value.companyProfileType === accountType) {
            searchOutput.push(value);
        }

    }

    return searchOutput;

}

exports.createSearchRadiusAttributesAndValue = function(defaultValues, searchRadius) {

    let searchRadiusObject = {};
    defaultValues.forEach(function(element) {

        searchRadiusObject[element] = {};
        searchRadiusObject[element].radius = element;
        searchRadiusObject[element].label = `${ element } Miles`;

        if (element === searchRadius) {

            searchRadiusObject[element].isChecked = 'checked';
            return;

        } else {

            searchRadiusObject[element].isChecked = '';

        }

    });

    return searchRadiusObject;

}

exports.createSearchServicesForChecking = function(originalQuery, listOfCompanyServices) {

    let companyServices = {};
    for (const value of listOfCompanyServices) {
        companyServices[value] = originalQuery[value];
    }

    return companyServices;

}

exports.createServicesAttributesAndValues = function(defaultServices, cleanedQueryWithBoolean) {

    let servicesAttributesAndValues = {};

    for (const value of defaultServices) {

        servicesAttributesAndValues[value] = {};

        servicesAttributesAndValues[value].name = value;
        servicesAttributesAndValues[value].label = renderValue[value];

        if (cleanedQueryWithBoolean) {

            if (cleanedQueryWithBoolean[value] === true) {

                servicesAttributesAndValues[value].isChecked = 'checked';

            } else {

                servicesAttributesAndValues[value].isChecked = '';

            }

        } else {

            servicesAttributesAndValues[value].isChecked = '';

        }

    }

    return servicesAttributesAndValues;

}

exports.createSessionObject = function(projectStatus, redisClient, RedisStore) {

    let sessionObject = {
        // maxAge: 24 hours
        maxAge: 24 * 60 * 60 * 1000,
        name: process.env.SESSION_NAME,
        // Redis uses the touch method so this value should be set to false.  Probably fine for testing with default store too.
        resave: false,
        saveUninitialized: true,
        secret: process.env.SESSION_SECRET,
        cookie: {
            sameSite: 'lax',
            // secure: true requires internal https but when Nginx is configured as a reverse proxy it uses http by default to communicate with Node.js.  
            // Nginx does this because http is much less processor intensive.  All communication to the outside world still uses secure https.
            secure: false
        } 
    }

    // Use default store when testing on Windows.  On Linux turn on the Redis store.
    if (projectStatus === 'staged' || projectStatus === 'production') {

        sessionObject.store = new RedisStore({ client: redisClient });
        // sessionObject.cookie.secure = true;

    }

    return sessionObject;

}

exports.getGeoLocationAnswerLatLong = function(companyZip, geoLocation) {

    let isZipCodeRealAndInUsa = false;
    let zipCodeLongAndLat = [];

    for (const key in geoLocation.entity.features) {

        if (geoLocation.entity.features[key].place_name.includes(companyZip) === true && geoLocation.entity.features[key].place_name.includes('United States')) {

            isZipCodeRealAndInUsa = true;
            zipCodeLongAndLat = geoLocation.entity.features[key].center;

            return { isZipCodeRealAndInUsa, zipCodeLongAndLat };

        };

    }

    return { isZipCodeRealAndInUsa, zipCodeLongAndLat };

}

function addTwoSlashesIfNoPrefix(companyWebsite) {

    let doesCompanyWebsiteStartWithPrefix = companyWebsite.startsWith('http') || companyWebsite.startsWith('https') ? true : false;

    if (doesCompanyWebsiteStartWithPrefix === false) return `//${ companyWebsite }`;
    
    return companyWebsite;

}

function removeDashesFromPhone(companyPhone) {

    return companyPhone.replace(/-/g, '');

}