const defaultValue = require('../models/default-values');
const logicUserAccounts = require('./logic-user-accounts')
const renderValue = require('../models/rendering-values');

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

exports.processCompanyServices = function(accounts) {

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

        // This version is used for the telephone link.
        individualAccount.formattedPhone = removeDashesFromPhone(individualAccount.companyPhone);
    
        individualAccount.companyServicesAssembled = companyServicesAssembled;
        
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

    // Use default store when testing on Windows.  On Linux remove the comment below to turn on the Redis store.
    if (projectStatus === 'staged' || projectStatus === 'production') {
        sessionObject.store = new RedisStore({ client: redisClient });
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

function removeDashesFromPhone(companyPhone) {

    return companyPhone.replace(/-/g, '');

}