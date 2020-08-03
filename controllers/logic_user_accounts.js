"use strict";

const bcrypt = require('bcryptjs');
const cryptoRandomString = require('crypto-random-string');
const objectHash = require('object-hash');
const path = require('path');
const phoneNormalizer = require('phone');

const communication = require('./communication');
const defaultAppValues = require('../models/default_app_values.js');
const defaultMessages = require('../models/default_messages');
const logicMessages = require('./logic_messages');
const mongooseInstance = require('./mongoose_create_instances');

const { 
    FalseEmailConfirmationRequest,
    LoginFailure,
    PasswordResetRequest,
    RecentDeletedAccount,
    RecentPasswordResetLimitReached,
    RecentPasswordResetRequest,
    UnverifiedUser,
    User
} = require('../models/mongoose_schema');

// Custom path to .env file.
require('dotenv').config({ path: path.join(__dirname, '../models/.env') });

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

        // If you've surpassed the maximum number of requests forward to password_reset_limit_reached.
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

        let emailBody = defaultMessages.passwordResetRequestEmailBody(process.env.WEBSITE, process.env.ORGANIZATION, process.env.HOST, confirmationHash, expirationTime);

        communication.sendEmail(email, emailSubject, emailBody);
    }  
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