"use strict";

const phoneNormalizer = require('phone');
const zxcvbn = require('zxcvbn');

const formFields = require('../models/forms-default-fields.js');
const timeValue = require('../models/time-values');

exports.checkAllFieldsFilled = function(formFields, userInputFields) {

    for(let element of formFields) {
        if (userInputFields[element] === '' || userInputFields[element] === undefined) {
            return false;
        }
    }

    return true;
}

exports.checkAllAccountPropertiesFilled = function(sessionUserValues, currentProperty) {

    let userProperties = JSON.parse(JSON.stringify(sessionUserValues));

    // These 3 are allowed to be empty so delete them.
    delete userProperties.companyStreetTwo;
    delete userProperties.companyDescription;
    delete userProperties.companyWebsite;

    // The current property has a value or you wouldn't get here.  However it hasn't been updated on the session so it is allowed to be empty.  Delete that property.
    delete userProperties[currentProperty];

    // Company services have to be checked separately so create an array of them.
    let companyServiceProperties = [...formFields.addChangeCompanyServices];

    // Remove deleteProperty because it isn't needed for this test.
    let indexOfDeleteProperty = companyServiceProperties.indexOf('deleteProperty');
    companyServiceProperties.splice(indexOfDeleteProperty, 1);

    // Check to see if any services have been added.  
    let haveAnyServicesBeenAdded = false;
    companyServiceProperties.forEach(function(element) {
        if (userProperties[element] === true) haveAnyServicesBeenAdded = true;
    })

    // if (haveAnyServicesBeenAdded === false) return false;

    // If any remaining property is empty return false.
    for (var key in userProperties) {
        if (userProperties[key] === "")
            return false;
    }

    return true;

}

exports.checkArePremiumAccountExtendsAvailable = function(expirationDate, isUpgradeExpirationSoon) {

    let oneDay = 24 * 60 * 60 * 1000;
    let today = new Date();

    let numberOfDays = Math.floor((Date.UTC(expirationDate.getFullYear(), expirationDate.getMonth(), expirationDate.getDate())) - (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))) / oneDay;

    let maxDays = timeValue.premiumAccountExtendsCutoff;

    if (numberOfDays < maxDays) {

        return true;
    } else {

        return false;
    }
}

exports.checkCompanyAddressNormalized = function(companyStreet, companyStreetTwo, companyCity, companyState, companyZip, normalizedCompanyAddress) {

    if (
        normalizedCompanyAddress.street1 === companyStreet &&
        normalizedCompanyAddress.street2 === companyStreetTwo &&
        normalizedCompanyAddress.city === companyCity &&
        normalizedCompanyAddress.state === companyState &&
        normalizedCompanyAddress.Zip5 === companyZip
    ) return true;

    return false;
    
}

exports.checkIfRouteBeatWebhook = function(expirationDateSessionValue, expirationDateDBValue) {

    if (expirationDateSessionValue === expirationDateDBValue) return true;
    return false;
}

exports.checkForPreviousErrors = function(emailError, firstNameError, lastNameError, phoneError) {

    if (emailError || firstNameError || lastNameError || phoneError) {
        return true;
    }
    return false;
}

exports.checkIfInputInsideMaxLength = function(field, maxLength) {

    return field.length > maxLength ? false : true;
}

exports.checkIfInputTooShort = function(field, minLength) {

    return field.length < minLength ? true : false;
}

exports.checkIsUpgradeExpirationSoon = function(numberOfDaysUntilExpiration) {

    // A negative number indicates this is a free account.
    if (numberOfDaysUntilExpiration < 0) {
        return false;
    } else if (numberOfDaysUntilExpiration > timeValue.upgradeExpirationAlarmTime) {
        return false;
    } else {
        return true;
    }
    
}

exports.checkPasswordMeetsRequirements = function(password) {

    return zxcvbn(password).score >= 2 ? true : false;
}

exports.checkCompanyPhoneValid = function(companyPhone) {

    // If phoneNormalizer returns an empty array it indicates that the phone number is not complete or valid.
    if (phoneNormalizer(companyPhone, '', true).length === 0) return false;
    if (companyPhone.charAt(0) == 0 || companyPhone.charAt(0) == 1) return false;
    return true;
}

exports.checkCompanyStateValid = function(companyState) {

    let states = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
        'DC', ''];

    if (states.includes(companyState)) return true;
    return false;
}

exports.checkCompanyServicesHaveValue = function (
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
    ) {

    for (const element of arguments) {
        if (element === true) return true;
    }

    return false;

}

exports.checkServiceValuesValid = function(cleanedFields) {

    let cleanedFieldsArray = Object.entries(cleanedFields);

    // cleanedFieldsArray.push(['cat', 'abc123']);

    let areAllServiceValuesValid = true;

    cleanedFieldsArray.forEach(function([key, value]) {

        if (key !== 'deleteProperty' && value !== 'true' && value !== '') {
            areAllServiceValuesValid = false;
        }

    });

    return areAllServiceValuesValid;

}

exports.checkWereCompanyServicesAdded = function(companyServices, userValues) {

    let wereCompanyServicesAdded = false;

    companyServices.forEach(function(element) {
        if (userValues[element] === true) wereCompanyServicesAdded = true;
    });

    return wereCompanyServicesAdded;

};