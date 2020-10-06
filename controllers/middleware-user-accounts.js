"use strict";

const bcrypt = require('bcryptjs');
const cryptoRandomString = require('crypto-random-string');
const emailValidator = require('email-validator');
const Filter = require('bad-words');
const objectHash = require('object-hash');
const path = require('path');
const USPS = require('usps-webtools-promise').default;
const validator = require('validator');

require('dotenv').config({ path: path.join(__dirname, '../models/.env') });

const checks = require('./checks');
const communication = require('./communication');
const defaultMessage = require('../models/messages-default');
const defaultValue = require('../models/values-default');
const emailMessage = require('../models/messages-email');
const errorMessage = require('../models/messages-error');
const formFields = require('../models/values-form-fields');
const logicUserAccounts = require('./logic-user-accounts');
const mongooseInstance = require('./mongoose-create-instances');
const regexpValue = require('../models/values-messages-regexp');
const renderValue = require('../models/values-rendering');
const siteValue = require('../models/values-site');
const stripeValue = require('../models/values-messages-stripe');
const timeValue = require('../models/values-time');
const { wrapAsync } = require('./error-handling');

const filter = new Filter();

const usps = new USPS({
    userId: process.env.USPS_USER_ID,
    // USPS returns ALL CAPS, this boolean turns on Proper Caps for both Street lines and City. This is an optional item.
    properCase: Boolean
});

const {
    FalseEmailConfirmationRequest,
    LoginFailure,
    PasswordResetRequest,
    RecentDeletedAccount,
    RecentPasswordResetSuccess,
    StripeCancelKey,
    StripeSuccessKey,
    User,
    UnverifiedUser
    } = require('../models/mongoose-schema');

exports.accountDeleted = wrapAsync(async function(req, res) {

    let email = req.query.email ? req.query.email : '';

    let doesRecentDeletedAccountExist = await RecentDeletedAccount.exists( { email: email } );

    // If this account wasn't recently deleted forward to the homepage.
    if (!doesRecentDeletedAccountExist) return res.status(404).redirect('/page-not-found');

    req.session.destroy( function(error) {
        if (error) {
            res.clearCookie(process.env.SESSION_NAME);
        }
    });

    // For rendering.
    let activeLink = 'account-deleted';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = false;
    
    res.render('account-deleted', { activeLink, contactEmail, loggedIn });
});

exports.addChangeCompanyAddress = wrapAsync(async function(req, res) {

    // Create these now and set the value in the if block below.
    let inputFields = {};
    let addOrChangeProperty; 

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { 
            cleanedFields,
            companyCityError,
            companyStateError,
            companyStreetError,
            companyStreetTwoError,
            companyZipError
        } = req.session.transfer;

        delete req.session.transfer;

        // Set object to previous form input.
        inputFields = cleanedFields;

        addOrChangeProperty = req.session.userValues.companyCity ? 'change' : 'add';

    // If req.session.userValues.companyCity has a value then all location properties also have a value.
    } else if (req.session.userValues.companyCity) {

        // Set object to the values stored in the session.
        inputFields.companyCity = req.session.userValues.companyCity;
        inputFields.companyState = req.session.userValues.companyState;
        inputFields.companyStreet = req.session.userValues.companyStreet;
        inputFields.companyStreetTwo = req.session.userValues.companyStreetTwo;
        inputFields.companyZip = req.session.userValues.companyZip;

        addOrChangeProperty = 'change';

    } else {
        // If req.session data isn't used set every property to an empty string.
        inputFields = logicUserAccounts.makeFieldsEmpty(formFields.addChangeCompanyAddress);

        addOrChangeProperty = 'add';
    }

    // Grab the data from req.session and then delete it.
    if (req.session.normalize) {

        var normalize = {};

        normalize.userInputStreet = req.session.normalize.userInputStreet;
        normalize.userInputStreetTwo = req.session.normalize.userInputStreetTwo;
        normalize.userInputCity = req.session.normalize.userInputCity;
        normalize.userInputState = req.session.normalize.userInputState;
        normalize.userInputZip = req.session.normalize.userInputZip;
        normalize.uspsStreet = req.session.normalize.uspsStreet;
        normalize.uspsStreetTwo = req.session.normalize.uspsStreetTwo;
        normalize.uspsCity = req.session.normalize.uspsCity;
        normalize.uspsState = req.session.normalize.uspsState;
        normalize.uspsZip = req.session.normalize.uspsZip;

        delete req.session.normalize;
    }

    // For rendering.
    let activeLink = 'add-change-company-address';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;
    let companyCityAttributes = renderValue.companyCityField.attributes;
    let companyStreetAttributes = renderValue.companyStreetField.attributes;
    let companyStreetTwoAttributes = renderValue.companyStreetField.attributes;
    let companyZipAttributes = renderValue.companyZipField.attributes;
    let patternCompanyCity = regexpValue.companyCity;
    let patternCompanyStreet = regexpValue.companyStreet;
    let patternCompanyStreetTwo = regexpValue.companyStreetTwo;
    let patternCompanyZip = regexpValue.companyZip;

    res.render('add-change-company-address', {
        userInput: inputFields,
        activeLink,
        contactEmail,
        loggedIn,
        addOrChangeProperty,
        companyCityError,
        companyStateError,
        companyStreetError,
        companyStreetTwoError,
        companyZipError,
        companyCityAttributes, 
        companyStreetAttributes,
        companyStreetTwoAttributes,
        companyZipAttributes,
        normalize,
        patternCompanyCity,
        patternCompanyStreet,
        patternCompanyStreetTwo,
        patternCompanyZip
    });
});

exports.addChangeCompanyDescription = wrapAsync(async function(req, res) {

    // Create these now and set the value in the if block below.
    let inputFields = {};
    let addOrChangeProperty; 

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, companyDescriptionError } = req.session.transfer;

        delete req.session.transfer;

        // Set object to previous form input.
        inputFields = cleanedFields;

        addOrChangeProperty = req.session.userValues.companyDescription ? 'change' : 'add';

    } else if (req.session.userValues.companyDescription) {

        // Set object to the values stored in the session.
        inputFields.companyDescription = req.session.userValues.companyDescription;

        addOrChangeProperty = 'change';

    } else {
        // If req.session data isn't used set every property to an empty string.
        inputFields = logicUserAccounts.makeFieldsEmpty(formFields.addChangeCompanyDescription);

        addOrChangeProperty = 'add';
    }

    // For rendering.
    let activeLink = 'add-change-company-description';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;
    let companyDescriptionAttributes = renderValue.companyDescriptionField.attributes;
    let companyDescription = req.session.userValues.companyDescription;
    let patternCompanyDescription = regexpValue.companyDescription;

    res.render('add-change-company-description', { userInput: inputFields, activeLink, contactEmail, loggedIn, addOrChangeProperty, companyDescription, companyDescriptionAttributes, companyDescriptionError, patternCompanyDescription });
});

exports.addChangeCompanyName = wrapAsync(async function(req, res) {

    // Create these now and set the value in the if block below.
    let inputFields = {};
    let addOrChangeProperty; 

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, companyNameError } = req.session.transfer;
        delete req.session.transfer;

        // Set object to previous form input.
        inputFields = cleanedFields;

        addOrChangeProperty = req.session.userValues.companyName ? 'change' : 'add';

    } else {

        // If req.session data isn't used set every property to an empty string.
        inputFields = logicUserAccounts.makeFieldsEmpty(formFields.addChangeCompanyName);

        addOrChangeProperty = req.session.userValues.companyName ? 'change' : 'add';
    }

    // For rendering.
    let activeLink = 'add-change-company-name';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;
    let companyNameAttributes = renderValue.companyNameField.attributes;
    let companyName = req.session.userValues.companyName;
    let patternCompanyName = regexpValue.companyName;

    res.render('add-change-company-name', { userInput: inputFields, activeLink, contactEmail, loggedIn, addOrChangeProperty, companyName, companyNameAttributes, companyNameError, patternCompanyName });
});

exports.addChangeCompanyPhone = wrapAsync(async function(req, res) {

    // Create these now and set the value in the if block below.
    let inputFields = {};
    let addOrChangeProperty; 

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, companyPhoneError } = req.session.transfer;
        delete req.session.transfer;

        // Set object to previous form input.
        inputFields = cleanedFields;

        addOrChangeProperty = req.session.userValues.companyPhone ? 'change' : 'add';

    } else {
        // If req.session data isn't used set every property to an empty string.
        inputFields = logicUserAccounts.makeFieldsEmpty(formFields.addChangeCompanyPhone);

        addOrChangeProperty = req.session.userValues.companyPhone ? 'change' : 'add';
    }

    // For rendering.
    let activeLink = 'add-change-company-phone';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;
    let companyPhoneAttributes = renderValue.companyPhoneField.attributes;
    let companyPhone = req.session.userValues.companyPhone;

    res.render('add-change-company-phone', { userInput: inputFields, activeLink, contactEmail, loggedIn, addOrChangeProperty, companyPhone, companyPhoneAttributes, companyPhoneError });
});

exports.addChangeCompanyServices = wrapAsync(async function(req, res) {

    // Create these now and set the value in the if block below.
    let addOrChangeProperty; 

    // Bring these in from the session to see if this is an add or change situation.
    let {
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
        } = req.session.userValues;

    let doCompanyServicesHaveValue = checks.checkCompanyServicesHaveValue(
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
        );

    // Grab the data from req.session and then delete it.
    let inputFields;

    if (req.session.transfer) {

        var { companyServicesError, cleanedFields } = req.session.transfer;
        delete req.session.transfer;

        // Because there was an error set the values to the previous forms input instead of the session values.  This also makes sure every empty property has a 'no' value.
        cleanedFields.serviceBoardingSecuring = logicUserAccounts.setCheckInputYesNo(cleanedFields.serviceBoardingSecuring);
        cleanedFields.serviceDebrisRemovalTrashout = logicUserAccounts.setCheckInputYesNo(cleanedFields.serviceDebrisRemovalTrashout);
        cleanedFields.serviceEvictionManagement = logicUserAccounts.setCheckInputYesNo(cleanedFields.serviceEvictionManagement);
        cleanedFields.serviceFieldInspection = logicUserAccounts.setCheckInputYesNo(cleanedFields.serviceFieldInspection);
        cleanedFields.serviceHandymanGeneralMaintenance = logicUserAccounts.setCheckInputYesNo(cleanedFields.serviceHandymanGeneralMaintenance);
        cleanedFields.serviceLandscapeMaintenance = logicUserAccounts.setCheckInputYesNo(cleanedFields.serviceLandscapeMaintenance);
        cleanedFields.serviceLockChanges = logicUserAccounts.setCheckInputYesNo(cleanedFields.serviceLockChanges);
        cleanedFields.serviceOverseePropertyRehabilitation = logicUserAccounts.setCheckInputYesNo(cleanedFields.serviceOverseePropertyRehabilitation);
        cleanedFields.servicePoolMaintenance = logicUserAccounts.setCheckInputYesNo(cleanedFields.servicePoolMaintenance);
        cleanedFields.servicePropertyCleaning = logicUserAccounts.setCheckInputYesNo(cleanedFields.servicePropertyCleaning);
        cleanedFields.serviceWinterizations = logicUserAccounts.setCheckInputYesNo(cleanedFields.serviceWinterizations);

        addOrChangeProperty = doCompanyServicesHaveValue ? 'change' : 'add';
        
        // Set object to previous form input.
        inputFields = cleanedFields;

    } else {

        addOrChangeProperty = doCompanyServicesHaveValue ? 'change' : 'add';

        // If there isn't an error set the values to those stored in the session.
        inputFields = req.session.userValues
    }

    // For rendering.
    let activeLink = 'add-change-company-services';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;

    let labelBoardingSecuring = renderValue.serviceBoardingSecuring;
    let labelDebrisRemovalTrashout = renderValue.serviceDebrisRemovalTrashout;
    let labelEvictionManagement = renderValue.serviceEvictionManagement;
    let labelFieldInspection = renderValue.serviceFieldInspection;
    let labelHandymanGeneralMaintenance = renderValue.serviceHandymanGeneralMaintenance;
    let labelLandscapeMaintenance = renderValue.serviceLandscapeMaintenance;
    let labelLockChanges = renderValue.serviceLockChanges;
    let labelOverseePropertyRehabilitation = renderValue.serviceOverseePropertyRehabilitation;
    let labelPoolMaintenance = renderValue.servicePoolMaintenance;
    let labelPropertyCleaning = renderValue.servicePropertyCleaning;
    let labelWinterizations = renderValue.serviceWinterizations;

    res.render('add-change-company-services',
        { 
            userInput: inputFields,
            activeLink,
            contactEmail,
            loggedIn,
            addOrChangeProperty,
            labelBoardingSecuring,
            labelDebrisRemovalTrashout,
            labelEvictionManagement,
            labelFieldInspection,
            labelHandymanGeneralMaintenance,
            labelLandscapeMaintenance,
            labelLockChanges,
            labelOverseePropertyRehabilitation,
            labelPoolMaintenance,
            labelPropertyCleaning,
            labelWinterizations,
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
            serviceWinterizations,
            companyServicesError
        });
});

exports.addChangeCompanyWebsite = wrapAsync(async function(req, res) {
    
    // Create these now and set the value in the if block below.
    let inputFields = {};
    let addOrChangeProperty; 

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, companyWebsiteError } = req.session.transfer;
        delete req.session.transfer;

        // Set object to previous form input.
        inputFields = cleanedFields;

        addOrChangeProperty = req.session.userValues.companyWebsite ? 'change' : 'add';

    } else {
        // If req.session data isn't used set every property to an empty string.
        inputFields = logicUserAccounts.makeFieldsEmpty(formFields.addChangeCompanyWebsite);

        addOrChangeProperty = req.session.userValues.companyWebsite ? 'change' : 'add';
    }

    // For rendering.
    let activeLink = 'add-change-company-website';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;
    let companyWebsiteAttributes = renderValue.companyWebsiteField.attributes;
    let companyWebsite = req.session.userValues.companyWebsite;
    let patternCompanyWebsite = regexpValue.companyWebsite;

    res.render('add-change-company-website', { userInput: inputFields, activeLink, contactEmail, loggedIn, addOrChangeProperty, companyWebsite, companyWebsiteAttributes, companyWebsiteError, patternCompanyWebsite });
});

exports.changeEmail = wrapAsync(async function(req, res) {

    let { email } = req.session.userValues;
    
    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, newEmailError, emailConfirmationError, passwordError } = req.session.transfer;
        delete req.session.transfer;

        // Set object to previous form input.
        var inputFields = cleanedFields;

    } else {
        // If req.session data isn't used set every property to an empty string.
        var inputFields = logicUserAccounts.makeFieldsEmpty(formFields.changeEmail);
    }

    // For rendering.
    let activeLink = 'change-email';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;
    let emailAttributes = renderValue.emailField.attributes;
    let passwordAttributes = renderValue.passwordField.attributes();
    let currentEmail = email;
    let patternEmail = regexpValue.email;

    res.render('change-email', { userInput: inputFields, activeLink, contactEmail, loggedIn, emailAttributes, passwordAttributes, currentEmail, newEmailError, emailConfirmationError, passwordError, patternEmail });
});

exports.changePassword = wrapAsync(async function(req, res) {

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, passwordCurrentError, passwordError, passwordConfirmError } = req.session.transfer;

        if (passwordCurrentError) {
            var passwordCurrentErrorMessage = passwordCurrentError;
        }

        if (passwordError) {
            var passwordErrorMessage = passwordError.message;
            var passwordErrorType = passwordError.errorType;
        }
        
        if (passwordConfirmError) {
            var passwordConfirmErrorMessage = passwordConfirmError.message;
            var passwordConfirmErrorType = passwordConfirmError.errorType;
        }

        delete req.session.transfer;

        // Set object to previous form input.
        var inputFields = cleanedFields;

    } else {
        // If req.session data isn't used set every property to an empty string.
        var inputFields = logicUserAccounts.makeFieldsEmpty(formFields.changePassword);
    }

    // For rendering.
    let activeLink = 'change-password';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;

    let passwordCurrentAttributes = renderValue.passwordField.attributes();
    let passwordAttributes = renderValue.passwordField.attributes(passwordErrorType);
    let passwordConfirmAttributes = renderValue.passwordField.attributes(passwordConfirmErrorType);
    let patternPassword = regexpValue.password;

    res.render('change-password', { userInput: inputFields, activeLink, contactEmail, loggedIn, passwordCurrentErrorMessage, passwordErrorMessage, passwordConfirmErrorMessage, passwordCurrentAttributes, passwordAttributes, passwordConfirmAttributes, patternPassword });
});

exports.confirmationLimitReached = wrapAsync(async function(req, res) {

    let email = req.query.email ? req.query.email : '';

    // If the email matches an unverified user grab it.
    let unverifiedUser = await UnverifiedUser.findOne({ email: email });

    // If the hash is wrong or not present redirect to the home page.
    if (email === '' || unverifiedUser === null) return res.status(404).redirect('/page-not-found');

    // If for some reason the user has never been to the registration sent page redirect them to that.
    if (unverifiedUser.numberOfConfirmations === 0) return res.redirect(`registration-sent?email=${email}`);

    // If the user has confirmation requests but hasn't gone over the limit redirect to confirmation-resent.
    if (unverifiedUser.numberOfConfirmations >= 1 && unverifiedUser.numberOfConfirmations < defaultValue.numberOfEmailConfirmationsAllowed) {
        return res.redirect(`confirmation-resent?email=${email}`);
    }

    // For rendering.
    let activeLink = 'confirmation-limit-reached';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;
    let emailSubject = emailMessage.emailVerificationEmailSubject();
    let body = errorMessage.confirmationLimitReachedBody(email, emailSubject);
    let expirationTime = timeValue.getExpirationTime(timeValue.unverifiedUserExpiration);

    res.render('confirmation-limit-reached', { activeLink, contactEmail, loggedIn, body, email, emailSubject, expirationTime });
});

exports.confirmationResent = wrapAsync(async function(req, res) {

    let email = req.query.email ? req.query.email : '';
    let resetAttempt = req.query.resetattempt ? req.query.resetattempt : '';

    // If the email matches an unverified user grab it.
    let unverifiedUser = await UnverifiedUser.findOne({ email: email });

    // If the hash is wrong or not present redirect to page-not-found.
    if (email === '' || unverifiedUser === null) return res.status(404).redirect('/page-not-found');

    // If for some reason the user has never been to the registration sent page redirect them to that.
    if (unverifiedUser.numberOfConfirmations === 0) return res.redirect(`registration-sent?email=${ email }`);
    
    // If the user has exceeded the maximum number of confirmations redirect them to the confirmation limit reached page.
    if (unverifiedUser.numberOfConfirmations >= defaultValue.numberOfEmailConfirmationsAllowed) return res.redirect(`/confirmation-limit-reached?email=${ email }`);

    let emailSubject = emailMessage.emailVerificationEmailSubject();

    // If an unverified user exists update the db and send the email.
    if (unverifiedUser) {

        var { confirmationHash } = unverifiedUser;

        await UnverifiedUser.updateOne({ email: email }, { numberOfConfirmations: unverifiedUser.numberOfConfirmations += 1 });
        
        var emailBody = emailMessage.emailVerificationEmailBody(confirmationHash, resetAttempt);

        communication.sendEmail(email, emailSubject, emailBody);
    } 

    // For rendering.
    let activeLink = 'confirmation-resent';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;
    let body = defaultMessage.confirmationResentBody(email, emailSubject, resetAttempt);

    res.render('confirmation-resent', { activeLink, contactEmail, loggedIn, email, emailSubject, body });
});

exports.deleteYourAccount = wrapAsync(async function(req, res) {

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, deleteAccountError } = req.session.transfer;
        delete req.session.transfer;

        // Set object to previous form input.
        var inputFields = cleanedFields;

    } else {
        // If req.session data isn't used set every property to an empty string.
        var inputFields = logicUserAccounts.makeFieldsEmpty(formFields.changeYourName);
    }

    // For rendering.
    let activeLink = 'delete-your-account';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;
    let passwordAttributes = renderValue.passwordField.attributes();

    res.render('delete-your-account', { userInput: inputFields, activeLink, contactEmail, loggedIn, passwordAttributes, deleteAccountError });
});

exports.login = wrapAsync( async function(req, res) {

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, emailError, passwordError } = req.session.transfer;
        delete req.session.transfer;

        // Set object to previous form input.
        var inputFields = cleanedFields;

    } else {
        // If req.session data isn't used set every property to an empty string.
        var inputFields = logicUserAccounts.makeFieldsEmpty(formFields.login);
    }

    // For rendering.
    let activeLink = 'login';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;
    let emailAttributes  = renderValue.emailField.attributes;
    let passwordAttributes = renderValue.passwordField.attributes();

    res.render('login', { userInput: inputFields, activeLink, contactEmail, loggedIn, emailAttributes, passwordAttributes, emailError, passwordError });
});

exports.loginFailureLimitReached = wrapAsync(async function(req, res) {

    let email = req.query.email ? req.query.email : '';

    // If the hash matches an unverified user grab it.
    let loginFailure = await LoginFailure.findOne({ email: email });

    // If the hash is wrong or not present redirect to the home page.
    if (email === '' || loginFailure === null) return res.status(404).redirect('/page-not-found');

    // For rendering.
    let activeLink = 'login-failure-limit-reached';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = false;

    let expirationTime = timeValue.getExpirationTime(timeValue.loginFailureExpiration);

    res.render('login-failure-limit-reached', { activeLink, contactEmail, loggedIn, expirationTime });
});

exports.logout = wrapAsync(async function(req, res) {

    logicUserAccounts.logoutSteps(req, res);
});

exports.myAccount = wrapAsync(async function(req, res) {

    let {
        companyCity,
        companyDescription,
        companyName,
        companyPhone,
        companyProfileType,
        companyState,
        companyStreet,
        companyStreetTwo,
        companyWebsite,
        companyZip,
        createdAt,
        email,
        expirationDate,
        password,
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
    } = req.session.userValues;

    let isAccountUpgraded = companyProfileType === defaultValue.accountUpgrade ? true : false;

    // Start the Message / Stripe section.
    let failMessage, successMessage;

    // Both queries should never exist in the same response.  If they do this indicates shenanigans.
    if (req.query.success && !req.query.cancel) {

        // If the success key exists grab paymentIntent for use in updating the DB if that is needed.
        let stripeSuccessKey = await StripeSuccessKey.findOne( { entryKey: req.query.success } );

        let paymentIntent = stripeSuccessKey ? stripeSuccessKey.paymentIntent : null;

        if (paymentIntent) {

            // If webhookPremiumUpgrade has already updated DB this returns.
            await logicUserAccounts.stripeSuccessUpdateDB(paymentIntent);

            let userValues = await User.findOne({ email: email });
            req.session.userValues = userValues;

            companyProfileType = req.session.userValues.companyProfileType;
            expirationDate = req.session.userValues.expirationDate;
        
            isAccountUpgraded = true;
            successMessage = stripeValue.successMessage; 
        } 
    } 

    if (req.query.cancel && !req.query.success) {

        let doesStripeCancelKeyExist = await StripeCancelKey.exists( { entryKey: req.query.cancel } );
        if (doesStripeCancelKeyExist) failMessage = stripeValue.cancelMessage;
    }

    // Both keys are always created in middlewareStripe.postCreateCheckoutSession.  If either exists delete them both.
    if (req.query.cancel || req.query.success) {

        await StripeSuccessKey.findOneAndRemove( { email: email } );
        await StripeCancelKey.findOneAndRemove( { email: email } );   
    }

    if (req.session.userValues.successMessage || req.session.userValues.failMessage) {
        
        // It won't matter if both are set because only one will be a string and that's what will be displayed in my-account.ejs
        successMessage = req.session.userValues.successMessage;
        failMessage = req.session.userValues.failMessage;

        delete req.session.userValues.successMessage;
        delete req.session.userValues.failMessage;
    }

    let URLNotActiveMessage;
    if (req.session.userValues.URLNotActiveError) {

        URLNotActiveMessage = defaultMessage.URLNotActiveMessage;

        await User.updateOne({ email: req.session.userValues.email }, { URLNotActiveError: false });
        delete req.session.userValues.URLNotActiveError;
    }

    // Prepare Date information for rendering.
    let memberSince = `${ new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(createdAt)) } ${ new Date(createdAt).getFullYear() }`;

    let numberOfDaysUntilExpiration, isUpgradeExpirationSoon, premiumAccountExtendsAvailable, premiumExpirationDate;

    if (isAccountUpgraded === true) {
        
        numberOfDaysUntilExpiration = logicUserAccounts.getNumberOfDaysUntilExpiration(new Date(expirationDate));
        isUpgradeExpirationSoon = checks.checkIsUpgradeExpirationSoon(numberOfDaysUntilExpiration);
        premiumAccountExtendsAvailable = checks.checkArePremiumAccountExtendsAvailable(new Date(expirationDate), isUpgradeExpirationSoon);
        premiumExpirationDate = logicUserAccounts.getPremiumExpirationDate(new Date(expirationDate))
    }
    
    let companyStreetAssembled = logicUserAccounts.getCompanyStreetFull(companyStreet, companyStreetTwo);
    let companyRegionAssembled = logicUserAccounts.getCompanyRegionFull(companyCity, companyState, companyZip);

    let doCompanyServicesHaveValue = checks.checkCompanyServicesHaveValue (
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
        );

    let companyServicesMyAccountValue;
    if (doCompanyServicesHaveValue) {
        companyServicesMyAccountValue = logicUserAccounts.assembleCompanyServices (
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
        );
    } else {
        companyServicesMyAccountValue = defaultMessage.myAccountInformationEmpty;
    }

    // For rendering.
    let activeLink = 'my-account';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = true;

    let companyDescriptionMyAccountValue = companyDescription ? companyDescription : defaultMessage.myAccountInformationEmpty;
    let companyNameMyAccountValue = companyName ? companyName : defaultMessage.myAccountInformationEmpty;
    let companyPhoneMyAccountValue = companyPhone ? companyPhone : defaultMessage.myAccountInformationEmpty;
    let companyRegionMyAccountValue = companyRegionAssembled ? companyRegionAssembled : defaultMessage.myAccountInformationEmpty;
    let companyStreetMyAccountValue = companyStreetAssembled ? companyStreetAssembled : defaultMessage.myAccountInformationEmpty;
    let companyStreetTwoMyAccountValue = companyStreetTwo ? companyStreetTwo : defaultMessage.myAccountInformationEmpty;
    let companyWebsiteMyAccountValue = companyWebsite ? companyWebsite : defaultMessage.myAccountInformationEmpty;

    let isCompanyAddressAdded = companyStreetMyAccountValue === defaultMessage.myAccountInformationEmpty ? false : true;
    let isCompanyDescriptionAdded = companyDescriptionMyAccountValue === defaultMessage.myAccountInformationEmpty ? false : true;
    let isCompanyNameAdded = companyNameMyAccountValue === defaultMessage.myAccountInformationEmpty ? false : true;
    let isCompanyPhoneAdded = companyPhoneMyAccountValue === defaultMessage.myAccountInformationEmpty ? false : true;
    let isCompanyServicesAdded = companyServicesMyAccountValue === defaultMessage.myAccountInformationEmpty ? false : true;
    let isCompanyWebsiteAdded = companyWebsiteMyAccountValue === defaultMessage.myAccountInformationEmpty ? false : true;


    let companyPropertiesUnfilled = logicUserAccounts.assembleCompanyPropertiesUnfilled(isCompanyNameAdded, isCompanyPhoneAdded, isCompanyAddressAdded, isCompanyServicesAdded);

    let isAccountLive = 
        isCompanyAddressAdded === true &&
        isCompanyNameAdded === true &&
        isCompanyPhoneAdded === true &&
        isCompanyServicesAdded === true
        ? true : false;

    res.render('my-account', {
        activeLink,
        contactEmail,
        loggedIn,
        companyDescriptionMyAccountValue,
        companyNameMyAccountValue,
        companyPhoneMyAccountValue,
        companyProfileType,
        companyPropertiesUnfilled,
        companyRegionMyAccountValue,
        companyServicesMyAccountValue,
        companyStreetMyAccountValue,
        companyStreetTwoMyAccountValue,
        companyWebsiteMyAccountValue,
        contactEmail,
        costInDollarsProduct_1: stripeValue.costInDollarsProduct_1,
        email,
        failMessage, 
        isAccountLive,
        isAccountUpgraded,
        isCompanyAddressAdded,
        isCompanyDescriptionAdded,
        isCompanyNameAdded,
        isCompanyPhoneAdded,
        isCompanyServicesAdded,
        isCompanyWebsiteAdded,
        isUpgradeExpirationSoon,
        memberSince,
        numberOfDaysUntilExpiration,
        password,
        premiumAccountExtendsAvailable,
        premiumExpirationDate,
        successMessage,
        upgradedProfileName: defaultValue.accountUpgrade,
        upgradeSalesPitch: defaultMessage.upgradeSalesPitch,
        URLNotActiveMessage
    });
});

exports.pageNotFound = wrapAsync(async function(req, res) {

    // For rendering.
    let activeLink = 'page-not-found';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;

    res.status(404).render('page-not-found', { activeLink, contactEmail, loggedIn });
});

exports.passwordReset = wrapAsync(async function(req, res) {

    // Check to see if hash is legitimate.
    let hash = req.query.hash ? req.query.hash : '';
    let passwordResetRequest = await PasswordResetRequest.findOne({ confirmationHash: hash });

    if (!passwordResetRequest) return res.status(404).redirect('/page-not-found');

    // If there is an error available from previous postPasswordReset grab it from req.session and then delete it.
    if (req.session.transfer) {
        var { cleanedFields, passwordError, passwordConfirmError } = req.session.transfer;

        if (passwordError) {
            var passwordErrorMessage = passwordError.message;
            var passwordErrorType = passwordError.errorType;
        }
        
        if (passwordConfirmError) {
            var passwordConfirmErrorMessage = passwordConfirmError.message;
            var passwordConfirmErrorType = passwordConfirmError.errorType;
        }

        delete req.session.transfer;

        // Set object to previous form input.
        var inputFields = cleanedFields;
    } else {
        // If req.session data isn't used set every property to an empty string.
        var inputFields = logicUserAccounts.makeFieldsEmpty(formFields.passwordReset);
    }

    // For rendering.
    let activeLink = 'password-reset';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;
    let passwordAttributes = renderValue.passwordField.attributes(passwordErrorType);
    let passwordConfirmAttributes = renderValue.passwordField.attributes(passwordConfirmErrorType);
    let patternPassword = regexpValue.password;

    res.render('password-reset', { userInput: inputFields, activeLink, contactEmail, loggedIn, hash, passwordErrorMessage, passwordConfirmErrorMessage, passwordAttributes, passwordConfirmAttributes, patternPassword });
});

exports.passwordResetRequest = wrapAsync(async function(req, res) {

    // If transfer data exists from postPasswordResetRequest grab it from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, emailError } = req.session.transfer;
        delete req.session.transfer;

        // Set object to previous form input.
        var inputFields = cleanedFields;

    } else {
        // If transfer data doesn't exist set every property to an empty string.
        var inputFields = logicUserAccounts.makeFieldsEmpty(formFields.passwordResetRequest);
    }

    // For rendering.
    let activeLink = 'password-reset-request';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;

    res.render('password-reset-request', { userInput: inputFields, activeLink, contactEmail, loggedIn, emailError, emailAttributes });
});

exports.passwordResetRequestSent = wrapAsync(async function(req, res) {

    let email = req.query.email ? req.query.email : '';
    let forward = req.query.forward ? req.query.forward : '';

    // Check to see if PasswordResetRequest exists.
    let passwordResetRequest = await PasswordResetRequest.findOne({ email: email });
    let requests = passwordResetRequest ? passwordResetRequest.numberOfRequests : 0;

    // Check to see if client passed fake info.
    if (
        (forward != 'true' && forward != 'false') ||
        email === '' ||
        requests < 1 ||
        requests > defaultValue.numberOfPasswordResetRequestsAllowed ||
        passwordResetRequest === null
    ) {
        return res.status(404).redirect('/page-not-found');
    }

    let emailSubject = emailMessage.passwordResetRequestEmailSubject();
    let expirationTime = timeValue.getExpirationTime(timeValue.passwordResetRequestExpiration);

    let confirmationHash = await logicUserAccounts.getOrCreateConfirmationHash(email);
    let wasConfirmationLimitReached = await logicUserAccounts.incrementExistingPasswordResetOrCreateNew(email, confirmationHash, forward);
    if (wasConfirmationLimitReached) return res.redirect(`/password-reset-limit-reached?email=${ email }`);
    await logicUserAccounts.sendEmailIfNecessary(email, confirmationHash, emailSubject, expirationTime, forward); 

    // For rendering.
    let activeLink = 'password-reset-request-sent';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;
    forward = 'false';
    
    res.render('password-reset-request-sent', { activeLink, contactEmail, loggedIn, forward, email, emailSubject, expirationTime });
});

exports.passwordResetLimitReached = wrapAsync(async function(req, res) {

    let email = req.query.email ? req.query.email : '';

    // Check to see if PasswordResetRequest exists.
    let passwordResetRequest = await PasswordResetRequest.findOne({ email: email });

    let wasLimitReached = false;
    if (passwordResetRequest) {
        if (passwordResetRequest.numberOfRequests >= defaultValue.numberOfPasswordResetRequestsAllowed) wasLimitReached = true;
    }

    // If the hash is wrong or not present redirect to the home page.
    if (email === '' || wasLimitReached === false) return res.status(404).redirect('/page-not-found');

    // For rendering.
    let activeLink = 'password-reset-limit-reached';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;
    let emailSubject = emailMessage.passwordResetRequestEmailSubject();
    let expirationTime = timeValue.getExpirationTime(timeValue.passwordResetRequestExpiration);

    res.render('password-reset-limit-reached', { activeLink, contactEmail, loggedIn, email, emailSubject, expirationTime });
});

exports.passwordResetSuccess = wrapAsync(async function(req, res) {

    let email = req.query.email ? req.query.email : '';

    // Check to see if RecentPasswordResetSuccess exists.
    let doesRecentPasswordResetSuccessExist = await RecentPasswordResetSuccess.exists({ email: email });

    // If credentials were fake forward to page-not-found.
    if (!doesRecentPasswordResetSuccessExist) return res.status(404).redirect('/page-not-found');

    // For rendering.
    let activeLink = 'password-reset-success';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;

    res.render('password-reset-success', { activeLink, contactEmail, loggedIn });
});

exports.postChangeEmail = wrapAsync(async function(req, res) {

    // Sanitize and process input.
    let cleanedFields = logicUserAccounts.cleanFields(formFields.changeEmail, req.body);
    let { newEmail, emailConfirmation, passwordCheck } = cleanedFields;

    // Check for a change.  If nothing changed redirect to MyAccount.
    let didEmailChange = req.session.userValues.email === newEmail ? false : true;

    if (didEmailChange === false) return res.redirect('/my-account');

    let areAllFieldsFilled = checks.checkAllFieldsFilled(formFields.changeEmail, cleanedFields);
    let isEmailTooLong = checks.checkIfInputTooLong(newEmail, renderValue.emailField.maxLength);
    let isEmailValid = emailValidator.validate(newEmail);
    let doEmailsMatch = newEmail === emailConfirmation ? true : false;    
    let isPasswordCorrect = await bcrypt.compare(passwordCheck, req.session.userValues.password);
    let doesUnverifiedUserAlreadyExist = await UnverifiedUser.exists({ email: newEmail });
    let userDBSearch = await User.exists({ email: newEmail });
    let doesUserAlreadyExist = userDBSearch === true && didEmailChange === true ? true : false;

    let regExpEmail = new RegExp(regexpValue.email, 'gi');
    let isEmailValidCharacters = regExpEmail.test(newEmail);

    if (
        areAllFieldsFilled === true &&
        isEmailTooLong === false &&
        isEmailValid === true &&
        doEmailsMatch === true &&
        isPasswordCorrect === true &&
        doesUnverifiedUserAlreadyExist === false &&
        doesUserAlreadyExist === false &&
        isEmailValidCharacters === true
    ) {

        await User.updateOne({ email: req.session.userValues.email }, { email: newEmail });

        let changeProperty = 'email';
        let changeVerb = defaultMessage.companyPropertyChangeVerb.update;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);
        req.session.userValues.email = newEmail;

        return res.redirect('/my-account');
    } else {

        // Create and redirect the errors to changeEmail where they will be rendered and deleted.
        let whyEmailUsed = 'change';
        let newEmailError = errorMessage.getNewEmailError(newEmail, whyEmailUsed, isEmailTooLong, isEmailValid, doesUserAlreadyExist, doesUnverifiedUserAlreadyExist, isEmailValidCharacters);
        let emailConfirmationError = errorMessage.getEmailConfirmationError(emailConfirmation, doEmailsMatch);
        let passwordError = errorMessage.getSaveEmailPasswordError(passwordCheck, isPasswordCorrect);

        // If there is an email error blank out emailConfirm field.  After any error always blank out password field.
        if (newEmailError) cleanedFields.emailConfirmation = '';
        cleanedFields.password = '';

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.newEmailError = newEmailError;
        req.session.transfer.emailConfirmationError = emailConfirmationError;
        req.session.transfer.passwordError = passwordError;

        return res.redirect('/change-email');
    }
});

exports.postChangePassword = wrapAsync(async function(req, res) {

    // Sanitize and process input.
    let cleanedFields = logicUserAccounts.cleanFields(formFields.changePassword, req.body);
    let { passwordConfirm, passwordCurrent, password } = cleanedFields;
    let { email } = req.session.userValues;

    let isCurrentPasswordCorrect = await bcrypt.compare(passwordCurrent, req.session.userValues.password);
    let isPasswordFilled = password === '' ? false : true;
    let isPasswordConfirmFilled = passwordConfirm === '' ? false : true;
    let isPasswordTooLong = checks.checkIfInputTooLong(password, renderValue.passwordField.maxLength);
    let doesPasswordMeetRequirements = checks.checkPasswordMeetsRequirements(password);
    let doPasswordsMatch = password === passwordConfirm ? true : false;

    let regExpPassword = new RegExp(regexpValue.password, 'gi');
    let isPasswordValidCharacters = regExpPassword.test(password);
    
    if (
        isCurrentPasswordCorrect === true &&
        isPasswordFilled === true &&
        isPasswordConfirmFilled === true &&
        isPasswordTooLong === false &&
        doesPasswordMeetRequirements === true &&
        doPasswordsMatch === true &&
        isPasswordValidCharacters === true
    ) {

        // If any of these are stored in the db delete them.
        await LoginFailure.findOneAndRemove({ email: email });
        await PasswordResetRequest.findOneAndRemove({ email: email });

        let passwordHashed = await logicUserAccounts.hashPassword(password);

        await User.updateOne({ email: email }, { password: passwordHashed });

        let changeProperty = 'password';
        let changeVerb = defaultMessage.companyPropertyChangeVerb.update;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);
        req.session.userValues.password = passwordHashed;

        return res.redirect('/my-account');
    } else {
        
        // Create and redirect the errors to changePassword where they will be rendered and deleted.
        let whyPasswordUsed = 'changePassword';
        let passwordCurrentError = errorMessage.getPasswordError(whyPasswordUsed, passwordCurrent, isCurrentPasswordCorrect);
        let passwordError = errorMessage.getPasswordNewError(whyPasswordUsed, password, isPasswordTooLong, doesPasswordMeetRequirements, isPasswordValidCharacters);
        let passwordConfirmError = errorMessage.getPasswordConfirmError(whyPasswordUsed, passwordError, passwordConfirm, doPasswordsMatch);
        
        // If there is a current password error change it to an empty string for rendering at changePassword.
        if (passwordCurrentError) {
            cleanedFields.passwordCurrent = '';
        }

        // If there is a password error change the password and confirmation to an empty string for rendering at register.
        if (passwordError) {
            cleanedFields.password = '';
            cleanedFields.passwordConfirm = '';
        }

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.passwordCurrentError = passwordCurrentError;
        req.session.transfer.passwordError = passwordError;
        req.session.transfer.passwordConfirmError = passwordConfirmError;

        return res.redirect('change-password');
    }
});

exports.postAddChangeCompanyAddress = wrapAsync(async function(req, res) {

    // Sanitize and process input.
    let cleanedFields = logicUserAccounts.cleanFields(formFields.addChangeCompanyAddress, req.body);
    let { companyCity, companyState, companyStreet, companyStreetTwo, companyZip, overrideUsps, deleteProperty } = cleanedFields;

    let changeProperty = 'address';
    let changeVerb;

    if (deleteProperty === 'true') {

        await User.updateOne({ email: req.session.userValues.email }, { 
            companyCity: '',
            companyState: '',
            companyStreet: '',
            companyStreetTwo: '',
            companyZip: '',
            live: false
        });

        req.session.userValues.companyCity = '';
        req.session.userValues.companyState = '';
        req.session.userValues.companyStreet = '';
        req.session.userValues.companyStreetTwo = '';
        req.session.userValues.companyZip = '';
        req.session.userValues.live = false;

        changeVerb = defaultMessage.companyPropertyChangeVerb.delete;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

        return res.redirect('/my-account');
    }

    // Check for a change.  If nothing changed redirect to my-account.
    let didCompanyAddressChange =
        req.session.userValues.companyCity === companyCity &&
        req.session.userValues.companyState === companyState &&
        req.session.userValues.companyStreet === companyStreet &&
        req.session.userValues.companyStreetTwo === companyStreetTwo &&
        req.session.userValues.companyZip === companyZip &&
        companyCity &&
        companyState &&
        companyStreet &&
        companyZip
        ? false : true;

    if (didCompanyAddressChange === false) return res.redirect('/my-account');

    let isCompanyCityFilled = companyCity === '' ? false : true;
    let isCompanyCityTooShort = companyCity.length >= renderValue.companyCityField.minLength ? false : true;
    let isCompanyCityTooLong = companyCity.length <= renderValue.companyCityField.maxLength ? false : true;

    let regExpCompanyCity = new RegExp(regexpValue.companyCity, 'gi');
    let isCompanyCityValidCharacters = regExpCompanyCity.test(companyCity);

    let isCompanyStateFilled = companyState === '' ? false : true;
    let isCompanyStateValid = checks.checkCompanyStateValid(companyState);

    let isCompanyStreetFilled = companyStreet === '' ? false : true;
    let isCompanyStreetTooShort = companyStreet.length >= renderValue.companyStreetField.minLength ? false : true;
    let isCompanyStreetTooLong = companyStreet.length <= renderValue.companyStreetField.maxLength ? false : true;

    let regExpCompanyStreet = new RegExp(regexpValue.companyStreet, 'gi');
    let isCompanyStreetValidCharacters = regExpCompanyStreet.test(companyStreet);

    let isCompanyStreetTwoFilled = companyStreetTwo === '' ? false : true;

    let isCompanyStreetTwoTooShort;
    if (isCompanyStreetTwoFilled) {
        isCompanyStreetTwoTooShort = companyStreetTwo.length >= renderValue.companyStreetField.minLength ? false : true;
    } else {
        isCompanyStreetTwoTooShort = false;
    }
    
    let isCompanyStreetTwoTooLong = companyStreetTwo.length <= renderValue.companyStreetField.maxLength ? false : true; 
    
    let regExpCompanyStreetTwo = new RegExp(regexpValue.companyStreetTwo, 'gi');
    let isCompanyStreetTwoValidCharacters = regExpCompanyStreetTwo.test(companyStreetTwo);

    let isCompanyZipFilled = companyZip === '' ? false : true;
    let isCompanyZipFiveDigits = companyZip.length === 5 ? true : false;

    let regExpCompanyZip = new RegExp(regexpValue.companyZip, 'gi');
    let isCompanyZipValidCharacters = regExpCompanyZip.test(companyZip);

    let uspsNormalizedCompanyAddress = await usps.verify({
        street1: companyStreet,
        street2: companyStreetTwo,
        city: companyCity,
        state: companyState,
        zip: companyZip
    });

    let isCompanyAddressNormalized = checks.checkCompanyAddressNormalized(companyStreet, companyStreetTwo, companyCity, companyState, companyZip, uspsNormalizedCompanyAddress);

    // If USPS can't normalize the address it returns a .name property.  Without .name an error doesn't exist.
    let uspsNormalizationError = uspsNormalizedCompanyAddress.name;

    if (
        isCompanyCityFilled === true &&
        isCompanyCityTooShort === false &&
        isCompanyCityTooLong === false &&
        isCompanyCityValidCharacters === true &&
        isCompanyStateFilled === true &&
        isCompanyStateValid === true &&
        isCompanyStreetFilled === true &&
        isCompanyStreetTooShort === false &&
        isCompanyStreetTooLong === false &&
        isCompanyStreetValidCharacters === true &&
        isCompanyStreetTwoTooShort === false &&
        isCompanyStreetTwoTooLong === false &&
        isCompanyStreetTwoValidCharacters === true &&
        isCompanyZipFilled === true &&
        isCompanyZipFiveDigits === true &&
        isCompanyZipValidCharacters === true &&
        uspsNormalizationError === undefined &&
        (isCompanyAddressNormalized === true || overrideUsps === 'true')
    ) {

        req.session.userValues.companyCity = companyCity;
        req.session.userValues.companyState = companyState;
        req.session.userValues.companyStreet = companyStreet;
        req.session.userValues.companyStreetTwo = companyStreetTwo;
        req.session.userValues.companyZip = companyZip;

        let areAllUserValuesFilled = checks.checkAllUserValuesFilled(req.session.userValues);

        if (areAllUserValuesFilled === true) {

            await User.updateOne({ email: req.session.userValues.email }, { 
                companyCity: companyCity,
                companyState: companyState,
                companyStreet: companyStreet,
                companyStreetTwo: companyStreetTwo,
                companyZip: companyZip,
                live: true
            });
        } else {

            await User.updateOne({ email: req.session.userValues.email }, { 
                companyCity: companyCity,
                companyState: companyState,
                companyStreet: companyStreet,
                companyStreetTwo: companyStreetTwo,
                companyZip: companyZip,
                live: false
            });
        }    

        changeVerb = didCompanyAddressChange === true ? defaultMessage.companyPropertyChangeVerb.update : defaultMessage.companyPropertyChangeVerb.add;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

        return res.redirect('/my-account');

    } else if (
        isCompanyCityFilled === true &&
        isCompanyCityTooShort === false &&
        isCompanyCityTooLong === false &&
        isCompanyCityValidCharacters === true &&
        isCompanyStateFilled === true &&
        isCompanyStateValid === true &&
        isCompanyStreetFilled === true &&
        isCompanyStreetTooShort === false &&
        isCompanyStreetTooLong === false &&
        isCompanyStreetValidCharacters === true &&
        isCompanyStreetTwoTooShort === false &&
        isCompanyStreetTwoTooLong === false &&
        isCompanyStreetTwoValidCharacters === true &&
        isCompanyZipFilled === true &&
        isCompanyZipFiveDigits === true &&
        isCompanyZipValidCharacters === true &&
        uspsNormalizationError === undefined &&
        isCompanyAddressNormalized === false

    ) {

        req.session.normalize = {};
        req.session.normalize.userInputStreet = companyStreet;
        req.session.normalize.userInputStreetTwo = companyStreetTwo;
        req.session.normalize.userInputCity = companyCity;
        req.session.normalize.userInputState = companyState;
        req.session.normalize.userInputZip = companyZip;
        req.session.normalize.uspsStreet = uspsNormalizedCompanyAddress.street1;
        req.session.normalize.uspsStreetTwo = uspsNormalizedCompanyAddress.street2;
        req.session.normalize.uspsCity = uspsNormalizedCompanyAddress.city;
        req.session.normalize.uspsState = uspsNormalizedCompanyAddress.state;
        req.session.normalize.uspsZip = uspsNormalizedCompanyAddress.Zip5;

        return res.redirect('/add-change-company-address');
    } else {
        
        let isCompanyRegionFilled = (companyCity, companyState, companyZip) ? true : false;

        // Create and redirect the errors to changeCompanyAddress where they will be rendered and deleted from the session.
        let companyCityError = errorMessage.getCompanyCityError(isCompanyCityFilled, isCompanyCityTooLong, isCompanyCityTooShort, isCompanyCityValidCharacters);
        let companyStateError = errorMessage.getCompanyStateError(isCompanyStateFilled, isCompanyStateValid);
        let companyStreetError = errorMessage.getCompanyStreetError(isCompanyStreetFilled, isCompanyStreetTooLong, isCompanyStreetTooShort, isCompanyStreetValidCharacters, isCompanyRegionFilled, uspsNormalizationError);
        let companyStreetTwoError = errorMessage.getCompanyStreetTwoError(isCompanyStreetTwoFilled, isCompanyStreetTwoTooLong, isCompanyStreetTwoTooShort, isCompanyStreetTwoValidCharacters);
        let companyZipError = errorMessage.getCompanyZipError(isCompanyZipFilled, isCompanyZipFiveDigits, isCompanyZipValidCharacters);

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.companyCityError = companyCityError;
        req.session.transfer.companyStateError = companyStateError;
        req.session.transfer.companyStreetError = companyStreetError;
        req.session.transfer.companyStreetTwoError = companyStreetTwoError;
        req.session.transfer.companyZipError = companyZipError;

        return res.redirect('/add-change-company-address');
    }
});

exports.postAddChangeCompanyDescription = wrapAsync(async function(req, res) {

    // Sanitize and process input.
    let cleanedFields = logicUserAccounts.cleanFields(formFields.addChangeCompanyDescription, req.body);
    let { companyDescription, deleteProperty } = cleanedFields;
    let { email } = req.session.userValues;

    let changeProperty = 'description';
    let changeVerb;

    if (deleteProperty === 'true') {

        await User.updateOne({ email: email }, { 
            companyDescription: ''
        });

        changeVerb = defaultMessage.companyPropertyChangeVerb.delete;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);
        req.session.userValues.companyDescription = '';

        return res.redirect('/my-account');
    }

    // If nothing changed redirect to my-account.
    let didCompanyDescriptionChange = req.session.userValues.companyDescription !== companyDescription ? true : false;
    let wasCompanyDescriptionAdded = req.session.userValues.companyDescription === '' && didCompanyDescriptionChange === true ? true : false;
    let isCompanyDescriptionFilled = companyDescription === '' ? false : true;

    if (didCompanyDescriptionChange === false && isCompanyDescriptionFilled === true) return res.redirect('/my-account');

    let isCompanyDescriptionProfane = filter.isProfane(companyDescription);
    let isCompanyDescriptionTooLong = companyDescription.length <= renderValue.companyDescriptionField.maxLength ? false : true;
    let isCompanyDescriptionTooShort = companyDescription.length >= renderValue.companyDescriptionField.minLength ? false : true;

    let regExpCompanyDescription = new RegExp(regexpValue.companyDescription, 'gi');
    let isCompanyDescriptionValidCharacters = regExpCompanyDescription.test(companyDescription);

    if (
        isCompanyDescriptionProfane === false &&
        isCompanyDescriptionTooLong === false &&
        isCompanyDescriptionTooShort === false &&
        isCompanyDescriptionValidCharacters === true
    ) {
        let cleanedCompanyDescription = logicUserAccounts.cleanCompanyDescription(companyDescription);
        let trimmedCompanyDescription = cleanedCompanyDescription.trim();
        let capitalizedCompanyDescription = trimmedCompanyDescription.charAt(0).toUpperCase() + trimmedCompanyDescription.slice(1);
        let periodAtEndCompanyDescription = capitalizedCompanyDescription.charAt(-1) === '.' ? capitalizedCompanyDescription : capitalizedCompanyDescription + '.';

        await User.updateOne({ email : email }, { companyDescription: periodAtEndCompanyDescription });
        changeVerb = wasCompanyDescriptionAdded === true ? defaultMessage.companyPropertyChangeVerb.add : defaultMessage.companyPropertyChangeVerb.update;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);
        req.session.userValues.companyDescription = periodAtEndCompanyDescription;

        return res.redirect('/my-account');
    } else {

        // Create and redirect the errors to changeCompanyDescription where they will be rendered and deleted.
        let companyDescriptionError = errorMessage.getCompanyDescriptionError(isCompanyDescriptionFilled, isCompanyDescriptionTooLong, isCompanyDescriptionTooShort, isCompanyDescriptionProfane, isCompanyDescriptionValidCharacters);

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.companyDescriptionError = companyDescriptionError;

        return res.redirect('/add-change-company-description');
    }    

});

exports.postAddChangeCompanyName = wrapAsync(async function(req, res) {

    // Sanitize and process input.
    let cleanedFields = logicUserAccounts.cleanFields(formFields.addChangeCompanyName, req.body);
    let { companyName, deleteProperty } = cleanedFields;
    let { email } = req.session.userValues;

    let changeProperty = 'name';
    let changeVerb;

    if (deleteProperty === 'true') {

        await User.updateOne({ email: email }, { 
            companyName: '',
            live: false
        });

        req.session.userValues.companyName = '';
        req.session.userValues.live = false;

        changeVerb = defaultMessage.companyPropertyChangeVerb.delete;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

        return res.redirect('/my-account');
    }

    // If nothing changed redirect to my-account.
    let didCompanyNameChange = companyName === req.session.userValues.companyName ? false : true;
    let wasCompanyNameAdded = req.session.userValues.companyName === '' && didCompanyNameChange === true ? true : false; 
    let isCompanyNameFilled = companyName === '' ? false : true;

    if (didCompanyNameChange === false && isCompanyNameFilled === true) return res.redirect('/my-account');
    
    let regexCharacterOrNumber = new RegExp(regexpValue.characterOrNumber, 'g');
    let doesCompanyNameContainCharacterOrNumber = regexCharacterOrNumber.test(companyName);

    let isCompanyNameProfane = filter.isProfane(companyName);
    let isCompanyNameTooLong = companyName.length <= renderValue.companyNameField.maxLength ? false : true;
    let isCompanyNameTooShort = companyName.length >= renderValue.companyNameField.minLength ? false : true;

    let regExpCompanyName = new RegExp(regexpValue.companyName, 'gi');
    let isCompanyNameValidCharacters = regExpCompanyName.test(companyName);

    if (
        doesCompanyNameContainCharacterOrNumber === true &&
        isCompanyNameFilled === true &&
        isCompanyNameProfane === false &&
        isCompanyNameTooLong === false &&
        isCompanyNameTooShort === false &&
        isCompanyNameValidCharacters === true
    ) {
        // capitalize the first letter in every word.
        let capitalizedPattern = new RegExp(regexpValue.capitalizeEveryWord, 'g');
        let capitalizedCompanyName = companyName.replace(capitalizedPattern, function(match){ return match.toUpperCase() });
        
        let areAllUserValuesFilled = checks.checkAllUserValuesFilled(req.session.userValues);

        if (areAllUserValuesFilled === true) {
            await User.updateOne({ email : email }, { companyName: capitalizedCompanyName, live: true });
        } else {
            await User.updateOne({ email : email }, { companyName: capitalizedCompanyName, live: false });
        }

        changeVerb = wasCompanyNameAdded === true ? defaultMessage.companyPropertyChangeVerb.add : defaultMessage.companyPropertyChangeVerb.update;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);
        req.session.userValues.companyName = capitalizedCompanyName;

        return res.redirect('/my-account');
    } else {

        // Create and redirect the errors to changeCompanyName where they will be rendered and deleted.
        let companyNameError = errorMessage.getCompanyNameError(isCompanyNameFilled, isCompanyNameTooLong, isCompanyNameTooShort, isCompanyNameProfane, isCompanyNameValidCharacters, doesCompanyNameContainCharacterOrNumber);

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.companyNameError = companyNameError;

        return res.redirect('/add-change-company-name');
    }
});

exports.postAddChangeCompanyPhone = wrapAsync(async function(req, res) {

    // Sanitize and process input.
    let cleanedFields = logicUserAccounts.cleanFields(formFields.addChangeCompanyPhone, req.body);
    let { companyPhone, deleteProperty } = cleanedFields;

    let changeProperty = 'phone';
    let changeVerb;

    if (deleteProperty === 'true') {

        await User.updateOne({ email: req.session.userValues.email }, { 
            companyPhone: '',
            live: false
        });

        req.session.userValues.companyPhone = '';
        changeVerb = defaultMessage.companyPropertyChangeVerb.delete;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

        return res.redirect('/my-account');
    }

    // Dismantle and rebuild companyPhone.  formatPhone strips out all characters that aren't numbers and returns companyPhone in E.164 format.  
    let companyPhoneFormatted = logicUserAccounts.formatCompanyPhone(companyPhone);

    // Check for a change.  If nothing changed redirect to my-account.
    let didCompanyPhoneChange = req.session.userValues.companyPhone === companyPhoneFormatted ? false : true;
    let wasCompanyPhoneAdded = req.session.userValues.companyPhone === '' && didCompanyPhoneChange === true ? true : false; 
    let isCompanyPhoneFilled = companyPhone === '' ? false : true;
    
    let regExpCompanyPhone = new RegExp(regexpValue.companyPhone, 'gi');
    let isCompanyPhoneValidCharacters = regExpCompanyPhone.test(companyPhoneFormatted);

    if (didCompanyPhoneChange === false && isCompanyPhoneFilled === true) return res.redirect('/my-account');

    let isCompanyPhoneValid = checks.checkCompanyPhoneValid(companyPhoneFormatted);

    if (
        isCompanyPhoneFilled === true &&
        isCompanyPhoneValid === true
    ) {

        let areAllUserValuesFilled = checks.checkAllUserValuesFilled(req.session.userValues);

        if (areAllUserValuesFilled === true) {
            await User.updateOne({ email: req.session.userValues.email }, { companyPhone: companyPhoneFormatted, live: true });
        } else {
            await User.updateOne({ email: req.session.userValues.email }, { companyPhone: companyPhoneFormatted, live: false });
        }

        changeVerb = wasCompanyPhoneAdded === true ? defaultMessage.companyPropertyChangeVerb.add : defaultMessage.companyPropertyChangeVerb.update;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);
        req.session.userValues.companyPhone = companyPhoneFormatted;

        return res.redirect('/my-account');
    } else {
        
        // Create and redirect the errors to changeCompanyPhone where they will be rendered and deleted.
        let companyPhoneError = errorMessage.getCompanyPhoneError(isCompanyPhoneFilled, isCompanyPhoneValid, isCompanyPhoneValidCharacters);

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.companyPhoneError = companyPhoneError;

        return res.redirect('/add-change-company-phone');
    }
});

exports.postAddChangeCompanyServices = wrapAsync(async function(req, res) {

    // Sanitize and process input.
    let cleanedFields = logicUserAccounts.cleanFields(formFields.addChangeCompanyServices, req.body);
    let { 
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
        serviceWinterizations,
        deleteProperty,
    } = cleanedFields;

    serviceBoardingSecuring = logicUserAccounts.setCheckInputYesNo(serviceBoardingSecuring);
    serviceDebrisRemovalTrashout = logicUserAccounts.setCheckInputYesNo(serviceDebrisRemovalTrashout);
    serviceEvictionManagement = logicUserAccounts.setCheckInputYesNo(serviceEvictionManagement);
    serviceFieldInspection = logicUserAccounts.setCheckInputYesNo(serviceFieldInspection);
    serviceHandymanGeneralMaintenance = logicUserAccounts.setCheckInputYesNo(serviceHandymanGeneralMaintenance);
    serviceLandscapeMaintenance = logicUserAccounts.setCheckInputYesNo(serviceLandscapeMaintenance);
    serviceLockChanges = logicUserAccounts.setCheckInputYesNo(serviceLockChanges);
    serviceOverseePropertyRehabilitation = logicUserAccounts.setCheckInputYesNo(serviceOverseePropertyRehabilitation);
    servicePoolMaintenance = logicUserAccounts.setCheckInputYesNo(servicePoolMaintenance);
    servicePropertyCleaning = logicUserAccounts.setCheckInputYesNo(servicePropertyCleaning);
    serviceWinterizations = logicUserAccounts.setCheckInputYesNo(serviceWinterizations);

    let changeProperty = 'services';
    let changeVerb;

    if (deleteProperty === 'yes') {

        await User.updateOne({ email: req.session.userValues.email }, { 
            serviceBoardingSecuring: 'no',
            serviceDebrisRemovalTrashout: 'no',
            serviceEvictionManagement: 'no',
            serviceFieldInspection: 'no',
            serviceHandymanGeneralMaintenance: 'no',
            serviceLandscapeMaintenance: 'no',
            serviceLockChanges: 'no',
            serviceOverseePropertyRehabilitation: 'no',
            servicePoolMaintenance: 'no',
            servicePropertyCleaning: 'no',
            serviceWinterizations: 'no',
            live: false
        });

        req.session.userValues.serviceBoardingSecuring = 'no';
        req.session.userValues.serviceDebrisRemovalTrashout = 'no';
        req.session.userValues.serviceEvictionManagement = 'no';
        req.session.userValues.serviceFieldInspection = 'no';
        req.session.userValues.serviceHandymanGeneralMaintenance = 'no';
        req.session.userValues.serviceLandscapeMaintenance = 'no';
        req.session.userValues.serviceLockChanges = 'no';
        req.session.userValues.serviceOverseePropertyRehabilitation = 'no';
        req.session.userValues.servicePoolMaintenance = 'no';
        req.session.userValues.servicePropertyCleaning = 'no';
        req.session.userValues.serviceWinterizations = 'no';
        req.session.userValues.live = false;

        changeVerb = defaultMessage.companyPropertyChangeVerb.delete;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

        return res.redirect('/my-account');
    }

    // Check for a change.  If nothing changed redirect to my-account.
    let didCompanyServicesChange =
        req.session.userValues.serviceBoardingSecuring === serviceBoardingSecuring &&
        req.session.userValues.serviceDebrisRemovalTrashout === serviceDebrisRemovalTrashout &&
        req.session.userValues.serviceEvictionManagement === serviceEvictionManagement &&
        req.session.userValues.serviceFieldInspection === serviceFieldInspection &&        
        req.session.userValues.serviceHandymanGeneralMaintenance === serviceHandymanGeneralMaintenance &&
        req.session.userValues.serviceLandscapeMaintenance === serviceLandscapeMaintenance &&
        req.session.userValues.serviceLockChanges === serviceLockChanges &&
        req.session.userValues.serviceOverseePropertyRehabilitation === serviceOverseePropertyRehabilitation &&
        req.session.userValues.servicePoolMaintenance === servicePoolMaintenance &&
        req.session.userValues.servicePropertyCleaning === servicePropertyCleaning &&
        req.session.userValues.serviceWinterizations === serviceWinterizations &&
        (
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
        )
        ? false : true;

    if (didCompanyServicesChange === false) return res.redirect('/my-account');

    let isACompanyServiceFilled = checks.checkCompanyServicesHaveValue(
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
        );

    if (
        isACompanyServiceFilled === true 
    ) {

        let areAllUserValuesFilled = checks.checkAllUserValuesFilled(req.session.userValues);

        if (areAllUserValuesFilled === true) {

            await User.updateOne({ email: req.session.userValues.email },
                {
                    serviceBoardingSecuring: serviceBoardingSecuring,
                    serviceDebrisRemovalTrashout: serviceDebrisRemovalTrashout,
                    serviceDebrisRemovalTrashout: serviceDebrisRemovalTrashout,
                    serviceEvictionManagement: serviceEvictionManagement,
                    serviceFieldInspection: serviceFieldInspection,
                    serviceHandymanGeneralMaintenance: serviceHandymanGeneralMaintenance,
                    serviceLandscapeMaintenance: serviceLandscapeMaintenance,
                    serviceLockChanges: serviceLockChanges,
                    serviceOverseePropertyRehabilitation: serviceOverseePropertyRehabilitation,
                    servicePoolMaintenance: servicePoolMaintenance,
                    servicePropertyCleaning: servicePropertyCleaning,
                    serviceWinterizations: serviceWinterizations,
                    live: true
                });

        } else {

            await User.updateOne({ email: req.session.userValues.email },
                {
                    serviceBoardingSecuring: serviceBoardingSecuring,
                    serviceDebrisRemovalTrashout: serviceDebrisRemovalTrashout,
                    serviceDebrisRemovalTrashout: serviceDebrisRemovalTrashout,
                    serviceEvictionManagement: serviceEvictionManagement,
                    serviceFieldInspection: serviceFieldInspection,
                    serviceHandymanGeneralMaintenance: serviceHandymanGeneralMaintenance,
                    serviceLandscapeMaintenance: serviceLandscapeMaintenance,
                    serviceLockChanges: serviceLockChanges,
                    serviceOverseePropertyRehabilitation: serviceOverseePropertyRehabilitation,
                    servicePoolMaintenance: servicePoolMaintenance,
                    servicePropertyCleaning: servicePropertyCleaning,
                    serviceWinterizations: serviceWinterizations,
                    live: false
                });
        }

        req.session.userValues.serviceBoardingSecuring = serviceBoardingSecuring;
        req.session.userValues.serviceDebrisRemovalTrashout = serviceDebrisRemovalTrashout;
        req.session.userValues.serviceEvictionManagement = serviceEvictionManagement;
        req.session.userValues.serviceFieldInspection = serviceFieldInspection;      
        req.session.userValues.serviceHandymanGeneralMaintenance = serviceHandymanGeneralMaintenance;
        req.session.userValues.serviceLandscapeMaintenance = serviceLandscapeMaintenance;
        req.session.userValues.serviceLockChanges = serviceLockChanges;
        req.session.userValues.serviceOverseePropertyRehabilitation = serviceOverseePropertyRehabilitation;
        req.session.userValues.servicePoolMaintenance = servicePoolMaintenance;
        req.session.userValues.servicePropertyCleaning = servicePropertyCleaning;
        req.session.userValues.serviceWinterizations = serviceWinterizations; 

        changeVerb = didCompanyServicesChange === true ? defaultMessage.companyPropertyChangeVerb.update : defaultMessage.companyPropertyChangeVerb.add;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

        return res.redirect('/my-account');

    } else {
        
        // Create and redirect the errors to changeCompanyPhone where they will be rendered and deleted.
        let companyServicesError = errorMessage.getCompanyServicesError(isACompanyServiceFilled);

        req.session.transfer = {};
        req.session.transfer.companyServicesError = companyServicesError;
        req.session.transfer.cleanedFields = cleanedFields;

        return res.redirect('/add-change-company-services');
    }
});

exports.postAddChangeCompanyWebsite = wrapAsync(async function(req, res) {
    
    // Sanitize and process input.
    let cleanedFields = logicUserAccounts.cleanFields(formFields.addChangeCompanyWebsite, req.body);
    let { companyWebsite, deleteProperty } = cleanedFields;
    let { email } = req.session.userValues;

    let changeProperty = 'website'
    let changeVerb;

    if (deleteProperty === 'true') {

        await User.updateOne({ email: email }, { 
            companyWebsite: ''
        });

        req.session.userValues.companyWebsite = '';
        changeVerb = defaultMessage.companyPropertyChangeVerb.delete;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

        return res.redirect('/my-account');
    }

    // If nothing changed redirect to my-account.
    let didCompanyWebsiteChange = companyWebsite === req.session.userValues.companyWebsite ? false : true;
    let wasCompanyWebsiteAdded = req.session.userValues.companyWebsite === '' && didCompanyWebsiteChange === true ? true : false; 
    let isCompanyWebsiteFilled = companyWebsite === '' ? false : true;

    if (didCompanyWebsiteChange === false && isCompanyWebsiteFilled === true) return res.redirect('/my-account');

    let isCompanyWebsiteTooLong = companyWebsite.length <= renderValue.companyWebsiteField.maxLength ? false : true;
    let isCompanyWebsiteValid = validator.isURL(companyWebsite);

    let regExpCompanyWebsite = new RegExp(regexpValue.companyWebsite, 'gi');
    let isCompanyWebsiteValidCharacters = regExpCompanyWebsite.test(companyWebsite);

    if (
        isCompanyWebsiteFilled === true &&
        isCompanyWebsiteTooLong === false &&
        isCompanyWebsiteValid === true
    ) {

        // This tests the URL and saves it.
        let partiallyProcessedURL = logicUserAccounts.partiallyProcessURL(companyWebsite);
        let processedURL = logicUserAccounts.processURL(companyWebsite);

        // This runs in the background so as to not slow down the client.
        logicUserAccounts.testURLAndResave(processedURL, email, req);

        await User.updateOne({ email: email }, { companyWebsite: partiallyProcessedURL });

        changeVerb = wasCompanyWebsiteAdded === true ? defaultMessage.companyPropertyChangeVerb.add : defaultMessage.companyPropertyChangeVerb.update;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);
        req.session.userValues.companyWebsite = partiallyProcessedURL;

        return res.redirect('/my-account');
    } else {
        
        // Create and redirect the errors to addChangeCompanyWebsite where they will be rendered and deleted.
        let companyWebsiteError = errorMessage.getCompanyWebsiteError(isCompanyWebsiteFilled, isCompanyWebsiteTooLong, isCompanyWebsiteValid, isCompanyWebsiteValidCharacters);

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.companyWebsiteError = companyWebsiteError;

        return res.redirect('/add-change-company-website');
    }
});

exports.postDeleteYourAccount = wrapAsync(async function(req, res) {

    // Sanitize and process input.
    let cleanedFields = logicUserAccounts.cleanFields(formFields.deleteYourAccount, req.body);
    let { password } = cleanedFields;

    let email = req.session.userValues.email || '';
    let dbPassword = req.session.userValues.password || '';

    let isPasswordCorrect = await bcrypt.compare(password, dbPassword);
    
    if (isPasswordCorrect) {

        await User.findOneAndRemove({ email: email });

        // Create a temporary key stored in the db to be used to access the account-deleted route.
        let recentDeletedAccount = mongooseInstance.createRecentDeletedAccount(email);
        await recentDeletedAccount.save();

        // Check for and remove any login failures in the db.
        await logicUserAccounts.removeLoginFailures(email);

        return res.redirect(`/account-deleted?email=${email}`);
    }

    // Create and redirect the error to deleteYourAccount where it will be rendered and deleted.
    let whyPasswordUsed = 'delete account';
    let deleteAccountError = errorMessage.getPasswordError(whyPasswordUsed, password, isPasswordCorrect);

    req.session.transfer = {};
    req.session.transfer.deleteAccountError = deleteAccountError;

    return res.redirect('/delete-your-account');
});

exports.postLogin = wrapAsync(async function(req, res) {

    // Sanitize and process input.
    let cleanedFields = logicUserAccounts.cleanFields(formFields.login, req.body);
    let { email, password } = cleanedFields;

    let isEmailValid = emailValidator.validate(email);
    let userValues = await User.findOne({ email: email });
    let doesLoginExist = userValues === null ? false : true;

    let dbPassword = userValues ? userValues.password : '';
    let isPasswordCorrect = await bcrypt.compare(password, dbPassword);

    // Check to see if client should be locked out because of multiple failed password attempts.
    let loginFailure = await LoginFailure.findOne({ email: email });
    let lockedOut;

    if (loginFailure) {
        lockedOut = loginFailure.numberOfFailures >= defaultValue.numberOfLoginFailuresAllowed ? true : false;
    } else {
        lockedOut = false;
    }
    
    // Increment login failure if needed.  This occurs even if email/account doesn't exist to stop hackers from blasting server.
    if (password && email && isEmailValid && !isPasswordCorrect) {

        if (!loginFailure) {
            loginFailure = mongooseInstance.createLoginFailure(email);
            await loginFailure.save();
        } else {
            loginFailure.numberOfFailures += 1;
            await LoginFailure.updateOne({ email: email }, { numberOfFailures: loginFailure.numberOfFailures });
        }
        
        if (loginFailure.numberOfFailures >= defaultValue.numberOfLoginFailuresAllowed) {
            lockedOut = true;
        }
    }

    if (lockedOut) {
        
        return res.redirect(`/login-failure-limit-reached?email=${email}`);
    }

    if (
        doesLoginExist === true &&
        isPasswordCorrect === true &&
        lockedOut === false
        ) {    

        // Check for and remove any login failures in the db.
        await logicUserAccounts.removeLoginFailures(email);

        req.session.userValues = userValues;
        return res.redirect('/my-account');
    } else {

        // Create and redirect the errors to login where they will be rendered and deleted.
        let emailError = errorMessage.getLoginEmailError(email, isEmailValid);
        let whyPasswordUsed = 'login';
        let passwordError = errorMessage.getPasswordError(whyPasswordUsed, password, isPasswordCorrect);

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.emailError = emailError;
        req.session.transfer.passwordError = passwordError;

        return res.redirect('/login');
    }
});

exports.postPasswordReset = wrapAsync(async function(req, res) {

    // Sanitize and process input.
    let cleanedFields = logicUserAccounts.cleanFields(formFields.passwordReset, req.body);
    let { password, passwordConfirm } = cleanedFields;
    let hash = req.query.hash ? req.query.hash : '';

    let areAllFieldsFilled = checks.checkAllFieldsFilled(formFields.passwordReset, cleanedFields);
    let isPasswordTooLong = checks.checkIfInputTooLong(password, renderValue.passwordField.maxLength);
    let doesPasswordMeetRequirements = checks.checkPasswordMeetsRequirements(password);
    let doPasswordsMatch = password === passwordConfirm ? true : false;

    let regExpPassword = new RegExp(regexpValue.password, 'gi');
    let isPasswordValidCharacters = regExpPassword.test(password);

    if (
        areAllFieldsFilled === true &&
        doPasswordsMatch === true &&
        doesPasswordMeetRequirements === true &&
        isPasswordTooLong === false &&
        isPasswordValidCharacters === true
        ) {

            let passwordResetRequest = await PasswordResetRequest.findOne({ confirmationHash: hash });
            let { email } = passwordResetRequest;
            let passwordHashed = await logicUserAccounts.hashPassword(password);
            await User.updateOne({ email: email }, { password: passwordHashed });
            await PasswordResetRequest.findOneAndRemove({ confirmationHash: hash });

            let recentPasswordResetSuccess = mongooseInstance.createRecentPasswordResetSuccess(email);
            await recentPasswordResetSuccess.save();

            // Check for and remove any login failures in the db.
            await logicUserAccounts.removeLoginFailures(email);

            return res.redirect(`/password-reset-success?email=${ email }`);
        } else {

            // Create and send the error to passwordReset where it will be used and deleted.
            let whyPasswordUsed = 'passwordChange';
            let passwordError = errorMessage.getPasswordNewError(whyPasswordUsed, password, isPasswordTooLong, doesPasswordMeetRequirements, isPasswordValidCharacters);
            let passwordConfirmError = errorMessage.getPasswordConfirmError(whyPasswordUsed, passwordError, passwordConfirm, doPasswordsMatch);

            req.session.transfer = {};
            req.session.transfer.cleanedFields = cleanedFields;
            req.session.transfer.passwordError = passwordError;
            req.session.transfer.passwordConfirmError = passwordConfirmError;

            return res.redirect(`/password-reset?hash=${ hash }`);
        }
});

exports.postPasswordResetRequest = wrapAsync(async function(req, res) {

    // Sanitize and process input.
    let cleanedFields = logicUserAccounts.cleanFields(formFields.passwordResetRequest, req.body);
    let { email } = cleanedFields;

    let isEmailValid = emailValidator.validate(email);
    let isEmailTooLong = checks.checkIfInputTooLong(email, renderValue.emailField.maxLength);

    if (
        email === '' ||
        isEmailValid === false ||
        isEmailTooLong === true
        ) {

        // Create and send the error to passwordResetRequest where it will be used and deleted.
        let emailError = errorMessage.getEmailError(email, isEmailValid, isEmailTooLong);

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.emailError = emailError;

        return res.redirect('/password-reset-request');
    } 

    // If client attempts to reset password of an unverified account make him verify first.
    let unverifiedUser = await UnverifiedUser.findOne({ email: email });
    
    if (unverifiedUser) {

        return res.redirect(`/confirmation-resent?email=${ email }&resetattempt=true`);
    }

    let confirmationHash = await logicUserAccounts.getOrCreateConfirmationHash(email);
    let wasConfirmationLimitReached = await logicUserAccounts.incrementExistingPasswordResetOrCreateNew(email, confirmationHash);
    if (wasConfirmationLimitReached) return res.redirect(`/password-reset-limit-reached?email=${ email }`);

    let emailSubject = emailMessage.passwordResetRequestEmailSubject();
    let expirationTime = timeValue.getExpirationTime(timeValue.passwordResetRequestExpiration);
    await logicUserAccounts.sendEmailIfNecessary(email, confirmationHash, emailSubject, expirationTime); 

    // If the email passes the checks and no unverified user exists send the client to passwordResetRequestSent.
    // Notify client that the request for that email was received whether or not the user exists.  This way hackers won't know if an email exists in the db.  
    return res.redirect(`/password-reset-request-sent?email=${ email }&forward=true`);
});

exports.postRegister = wrapAsync(async function(req, res) {

    // Sanitize and process input.
    let cleanedFields = logicUserAccounts.cleanFields(formFields.register, req.body);
    let { email, password, passwordConfirm } = cleanedFields;
    let termsOfUse = logicUserAccounts.setCheckInputYesNo(cleanedFields.termsOfUse);
    
    let areAllFieldsFilled = checks.checkAllFieldsFilled(formFields.register, cleanedFields);
    let isEmailValid = emailValidator.validate(email);
    let isEmailTooLong = checks.checkIfInputTooLong(email, renderValue.emailField.maxLength);

    let doesUnverifiedUserAlreadyExist = await UnverifiedUser.exists({ email: email });
    let doesUserAlreadyExist = await User.exists({ email: email });

    let doesPasswordMeetRequirements = checks.checkPasswordMeetsRequirements(password);
    let doPasswordsMatch = password === passwordConfirm ? true : false;
    let isPasswordTooLong = checks.checkIfInputTooLong(password, renderValue.passwordField.maxLength);

    let regExpPassword = new RegExp(regexpValue.password, 'gi');
    let isPasswordValidCharacters = regExpPassword.test(password);

    let isTermsOfUseChecked = termsOfUse === 'yes' ? true : false;

    if (
        areAllFieldsFilled === true &&
        isEmailValid === true &&
        isEmailTooLong === false &&
        doesUserAlreadyExist === false &&
        doesPasswordMeetRequirements === true &&
        doPasswordsMatch === true &&
        isPasswordTooLong === false &&
        isTermsOfUseChecked === true &&
        isPasswordValidCharacters
    ) {

        // If an unverified user already exists save over it with new values but update the confirmation counter so that a hacker can't blast the server with same email an unlimited number of times.
        if (doesUnverifiedUserAlreadyExist === true) {

            var unverifiedUser = await UnverifiedUser.findOne({ email: email });

            let { numberOfConfirmations } = unverifiedUser;

            if (numberOfConfirmations >= defaultValue.numberOfEmailConfirmationsAllowed) {
                req.session.tooManyConfirmations = true;
                return res.redirect('/confirmation-limit-reached');
            }

            let hashedPassword = await logicUserAccounts.hashPassword(password);
            await UnverifiedUser.updateOne({ email: email}, {password: hashedPassword, numberOfConfirmations: numberOfConfirmations += 1 });
        } else {

            // If one of these is stored in the db delete it.  It is no longer needed.
            await FalseEmailConfirmationRequest.findOneAndRemove({ email: email });
            await RecentDeletedAccount.findOneAndRemove({ email: email });

            var unverifiedUser = mongooseInstance.createUnverifiedUser(email);
            let salt = cryptoRandomString({ length: 10 });
            unverifiedUser.confirmationHash = objectHash(email + salt);
            unverifiedUser.password = await logicUserAccounts.hashPassword(password);
            await unverifiedUser.save();
        }

        let emailSubject = emailMessage.emailVerificationEmailSubject();
        let htmlMessage = emailMessage.emailVerificationEmailBody(unverifiedUser.confirmationHash);
        communication.sendEmail(email, emailSubject, htmlMessage);

        return res.redirect(`/registration-sent?email=${email}`);

    } else {

        // Create and send the errors to register where they will be used and deleted.
        let whyEmailUsed = 'register';
        let emailError = errorMessage.getNewEmailError(email, whyEmailUsed, isEmailTooLong, isEmailValid, doesUserAlreadyExist);
        let whyPasswordUsed = 'register';
        let passwordError = errorMessage.getPasswordNewError(whyPasswordUsed, password, isPasswordTooLong, doesPasswordMeetRequirements, isPasswordValidCharacters);
        let passwordConfirmError = errorMessage.getPasswordConfirmError(whyPasswordUsed, passwordError, passwordConfirm, doPasswordsMatch);
        let termsOfUseError = isTermsOfUseChecked === true ? undefined : 'Please agree to the terms of use and read the privacy policy.';

        // If there is a password error change the password and confirmation to an empty string for rendering at register.
        if (passwordError) {
            cleanedFields.password = '';
            cleanedFields.passwordConfirm = '';
            cleanedFields.termsOfUse = termsOfUse;
        }

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.emailError = emailError;
        req.session.transfer.passwordError = passwordError;
        req.session.transfer.passwordConfirmError = passwordConfirmError;
        req.session.transfer.termsOfUseError = termsOfUseError;

        return res.redirect('/register');
    }
});

// If the user is logged in redirect to my-account.
exports.redirectMyAccount = wrapAsync(async function(req, res, next) {

    if (req.session.userValues) {

        return res.redirect('/my-account');
    }

    return next();
});

exports.redirectLogin = wrapAsync(async function(req, res, next) {

    if (!req.session.userValues) {

        return res.redirect('/login');
    }
    
    return next();
});

exports.register = wrapAsync(async function(req, res) {

    // If there is data available from previous postRegister gather it from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, emailError, passwordError, passwordConfirmError, termsOfUseError } = req.session.transfer;

        if (passwordError) {
            var passwordErrorMessage = passwordError.message;
            var passwordErrorType = passwordError.errorType;
        }
        
        if (passwordConfirmError) {
            var passwordConfirmErrorMessage = passwordConfirmError.message;
            var passwordConfirmErrorType = passwordConfirmError.errorType;
        }

        delete req.session.transfer;

        // Set object to previous form input.
        var inputFields = cleanedFields;

    } else {
        // If req.session data isn't used set every property to an empty string.
        var inputFields = logicUserAccounts.makeFieldsEmpty(formFields.register);
    }

    // For rendering.
    let activeLink = 'register';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;
    let emailAttributes = renderValue.emailField.attributes;
    let passwordAttributes = renderValue.passwordField.attributes(passwordErrorType);
    let passwordConfirmAttributes = renderValue.passwordField.attributes(passwordConfirmErrorType);
    let patternEmail = regexpValue.email;
    let patternPassword = regexpValue.password;

    res.render('register', { userInput: inputFields, activeLink, contactEmail, loggedIn, emailAttributes, passwordAttributes, passwordConfirmAttributes, emailError, passwordErrorMessage, passwordConfirmErrorMessage, termsOfUseError, patternEmail, patternPassword });
});

exports.registrationSent = wrapAsync(async function(req, res) {

    let email = req.query.email ? req.query.email : '';

    // If the hash matches an unverified user grab it.
    let unverifiedUser = await UnverifiedUser.findOne({ email: email });

    // If the hash is wrong or not present redirect to the home page.
    if (email === '' || unverifiedUser === null) {
        return res.status(404).redirect('/page-not-found');
    }

    await UnverifiedUser.updateOne({ email: email }, { numberOfConfirmations: unverifiedUser.numberOfConfirmations += 1 });

    // For rendering.
    let activeLink = 'registration-sent';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;
    let emailSubject = emailMessage.emailVerificationEmailSubject();

    res.render('registration-sent', { activeLink, contactEmail, loggedIn, email, emailSubject });
});

exports.verified = wrapAsync(async function(req, res) {

    let hash = req.query.hash ? req.query.hash : '';

    // If the hash matches an unverified user grab it.
    let unverifiedUser = await UnverifiedUser.findOne({ confirmationHash: hash });

    // If the hash is wrong or not present redirect to the home page.
    if (hash === '' || unverifiedUser === null) {
        return res.status(404).redirect('/page-not-found');
    }

    let { email } = unverifiedUser;

    // Create the verified user from the unverifiedUser.
    let newUser = mongooseInstance.createUser(unverifiedUser);
    await newUser.save();

    // Delete the unverifiedUser from the db.
    await UnverifiedUser.findOneAndRemove({ email: email });

    // If any of these are stored in the db delete them.  They are no longer needed.
    await LoginFailure.findOneAndRemove({ email: email });
    await PasswordResetRequest.findOneAndRemove({ email: email });

    // For rendering.
    let activeLink = 'verified';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;

    res.render('verified', { activeLink, contactEmail, loggedIn });
});