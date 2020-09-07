"use strict";

const bcrypt = require('bcryptjs');
const cryptoRandomString = require('crypto-random-string');
const objectHash = require('object-hash');
const path = require('path');
const phoneNormalizer = require('phone');

const communication = require('./communication');
const defaultAppValues = require('../models/default-app-values.js');
const defaultMessages = require('../models/default-messages');
const logicMessages = require('./logic-messages');
const mongooseInstance = require('./mongoose-create-instances');

const { 
    FalseEmailConfirmationRequest,
    LoginFailure,
    PasswordResetRequest,
    RecentDeletedAccount,
    RecentPasswordResetLimitReached,
    RecentPasswordResetRequest,
    UnverifiedUser,
    User
} = require('../models/mongoose-schema');

// Custom path to .env file.
require('dotenv').config({ path: path.join(__dirname, '../models/.env') });

exports.assembleBusinessServices = function (
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

    let assembledServices = '';

    if (serviceBoardingSecuring === 'yes') assembledServices += `${ defaultAppValues.serviceBoardingSecuring }, `;
    if (serviceDebrisRemovalTrashout === 'yes') assembledServices += `${ defaultAppValues.serviceDebrisRemovalTrashout }, `;
    if (serviceEvictionManagement === 'yes') assembledServices += `${ defaultAppValues.serviceEvictionManagement }, `;
    if (serviceFieldInspection === 'yes') assembledServices += `${ defaultAppValues.serviceFieldInspection }, `;
    if (serviceHandymanGeneralMaintenance === 'yes') assembledServices += `${ defaultAppValues.serviceHandymanGeneralMaintenance }, `;
    if (serviceLandscapeMaintenance === 'yes') assembledServices += `${ defaultAppValues.serviceLandscapeMaintenance }, `;
    if (serviceLockChanges === 'yes') assembledServices += `${ defaultAppValues.serviceLockChanges }, `;
    if (serviceOverseePropertyRehabilitation === 'yes') assembledServices += `${ defaultAppValues.serviceOverseePropertyRehabilitation }, `;
    if (servicePoolMaintenance === 'yes') assembledServices += `${ defaultAppValues.servicePoolMaintenance }, `;
    if (servicePropertyCleaning === 'yes') assembledServices += `${ defaultAppValues.servicePropertyCleaning }, `;
    if (serviceWinterizations === 'yes') assembledServices += `${ defaultAppValues.serviceWinterizations }, `;

    // remove the last coma and space.
    let trimmedAssembledServices = assembledServices.slice(0, -2);

    return trimmedAssembledServices;
}

exports.assembleBusinessPropertiesUnfilled = function(isBusinessNameAdded, isBusinessPhoneAdded, isBusinessAddressAdded, isBusinessServicesAdded) {

    let assembledProperties = '';

    if (isBusinessNameAdded === false) {

        let numberOfFollowingServices = 0;
        if(isBusinessPhoneAdded === false) numberOfFollowingServices += 1;
        if(isBusinessAddressAdded === false) numberOfFollowingServices += 1;
        if(isBusinessServicesAdded === false) numberOfFollowingServices += 1;

        if(numberOfFollowingServices === 0 || numberOfFollowingServices >= 2) {
            assembledProperties += `<a href="${ defaultAppValues.linkAddChangeBusinessName }">name</a>, `;
        } else if (numberOfFollowingServices === 1) {
            assembledProperties += `<a href="${ defaultAppValues.linkAddChangeBusinessName }">name</a> and `;
        } 
    }

    if (isBusinessPhoneAdded === false) {

        let numberOfFollowingServices = 0;
        if(isBusinessAddressAdded === false) numberOfFollowingServices += 1;
        if(isBusinessServicesAdded === false) numberOfFollowingServices += 1;

        if(numberOfFollowingServices === 0 || numberOfFollowingServices >= 2) {
            assembledProperties += `<a href="${ defaultAppValues.linkAddChangeBusinessPhone }">phone number</a>, `;
        } else if (numberOfFollowingServices === 1) {
            assembledProperties += `<a href="${ defaultAppValues.linkAddChangeBusinessPhone }">phone number</a> and `;
        } 
    }

    if (isBusinessAddressAdded === false) {

        let numberOfFollowingServices = 0;
        if(isBusinessServicesAdded === false) numberOfFollowingServices += 1;

        if(numberOfFollowingServices === 0) {
            assembledProperties += `<a href="${ defaultAppValues.linkAddChangeBusinessAddress }">address</a>, `;
        } else if (numberOfFollowingServices === 1) {
            assembledProperties += `<a href="${ defaultAppValues.linkAddChangeBusinessAddress }">address</a> and `;
        } 
    }
    
    if (isBusinessServicesAdded === false) assembledProperties += `<a href="${ defaultAppValues.linkAddChangeBusinessServices }">services offered</a>, `;

    let trimmedAssembledProperties = assembledProperties.slice(0, -2);

    return trimmedAssembledProperties;
}

exports.cleanFields = function(defaultFields, reqBody) {

    //TODO: remove all characters over the maximum number of characters for each field.

    let isReqBodyKeyGenuine;
    let wereAllKeysGenuine;

    // This checks to see if the keys on req.body are different from those in the form.
    // If a key is fake the value false is stored and that key is deleted from req.body.
    for(let property in reqBody) {
        isReqBodyKeyGenuine = defaultFields.includes(property);
        if (isReqBodyKeyGenuine === false) {
            delete reqBody[property];
            wereAllKeysGenuine = false;
        }
    }

    let isReqBodyKeyDuplicate;
    let wereThereDuplicateKeys;

    // This checks to see that no key was sent twice.  This can happen if a client finds a way to name 2 fields the same name.
    for(let property in reqBody) {
        isReqBodyKeyDuplicate = Array.isArray(reqBody[property]);
        if (isReqBodyKeyDuplicate === true) {
            delete reqBody[property];
            wereThereDuplicateKeys = true;
        }
    }

    // If a key was not included in req.body add the key with a value of empty string ''.
    defaultFields.forEach(function(element) {
        reqBody[element] = reqBody[element] || '';
    });

    // If there were any fake or duplicate keys the value of every property is changed to an empty string to eliminate the possibility of malicious data.
    if (wereAllKeysGenuine === false || wereThereDuplicateKeys === true) {
        for(let property in reqBody) {
            reqBody[property] = '';
        }

        //TODO: If the user is logged in log them out and send them to the home page.
        
    }

    // Trim white space from each property.
    for(let property in reqBody) {
        reqBody[property] = reqBody[property].trim();
    }

    return reqBody;
}

function filterOnlyOneAllowed(string, character) {

    let first = true;

    return string.replace(new RegExp(character, 'g'), function(value) {
        if (first) {
            first = false;
            return value;
        }
        return '';
    });
}

exports.formatName = function(name) {

    let onlyOneSpace = filterOnlyOneAllowed(name, ' ')
    let upperCased = onlyOneSpace.charAt(0).toUpperCase() + onlyOneSpace.slice(1) || '';
    let nameArray = upperCased.split('');

    let formattedArray = nameArray.map(function(element, index, array) {

        return array[index - 1] === ' ' ? element.toUpperCase() : element;
    });

    return formattedArray.join('');
}

exports.formatBusinessPhone = function(businessPhone) {

    let cleanedPhone = businessPhone.replace(/\D/g,'');

    let phonePrefixRemoved;

    if(cleanedPhone.charAt(0) == 0 || cleanedPhone.charAt(0) == 1) {
        phonePrefixRemoved = cleanedPhone.slice(1);
    } else {
        phonePrefixRemoved = cleanedPhone;
    }

    if (phonePrefixRemoved.length < 4) {
        return phonePrefixRemoved.slice(0, 3);
    }

    if (phonePrefixRemoved.length < 7) {
        return phonePrefixRemoved.slice(0, 3) + '-' + phonePrefixRemoved.slice(3);
    }

    return phonePrefixRemoved.slice(0, 3) + '-' + phonePrefixRemoved.slice(3, 6) + '-' + phonePrefixRemoved.slice(6);
}

exports.hashPassword = function(password) {

    return new Promise( function(resolve, reject) {
        bcrypt.genSalt(10, function(error, salt) {
            bcrypt.hash(password, salt, function(error, hash) {
                if (error) {
                    reject(error);
                }
                resolve(hash);
            });
        });
    });
}

exports.getBusinessRegionFull = function(businessCity, businessState, businessZip) {
    
    if(businessCity, businessState, businessZip) {
        return `${ businessCity }, ${ businessState } ${ businessZip }`;
    } else {
        return null;
    }
}

exports.getBusinessStreetFull = function(businessStreet, businessStreetTwo) {

    if(businessStreetTwo) {
        return `${ businessStreet }, ${ businessStreetTwo }`;
    } else if(businessStreet) {
        return `${ businessStreet }`;
    } else {
        return null;
    }
}

exports.getOrCreateConfirmationHash = async function(email) {

    // Determine if a password reset request already exists.
    let retrievedPasswordResetRequest = await PasswordResetRequest.findOne({ email: email });

    if (retrievedPasswordResetRequest) {
        return retrievedPasswordResetRequest.confirmationHash;
    }

    let salt = cryptoRandomString({ length: 16 });
    let confirmationHash = objectHash(email + salt);
    return confirmationHash;
}

exports.incrementExistingPasswordResetOrCreateNew = async function(email, confirmationHash, forward) {

    // Determine if a password reset request already exists.
    let retrievedPasswordResetRequest = await PasswordResetRequest.findOne({ email: email });

    // If a request exists increment numberOfRequests.
    // Create the request whether a real user exists or not.  The upper limit on requests will stop spammers from repeatedly requesting a reset for a non user.
    if(retrievedPasswordResetRequest) {

        // If you've surpassed the maximum number of requests forward to password-reset-limit-reached.
        if(retrievedPasswordResetRequest.numberOfRequests >= defaultAppValues.numberOfPasswordResetRequestsAllowed) {

            return true;
        } else {

            if(forward != "true") await PasswordResetRequest.updateOne({ email: email }, { numberOfRequests: retrievedPasswordResetRequest.numberOfRequests += 1 });
        } 

    // Because the request didn't exist create a new one.
    } else {

        let passwordResetRequest = await mongooseInstance.createPasswordResetRequest(email, confirmationHash);
        await passwordResetRequest.save();
    }
    
    return false;
}

exports.sendEmailIfNecessary = async function(email, confirmationHash, emailSubject, expirationTime, forward) {

    // If User exists create and send the email
    let retrievedUser = await User.findOne({ email: email });
    
    if(retrievedUser && forward != 'true') {

        let emailBody = defaultMessages.passwordResetRequestEmailBody(process.env.WEBSITE, process.env.COMPANYICON, process.env.ORGANIZATION, process.env.HOST, confirmationHash, expirationTime);

        communication.sendEmail(email, emailSubject, emailBody);
    }  
}

exports.setCheckInputYesNo = function(checkInputValue) {

    if (checkInputValue === 'yes') return 'yes';
    return 'no';
}

exports.makeFieldsEmpty = function(defaultFields) {

    let emptyFields = {};

    defaultFields.forEach(function(element) {
        emptyFields[element] = '';
    });

    return emptyFields;
}

exports.removeLoginFailures = async function(email) {

    let doesLoginFailureExist = await LoginFailure.exists({ email: email });

    if(doesLoginFailureExist) {
        await LoginFailure.findOneAndRemove({ email: email });
    }
}

exports.wrapAsync = function(fn) {
    return function(req, res, next) {
        fn(req, res, next).catch(next);
    }
}