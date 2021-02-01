const readChunk = require('read-chunk');
const isJpg = require('is-jpg');
const isPng = require('is-png');

const phoneNormalizer = require('phone');
const zxcvbn = require('zxcvbn');

const defaultValue = require('../models/default-values');
const formFields = require('../models/forms-default-fields');
const timeValue = require('../models/time-values');
const { getCompanyServicesFromUserValues } = require('./logic-user-accounts');

exports.checkAreAllAccountPropertiesFilled = function(sessionUserValues, currentProperty) {

    let userProperties = JSON.parse(JSON.stringify(sessionUserValues));

    // The current property has a value or you wouldn't get here.  However this property hasn't been updated on the session yet so it is allowed to be empty at this point.  Check the other properties required to be live, not counting services.  If anything is empty return false.
    if (currentProperty === 'companyAddress') {

        if (
            userProperties.companyName === '' ||
            userProperties.companyPhone === ''
            ) return false;

    } else if (currentProperty === 'companyName') {

        if (
            userProperties.companyPhone === '' ||
            userProperties.companyCity === '' ||
            userProperties.companyState === '' ||
            userProperties.companyStreet === '' ||
            userProperties.companyZipCode === '' 
            ) return false;
    
    } else if (currentProperty === 'companyPhone') {

        if (
            userProperties.companyName === '' ||
            userProperties.companyCity === '' ||
            userProperties.companyState === '' ||
            userProperties.companyStreet === '' ||
            userProperties.companyZipCode === '' 
            ) return false;

    } else if (currentProperty === 'companyServices') {

        if (
            userProperties.companyName === '' ||
            userProperties.companyPhone === '' ||
            userProperties.companyCity === '' ||
            userProperties.companyState === '' ||
            userProperties.companyStreet === '' ||
            userProperties.companyZipCode === '' 
            ) return false;

    }

    // Company services have to be checked separately.  If you've gotten this far without returning false every other property has a value.
    if (currentProperty !== 'companyServices') {

        let companyServiceProperties = [...formFields.addChangeCompanyServices];

        // Remove deleteProperty because it isn't needed for this test.
        let indexOfDeleteProperty = companyServiceProperties.indexOf('deleteProperty');
        companyServiceProperties.splice(indexOfDeleteProperty, 1);

        for (var element of companyServiceProperties) {

            if (userProperties[element] === true) return true;
    
        }

        return false;

    }

    // If currentProperty === companyServices and every other property had a value you'll get here.  For other properties the boolean is determined in the block above.
    return true;

}

exports.checkDoAnyCompanyServicesHaveValue = function (
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

    for (const value of arguments) {
        if (value === true) return true;
    }

    return false;

}

exports.checkIfAllContentGenuine = function(defaultSubmissionFields, request) {

    let isKeyGenuine;
    for (const key in request) {

        isKeyGenuine = defaultSubmissionFields.includes(key);
        if (isKeyGenuine === false) return false;

    }

    return true;

}

exports.checkIfAllContentSubmitted = function(defaultSubmissionFields, request) {

    for (const value of defaultSubmissionFields) {

        if (request.hasOwnProperty(value) === false) {
            return false;
        }

    }

    return true;

}

exports.checkIfAtLeastOneCompanyServiceFilled = function(cleanedFormWithBoolean) {

    let listOfCompanyServices = defaultValue.listOfCompanyServices;

    for (const value of listOfCompanyServices) {
        if (cleanedFormWithBoolean[value] === true) return true;
    }

    return false;

};

exports.checkIfCompanyAddressNormalized = function(
    companyStreet,
    companyStreetTwo,
    companyCity,
    companyState,
    companyZip,
    normalizedCompanyAddress
    ) {

    if (
        normalizedCompanyAddress.street1 === companyStreet &&
        normalizedCompanyAddress.street2 === companyStreetTwo &&
        normalizedCompanyAddress.city === companyCity &&
        normalizedCompanyAddress.state === companyState &&
        normalizedCompanyAddress.Zip5 === companyZip
    ) return true;

    return false;
    
}

exports.checkIfCompanyPhoneValid = function(companyPhone) {

    // If phoneNormalizer returns an empty array it indicates that the phone number is not complete or valid.
    if (phoneNormalizer(companyPhone, '', true).length === 0) return false;

    // A real phone number in the correct format can't start with a 0 or 1.
    if (companyPhone.charAt(0) == 0 || companyPhone.charAt(0) == 1) return false;

    return true;
    
}

exports.checkIfCompanyServicesUnchanged = function(reqSessionUserValues, listOfServicesObject) {

    for (const key in listOfServicesObject) {
        if (listOfServicesObject[key] !== reqSessionUserValues[key]) return false;
    }

    return true;

}

exports.checkIfCompanyStateValid = function(companyState) {

    let states = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
        'DC', ''];

    let wasStateValid = states.includes(companyState);

    if (wasStateValid === true) return true;
    
    return false;

}

exports.checkIfDeletePropertyCorrectlySet = function(reqBody) {

    // deleteProperty is used in many routes.  If it is present make sure the value is either true or empty string.
    if (reqBody.deleteProperty) {

        if (reqBody.deleteProperty === 'true' || reqBody.deleteProperty === 'false') {

            return true;

        } else {

            return false;

        }

    }

    return true;

}

exports.checkIfVendorLogoFileIsImage = function(filename, vendorLogoUploadFolder) {

    let linkToImage = `${ vendorLogoUploadFolder }${ filename }`;

    let imageBufferJpg = readChunk.sync(linkToImage, 0, 3);
    let imageBufferPng = readChunk.sync(linkToImage, 0, 8);

    let isImageJpg = isJpg(imageBufferJpg);
    let isImagePng = isPng(imageBufferPng);

    if (isImageJpg === true || isImagePng === true) {

        return true;

    } else {

        return false;

    }

}

exports.checkIfVendorLogoFileSizeUnderLimit = function(size, maxVendorLogoUploadFileSize) {

    let isFileSizeUnderLimit = size < maxVendorLogoUploadFileSize ? true : false;

    return isFileSizeUnderLimit;

}

exports.checkIfVendorLogoMimeTypeValid = function(mimeType, vendorLogoValidMimeTypes) {

    let isMimeTypeValid = vendorLogoValidMimeTypes.includes(mimeType);

    return isMimeTypeValid;

}

exports.checkIfVendorLogoReqFieldsValid = function(reqBody, reqFile, addChangeCompanyLogo) {

    let isNumberOfBodyKeysValid = Object.keys(reqBody).length === 1 ? true : false;
    let isNumberOfFileKeysValid = Object.keys(reqFile).length >= 1 ? true : false;

    // This checks to see if deleteProperty is in the request.
    for (const key in reqBody) {
        var isTextFieldNameValid = addChangeCompanyLogo.includes(key);
    }

    // This checks to see if the file was submitted is in the request.
    let isImageFieldNameValid = addChangeCompanyLogo.includes(reqFile.fieldname);

    if (
        isNumberOfBodyKeysValid === true &&
        isNumberOfFileKeysValid === true &&
        isTextFieldNameValid === true &&
        isImageFieldNameValid === true
        ) {

        return true;

    } else {

        return false;

    }

}

exports.checkIfPasswordMeetsRequirements = function(password) {

    let didPasswordMeetRequirements = zxcvbn(password).score >= 2;

    if (didPasswordMeetRequirements === true) return true;

    return false;

}

exports.checkIfServiceValuesValid = function(cleanedSubmission) {

    let listOfCompanyServices = defaultValue.listOfCompanyServices;

    for (const value of listOfCompanyServices) {
        if (cleanedSubmission[value] !== true && cleanedSubmission[value] !== false) return false;
    }

    return true;

}

exports.checkIfUpgradeExpirationSoon = function(numberOfDaysUntilExpiration) {

    // A negative number indicates this is a free account.
    if (numberOfDaysUntilExpiration < 0) return false;
    if (numberOfDaysUntilExpiration > timeValue.firstAlertBeforeExpiration) return false;

    return true;
    
}

exports.checkWereCompanyServicesAdded = function(companyServices, userValues) {

    // If any value is true that means a service already existed and the change is an update, not an add.
    for (const value of companyServices) {
        if (userValues[value] === true) return false;
    }

    return true;

};