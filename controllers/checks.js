"use strict";

const zxcvbn = require('zxcvbn');
const phoneNormalizer = require('phone');

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
    // businessStreetTwo is allowed to be empty so delete that.
    delete userProperties.businessStreetTwo;

    let businessServiceProperties = [...defaultFields.addChangeBusinessServices];
    // Remove deleteProperty because it isn't needed for this test.
    businessServiceProperties.pop();

    // If any businessService property is 'no' return false.
    let isAServicePropertyYes = false;
    businessServiceProperties.forEach(function(element) {
        if (userProperties[element] === 'yes') isAServicePropertyYes = true;
    })

    if(isAServicePropertyYes === false) return false;

    // If any property is empty return false.
    for (var key in userProperties) {
        if (userProperties[key] === null && userProperties[key] === undefined && userProperties[key] === "")
            return false;
    }

    return true;
}

exports.checkBusinessAddressNormalized = function(businessStreet, businessStreetTwo, businessCity, businessState, businessZip, normalizedBusinessAddress) {

    if (
        normalizedBusinessAddress.street1 === businessStreet &&
        normalizedBusinessAddress.street2 === businessStreetTwo &&
        normalizedBusinessAddress.city === businessCity &&
        normalizedBusinessAddress.state === businessState &&
        normalizedBusinessAddress.Zip5 === businessZip
    ) return true;

    return false;
}

exports.checkForPreviousErrors = function(emailError, firstNameError, lastNameError, phoneError) {

    if(emailError || firstNameError || lastNameError || phoneError) {
        return true;
    }
    return false;
}

exports.checkIfInputTooLong = function(field, maxLength) {

    return field.length > maxLength ? true : false;
}

exports.checkPasswordMeetsRequirements = function(password) {

    return zxcvbn(password).score >= 2 ? true : false;
}

exports.checkBusinessPhoneValid = function(businessPhone) {

    // If phoneNormalizer returns an empty array it indicates that the phone number is not complete or valid.
    if (phoneNormalizer(businessPhone, '', true).length === 0) return false;
    if (businessPhone.charAt(0) == 0 || businessPhone.charAt(0) == 1) return false;
    return true;
}

exports.checkBusinessStateValid = function(businessState) {

    let states = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
        'DC', ''];

    if (states.includes(businessState)) return true;
    return false;
}

exports.checkBusinessServicesHaveValue = function (
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