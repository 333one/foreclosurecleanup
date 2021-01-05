const checks = require('./checks');
const defaultValue = require('../models/default-values');

exports.addMissingServicesToSubmission = function(submission) {

    let { listOfCompanyServices } = defaultValue;

    for (const element of listOfCompanyServices) {

        if (!submission.hasOwnProperty(element)) {
            submission[element] = 'false';
        }

    }

    return submission;

}

exports.cleanForm = function(defaultFormFields, reqBody) {

    // This function is used at the beginning of every POST request to deal with the submission of sloppy, erroneous or malicious data.

    // Trim white space from each property.
    let trimmedReqBody = {};
    for (const key in reqBody) {

        if (typeof reqBody[key] === 'string') {
            trimmedReqBody[key] = reqBody[key].trim();
        }
        
    }

    let wereAllKeysPresent = checks.checkIfAllContentSubmitted(defaultFormFields, trimmedReqBody);
    let wereAllKeysGenuine = checks.checkIfAllContentGenuine(defaultFormFields, trimmedReqBody);
    let isDeletePropertyCorrectlySet = checks.checkIfDeletePropertyCorrectlySet(trimmedReqBody);

    // If anything was wrong with the submission a new, empty, clean object is returned to eliminate the possibility of malicious data.
    if (wereAllKeysPresent === false || wereAllKeysGenuine === false || isDeletePropertyCorrectlySet === false) {
        return createCleanEmptySubmission(defaultFormFields);
    }

    return trimmedReqBody;

}

exports.cleanQuery = function(defaultRequestFields, reqQuery) {

    let wereAllFieldsPresent = checks.checkIfAllContentSubmitted(defaultRequestFields, reqQuery);
    let wereAllFieldsGenuine = checks.checkIfAllContentGenuine(defaultRequestFields, reqQuery);

    // If anything was wrong with the submission a new, empty, clean object is returned to eliminate the possibility of malicious data.
    if (wereAllFieldsPresent === false || wereAllFieldsGenuine === false) {
        return createCleanEmptySubmission(defaultRequestFields);
    }

    return reqQuery;

}

exports.convertCheckboxToBoolean = function(checkInputValue) {

    if (checkInputValue === 'isChecked') return true;
    return false;

}

exports.makeFieldsEmpty = function(formFields) {

    let emptyFields = {};

    formFields.forEach(function(element) {
        emptyFields[element] = '';
    });

    return emptyFields;

}

function createCleanEmptySubmission(defaultSubmissionFields) {

    let cleanEmptyRequest = {};
    for (const value of defaultSubmissionFields) {
        cleanEmptyRequest[value] = '';
    }
    
    return cleanEmptyRequest;

};