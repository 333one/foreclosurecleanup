"use strict";

const axios = require('axios');
const bcrypt = require('bcryptjs');
const cryptoRandomString = require('crypto-random-string');
const fetch = require('node-fetch');
const normalizeUrl = require('normalize-url');
const objectHash = require('object-hash');
const path = require('path');

const communication = require('./communication');
const defaultAppValues = require('../models/default-app-values.js');
const defaultMessages = require('../models/default-messages');
const { logErrorMessage, wrapAsync } = require('./error-handling');
const logicMessages = require('./logic-messages');
const mongooseInstance = require('./mongoose-create-instances');

const { 
    FalseEmailConfirmationRequest,
    LoginFailure,
    PasswordResetRequest,
    RecentDeletedAccount,
    RecentPasswordResetLimitReached,
    RecentPasswordResetRequest,
    StripeCheckoutSession,
    UnverifiedUser,
    User
} = require('../models/mongoose-schema');

// Custom path to .env file.
require('dotenv').config({ path: path.join(__dirname, '../models/.env') });

exports.assembleCompanyServices = function (
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

exports.assembleCompanyPropertiesUnfilled = function(isCompanyNameAdded, isCompanyPhoneAdded, isCompanyAddressAdded, isCompanyServicesAdded) {

    let assembledProperties = '';

    if (isCompanyNameAdded === false) {

        let numberOfFollowingServices = 0;
        if (isCompanyPhoneAdded === false) numberOfFollowingServices += 1;
        if (isCompanyAddressAdded === false) numberOfFollowingServices += 1;
        if (isCompanyServicesAdded === false) numberOfFollowingServices += 1;

        if (numberOfFollowingServices === 0 || numberOfFollowingServices >= 2) {
            assembledProperties += `<a href="/add-change-company-name">name</a>, `;
        } else if (numberOfFollowingServices === 1) {
            assembledProperties += `<a href="/add-change-company-name">name</a> and `;
        } 
    }

    if (isCompanyPhoneAdded === false) {

        let numberOfFollowingServices = 0;
        if (isCompanyAddressAdded === false) numberOfFollowingServices += 1;
        if (isCompanyServicesAdded === false) numberOfFollowingServices += 1;

        if (numberOfFollowingServices === 0 || numberOfFollowingServices >= 2) {
            assembledProperties += `<a href="/add-change-company-phone">phone number</a>, `;
        } else if (numberOfFollowingServices === 1) {
            assembledProperties += `<a href="/add-change-company-phone">phone number</a> and `;
        } 
    }

    if (isCompanyAddressAdded === false) {

        let numberOfFollowingServices = 0;
        if (isCompanyServicesAdded === false) numberOfFollowingServices += 1;

        if (numberOfFollowingServices === 0) {
            assembledProperties += `<a href="/add-change-company-address">address</a>, `;
        } else if (numberOfFollowingServices === 1) {
            assembledProperties += `<a href="/add-change-company-address">address</a> and `;
        } 
    }
    
    if (isCompanyServicesAdded === false) assembledProperties += `<a href="/add-change-company-services">services offered</a>, `;

    let trimmedAssembledProperties = assembledProperties.slice(0, -2);

    return trimmedAssembledProperties;
}

exports.cleanCompanyDescription = function(companyDescription) {


    let cleanedCompanyDescription = companyDescription.replace(/<|\/>|>|href=/gi, '');

    return cleanedCompanyDescription;
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

function createNewExpirationDate(upgradeRenewalDate, expirationDate) {

    let newExpirationStartPoint = String(expirationDate) === String(defaultAppValues.freeAccountExpiration) ? new Date(upgradeRenewalDate) : new Date(expirationDate);
    let newExpirationYear = newExpirationStartPoint.getFullYear() + 1;
    newExpirationStartPoint.setFullYear(newExpirationYear);

    return newExpirationStartPoint;
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

exports.formatCompanyPhone = function(companyPhone) {

    let cleanedPhone = companyPhone.replace(/\D/g,'');

    let phonePrefixRemoved;

    if (cleanedPhone.charAt(0) == 0 || cleanedPhone.charAt(0) == 1) {
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

exports.getDeleteAddChange = function(deleteProperty, companyProperty) {

    let deleteAddChange;

    if (deleteProperty === 'true') {
        deleteAddChange = 'delete';
    } else if (companyProperty === '') {
        deleteAddChange = 'add';
    } else {
        deleteAddChange = 'change'
    }

    return deleteAddChange;
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

exports.getCompanyRegionFull = function(companyCity, companyState, companyZip) {
    
    if (companyCity, companyState, companyZip) {
        return `${ companyCity }, ${ companyState } ${ companyZip }`;
    } else {
        return null;
    }
}

exports.getCompanyStreetFull = function(companyStreet, companyStreetTwo) {

    if (companyStreetTwo) {
        return `${ companyStreet }, ${ companyStreetTwo }`;
    } else if (companyStreet) {
        return `${ companyStreet }`;
    } else {
        return null;
    }
}

exports.getNumberOfDaysUntilExpiration = function(expirationDate) {

    let oneDay = 24 * 60 * 60 * 1000;
    let today = new Date();

    let numberOfDays = Math.floor((Date.UTC(expirationDate.getFullYear(), expirationDate.getMonth(), expirationDate.getDate())) - (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))) / oneDay;

    return numberOfDays;
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

function getOrdinal(day) {

    let firstDigit = day % 10;
    let lastDigits = day % 100;

    if (firstDigit == 1 && lastDigits != 11) {
        return day + "st";
    }
    if (firstDigit == 2 && lastDigits != 12) {
        return day + "nd";
    }
    if (firstDigit == 3 && lastDigits != 13) {
        return day + "rd";
    }
    return day + "th";
}

exports.getPremiumExpirationDate = function(expirationDate) {

    let month = expirationDate.toLocaleString('default', { month: 'long' });
    let day = expirationDate.getDate();
    let year = expirationDate.getFullYear();

    let dayWithOrdinal = getOrdinal(day);

    return `${ month } ${ dayWithOrdinal }, ${year}`;
}

exports.incrementExistingPasswordResetOrCreateNew = async function(email, confirmationHash, forward) {

    // Determine if a password reset request already exists.
    let retrievedPasswordResetRequest = await PasswordResetRequest.findOne({ email: email });

    // If a request exists increment numberOfRequests.
    // Create the request whether a real user exists or not.  The upper limit on requests will stop spammers from repeatedly requesting a reset for a non user.
    if (retrievedPasswordResetRequest) {

        // If you've surpassed the maximum number of requests forward to password-reset-limit-reached.
        if (retrievedPasswordResetRequest.numberOfRequests >= defaultAppValues.numberOfPasswordResetRequestsAllowed) {

            return true;
        } else {

            if (forward != "true") await PasswordResetRequest.updateOne({ email: email }, { numberOfRequests: retrievedPasswordResetRequest.numberOfRequests += 1 });
        } 

    // Because the request didn't exist create a new one.
    } else {

        let passwordResetRequest = await mongooseInstance.createPasswordResetRequest(confirmationHash, email);
        await passwordResetRequest.save();
    }
    
    return false;
}

exports.logoutSteps = function(req, res) {

    req.session.destroy( function(error) {

        if (error) {
            res.clearCookie(process.env.SESSION_NAME);
        }
        return res.redirect('/login');
    });
}

exports.makeFieldsEmpty = function(defaultFields) {

    let emptyFields = {};

    defaultFields.forEach(function(element) {
        emptyFields[element] = '';
    });

    return emptyFields;
}

exports.partiallyProcessURL = function(websiteURL) {

    let queryIndex = websiteURL.indexOf('?');
    if (queryIndex === -1) queryIndex = websiteURL.length;
    let noQueriesURL = websiteURL.slice(0, queryIndex);

    // normalizeProtocol: false should stop http:// from being automatically added to the URL but it doesn't seem to work so have to process that separately below.
    let processedURL = normalizeUrl(noQueriesURL, { normalizeProtocol: false, stripWWW: false, stripHash: true, removeDirectoryIndex: [/^default\.[a-z]+$/], removeTrailingSlash: true });

    let didWebsiteURLStartWithProtocol = websiteURL.match(/^http:\/\//) === true ? true : false;
    if (didWebsiteURLStartWithProtocol === false) processedURL = processedURL.slice(7);

    return processedURL;
}

exports.processURL = function(websiteURL) {

    let queryIndex = websiteURL.indexOf('?');
    if (queryIndex === -1) queryIndex = websiteURL.length;
    let noQueriesURL = websiteURL.slice(0, queryIndex);

    let processedURL = normalizeUrl(noQueriesURL, { stripProtocol: true, stripWWW: true, stripHash: true, removeDirectoryIndex: [/^default\.[a-z]+$/], removeTrailingSlash: true });

    return processedURL;
}

exports.removeLoginFailures = async function(email) {

    let doesLoginFailureExist = await LoginFailure.exists({ email: email });

    if (doesLoginFailureExist) {
        await LoginFailure.findOneAndRemove({ email: email });
    }
}

async function saveActiveURL(activeURL, email, req) {

    await User.updateOne({ email: email }, { companyWebsite: activeURL });
    req.session.userValues.companyWebsite = activeURL;
    req.session.save();
}

exports.sendEmailIfNecessary = async function(email, confirmationHash, emailSubject, expirationTime, forward) {

    // If User exists create and send the email
    let retrievedUser = await User.findOne({ email: email });
    
    if (retrievedUser && forward != 'true') {

        let emailBody = defaultMessages.passwordResetRequestEmailBody(defaultAppValues.website, defaultAppValues.companyIcon, defaultAppValues.organization, defaultAppValues.host, confirmationHash, expirationTime);

        communication.sendEmail(email, emailSubject, emailBody);
    }  
}

exports.setCheckInputYesNo = function(checkInputValue) {

    if (checkInputValue === 'yes') return 'yes';
    return 'no';
}

exports.stripeSuccessUpdateDB = async function(eventDataObjectId) {

    // event.data.object.id should be equal to session.payment_intent
    let stripeCheckoutSession = await StripeCheckoutSession.findOne({ paymentIntent: eventDataObjectId });

    // myAccount route uses this value, webhookPremiumUpgrade doesn't need it.
    if (!stripeCheckoutSession) return;

    let { email } = stripeCheckoutSession;

    let { expirationDate } = await User.findOne({ email: email });

    let upgradeRenewalDate = new Date();

    let updatedExpirationDate = createNewExpirationDate(upgradeRenewalDate, expirationDate);

    await User.updateOne({ email: email },
        { companyProfileType: defaultAppValues.accountUpgrade,
            expirationDate: updatedExpirationDate,
            $push: {'upgradeRenewalDates': upgradeRenewalDate } }
    );

    await StripeCheckoutSession.findOneAndRemove({ paymentIntent: eventDataObjectId });
}

async function testIfURLActive(possiblyActiveURL) {

    let axiosResult = false;
    let okResult = new RegExp('OK', 'i');

    await axios.get(possiblyActiveURL)
        .then(function(response) {
            if (String(response.status).includes('2')) axiosResult = true;
            if (response.statusText.match(okResult)) axiosResult = true;
        })
        .catch(function(error) {
            if (error.response !== undefined) axiosResult = true;
        });

    if (axiosResult === true) return true;
    return false;
}

exports.testURLAndResave = async function(partiallyProcessedURL, processedURL, email, req) {

    // try in this order of importance
    let httpsWwwURL = `https://www.${ processedURL }`;
    let httpsURL = `https://${ processedURL }`;
    let httpWwwURL = `http://www.${ processedURL }`;
    let httpURL = `http://${ processedURL }`;

    let isOriginalURLActive = await testIfURLActive(partiallyProcessedURL);
    if (isOriginalURLActive === true) {
        saveActiveURL(partiallyProcessedURL, email, req);
        return;
    }

    let isHttpsWwwURLActive = await testIfURLActive(httpsWwwURL);
    if (isHttpsWwwURLActive === true) {
        saveActiveURL(httpsWwwURL, email, req);
        return;
    }

    let isHttpsURLActive = await testIfURLActive(httpsURL);
    if (isHttpsURLActive === true) {
        saveActiveURL(httpsURL, email, req);
        return;
    }
    
    let isHttpWwwURLActive = await testIfURLActive(httpWwwURL);
    if (isHttpWwwURLActive === true) {
        saveActiveURL(httpWwwURL, email, req);
        return;
    }

    let isHttpURLActive = await testIfURLActive(httpURL);
    if (isHttpURLActive === true) {
        saveActiveURL(httpURL, email, req);
        return;
    }

    await User.updateOne({ email: email }, { URLNotActiveError: true });
    req.session.userValues.URLNotActiveError = true;

    // TODO: I would prefer to use an array but unfortunately any exception thrown in a loop seems to break it.  Check into how to do this later.

}