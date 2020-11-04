"use strict";

const axios = require('axios');
const bcrypt = require('bcryptjs');
const cryptoRandomString = require('crypto-random-string');
const normalizeUrl = require('normalize-url');
const objectHash = require('object-hash');
const path = require('path');

const communication = require('./communication');
const defaultMessage = require('../models/default-messages');
const defaultValue = require('../models/default-values');
const emailMessage = require('../models/email-messages');
const logoutSteps = require('./logout-steps');
const mongooseInstance = require('./mongoose-create-instances');
const regExpValue = require('../models/regexp-values');
const renderValue = require('../models/rendering-values');
const timeValue = require('../models/time-values');

const { 
    LoginFailure,
    PasswordResetRequest,
    StripeCheckoutSession,
    User
} = require('../models/mongoose-schema');

// Custom path to .env file.
require('dotenv').config({ path: path.join(__dirname, '../models/.env') });

exports.addCompanyServices = function(formFields, userValues) {

    let serviceProperties = {};

    formFields.forEach(function(element) {
        serviceProperties[element] = userValues[element];
    });

    return serviceProperties;

}

exports.assembleCompanyServices = function (
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

    let parameterObject = {
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
    }

    let assembledServices = '';

    for (const element in parameterObject) {
        if (parameterObject[element] === true) assembledServices += `${ renderValue[element] }, `;
    }

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

    let regExpRemoveCode = new RegExp(regExpValue.removeCode, 'gi');
    let cleanedCompanyDescription = companyDescription.replace(regExpRemoveCode, '');

    return cleanedCompanyDescription;
    
}

exports.cleanFields = function(formFields, reqBody) {

    //TODO: remove all characters over the maximum number of characters for each field.

    // This checks to see if the keys on req.body are different from those in the form.
    // If a key is fake the value false is stored and that key is deleted from req.body.
    for (const element in reqBody) {

        var isReqBodyKeyGenuine = formFields.includes(element);

        if (isReqBodyKeyGenuine === false) {

            delete reqBody[element];
            var wereAllKeysGenuine = false;

        }

    }

    // This checks to see that no key was sent twice.  This can happen if a client finds a way to give 2 fields the same name.
    for (const element in reqBody) {

        var isReqBodyKeyDuplicate = Array.isArray(reqBody[element]);

        if (isReqBodyKeyDuplicate === true) {

            delete reqBody[element];
            var wereThereDuplicateKeys = true;

        }

    }

    // If a key was not included in req.body add the key with a value of empty string ''.
    formFields.forEach(function(element) {
        reqBody[element] = reqBody[element] || '';
    });

    // If there were any fake or duplicate keys the value of every property is changed to an empty string to eliminate the possibility of malicious data.
    if (wereAllKeysGenuine === false || wereThereDuplicateKeys === true) {

        for (const element in reqBody) {
            reqBody[element] = '';
        }
        
    }

    // Trim white space from each property.
    for (const element in reqBody) {
        reqBody[element] = reqBody[element].trim();
    }

    return reqBody;

}

exports.convertCheckboxToBoolean = function(checkInputValue) {

    if (checkInputValue === 'isChecked') return true;
    return false;

}

exports.convertBooleanToString = function(inputFields) {

    let serviceProperties = {};

    for (const element in inputFields) {

        if (inputFields[element] === true) {
            serviceProperties[element] = 'true';
        } else if (inputFields[element] === false) {
            serviceProperties[element] = 'false';
        }

    };

    return serviceProperties;

}

exports.convertStringToBoolean = function(companyServicesArray, inputFields) {

    let serviceProperties = {};

    companyServicesArray.forEach( function(element) {

        if (inputFields[element] === 'true') {
            serviceProperties[element] = true;
        } else {
            serviceProperties[element] = false;
        }
        
    });

    return serviceProperties;

}

exports.createConfirmationHash = function(email) {

    let salt = cryptoRandomString({ length: 16 });
    let confirmationHash = objectHash(email + salt);
    
    return confirmationHash;
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

exports.formatURL = function(companyWebsite) {

    // This removes trailing slashes and default.php.  # has already been disallowed by a test before this.
    let formattedURL = normalizeUrl(companyWebsite, { stripWWW: false, removeDirectoryIndex: [regExpValue.directoryIndex], removeTrailingSlash: true });

    // If no protocol is present normalizeURL adds an http.  Remove http if user didn't include it originally.
    let regExpHttp = new RegExp(regExpValue.httpProtocol, 'i');
    let regExpHttps = new RegExp(regExpValue.httpsProtocol, 'i');

    let didCompanyWebsiteStartWithHttp = regExpHttp.test(companyWebsite) === true ? true : false;
    let didCompanyWebsiteStartWithHttps = regExpHttps.test(companyWebsite) === true ? true : false;

    if (didCompanyWebsiteStartWithHttp === false) {

        if (didCompanyWebsiteStartWithHttps === false) {
            formattedURL = formattedURL.slice(7);
        }

    }

    return formattedURL;

}

exports.testFormattedURLAndSave = async function(formattedURL, email) {

    // If a protocol isn't present this adds the http and doesn't strip the www if it exists.
    let normalizedURL = normalizeUrl(formattedURL, { stripWWW: false });

    // For testing purposes check an http:// and https:// version.  The following block of code sets that up.
    let regExpHttp = new RegExp(regExpValue.httpProtocol, 'i');
    let regExpHttps = new RegExp(regExpValue.httpsProtocol, 'i');

    let doesNormalizedURLStartWithHttp = regExpHttp.test(normalizedURL) === true ? true : false;
    let doesNormalizedURLStartWithHttps = regExpHttps.test(normalizedURL) === true ? true : false;

    let httpVersion, httpsVersion;

    if (doesNormalizedURLStartWithHttp === true) {

        httpVersion = normalizedURL;
        httpsVersion = 'https://' + normalizedURL.slice(7);

    }

    if (doesNormalizedURLStartWithHttps === true) {

        httpsVersion = normalizedURL;
        httpVersion = 'http://' + normalizedURL.slice(8);

    }

    // If the URL works on http or https the DB is updated and it returns.
    let isHttpsURLActive = await testIfURLActive(httpsVersion);  
    if (isHttpsURLActive === true) return;
    
    let isHttpURLActive = await testIfURLActive(httpVersion);
    if (isHttpURLActive === true) return;

    // No version of the website worked.  Save to the DB, send the user an email and return.
    await User.updateOne({ email }, { urlNotActiveError: true, shouldBrowserFocusOnURLNotActiveError: true });

    let emailSubject = emailMessage.urlNotActiveSubject;
    let emailBody = emailMessage.urlNotActiveBody(formattedURL);
    communication.sendEmail(email, emailSubject, emailBody);

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
    let retrievedPasswordResetRequest = await PasswordResetRequest.findOne({ email });

    if (retrievedPasswordResetRequest) {
        return retrievedPasswordResetRequest.confirmationHash;
    }

    let salt = cryptoRandomString({ length: 16 });
    let confirmationHash = objectHash(email + salt);
    return confirmationHash;
}

exports.getPremiumExpirationDate = function(expirationDate) {

    let month = expirationDate.toLocaleString('default', { month: 'long' });
    let day = expirationDate.getDate();
    let year = expirationDate.getFullYear();

    let dayWithOrdinal = getOrdinal(day);

    return `${ month } ${ dayWithOrdinal }, ${year}`;
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

exports.incrementExistingPasswordResetOrCreateNew = async function(email, confirmationHash, forward) {

    // Determine if a password reset request already exists.
    let retrievedPasswordResetRequest = await PasswordResetRequest.findOne({ email });

    // If a request exists increment numberOfRequests.
    // Create the request whether a real user exists or not.  The upper limit on requests will stop spammers from repeatedly requesting a reset for a non user.
    if (retrievedPasswordResetRequest) {

        // If you've surpassed the maximum number of requests forward to password-reset-limit-reached.
        if (retrievedPasswordResetRequest.numberOfRequests >= defaultValue.numberOfPasswordResetRequestsAllowed) {

            return true;
        } else {

            if (forward != "true") await PasswordResetRequest.updateOne({ email }, { numberOfRequests: retrievedPasswordResetRequest.numberOfRequests += 1 });
        } 

    // Because the request didn't exist create a new one.
    } else {

        let passwordResetRequest = await mongooseInstance.createPasswordResetRequest(confirmationHash, email);
        await passwordResetRequest.save();
    }
    
    return false;
}

// exports.logoutSteps = function(req, res) {

//     req.session.destroy( function(error) {

//         if (error) res.clearCookie(process.env.SESSION_NAME);
//         return res.redirect('/login');

//     });

// }

// exports.logoutStepsNoRedirect = function(req, res) {

//     req.session.destroy( function(error) {
//         if (error) res.clearCookie(process.env.SESSION_NAME);
//     });

// }

exports.makeFieldsEmpty = function(formFields, empty = '') {

    let emptyFields = {};

    formFields.forEach(function(element) {
        emptyFields[element] = empty;
    });

    return emptyFields;

}

exports.processCompanyDescription = function(companyDescription) {

    // Add punctuation if needed before you test for max length.
    let companyDescriptionLength = companyDescription.length;

    let isPunctuationAtEndOfCompanyDescription = 
    companyDescription.charAt(companyDescriptionLength -1) === '.' ||
    companyDescription.charAt(companyDescriptionLength -1) === '!' ||
    companyDescription.charAt(companyDescriptionLength -1) === '?' 
    ? true : false;

    if (
        isPunctuationAtEndOfCompanyDescription === false
        ) {
        companyDescription = companyDescription + '.';
    }

    let capitalizedCompanyDescription = companyDescription.charAt(0).toUpperCase() + companyDescription.slice(1);

    return capitalizedCompanyDescription;

}

exports.sendEmailIfNecessary = async function(email, confirmationHash, emailSubject, expirationTime, forward) {

    // If User exists create and send the email
    let retrievedUser = await User.findOne({ email });
    
    if (retrievedUser && forward != 'true') {

        let emailBody = emailMessage.passwordResetRequestEmailBody(confirmationHash, expirationTime);

        communication.sendEmail(email, emailSubject, emailBody);
    }  
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

async function saveActiveURL(activeURL, email, req) {

    await User.updateOne({ email }, { companyWebsite: activeURL });
    req.session.userValues.companyWebsite = activeURL;
    req.session.save();

}

async function testIfURLActive(possiblyActiveURL) {

    let axiosResult = false;
    let okResult = new RegExp('OK', 'i');

    await axios.get(possiblyActiveURL)
        .then(function(response) {

            let doesResponseInclude2 = String(response.status).includes('2');
            let doesResponseIncludeOk = okResult.test(response.statusText); 

            if (doesResponseInclude2 === true || doesResponseIncludeOk === true) axiosResult = true;

        })
        .catch(function(error) {
            if (error.response !== undefined) axiosResult = true;
        });

    if (axiosResult === true) return true;

    return false;

}