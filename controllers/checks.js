"use strict";

const phoneNormalizer = require('phone');
const zxcvbn = require('zxcvbn');

const defaultAppValues = require('../models/default-app-values');
const defaultFields = require('../models/default-fields.js');

exports.checkAllFieldsFilled = function(defaultFields, userInputFields) {

    for(let element of defaultFields) {
        if (userInputFields[element] === '' || userInputFields[element] === undefined) {
            return false;
        }
    }

    return true;
}

exports.checkAllUserValuesFilled = function(sessionUserValues) {

    let userProperties = JSON.parse(JSON.stringify(sessionUserValues));
    // companyStreetTwo is allowed to be empty so delete that.
    delete userProperties.companyStreetTwo;

    let companyServiceProperties = [...defaultFields.addChangeCompanyServices];
    // Remove deleteProperty because it isn't needed for this test.
    companyServiceProperties.pop();

    // If any companyService property is 'no' return false.
    let isAServicePropertyYes = false;
    companyServiceProperties.forEach(function(element) {
        if (userProperties[element] === 'yes') isAServicePropertyYes = true;
    })

    if (isAServicePropertyYes === false) return false;

    // If any property is empty return false.
    for (var key in userProperties) {
        if (userProperties[key] === null && userProperties[key] === undefined && userProperties[key] === "")
            return false;
    }

    return true;
}

exports.checkArePremiumAccountExtendsAvailable = function(expirationDate, isUpgradeExpirationSoon) {

    let oneDay = 24 * 60 * 60 * 1000;
    let today = new Date();

    let numberOfDays = Math.floor((Date.UTC(expirationDate.getFullYear(), expirationDate.getMonth(), expirationDate.getDate())) - (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))) / oneDay;

    let maxDays = defaultAppValues.premiumAccountExtendsCutoff;

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

exports.checkIfInputTooLong = function(field, maxLength) {

    return field.length > maxLength ? true : false;
}

exports.checkIsUpgradeExpirationSoon = function(numberOfDaysUntilExpiration) {

    // A negative number indicates this is a free account.
    if (numberOfDaysUntilExpiration < 0) {
        return false;
    } else if (numberOfDaysUntilExpiration >= defaultAppValues.upgradeExpirationAlarmTime) {
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
    serviceBoardingSecuring,
    serviceDebrisRemovalTrashout,
    serviceEvictionManagement,
    serviceFieldInspection,
    serviceHandymanGeneralMaintenance,
    serviceLandscapeMaintenance,
    serviceLockChanges,
    serviceOverseePropertyRehabilitation,
    servicePoolMaintenance,
    servicePropertyCleaning,
    serviceWinterizations
    ) {

    if (
        serviceBoardingSecuring === 'yes' ||
        serviceDebrisRemovalTrashout === 'yes' ||
        serviceEvictionManagement === 'yes' ||
        serviceFieldInspection === 'yes' ||
        serviceHandymanGeneralMaintenance === 'yes' ||
        serviceLandscapeMaintenance === 'yes' ||
        serviceLockChanges === 'yes' ||
        serviceOverseePropertyRehabilitation === 'yes' ||
        servicePoolMaintenance === 'yes' ||
        servicePropertyCleaning === 'yes' ||
        serviceWinterizations === 'yes'
    ) return true;

    return false;
}