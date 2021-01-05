const axios = require('axios');
const bcrypt = require('bcryptjs');
const cryptoRandomString = require('crypto-random-string');
const normalizeUrl = require('normalize-url');
const objectHash = require('object-hash');

const communication = require('./communication');
const emailMessage = require('../models/email-messages');
const regExpValue = require('../models/regexp-values');
const renderValue = require('../models/rendering-values');
const siteValue = require('../models/site-values')
const timeValue = require('../models/time-values');

const { User } = require('../models/mongoose-schema');

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

    let propertyObject = {
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

    for (const element in propertyObject) {
        if (propertyObject[element] === true) assembledServices += `${ renderValue[element] }, `;
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

exports.createRandomHash = function(stringSeed) {

    let salt = cryptoRandomString({ length: 16 });
    let hash = objectHash(stringSeed + salt);
    
    return hash;

}

exports.createNewExpirationDate = function(todaysDate, currentExpirationDate) {

    // For a free account use new Date() for the start date.  For a Premium account use the previous expiration date.
    let newExpirationDate = String(currentExpirationDate) === String(timeValue.freeAccountExpiration) ? new Date(todaysDate) : new Date(currentExpirationDate);

    let newExpirationYear = newExpirationDate.getFullYear() + 1;
    newExpirationDate.setFullYear(newExpirationYear);

    return newExpirationDate;
    
}

exports.formatCompanyDescription = function(companyDescription) {

    // Add punctuation if needed before max length is tested.
    let companyDescriptionLength = companyDescription.length;

    let isPunctuationAtEndOfCompanyDescription = 
        companyDescription.charAt(companyDescriptionLength -1) === '.' ||
        companyDescription.charAt(companyDescriptionLength -1) === '!' ||
        companyDescription.charAt(companyDescriptionLength -1) === '?' 
        ? true : false;

    if (isPunctuationAtEndOfCompanyDescription === false) companyDescription = companyDescription + '.';

    let capitalizedCompanyDescription = companyDescription.charAt(0).toUpperCase() + companyDescription.slice(1);

    return capitalizedCompanyDescription;

}

exports.formatCompanyPhone = function(companyPhone) {

    let regExpPhone = new RegExp(regExpValue.anyNonNumberCharacter, 'g');
    let cleanedPhone = companyPhone.replace(regExpPhone,'');

    // Remove the phone prefix if it exists.
    let phonePrefixRemoved;
    if (cleanedPhone.charAt(0) == 0 || cleanedPhone.charAt(0) == 1) {

        phonePrefixRemoved = cleanedPhone.slice(1);

    } else {

        phonePrefixRemoved = cleanedPhone;

    }

    // Send it back formatted if its short.
    if (phonePrefixRemoved.length < 4) {

        return phonePrefixRemoved.slice(0, 3);

    }

    // Send it back formatted if its short.
    if (phonePrefixRemoved.length < 7) {

        return phonePrefixRemoved.slice(0, 3) + '-' + phonePrefixRemoved.slice(3);

    }

    // Send it back formatted.  This may or may not be short.
    let formattedPhone = phonePrefixRemoved.slice(0, 3) + '-' + phonePrefixRemoved.slice(3, 6) + '-' + phonePrefixRemoved.slice(6);

    return formattedPhone;

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

exports.getCompanyServicesFromUserValues = function(formFields, userValues) {

    let companyServiceProperties = {};

    formFields.forEach(function(element) {
        companyServiceProperties[element] = userValues[element];
    });

    return companyServiceProperties;

}

exports.getNumberOfDaysUntilExpiration = function(expirationDate) {

    let oneDay = 24 * 60 * 60 * 1000;
    let today = new Date();

    let expirationDateMilliseconds = Date.UTC(expirationDate.getFullYear(), expirationDate.getMonth(), expirationDate.getDate(), expirationDate.getHours(), expirationDate.getMinutes());
    let todaysDateMilliseconds = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), today.getMinutes());

    let numberOfDaysUntilExpiration = Math.round(Math.floor(expirationDateMilliseconds - todaysDateMilliseconds) / oneDay);

    return numberOfDaysUntilExpiration;

}

exports.getPremiumExpirationDateString = function(expirationDate) {

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

                if (error) reject(error);
                resolve(hash);

            });

        });

    });

}

exports.setReqSessionUserValuesServices = function(reqSessionUserValues, listOfServicesObject) {

    for (const key in listOfServicesObject) {
        reqSessionUserValues[key] = listOfServicesObject[key];
    }

    return reqSessionUserValues;

};

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

    // If the URL works on http or https it returns.
    let isHttpsURLActive = await testIfURLActive(httpsVersion);  
    if (isHttpsURLActive === true) return;
    
    let isHttpURLActive = await testIfURLActive(httpVersion);
    if (isHttpURLActive === true) return;

    // Get the user and make sure the website still holds a value.  The client may have quickly deleted their value before this check was complete.
    let user = await User.findOne({ email });

    if (user.companyWebsite !== '') {

        // No version of the website worked.  Save to the DB, send the user an email and return.
        await User.updateOne({ email }, { urlNotActiveError: true, shouldBrowserFocusOnURLNotActiveError: true });

        let emailSubject = emailMessage.urlNotActiveSubject;
        let emailBody = emailMessage.urlNotActiveBody(formattedURL);
        communication.sendEmail(siteValue.noReplyEmail, email, emailSubject, emailBody);

    }

}

function getOrdinal(day) {

    let remainder = day % 10;

    if (remainder === 1 && day !== 11) {
        return day + "st";
    }

    if (remainder === 2 && day !== 12) {
        return day + "nd";
    }

    if (remainder === 3 && day !== 13) {
        return day + "rd";
    }

    return day + "th";

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