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
const defaultMessage = require('../models/default-messages');
const defaultValue = require('../models/default-values');
const emailMessage = require('../models/email-messages');
const errorMessage = require('../models/error-messages');
const formFields = require('../models/forms-default-fields');
const logicStripe = require('./logic-stripe');
const logicUserAccounts = require('./logic-user-accounts');
const logoutSteps = require('./logout-steps');
const mongooseInstance = require('./mongoose-create-instances');
const regExpValue = require('../models/regexp-values');
const renderValue = require('../models/rendering-values');
const siteValue = require('../models/site-values');
const stripeValue = require('../models/stripe-values');
const timeValue = require('../models/time-values');
const { wrapAsync } = require('./error-handling');

const filter = new Filter();

const usps = new USPS({
    userId: process.env.USPS_USER_ID,
    // USPS returns ALL CAPS, this boolean turns on Proper Caps for both Street lines and City. This is an optional item.
    properCase: Boolean
});

const {
    LoginFailure,
    PasswordResetRequest,
    RecentDeletedAccount,
    RecentPasswordResetSuccess,
    StripeCancelKey,
    StripeCheckoutSession,
    StripeSuccessKey,
    User,
    UnverifiedUser
    } = require('../models/mongoose-schema');

exports.accountDeleted = wrapAsync(async function(req, res) {

    // Initial checks.  If queries were absent or fake forward to page-not-found.
    let email = req.query.email ? req.query.email : '';
    if (email === '') return res.status(404).redirect('/page-not-found');

    let doesRecentDeletedAccountExist = await RecentDeletedAccount.exists({ email });
    if (!doesRecentDeletedAccountExist) return res.status(404).redirect('/page-not-found');

    // For rendering.
    let activeLink = 'account-deleted';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = false;
    
    res.render('account-deleted', { activeLink, contactEmail, loggedIn });
});

exports.addChangeCompanyAddress = wrapAsync(async function(req, res) {

    // Create these now and set the value in the if block below.
    let inputFields = {};
    let addOrChangeProperty = 
        req.session.userValues.companyCity &&
        req.session.userValues.companyState &&
        req.session.userValues.companyStreet &&
        req.session.userValues.companyZip
        ? 'change' : 'add';

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

    } else {

        // If req.session data isn't used set every property to an empty string.
        inputFields = logicUserAccounts.makeFieldsEmpty(formFields.addChangeCompanyAddress);

    }

    let capitalizedAddOrChange = addOrChangeProperty.charAt(0).toUpperCase() + addOrChangeProperty.slice(1);
    let htmlTitle = `${ capitalizedAddOrChange } Company Address`;

    let showUspsNormalizedVsOriginal = false;
    if (req.session.originalInput && req.session.uspsNormalized) {

        showUspsNormalizedVsOriginal = true;

        var originalInput = {};

        originalInput.companyStreet = req.session.originalInput.companyStreet;
        originalInput.companyStreetTwo = req.session.originalInput.companyStreetTwo;
        originalInput.companyCity = req.session.originalInput.companyCity;
        originalInput.companyState = req.session.originalInput.companyState;
        originalInput.companyZip = req.session.originalInput.companyZip;

        var uspsNormalized = {};

        uspsNormalized.companyStreet = req.session.uspsNormalized.companyStreet;
        uspsNormalized.companyStreetTwo = req.session.uspsNormalized.companyStreetTwo;
        uspsNormalized.companyCity = req.session.uspsNormalized.companyCity;
        uspsNormalized.companyState = req.session.uspsNormalized.companyState;
        uspsNormalized.companyZip = req.session.uspsNormalized.companyZip;

        delete req.session.originalInput;
        delete req.session.uspsNormalized;

    }

    let { companyCity, companyState, companyStreet, companyStreetTwo, companyZip } = req.session.userValues;

    // For rendering.
    let activeLink = 'add-change-company-address';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;
    let companyCityAttributes = renderValue.companyCityField.attributes;
    let companyStreetAttributes = renderValue.companyStreetField.attributes;
    let companyStreetTwoAttributes = renderValue.companyStreetTwoField.attributes;
    let companyZipAttributes = renderValue.companyZipField.attributes;
    let patternCompanyCity = regExpValue.companyCity;
    let patternCompanyStreet = regExpValue.companyStreet;
    let patternCompanyStreetTwo = regExpValue.companyStreetTwo;
    let patternCompanyZip = regExpValue.companyZip;

    res.render('add-change-company-address', {
        userInput: inputFields,
        activeLink,
        contactEmail,
        loggedIn,
        addOrChangeProperty,
        companyCity,
        companyState,
        companyStreet,
        companyStreetTwo,
        companyZip,
        companyCityError,
        companyStateError,
        companyStreetError,
        companyStreetTwoError,
        companyZipError,
        companyCityAttributes, 
        companyStreetAttributes,
        companyStreetTwoAttributes,
        companyZipAttributes,
        htmlTitle,
        patternCompanyCity,
        patternCompanyStreet,
        patternCompanyStreetTwo,
        patternCompanyZip,
        showUspsNormalizedVsOriginal,
        originalInput,
        uspsNormalized
    });
});

exports.addChangeCompanyDescription = wrapAsync(async function(req, res) {

    // Create these now and set the value in the if block below.
    let inputFields = {};
    let addOrChangeProperty = req.session.userValues.companyDescription ? 'change' : 'add';

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, companyDescriptionError } = req.session.transfer;
        delete req.session.transfer;

        // Set object to previous form input.
        inputFields = cleanedFields;

    } else {

        // If req.session data isn't used set every property to an empty string.
        inputFields = logicUserAccounts.makeFieldsEmpty(formFields.addChangeCompanyDescription);

    } 

    let capitalizedAddOrChange = addOrChangeProperty.charAt(0).toUpperCase() + addOrChangeProperty.slice(1);
    let htmlTitle = `${ capitalizedAddOrChange } Company Description`;

    // For rendering.
    let activeLink = 'add-change-company-description';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;
    let companyDescription = req.session.userValues.companyDescription;
    let companyDescriptionAttributes = renderValue.companyDescriptionField.attributes;
    let patternCompanyDescription = regExpValue.companyDescription;

    res.render('add-change-company-description', {
        userInput: inputFields,
        activeLink,
        contactEmail,
        loggedIn,
        addOrChangeProperty,
        companyDescription,
        companyDescriptionAttributes,
        patternCompanyDescription,
        companyDescriptionError,
        htmlTitle
    });

});

exports.addChangeCompanyName = wrapAsync(async function(req, res) {

    // Create these now and set the value in the if block below.
    let inputFields = {};
    let addOrChangeProperty = req.session.userValues.companyName ? 'change' : 'add';

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, companyNameError } = req.session.transfer;
        delete req.session.transfer;

        // Set object to previous form input.
        inputFields = cleanedFields;

    } else {

        // If req.session data isn't used set every property to an empty string.
        inputFields = logicUserAccounts.makeFieldsEmpty(formFields.addChangeCompanyName);

    }

    let capitalizedAddOrChange = addOrChangeProperty.charAt(0).toUpperCase() + addOrChangeProperty.slice(1);
    let htmlTitle = `${ capitalizedAddOrChange } Company Name`;

    // For rendering.
    let activeLink = 'add-change-company-name';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;
    let companyName = req.session.userValues.companyName;
    let companyNameAttributes = renderValue.companyNameField.attributes;
    let patternCompanyName = regExpValue.companyName;

    res.render('add-change-company-name', {
        userInput: inputFields,
        activeLink,
        contactEmail,
        loggedIn,
        addOrChangeProperty,
        companyName,
        companyNameAttributes,
        patternCompanyName,
        companyNameError,
        htmlTitle
    });

});

exports.addChangeCompanyPhone = wrapAsync(async function(req, res) {

    // Create these now and set the value in the if block below.
    let inputFields = {};
    let addOrChangeProperty = req.session.userValues.companyPhone ? 'change' : 'add';

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, companyPhoneError } = req.session.transfer;
        delete req.session.transfer;

        // Set object to previous form input.
        inputFields = cleanedFields;

    } else {

        // If req.session data isn't used set every property to an empty string.
        inputFields = logicUserAccounts.makeFieldsEmpty(formFields.addChangeCompanyPhone);

    }

    let capitalizedAddOrChange = addOrChangeProperty.charAt(0).toUpperCase() + addOrChangeProperty.slice(1);
    let htmlTitle = `${ capitalizedAddOrChange } Company Phone Number`;

    // For rendering.
    let activeLink = 'add-change-company-phone';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;
    let companyPhone = req.session.userValues.companyPhone;
    let companyPhoneAttributes = renderValue.companyPhoneField.attributes;

    res.render('add-change-company-phone', {
        userInput: inputFields,
        activeLink,
        contactEmail,
        loggedIn,
        addOrChangeProperty,
        companyPhone,
        companyPhoneAttributes,
        companyPhoneError,
        htmlTitle
    });

});

exports.addChangeCompanyServices = wrapAsync(async function(req, res) {

    let inputFields = {}, inputFieldsBoolean = {};
    let addOrChangeProperty = 
        req.session.userValues.boardingSecuring === false &&
        req.session.userValues.debrisRemovalTrashout === false &&
        req.session.userValues.evictionManagement === false &&
        req.session.userValues.fieldInspection === false &&
        req.session.userValues.handymanGeneralMaintenance === false &&
        req.session.userValues.landscapeMaintenance === false &&
        req.session.userValues.lockChanges === false &&
        req.session.userValues.overseePropertyRehabilitation === false &&
        req.session.userValues.poolMaintenance === false &&
        req.session.userValues.propertyCleaning === false &&
        req.session.userValues.winterizations === false
            ? 'add' : 'change';

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, companyServicesError } = req.session.transfer;
        delete req.session.transfer;

        // Set object to previous form input.
        inputFields = cleanedFields;

    } else {

        inputFieldsBoolean = logicUserAccounts.addCompanyServices(formFields.addChangeCompanyServices, req.session.userValues);
        inputFields = logicUserAccounts.convertBooleanToString(inputFieldsBoolean);

    }

    let capitalizedAddOrChange = addOrChangeProperty.charAt(0).toUpperCase() + addOrChangeProperty.slice(1);
    let htmlTitle = `${ capitalizedAddOrChange } Company Services`;

    // For rendering.
    let activeLink = 'add-change-company-services';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;

    let labelBoardingSecuring = renderValue.boardingSecuring;
    let labelDebrisRemovalTrashout = renderValue.debrisRemovalTrashout;
    let labelEvictionManagement = renderValue.evictionManagement;
    let labelFieldInspection = renderValue.fieldInspection;
    let labelHandymanGeneralMaintenance = renderValue.handymanGeneralMaintenance;
    let labelLandscapeMaintenance = renderValue.landscapeMaintenance;
    let labelLockChanges = renderValue.lockChanges;
    let labelOverseePropertyRehabilitation = renderValue.overseePropertyRehabilitation;
    let labelPoolMaintenance = renderValue.poolMaintenance;
    let labelPropertyCleaning = renderValue.propertyCleaning;
    let labelWinterizations = renderValue.winterizations;

    res.render('add-change-company-services',
        { 
            userInput: inputFields,
            activeLink,
            contactEmail,
            loggedIn,
            addOrChangeProperty,
            loggedIn,
            htmlTitle,
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
            companyServicesError
        });
});

exports.addChangeCompanyWebsite = wrapAsync(async function(req, res) {
    
    // Create these now and set the value in the if block below.
    let inputFields = {};
    let addOrChangeProperty = req.session.userValues.companyWebsite ? 'change' : 'add';

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, companyWebsiteError } = req.session.transfer;
        delete req.session.transfer;

        // Set object to previous form input.
        inputFields = cleanedFields;

    } else {

        // If req.session data isn't used set every property to an empty string.
        inputFields = logicUserAccounts.makeFieldsEmpty(formFields.addChangeCompanyWebsite);

    }

    let capitalizedAddOrChange = addOrChangeProperty.charAt(0).toUpperCase() + addOrChangeProperty.slice(1);
    let htmlTitle = `${ capitalizedAddOrChange } Company Website`;

    // For rendering.
    let activeLink = 'add-change-company-website';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;
    let companyWebsiteAttributes = renderValue.companyWebsiteField.attributes;
    let companyWebsite = req.session.userValues.companyWebsite;
    let patternCompanyWebsite = regExpValue.companyWebsite;

    res.render('add-change-company-website', {
        userInput: inputFields,
        activeLink,
        contactEmail,
        loggedIn,
        addOrChangeProperty,
        companyWebsite,
        companyWebsiteAttributes,
        patternCompanyWebsite,
        companyWebsiteError,
        htmlTitle
    });

});

exports.changeEmail = wrapAsync(async function(req, res) {

    let { email } = req.session.userValues;
    
    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, changedEmailError, confirmationEmailError, currentPasswordError } = req.session.transfer;
        delete req.session.transfer;

        // Set object to previous form input.
        var inputFields = cleanedFields;

    } else {

        // If req.session inputs aren't used set every property to an empty string.
        var inputFields = logicUserAccounts.makeFieldsEmpty(formFields.changeEmail);

    }

    // For rendering.
    let activeLink = 'change-email';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;

    let emailAttributes = renderValue.emailField.attributes;
    let passwordAttributes = renderValue.passwordField.attributes;
    let currentEmail = email;
    let patternChangedEmail = regExpValue.email;

    res.render('change-email', {
        userInput: inputFields,
        activeLink,
        contactEmail,
        loggedIn,
        emailAttributes,
        passwordAttributes,
        currentEmail,
        changedEmailError,
        confirmationEmailError,
        currentPasswordError,
        patternChangedEmail
    });

});

exports.changePassword = wrapAsync(async function(req, res) {

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, currentPasswordError, changedPasswordError, confirmationPasswordError } = req.session.transfer;

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

    let allPasswordsAttributes = renderValue.passwordField.attributes;
    let patternChangedPassword = regExpValue.password;

    res.render('change-password', {
        userInput: inputFields,
        activeLink,
        contactEmail,
        loggedIn,
        currentPasswordError,
        changedPasswordError,
        confirmationPasswordError,
        allPasswordsAttributes,
        patternChangedPassword
    });
    
});

exports.confirmationLimitReached = wrapAsync(async function(req, res) {

    // Initial checks.  If queries were absent or fake forward to page-not-found.
    let email = req.query.email ? req.query.email : '';
    if (email === '') return res.status(404).redirect('/page-not-found');

    let unverifiedUser = await UnverifiedUser.findOne({ email });
    if (!unverifiedUser) return res.status(404).redirect('/page-not-found');

    // If number is out of range redirect to page-not-found.  Counter stops incrementing at max + 1 and stays at that number.
    if (unverifiedUser.numberOfConfirmations != defaultValue.numberOfEmailConfirmationsAllowed + 1) return res.status(404).redirect('/page-not-found');

    let isResetAttemptBeforeVerified = req.query.resetattempt === 'true' ? true : false;

    let emailSubject = emailMessage.verificationEmailSubject();
    let expirationTime = timeValue.getExpirationTime(timeValue.unverifiedUserExpiration);
    let emailBody = emailMessage.verificationEmailBody(confirmationHash, isResetAttemptBeforeVerified);
    
    communication.sendEmail(email, emailSubject, emailBody);

    let htmlBody = defaultMessage.confirmationLimitReachedBody(email, emailSubject, expirationTime, isResetAttemptBeforeVerified);

    // For rendering.
    let activeLink = 'confirmation-limit-reached';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;

    res.render('confirmation-limit-reached', { activeLink, contactEmail, loggedIn, htmlBody });

});

exports.confirmationSent = wrapAsync(async function(req, res) {

    // If the email is not present redirect to page-not-found.
    let email = req.query.email ? req.query.email : '';
    if (email === '') return res.status(404).redirect('/page-not-found');

    let isNewRegister = req.query.newregister === 'true' ? true : false;
    let isUnverifiedMultipleRegisters = req.query.unverifiedmultipleregisters === 'true'  ? true : false;
    let isConfirmationResent = req.query.resend === 'true' ? true : false;
    let isResetAttemptBeforeVerified = req.query.resetattempt === 'true' ? true : false;

    // If none of the queries are present or correct redirect to page-not-found.
    if (
        isNewRegister === false &&
        isUnverifiedMultipleRegisters === false &&
        isConfirmationResent === false &&
        isResetAttemptBeforeVerified === false
        ) {
            return res.status(404).redirect('/page-not-found'); 
        }

    // If no user exists redirect to page-not-found.
    let unverifiedUser = await UnverifiedUser.findOne({ email });
    if (!unverifiedUser) return res.status(404).redirect('/page-not-found');

    let numberOfConfirmations = unverifiedUser.numberOfConfirmations += 1;

    // If the user has equaled or exceeded the maximum number of confirmations redirect them to the confirmation limit reached page.
    if (numberOfConfirmations > defaultValue.numberOfEmailConfirmationsAllowed) {

        await UnverifiedUser.updateOne({ email }, { numberOfConfirmations: defaultValue.numberOfEmailConfirmationsAllowed + 1 });

        return res.redirect(`/confirmation-limit-reached?email=${ email }`);

    } 

    await UnverifiedUser.updateOne({ email }, { numberOfConfirmations });

    let { confirmationHash } = unverifiedUser;    
    let emailSubject = emailMessage.verificationEmailSubject();
    let emailBody = emailMessage.verificationEmailBody(confirmationHash, isResetAttemptBeforeVerified);
        
    communication.sendEmail(email, emailSubject, emailBody);

    let htmlBody = defaultMessage.confirmationSentBody(email, emailSubject, isNewRegister, isUnverifiedMultipleRegisters, isConfirmationResent, isResetAttemptBeforeVerified);

    // For rendering.
    let activeLink = 'confirmation-sent';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;

    res.render('confirmation-sent', { activeLink, contactEmail, loggedIn, htmlBody, email, emailSubject });
});

exports.deleteYourAccount = wrapAsync(async function(req, res) {

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, currentPasswordError } = req.session.transfer;
        delete req.session.transfer;

        // Set object to previous form input.
        var inputFields = cleanedFields;

    } else {
        // If req.session data isn't used set every property to an empty string.
        var inputFields = logicUserAccounts.makeFieldsEmpty(formFields.deleteYourAccount);
    }

    // For rendering.
    let activeLink = 'delete-your-account';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;
    let passwordAttributes = renderValue.passwordField.attributes;

    res.render('delete-your-account', { userInput: inputFields, activeLink, contactEmail, loggedIn, passwordAttributes, currentPasswordError });
});

exports.login = wrapAsync( async function(req, res) {

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, currentEmailError, currentPasswordError } = req.session.transfer;
        delete req.session.transfer;

        // Set object to previous form input.
        var inputFields = cleanedFields;

        // Clear currentPassword for rendering.
        inputFields.currentPassword = '';

    } else {
        // If req.session data isn't used set every property to an empty string.
        var inputFields = logicUserAccounts.makeFieldsEmpty(formFields.login);
    }

    // For rendering.
    let activeLink = 'login';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;
    let emailAttributes  = renderValue.emailField.attributes;
    let passwordAttributes = renderValue.passwordField.attributes;
    let patternCurrentEmail = regExpValue.email;
    let patternCurrentPassword = regExpValue.password;

    res.render('login', {
        userInput: inputFields,
        activeLink,
        contactEmail,
        loggedIn,
        emailAttributes,
        passwordAttributes,
        currentEmailError,
        currentPasswordError,
        patternCurrentEmail,
        patternCurrentPassword
    });

});

exports.loginFailureLimitReached = wrapAsync(async function(req, res) {

    // Initial checks.  If queries were absent or fake forward to page-not-found.
    let email = req.query.email ? req.query.email : '';
    if (email === '') return res.status(404).redirect('/page-not-found');

    let loginFailure = await LoginFailure.findOne({ email });
    if (!loginFailure) return res.status(404).redirect('/page-not-found');

    // If numberOfFailures doesn't equal max + 1 the client shouldn't be here.
    if (loginFailure.numberOfFailures != defaultValue.numberOfLoginFailuresAllowed + 1) return res.redirect('/page-not-found');

    // For rendering.
    let activeLink = 'login-failure-limit-reached';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = false;

    let expirationTime = timeValue.getExpirationTime(timeValue.loginFailureExpiration);

    res.render('login-failure-limit-reached', { activeLink, contactEmail, loggedIn, expirationTime });

});

exports.logout = wrapAsync(async function(req, res) {

    return logoutSteps.logoutUser(req, res, '/index');

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
        winterizations,
        shouldBrowserFocusOnURLNotActiveError,
        urlNotActiveError
    } = req.session.userValues;

    let isAccountUpgraded = companyProfileType === defaultValue.accountUpgrade ? true : false;

    // Start the Message / Stripe section.
    let failMessage, noChangeMessage, successMessage;

    // Both queries should never exist in the same response.  If they do this indicates shenanigans.  Log out the user.
    if (req.query.success && req.query.cancel) {
        return logoutSteps.logoutUser(req, res, '/index');
    }

    // The success query string, success=${ stripeSuccessString } is set up in middlewareStripe.postCreateCheckoutSession.  
    // If the success query exists it is because Stripe sent the user here.    
    if (req.query.success) {

        // Get the data from the DB to make sure the query string was real.  Below use paymentIntent as a key to update the db.
        // If stripeSuccessKey doesn't exist there are 2 reasons.  1) webhookPremiumUpgrade got there first and already deleted it after use.  2) success was a fake key.
        let stripeSuccessKey = await StripeSuccessKey.findOne({ entryKey: req.query.success });

        let paymentIntent = stripeSuccessKey ? stripeSuccessKey.paymentIntent : null;

        if (paymentIntent) {

            // Both webhookPremiumUpgrade and myAccount can update the DB.  Whichever is faster does the job.
            // This redundancy from webhookPremiumUpgrade ensures that the DB update always happens even if the session is lost because the client or server crashed.
            await logicStripe.stripeSuccessUpdateDB(paymentIntent);

            // Update the session values and other variables to reflect the upgrade that took place in stripeSuccessUpdateDB(paymentIntent).
            let userValues = await User.findOne({ email });
            req.session.userValues = userValues;

            companyProfileType = req.session.userValues.companyProfileType;
            expirationDate = req.session.userValues.expirationDate;
        
            isAccountUpgraded = true;
            successMessage = stripeValue.successMessage; 

        }
        
    } 

    // my-acccount is used as the Stripe cancel route.  my-account?cancel=${ stripeCancelString }
    if (req.query.cancel) {

        let doesStripeCancelKeyExist = await StripeCancelKey.exists({ entryKey: req.query.cancel });
        if (doesStripeCancelKeyExist) failMessage = stripeValue.cancelMessage;

    }

    // Both keys are always created in middlewareStripe.postCreateCheckoutSession.  Just to be careful if either exists delete them both.
    if (req.query.success || req.query.cancel) {

        await StripeSuccessKey.findOneAndRemove({ email });
        await StripeCancelKey.findOneAndRemove({ email });  
        
    }

    // A successMessage is created whenever there is a successful addChange on the account properties.
    if (req.session.userValues.successMessage) {

        successMessage = req.session.userValues.successMessage;
        delete req.session.userValues.successMessage;

    }

    // A successMessage is created whenever there is a successful addChange on the account properties.
    if (req.session.userValues.noChangeMessage) {

        noChangeMessage = req.session.userValues.noChangeMessage;
        delete req.session.userValues.noChangeMessage;

    }

    // This value comes from logicUserAccounts.testFormattedURL.
    // When a company website is changed or added the update to the session and DB happens immediately.  
    // testFormattedURL runs in the background to check if the URL is active.  After the check is done the result is stored in the DB.
    if (urlNotActiveError === true) {

        var urlNotActiveMessage = defaultMessage.urlNotActiveMessage;

        if (shouldBrowserFocusOnURLNotActiveError === true) {

            // Updated in the DB and on the session so that it focuses only one time when a URL error occurs.
            await User.updateOne({ email }, { shouldBrowserFocusOnURLNotActiveError: false });
            req.session.userValues.shouldBrowserFocusOnURLNotActiveError = false;

        }
        
    }

    // Prepare Date information for rendering.
    let memberSince = `${ new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(createdAt)) } ${ new Date(createdAt).getFullYear() }`;

    let numberOfDaysUntilExpiration, isUpgradeExpirationSoon, premiumAccountExtendsAvailable, premiumExpirationDate;

    if (isAccountUpgraded === true) {
        
        numberOfDaysUntilExpiration = logicUserAccounts.getNumberOfDaysUntilExpiration(new Date(expirationDate));
        isUpgradeExpirationSoon = checks.checkIsUpgradeExpirationSoon(numberOfDaysUntilExpiration);
        premiumAccountExtendsAvailable = checks.checkArePremiumAccountExtendsAvailable(new Date(expirationDate), isUpgradeExpirationSoon);
        premiumExpirationDate = logicUserAccounts.getPremiumExpirationDate(new Date(expirationDate));

    }
    
    // let companyStreetAssembled = logicUserAccounts.getCompanyStreetFull(companyStreet, companyStreetTwo);
    let companyRegionAssembled = logicUserAccounts.getCompanyRegionFull(companyCity, companyState, companyZip);

    // These next steps are used determine the rendering value for company services.
    let doCompanyServicesHaveValue = checks.checkCompanyServicesHaveValue (
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
        );

    let companyServicesMyAccountValue;
    if (doCompanyServicesHaveValue === true) {

        companyServicesMyAccountValue = logicUserAccounts.assembleCompanyServices (
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
        );

    } else {
        companyServicesMyAccountValue = defaultMessage.myAccountInformationEmpty;
    }

    // The next steps are used to determine if the account is Live and for rendering.
    let companyDescriptionMyAccountValue = companyDescription ? companyDescription : defaultMessage.myAccountInformationEmpty;
    let companyNameMyAccountValue = companyName ? companyName : defaultMessage.myAccountInformationEmpty;
    let companyPhoneMyAccountValue = companyPhone ? companyPhone : defaultMessage.myAccountInformationEmpty;
    let companyWebsiteMyAccountValue = companyWebsite ? companyWebsite : defaultMessage.myAccountInformationEmpty;

    // The account value for address has to be processed separately.
    let companyStreetMyAccountValue, companyStreetTwoMyAccountValue, companyRegionMyAccountValue;
    if (companyStreet && companyRegionAssembled) {

        companyStreetMyAccountValue = companyStreet;
        if (companyStreetTwo) companyStreetTwoMyAccountValue = companyStreetTwo;
        companyRegionMyAccountValue = companyRegionAssembled;

    } else {
        companyStreetMyAccountValue = defaultMessage.myAccountInformationEmpty;
    }

    // Check to see if properties were added.  During rendering, typeof === string check won't work because all accountValues store a string even if empty.
    let isCompanyAddressAdded = companyStreetMyAccountValue === defaultMessage.myAccountInformationEmpty ? false : true;
    let isCompanyDescriptionAdded = companyDescriptionMyAccountValue === defaultMessage.myAccountInformationEmpty ? false : true;
    let isCompanyNameAdded = companyNameMyAccountValue === defaultMessage.myAccountInformationEmpty ? false : true;
    let isCompanyPhoneAdded = companyPhoneMyAccountValue === defaultMessage.myAccountInformationEmpty ? false : true;
    let isCompanyServicesAdded = companyServicesMyAccountValue === defaultMessage.myAccountInformationEmpty ? false : true;
    let isCompanyWebsiteAdded = companyWebsiteMyAccountValue === defaultMessage.myAccountInformationEmpty ? false : true;

    let isAccountLive = 
        isCompanyAddressAdded === true &&
        isCompanyNameAdded === true &&
        isCompanyPhoneAdded === true &&
        isCompanyServicesAdded === true
        ? true : false;

    // This tells the user which properties he needs to add to make his account live.
    let companyPropertiesUnfilled = logicUserAccounts.assembleCompanyPropertiesUnfilled(isCompanyNameAdded, isCompanyPhoneAdded, isCompanyAddressAdded, isCompanyServicesAdded);

    // For rendering.
    let activeLink = 'my-account';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = true;

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
        noChangeMessage,
        numberOfDaysUntilExpiration,
        password,
        premiumAccountExtendsAvailable,
        premiumExpirationDate,
        shouldBrowserFocusOnURLNotActiveError,
        successMessage,
        upgradedProfileName: defaultValue.accountUpgrade,
        upgradeSalesPitch: defaultMessage.upgradeSalesPitch,
        urlNotActiveMessage
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

    // Initial checks.  If queries were absent or fake forward to page-not-found.
    let hash = req.query.hash ? req.query.hash : '';
    if (hash === '') return res.status(404).redirect('/page-not-found');

    let passwordResetRequest = await PasswordResetRequest.findOne({ confirmationHash: hash });
    if (!passwordResetRequest) return res.status(404).redirect('/page-not-found');

    // If there is an error available from previous postPasswordReset grab it from req.session and then delete it.
    if (req.session.transfer) {
        var { cleanedFields, changedPasswordError, confirmationPasswordError } = req.session.transfer;

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
    let passwordAttributes = renderValue.passwordField.attributes;
    let patternChangedPassword = regExpValue.password;

    res.render('password-reset', { userInput: inputFields, activeLink, contactEmail, loggedIn, hash, changedPasswordError, confirmationPasswordError, passwordAttributes, patternChangedPassword });
});

exports.passwordResetRequest = wrapAsync(async function(req, res) {

    // If transfer data exists from postPasswordResetRequest grab it from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, currentEmailError } = req.session.transfer;
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
    let emailAttributes = renderValue.emailField.attributes;
    let patternCurrentEmail = regExpValue.email;

    res.render('password-reset-request', { userInput: inputFields, activeLink, contactEmail, loggedIn, currentEmailError, emailAttributes, patternCurrentEmail });

});

exports.passwordResetRequestSent = wrapAsync(async function(req, res) {

    // Initial checks.  If queries were absent or fake forward to page-not-found.
    let email = req.query.email ? req.query.email : '';
    if (email === '') return res.status(404).redirect('/page-not-found');

    let doesPasswordResetRequestExist = await PasswordResetRequest.exists({ email });
    if (doesPasswordResetRequestExist === false) return res.status(404).redirect('/page-not-found');

    let emailSubject = emailMessage.passwordResetRequestEmailSubject();
    let expirationTime = timeValue.getExpirationTime(timeValue.passwordResetRequestExpiration);

    // For rendering.
    let activeLink = 'password-reset-request-sent';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;
    
    res.render('password-reset-request-sent', { activeLink, contactEmail, loggedIn, email, emailSubject, expirationTime });

});

exports.passwordResetLimitReached = wrapAsync(async function(req, res) {

    // Initial checks.  If queries were absent or fake forward to page-not-found.
    let email = req.query.email ? req.query.email : '';
    if (email === '') return res.status(404).redirect('/page-not-found');

    let passwordResetRequest = await PasswordResetRequest.findOne({ email });
    if (!passwordResetRequest) return res.status(404).redirect('/page-not-found');

    // If number is out of range redirect to page-not-found.  Counter stops incrementing at max + 1 and stays at that number.
    if (passwordResetRequest.numberOfRequests != defaultValue.numberOfEmailConfirmationsAllowed + 1) return res.status(404).redirect('/page-not-found');

    // For rendering.
    let activeLink = 'password-reset-limit-reached';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;
    let emailSubject = emailMessage.passwordResetRequestEmailSubject();
    let expirationTime = timeValue.getExpirationTime(timeValue.passwordResetRequestExpiration);

    res.render('password-reset-limit-reached', { activeLink, contactEmail, loggedIn, email, emailSubject, expirationTime });

});

exports.passwordResetSuccess = wrapAsync(async function(req, res) {

    // Initial checks.  If queries were absent or fake forward to page-not-found.
    let email = req.query.email ? req.query.email : '';
    if (email === '') return res.status(404).redirect('/page-not-found');

    let doesRecentPasswordResetSuccessExist = await RecentPasswordResetSuccess.exists({ email });
    if (doesRecentPasswordResetSuccessExist === false) return res.status(404).redirect('/page-not-found');

    // For rendering.
    let activeLink = 'password-reset-success';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;

    res.render('password-reset-success', { activeLink, contactEmail, loggedIn });

});

exports.postChangeEmail = wrapAsync(async function(req, res) {

    // Sanitize and process input.
    let cleanedFields = logicUserAccounts.cleanFields(formFields.changeEmail, req.body);
    let { changedEmail, confirmationEmail, currentPassword } = cleanedFields;
    let { email } = req.session.userValues;

    let changeProperty = 'email';

    let isChangedEmailFilled = changedEmail === '' ? false : true;

    // Check for a change.  If nothing changed redirect to MyAccount.
    let isEmailUnchanged = email === changedEmail ? true : false;
    if (isChangedEmailFilled === true && isEmailUnchanged === true) {

        req.session.userValues.noChangeMessage = defaultMessage.noChange(changeProperty);
        return res.redirect('/my-account');

    }

    let isChangedEmailInsideMaxLength = checks.checkIfInputInsideMaxLength(changedEmail, renderValue.emailField.maxLength);
    let regExpChangedEmail = new RegExp(regExpValue.email, 'i');
    let isChangedEmailValidCharacters = regExpChangedEmail.test(changedEmail);
    let isChangedEmailValid = emailValidator.validate(changedEmail);
    let isChangedEmailAvailableInUnverifiedUsers = !(await UnverifiedUser.exists({ email: changedEmail }));
    let isChangedEmailAvailableInUsers = !(await User.exists({ email: changedEmail }));

    // If changedEmail has any errors clear out confirmationEmail & currentPassword which will trigger an error for confirmationEmail & currentPassword as well.
    if (
        isChangedEmailFilled === false ||
        isChangedEmailInsideMaxLength === false ||
        isChangedEmailValidCharacters === false ||
        isChangedEmailValid === false ||
        isChangedEmailAvailableInUnverifiedUsers === false ||
        isChangedEmailAvailableInUsers === false
        ) {

        confirmationEmail = '';
        cleanedFields.confirmationEmail = '';
        currentPassword = '';
        cleanedFields.currentPassword = '';

    }

    let isConfirmationEmailFilled = confirmationEmail === '' ? false : true;
    let doEmailsMatch = changedEmail === confirmationEmail ? true : false; 

    // If confirmationEmail has any errors clear out confirmationEmail & currentPassword.  This will trigger an error for currentPassword as well.
    if (
        isConfirmationEmailFilled === false ||
        confirmationEmail === false
        ) {

        confirmationEmail = '';
        cleanedFields.confirmationEmail = '';
        currentPassword = '';
        cleanedFields.currentPassword = '';

    }

    let isCurrentPasswordFilled = currentPassword === '' ? false : true;
    let isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, req.session.userValues.password);

    // If currentPassword has any errors clear it out.
    if(isCurrentPasswordFilled === false || isCurrentPasswordCorrect === false) {

        currentPassword = '';
        cleanedFields.currentPassword = '';

    }
    
    if (
        isChangedEmailFilled === true &&
        isChangedEmailInsideMaxLength === true &&
        isChangedEmailValidCharacters === true &&
        isChangedEmailValid === true &&
        isChangedEmailAvailableInUnverifiedUsers === true &&
        isChangedEmailAvailableInUsers === true &&
        isConfirmationEmailFilled === true &&
        doEmailsMatch === true &&
        isCurrentPasswordFilled === true &&
        isCurrentPasswordCorrect === true
    ) {

        await User.updateOne({ email }, { email: changedEmail });

        let changeProperty = 'email';
        let changeVerb = defaultMessage.companyPropertyChangeVerb.update;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);
        req.session.userValues.email = changedEmail;

        // Notify the user of the change.
        let emailSubject = emailMessage.emailChangedSubject();
        let emailBody = emailMessage.emailChangedBody(email, changedEmail);
        communication.sendEmail(email, emailSubject, emailBody);

        return res.redirect('/my-account');

    } else {

        // Create and redirect the errors to changeEmail where they will be rendered and deleted.
        let changedEmailError = errorMessage.getChangedEmailError(isChangedEmailFilled, isChangedEmailInsideMaxLength, isChangedEmailValidCharacters, isChangedEmailValid, isChangedEmailAvailableInUnverifiedUsers, isChangedEmailAvailableInUsers);
        let confirmationEmailError = errorMessage.getChangedEmailConfirmationError(isConfirmationEmailFilled, doEmailsMatch);
        let currentPasswordError = errorMessage.getCurrentPasswordError(isCurrentPasswordFilled, isCurrentPasswordCorrect);

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.changedEmailError = changedEmailError;
        req.session.transfer.confirmationEmailError = confirmationEmailError;
        req.session.transfer.currentPasswordError = currentPasswordError;

        return res.redirect('/change-email');

    }

});

exports.postChangePassword = wrapAsync(async function(req, res) {

    // Sanitize and process input.
    let cleanedFields = logicUserAccounts.cleanFields(formFields.changePassword, req.body);
    let { currentPassword, changedPassword, confirmationPassword } = cleanedFields;
    let { email } = req.session.userValues;

    let changeProperty = 'password';

    let isCurrentPasswordFilled = currentPassword === '' ? false : true;
    let isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, req.session.userValues.password);

    // If nothing changed send user back to my-account.  Don't check unless isCurrentPasswordCorrect is true.
    if (isCurrentPasswordCorrect === true) {

        let isPasswordUnchanged = await bcrypt.compare(changedPassword, req.session.userValues.password);

        if (isPasswordUnchanged === true) {

            req.session.userValues.noChangeMessage = defaultMessage.noChange(changeProperty);
            return res.redirect('/my-account');

        }

    }

    // If currentPassword has any errors clear it out for rendering.
    if (isCurrentPasswordFilled === false || isCurrentPasswordCorrect === false) {
        currentPassword = '';
        cleanedFields.currentPassword = '';
    }

    let isChangedPasswordFilled = changedPassword === '' ? false : true;
    let isChangedPasswordInsideMaxLength = checks.checkIfInputInsideMaxLength(changedPassword, renderValue.passwordField.maxLength);
    let regExpPassword = new RegExp(regExpValue.password, 'i');
    let isChangedPasswordValidCharacters = regExpPassword.test(changedPassword);
    let doesChangedPasswordMeetRequirements = checks.checkPasswordMeetsRequirements(changedPassword);

    // If changedPassword has any errors clear it out and confirmationPassword which will trigger an error for it as well.
    if (
        isChangedPasswordFilled === false ||
        isChangedPasswordInsideMaxLength === false ||
        isChangedPasswordValidCharacters === false ||
        doesChangedPasswordMeetRequirements === false
        ) {
        changedPassword = '';
        cleanedFields.changedPassword = '';
        confirmationPassword = '';
        cleanedFields.confirmationPassword = '';
    }

    let isConfirmationPasswordFilled = confirmationPassword === '' ? false : true;
    let doPasswordsMatch = changedPassword === confirmationPassword ? true : false;

    // If confirmationPassword has any errors clear it out for rendering.
    if (isConfirmationPasswordFilled === false || doPasswordsMatch === false) {
        confirmationPassword = '';
        cleanedFields.confirmationPassword = '';
    }

    if (
        isCurrentPasswordFilled === true &&
        isCurrentPasswordCorrect === true &&
        isChangedPasswordFilled === true &&
        isChangedPasswordInsideMaxLength === true &&
        isChangedPasswordValidCharacters === true &&
        doesChangedPasswordMeetRequirements === true &&
        isConfirmationPasswordFilled === true &&
        doPasswordsMatch === true
    ) {

        // If any of these are stored in the DB delete them.
        await LoginFailure.findOneAndRemove({ email });
        await PasswordResetRequest.findOneAndRemove({ email });

        let passwordHashed = await logicUserAccounts.hashPassword(changedPassword);

        await User.updateOne({ email }, { password: passwordHashed });

        // Notify the user of the change.
        let emailSubject = emailMessage.passwordChangedSubject();
        let emailBody = emailMessage.passwordChangedBody(email);
        communication.sendEmail(email, emailSubject, emailBody);

        let changeProperty = 'password';
        let changeVerb = defaultMessage.companyPropertyChangeVerb.update;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);
        req.session.userValues.password = passwordHashed;

        return res.redirect('/my-account');

    } else {

        // Create and redirect the errors to changePassword where they will be rendered and deleted.
        let currentPasswordError = errorMessage.getCurrentPasswordError(isCurrentPasswordFilled, isCurrentPasswordCorrect);
        let changedPasswordError = errorMessage.getChangedPasswordError(isChangedPasswordFilled, isChangedPasswordInsideMaxLength, isChangedPasswordValidCharacters, doesChangedPasswordMeetRequirements);
        let confirmationPasswordError = errorMessage.getChangedConfirmationPasswordError(isConfirmationPasswordFilled, doPasswordsMatch);

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.currentPasswordError = currentPasswordError;
        req.session.transfer.changedPasswordError = changedPasswordError;
        req.session.transfer.confirmationPasswordError = confirmationPasswordError;

        return res.redirect('/change-password');
        
    }

});

exports.postAddChangeCompanyAddress = wrapAsync(async function(req, res) {

    // Sanitize and process input.
    let cleanedFields = logicUserAccounts.cleanFields(formFields.addChangeCompanyAddress, req.body);
    let { companyCity, companyState, companyStreet, companyStreetTwo, companyZip, useOriginalInput, deleteProperty } = cleanedFields;
    let { email } = req.session.userValues;

    let changeProperty = 'address';
    let changeVerb;

    if (deleteProperty === 'true') {

        await User.updateOne({ email }, { 
            companyStreet: '',
            companyStreetTwo: '',
            companyCity: '',
            companyState: '',
            companyZip: '',
            live: false
        });

        req.session.userValues.companyStreet = '';
        req.session.userValues.companyStreetTwo = '';
        req.session.userValues.companyCity = '';
        req.session.userValues.companyState = '';
        req.session.userValues.companyZip = '';
        req.session.userValues.live = false;

        changeVerb = defaultMessage.companyPropertyChangeVerb.delete;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

        return res.redirect('/my-account');

    }

    let isCompanyStreetFilled = companyStreet === '' ? false : true;
    let isCompanyStreetTwoFilled = companyStreetTwo === '' ? false : true;
    let isCompanyCityFilled = companyCity === '' ? false : true;
    let isCompanyStateFilled = companyState === '' ? false : true;
    let isCompanyZipFilled = companyZip === '' ? false : true;

    // Capitalize the input.  This needs to be done before values are compared.
    let capitalizeEveryWordPattern = new RegExp(regExpValue.capitalizeEveryWord, 'g');

    if (isCompanyStreetFilled === true) {

        companyStreet = companyStreet.replace(capitalizeEveryWordPattern, function(match) { return match.toUpperCase() });
        cleanedFields.companyStreet = companyStreet;

    }

    if (isCompanyStreetTwoFilled === true) {

        companyStreetTwo = companyStreetTwo.replace(capitalizeEveryWordPattern, function(match) { return match.toUpperCase() });
        cleanedFields.companyStreetTwo = companyStreetTwo;

    }

    if (isCompanyCityFilled === true) {

        companyCity = companyCity.replace(capitalizeEveryWordPattern, function(match) { return match.toUpperCase() });
        cleanedFields.companyCity = companyCity;

    }

    // Check for a change.  If the form is filled out and nothing changed redirect to my-account using next 2 blocks.
    let isCompanyAddressUnchanged =
        req.session.userValues.companyCity === companyCity &&
        req.session.userValues.companyState === companyState &&
        req.session.userValues.companyStreet === companyStreet &&
        req.session.userValues.companyStreetTwo === companyStreetTwo &&
        req.session.userValues.companyZip === companyZip 
        ? true : false;

    if (
        isCompanyAddressUnchanged === true &&
        isCompanyStreetFilled === true &&
        isCompanyCityFilled === true &&
        isCompanyStateFilled === true &&
        isCompanyZipFilled === true
        ) {

            req.session.userValues.noChangeMessage = defaultMessage.noChange(changeProperty);
            return res.redirect('/my-account');

        }

    let regExpCompanyStreet = new RegExp(regExpValue.companyStreet, 'i');
    let isCompanyStreetValidCharacters = regExpCompanyStreet.test(companyStreet);
    let isCompanyStreetInsideMinLength = companyStreet.length >= renderValue.companyStreetField.minLength ? true : false;
    let isCompanyStreetInsideMaxLength = companyStreet.length <= renderValue.companyStreetField.maxLength ? true : false;

    if (isCompanyStreetTwoFilled === true) {

        let regExpCompanyStreetTwo = new RegExp(regExpValue.companyStreetTwo, 'i');
        var isCompanyStreetTwoValidCharacters = regExpCompanyStreetTwo.test(companyStreetTwo);
        var isCompanyStreetTwoInsideMinLength = companyStreetTwo.length >= renderValue.companyStreetTwoField.minLength ? true : false;
        var isCompanyStreetTwoInsideMaxLength = companyStreetTwo.length <= renderValue.companyStreetTwoField.maxLength ? true : false;

    }

    let regExpCompanyCity = new RegExp(regExpValue.companyCity, 'i');
    let isCompanyCityValidCharacters = regExpCompanyCity.test(companyCity);
    let isCompanyCityInsideMinLength = companyCity.length >= renderValue.companyCityField.minLength ? true : false;
    let isCompanyCityInsideMaxLength = companyCity.length <= renderValue.companyCityField.maxLength ? true : false;

    let isCompanyStateValid = checks.checkCompanyStateValid(companyState);
    
    let isCompanyZipFiveDigits = companyZip.length === 5 ? true : false;

    let regExpCompanyZip = new RegExp(regExpValue.companyZip, 'i');
    let isCompanyZipValidCharacters = regExpCompanyZip.test(companyZip);

    // Don't waste the bandwidth on usps.verify if there are other errors to deal with first.
    let isCompanyAddressNormalized, uspsNormalized, isCompanyAddressValid;
    if(
        isCompanyStreetFilled === true &&
        isCompanyStreetInsideMinLength === true &&
        isCompanyStreetInsideMaxLength === true &&
        isCompanyStreetValidCharacters === true &&
        isCompanyStreetTwoInsideMinLength !== false &&
        isCompanyStreetTwoInsideMaxLength !== false &&
        isCompanyStreetTwoValidCharacters !== false &&
        isCompanyCityFilled === true &&
        isCompanyCityInsideMinLength === true &&
        isCompanyCityInsideMaxLength === true &&
        isCompanyCityValidCharacters === true &&
        isCompanyStateFilled === true &&
        isCompanyStateValid === true &&
        isCompanyZipFilled === true &&
        isCompanyZipFiveDigits === true &&
        isCompanyZipValidCharacters === true
    ) {

        uspsNormalized = await usps.verify({
            street1: companyStreet,
            street2: companyStreetTwo,
            city: companyCity,
            state: companyState,
            zip: companyZip
        });

        isCompanyAddressNormalized = checks.checkCompanyAddressNormalized(companyStreet, companyStreetTwo, companyCity, companyState, companyZip, uspsNormalized);

        // If USPS can't normalize the address it returns a .name property that holds the value 'USPS Webtools Error'.
        // If there is no error .name is not returned.
        isCompanyAddressValid = uspsNormalized.name === undefined ? true : false;

    }

    if (
        isCompanyStreetFilled === true &&
        isCompanyStreetInsideMinLength === true &&
        isCompanyStreetInsideMaxLength === true &&
        isCompanyStreetValidCharacters === true &&
        isCompanyStreetTwoInsideMinLength !== false &&
        isCompanyStreetTwoInsideMaxLength !== false &&
        isCompanyStreetTwoValidCharacters !== false &&
        isCompanyCityFilled === true &&
        isCompanyCityInsideMinLength === true &&
        isCompanyCityInsideMaxLength === true &&
        isCompanyCityValidCharacters === true &&
        isCompanyStateFilled === true &&
        isCompanyStateValid === true &&
        isCompanyZipFilled === true &&
        isCompanyZipFiveDigits === true &&
        isCompanyZipValidCharacters === true &&
        isCompanyAddressValid === true &&
        (isCompanyAddressNormalized === true || useOriginalInput === 'true')
    ) {

        // True / False boolean.  If every account property has a value the account is live.
        let areAllAccountPropertiesFilled = checks.checkAllAccountPropertiesFilled(req.session.userValues, 'companyAddress');

        await User.updateOne({ email }, { 
            companyStreet: companyStreet,
            companyStreetTwo: companyStreetTwo,
            companyCity: companyCity,
            companyState: companyState,
            companyZip: companyZip,
            live: areAllAccountPropertiesFilled
        }); 

        let wasCompanyAddressAdded =
            req.session.userValues.companyStreet === '' &&
            req.session.userValues.companyCity === '' &&
            req.session.userValues.companyState === '' &&
            req.session.userValues.companyZip === ''
            ? true : false;

        changeVerb = wasCompanyAddressAdded === true ? defaultMessage.companyPropertyChangeVerb.add : defaultMessage.companyPropertyChangeVerb.update;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

        req.session.userValues.companyStreet = companyStreet;
        req.session.userValues.companyStreetTwo = companyStreetTwo;
        req.session.userValues.companyCity = companyCity;
        req.session.userValues.companyState = companyState;
        req.session.userValues.companyZip = companyZip;

        return res.redirect('/my-account');

    } else if (
        isCompanyStreetFilled === true &&
        isCompanyStreetInsideMinLength === true &&
        isCompanyStreetInsideMaxLength === true &&
        isCompanyStreetValidCharacters === true &&
        isCompanyStreetTwoInsideMinLength !== false &&
        isCompanyStreetTwoInsideMaxLength !== false &&
        isCompanyStreetTwoValidCharacters !== false &&
        isCompanyCityFilled === true &&
        isCompanyCityInsideMinLength === true &&
        isCompanyCityInsideMaxLength === true &&
        isCompanyCityValidCharacters === true &&
        isCompanyStateFilled === true &&
        isCompanyStateValid === true &&
        isCompanyZipFilled === true &&
        isCompanyZipFiveDigits === true &&
        isCompanyZipValidCharacters === true &&
        isCompanyAddressValid === true &&
        isCompanyAddressNormalized === false
    ) {

        req.session.uspsNormalized = {};
        req.session.uspsNormalized.companyStreet = uspsNormalized.street1;
        req.session.uspsNormalized.companyStreetTwo = uspsNormalized.street2;
        req.session.uspsNormalized.companyCity = uspsNormalized.city;
        req.session.uspsNormalized.companyState = uspsNormalized.state;
        req.session.uspsNormalized.companyZip = uspsNormalized.Zip5;

        req.session.originalInput = {};
        req.session.originalInput.companyStreet = cleanedFields.companyStreet;
        req.session.originalInput.companyStreetTwo = cleanedFields.companyStreetTwo;
        req.session.originalInput.companyCity = cleanedFields.companyCity;
        req.session.originalInput.companyState = cleanedFields.companyState;
        req.session.originalInput.companyZip = cleanedFields.companyZip;

        return res.redirect('/add-change-company-address');

    } else {
        
        // Create and redirect the errors to changeCompanyAddress where they will be rendered and deleted from the session.
        let companyStreetError = errorMessage.getCompanyStreetError(isCompanyStreetFilled, isCompanyStreetValidCharacters, isCompanyStreetInsideMinLength, isCompanyStreetInsideMaxLength, isCompanyAddressValid);
        let companyStreetTwoError = errorMessage.getCompanyStreetTwoError(isCompanyStreetTwoValidCharacters, isCompanyStreetTwoInsideMinLength, isCompanyStreetTwoInsideMaxLength);
        let companyCityError = errorMessage.getCompanyCityError(isCompanyCityFilled, isCompanyCityValidCharacters, isCompanyCityInsideMinLength, isCompanyCityInsideMaxLength);
        let companyStateError = errorMessage.getCompanyStateError(isCompanyStateFilled, isCompanyStateValid);
        let companyZipError = errorMessage.getCompanyZipError(isCompanyZipFilled, isCompanyZipValidCharacters, isCompanyZipFiveDigits);

        // If the USPS sends an error that the street does not exist clear out all other errors and only show that error.
        if (isCompanyAddressValid === false) {

            companyStreetTwoError = undefined;
            companyCityError = undefined;
            companyStateError = undefined;
            companyZipError = undefined;

        }

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.companyStreetError = companyStreetError;
        req.session.transfer.companyStreetTwoError = companyStreetTwoError;
        req.session.transfer.companyCityError = companyCityError;
        req.session.transfer.companyStateError = companyStateError;
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

        await User.updateOne({ email }, { companyDescription: '', live: false });

        req.session.userValues.companyDescription = '';
        req.session.userValues.live = false;

        changeVerb = defaultMessage.companyPropertyChangeVerb.delete;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

        return res.redirect('/my-account');
        
    }

    // In this route the tests are done a little out of normal order.
    let isCompanyDescriptionFilled = companyDescription === '' ? false : true;

    // If company description is profane it is immediately cleared out.
    let isCompanyDescriptionFamilyFriendly = !filter.isProfane(companyDescription);
    if (isCompanyDescriptionFamilyFriendly === false ) {
        cleanedFields.companyDescription = '';
        companyDescription = '';
    } 

    let regExpCompanyDescription = new RegExp(regExpValue.companyDescription, 'i');
    let isCompanyDescriptionValidCharacters = regExpCompanyDescription.test(companyDescription);

    // Don't bother processing it if it has an early error.
    if (
        isCompanyDescriptionFilled === true &&
        isCompanyDescriptionValidCharacters === true &&
        isCompanyDescriptionFamilyFriendly === true 
    ) {
        var processedCompanyDescription = logicUserAccounts.processCompanyDescription(companyDescription);
    }

    if (processedCompanyDescription) {

        cleanedFields.companyDescription = processedCompanyDescription;
        companyDescription = processedCompanyDescription;

    }

    // If nothing changed redirect to my-account. 
    let isCompanyDescriptionUnchanged = companyDescription === req.session.userValues.companyDescription ? true : false;
    if (isCompanyDescriptionFilled === true && isCompanyDescriptionUnchanged === true) {

        req.session.userValues.noChangeMessage = defaultMessage.noChange(changeProperty);
        return res.redirect('/my-account');

    }

    let isCompanyDescriptionInsideMinLength = companyDescription.length >= renderValue.companyDescriptionField.minLength ? true : false;
    let isCompanyDescriptionInsideMaxLength = companyDescription.length <= renderValue.companyDescriptionField.maxLength ? true : false;    

    if (
        isCompanyDescriptionFilled === true &&
        isCompanyDescriptionFamilyFriendly === true &&
        isCompanyDescriptionValidCharacters === true &&
        isCompanyDescriptionInsideMinLength === true &&
        isCompanyDescriptionInsideMaxLength === true
    ) {

        // True / False boolean.  If every account property has a value the account is live.
        let areAllAccountPropertiesFilled = checks.checkAllAccountPropertiesFilled(req.session.userValues, 'companyDescription');

        await User.updateOne({ email }, { companyDescription, live: areAllAccountPropertiesFilled });

        let wasCompanyDescriptionAdded = req.session.userValues.companyDescription === '' ? true : false;
        changeVerb = wasCompanyDescriptionAdded === true ? defaultMessage.companyPropertyChangeVerb.add : defaultMessage.companyPropertyChangeVerb.update;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

        req.session.userValues.companyDescription = companyDescription;

        return res.redirect('/my-account');

    } else {

        // Create and redirect the errors to changeCompanyDescription where they will be rendered and deleted.
        let companyDescriptionError = errorMessage.getCompanyDescriptionError(
            isCompanyDescriptionFilled,
            isCompanyDescriptionFamilyFriendly,
            isCompanyDescriptionValidCharacters,
            isCompanyDescriptionInsideMinLength,
            isCompanyDescriptionInsideMaxLength
            );

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

    // Process deletes first.
    let changeProperty = 'name';
    let changeVerb;

    if (deleteProperty === 'true') {

        await User.updateOne({ email }, { companyName: '', live: false });

        req.session.userValues.companyName = '';
        req.session.userValues.live = false;

        changeVerb = defaultMessage.companyPropertyChangeVerb.delete;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

        return res.redirect('/my-account');

    }

    let isCompanyNameFilled = companyName === '' ? false : true;

    // No need to process the input if it wasn't filled in.
    if (isCompanyNameFilled === true) {

        // capitalize the first letter in every word.
        let capitalizeEveryWordPattern = new RegExp(regExpValue.capitalizeEveryWord, 'g');
        companyName = companyName.replace(capitalizeEveryWordPattern, function(match){ return match.toUpperCase() });
        cleanedFields.companyName = companyName;

    }

    // If nothing changed redirect to my-account. 
    let isCompanyNameUnchanged = companyName === req.session.userValues.companyName ? true : false;
    if (isCompanyNameFilled === true && isCompanyNameUnchanged === true) {

        req.session.userValues.noChangeMessage = defaultMessage.noChange(changeProperty);
        return res.redirect('/my-account');

    }

    // If company name is profane it is immediately cleared out.
    let isCompanyNameFamilyFriendly = !filter.isProfane(companyName);
    if (isCompanyNameFamilyFriendly === false ) {
        cleanedFields.companyName = '';
        companyName = '';
    } 

    let regExpCompanyName = new RegExp(regExpValue.companyName, 'i');
    let isCompanyNameValidCharacters = regExpCompanyName.test(companyName);

    let regexCharacters = new RegExp(regExpValue.characters, 'i');
    let doesCompanyNameContainAtLeastOneCharacter = regexCharacters.test(companyName);

    let isCompanyNameInsideMinLength = companyName.length >= renderValue.companyNameField.minLength ? true : false;
    let isCompanyNameInsideMaxLength = companyName.length <= renderValue.companyNameField.maxLength ? true : false;

    if (
        isCompanyNameFilled === true &&
        isCompanyNameFamilyFriendly === true &&
        isCompanyNameValidCharacters === true &&
        doesCompanyNameContainAtLeastOneCharacter === true &&
        isCompanyNameInsideMaxLength === true &&
        isCompanyNameInsideMinLength === true
    ) {
        
        // True / False boolean.  If every account property has a value the account is live.
        let areAllAccountPropertiesFilled = checks.checkAllAccountPropertiesFilled(req.session.userValues, 'companyName');

        await User.updateOne({ email }, { companyName, live: areAllAccountPropertiesFilled }); 

        let wasCompanyNameAdded = req.session.userValues.companyName === '' ? true : false;
        changeVerb = wasCompanyNameAdded === true ? defaultMessage.companyPropertyChangeVerb.add : defaultMessage.companyPropertyChangeVerb.update;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

        req.session.userValues.companyName = companyName;
        
        return res.redirect('/my-account');

    } else {

        // Create and redirect the errors to changeCompanyName where they will be rendered and deleted from the session.
        let companyNameError = errorMessage.getCompanyNameError(
            isCompanyNameFilled,
            isCompanyNameFamilyFriendly,
            isCompanyNameValidCharacters,
            doesCompanyNameContainAtLeastOneCharacter,
            isCompanyNameInsideMinLength,
            isCompanyNameInsideMaxLength
            );

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
    let { email } = req.session.userValues;

    // Process deletes first.
    let changeProperty = 'phone number';
    let changeVerb;

    if (deleteProperty === 'true') {

        await User.updateOne({ email }, { 
            companyPhone: '',
            live: false
        });

        req.session.userValues.companyPhone = '';
        req.session.userValues.live = false;

        changeVerb = defaultMessage.companyPropertyChangeVerb.delete;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

        return res.redirect('/my-account');

    }

    // Dismantle and rebuild companyPhone.  formatPhone strips out all characters that aren't numbers and returns companyPhone in E.164 format.  
    let companyPhoneFormatted = logicUserAccounts.formatCompanyPhone(companyPhone);

    // If nothing changed redirect to my-account.
    let isCompanyPhoneFilled = companyPhone === '' ? false : true;
    let isCompanyPhoneUnchanged = companyPhoneFormatted === req.session.userValues.companyPhone ? true : false;
    if (isCompanyPhoneFilled === true && isCompanyPhoneUnchanged === true) {

        req.session.userValues.noChangeMessage = defaultMessage.noChange(changeProperty);
        return res.redirect('/my-account');

    }

    // Although bad characters are processed out in formatCompanyPhone this check lets the user know they entered a bad character.
    // This stops the user from entering 6%0%2%5%5%5%5%5%5%5%, the % get processed out and removed and it comes back as a valid phone number.
    // The test is on companyPhone not companyPhoneFormatted like the other tests.
    let regExpCompanyPhone = new RegExp(regExpValue.companyPhone, 'i');
    let isCompanyPhoneValidCharacters = regExpCompanyPhone.test(companyPhone);

    // If invalid characters are submitted clear out the phone number.
    if (isCompanyPhoneValidCharacters === false) cleanedFields.companyPhone = '';

    // Checks the format as well.  Most of the time this spots incomplete numbers.
    let isCompanyPhoneValid = checks.checkCompanyPhoneValid(companyPhoneFormatted);

    if (
        isCompanyPhoneFilled === true &&
        isCompanyPhoneValidCharacters === true &&
        isCompanyPhoneValid === true
    ) {

        // True / False boolean.  If every account property has a value the account is live.
        let areAllAccountPropertiesFilled = checks.checkAllAccountPropertiesFilled(req.session.userValues, 'companyPhone');

        await User.updateOne({ email }, { companyPhone: companyPhoneFormatted, live: areAllAccountPropertiesFilled });

        let wasCompanyPhoneAdded = req.session.userValues.companyPhone === '' ? true : false; 
        changeVerb = wasCompanyPhoneAdded === true ? defaultMessage.companyPropertyChangeVerb.add : defaultMessage.companyPropertyChangeVerb.update;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

        req.session.userValues.companyPhone = companyPhoneFormatted;

        return res.redirect('/my-account');

    } else {
        
        // Create and redirect the errors to changeCompanyPhone where they will be rendered and deleted.
        let companyPhoneError = errorMessage.getCompanyPhoneError(isCompanyPhoneFilled, isCompanyPhoneValidCharacters, isCompanyPhoneValid);

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.companyPhoneError = companyPhoneError;

        return res.redirect('/add-change-company-phone');

    }

});

exports.postAddChangeCompanyServices = wrapAsync(async function(req, res) {

    // Sanitize and process input.
    let cleanedFields = logicUserAccounts.cleanFields(formFields.addChangeCompanyServices, req.body);

    let wereAllServiceValuesValid = checks.checkServiceValuesValid(cleanedFields);

    // Grab this value before it is turned into a Boolean.
    let { deleteProperty } = cleanedFields;

    // Checks submitted values in cleanedFields and saves Boolean version in new object.
    let cleanedFieldsBoolean = logicUserAccounts.convertStringToBoolean(formFields.addChangeCompanyServices, cleanedFields);

    let { 
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
    } = cleanedFieldsBoolean;

    let { email } = req.session.userValues;

    let changeProperty = 'services';
    let changeVerb;

    if (deleteProperty === 'yes') {

        await User.updateOne({ email }, { 
            boardingSecuring: false,
            debrisRemovalTrashout: false,
            evictionManagement: false,
            fieldInspection: false,
            handymanGeneralMaintenance: false,
            landscapeMaintenance: false,
            lockChanges: false,
            overseePropertyRehabilitation: false,
            poolMaintenance: false,
            propertyCleaning: false,
            winterizations: false,
            live: false
        });

        req.session.userValues.boardingSecuring = false;
        req.session.userValues.debrisRemovalTrashout = false;
        req.session.userValues.evictionManagement = false;
        req.session.userValues.fieldInspection = false;
        req.session.userValues.handymanGeneralMaintenance = false;
        req.session.userValues.landscapeMaintenance = false;
        req.session.userValues.lockChanges = false;
        req.session.userValues.overseePropertyRehabilitation = false;
        req.session.userValues.poolMaintenance = false;
        req.session.userValues.propertyCleaning = false;
        req.session.userValues.winterizations = false;
        req.session.userValues.live = false;

        changeVerb = defaultMessage.companyPropertyChangeVerb.delete;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

        return res.redirect('/my-account');

    }

    // Check for a change.  If nothing changed redirect to my-account.
    let isAtLeastOneCompanyServiceFilled = 
        boardingSecuring === true ||
        debrisRemovalTrashout === true ||
        evictionManagement === true ||
        fieldInspection === true ||
        handymanGeneralMaintenance === true ||
        landscapeMaintenance === true ||
        lockChanges === true ||
        overseePropertyRehabilitation === true ||
        poolMaintenance === true ||
        propertyCleaning === true ||
        winterizations === true
        ? true : false;

    let areCompanyServicesUnchanged =
        req.session.userValues.boardingSecuring === boardingSecuring &&
        req.session.userValues.debrisRemovalTrashout === debrisRemovalTrashout &&
        req.session.userValues.evictionManagement === evictionManagement &&
        req.session.userValues.fieldInspection === fieldInspection &&        
        req.session.userValues.handymanGeneralMaintenance === handymanGeneralMaintenance &&
        req.session.userValues.landscapeMaintenance === landscapeMaintenance &&
        req.session.userValues.lockChanges === lockChanges &&
        req.session.userValues.overseePropertyRehabilitation === overseePropertyRehabilitation &&
        req.session.userValues.poolMaintenance === poolMaintenance &&
        req.session.userValues.propertyCleaning === propertyCleaning &&
        req.session.userValues.winterizations === winterizations 
        ? true : false;

    if (isAtLeastOneCompanyServiceFilled === true && areCompanyServicesUnchanged === true) {

        req.session.userValues.noChangeMessage = defaultMessage.noChange(changeProperty);
        return res.redirect('/my-account');

    }

    if (isAtLeastOneCompanyServiceFilled === true && wereAllServiceValuesValid === true) {

        // True / False boolean.  If every account property has a value the account is live.
        let areAllAccountPropertiesFilled = checks.checkAllAccountPropertiesFilled(req.session.userValues, 'companyServices');

        await User.updateOne({ email },
            {
                boardingSecuring,
                debrisRemovalTrashout,
                debrisRemovalTrashout,
                evictionManagement,
                fieldInspection,
                handymanGeneralMaintenance,
                landscapeMaintenance,
                lockChanges,
                overseePropertyRehabilitation,
                poolMaintenance,
                propertyCleaning,
                winterizations,
                live: areAllAccountPropertiesFilled
            });

        req.session.userValues.boardingSecuring = boardingSecuring;
        req.session.userValues.debrisRemovalTrashout = debrisRemovalTrashout;
        req.session.userValues.evictionManagement = evictionManagement;
        req.session.userValues.fieldInspection = fieldInspection;      
        req.session.userValues.handymanGeneralMaintenance = handymanGeneralMaintenance;
        req.session.userValues.landscapeMaintenance = landscapeMaintenance;
        req.session.userValues.lockChanges = lockChanges;
        req.session.userValues.overseePropertyRehabilitation = overseePropertyRehabilitation;
        req.session.userValues.poolMaintenance = poolMaintenance;
        req.session.userValues.propertyCleaning = propertyCleaning;
        req.session.userValues.winterizations = winterizations; 

        let wereCompanyServicesAdded = checks.checkWereCompanyServicesAdded(formFields.addChangeCompanyServices, req.session.userValues);

        changeVerb = wereCompanyServicesAdded === true ? defaultMessage.companyPropertyChangeVerb.update : defaultMessage.companyPropertyChangeVerb.add;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

        return res.redirect('/my-account');

    } else {
        
        // Create and redirect the errors to changeCompanyPhone where they will be rendered and deleted.
        let companyServicesError = errorMessage.getCompanyServicesError(isAtLeastOneCompanyServiceFilled, wereAllServiceValuesValid);

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
    let { email, urlNotActiveError } = req.session.userValues;

    let changeProperty = 'website'
    let changeVerb;

    if (deleteProperty === 'true') {

        await User.updateOne({ email }, { companyWebsite: '', urlNotActiveError: false, shouldBrowserFocusOnURLNotActiveError: false });

        req.session.userValues.urlNotActiveError = false;
        req.session.userValues.shouldBrowserFocusOnURLNotActiveError = false;
        req.session.userValues.companyWebsite = '';

        changeVerb = defaultMessage.companyPropertyChangeVerb.delete;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

        return res.redirect('/my-account');

    }

    // If nothing changed redirect to my-account.
    let isCompanyWebsiteFilled = companyWebsite === '' ? false : true;
    let isCompanyWebsiteUnchanged = companyWebsite === req.session.userValues.companyWebsite ? true : false;
    if (isCompanyWebsiteFilled === true &&
        isCompanyWebsiteUnchanged === true &&
        urlNotActiveError === false
        ) {

            req.session.userValues.noChangeMessage = defaultMessage.noChange(changeProperty);
            return res.redirect('/my-account');

    }

    let regExpCompanyWebsite = new RegExp(regExpValue.companyWebsite, 'i');
    let isCompanyWebsiteValidCharacters = regExpCompanyWebsite.test(companyWebsite);

    let isCompanyWebsiteValid = validator.isURL(companyWebsite);

    let isCompanyWebsiteInsideMinLength = companyWebsite.length >= renderValue.companyWebsiteField.minLength ? true : false;
    let isCompanyWebsiteInsideMaxLength = companyWebsite.length <= renderValue.companyWebsiteField.maxLength ? true : false;

    if (
        isCompanyWebsiteFilled === true &&
        isCompanyWebsiteValidCharacters === true &&
        isCompanyWebsiteValid === true &&
        isCompanyWebsiteInsideMinLength === true &&
        isCompanyWebsiteInsideMaxLength === true
    ) {

        let formattedURL = logicUserAccounts.formatURL(companyWebsite);

        // A new or changed website save clears out any errors in the DB.  Any new errors will have to be created in testFormattedURLAndSave.
        await User.updateOne({ email }, { companyWebsite: formattedURL, urlNotActiveError: false, shouldBrowserFocusOnURLNotActiveError: false });

        // This tests if the website is active.  If it doesn't work it stores an error in the DB and sends the client an email.
        // It runs asynchronously in the background so that it doesn't slow down the client.
        logicUserAccounts.testFormattedURLAndSave(formattedURL, email);

        let wasCompanyWebsiteAdded = req.session.userValues.companyWebsite === '' ? true : false; 
        changeVerb = wasCompanyWebsiteAdded === true ? defaultMessage.companyPropertyChangeVerb.add : defaultMessage.companyPropertyChangeVerb.update;
        req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

        req.session.userValues.urlNotActiveError = false;
        req.session.userValues.shouldBrowserFocusOnURLNotActiveError = false;
        req.session.userValues.companyWebsite = formattedURL;

        return res.redirect('/my-account');

    } else {
        
        // Create and redirect the errors to addChangeCompanyWebsite where they will be rendered and deleted.
        let companyWebsiteError = errorMessage.getCompanyWebsiteError(
            isCompanyWebsiteFilled,
            isCompanyWebsiteValidCharacters,
            isCompanyWebsiteValid,
            isCompanyWebsiteInsideMaxLength,
            isCompanyWebsiteInsideMinLength
            );

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.companyWebsiteError = companyWebsiteError;

        return res.redirect('/add-change-company-website');

    }

});

exports.postDeleteYourAccount = wrapAsync(async function(req, res) {

    // Sanitize and process input.
    let cleanedFields = logicUserAccounts.cleanFields(formFields.deleteYourAccount, req.body);
    let { currentPassword } = cleanedFields;

    let email = req.session.userValues.email || '';
    let dbPassword = req.session.userValues.password || '';

    let isCurrentPasswordFilled = currentPassword === '' ? false : true;
    let isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, dbPassword);
    
    // If currentPassword has any errors clear it out.
    if(isCurrentPasswordFilled === false || isCurrentPasswordCorrect === false) {
        cleanedFields.currentPassword = '';
    }

    if (isCurrentPasswordCorrect) {

        // Delete every single Document in the db.
        await LoginFailure.findOneAndRemove({ email });
        await PasswordResetRequest.findOneAndRemove({ email });
        await RecentDeletedAccount.findOneAndRemove({ email });
        await RecentPasswordResetSuccess.findOneAndRemove({ email });
        await StripeCancelKey.findOneAndRemove({ email });
        await StripeCheckoutSession.findOneAndRemove({ email });
        await StripeSuccessKey.findOneAndRemove({ email });
        await UnverifiedUser.findOneAndRemove({ email });
        await User.findOneAndRemove({ email });

        // Create a temporary key stored in the DB to be used to access the account-deleted route.
        let recentDeletedAccount = mongooseInstance.createRecentDeletedAccount(email);
        await recentDeletedAccount.save();

        return logoutSteps.logoutUser(req, res, `/account-deleted?email=${ email }`);

    }

    // Create and redirect the error to deleteYourAccount where it will be rendered and deleted.
    let currentPasswordError = errorMessage.getCurrentPasswordError(isCurrentPasswordFilled, isCurrentPasswordCorrect);

    req.session.transfer = {};
    req.session.transfer.currentPasswordError = currentPasswordError;

    return res.redirect('/delete-your-account');
});

exports.postLogin = wrapAsync(async function(req, res) {

    // Sanitize and process input.
    let cleanedFields = logicUserAccounts.cleanFields(formFields.login, req.body);
    let { currentEmail, currentPassword } = cleanedFields;

    let loginFailure = await LoginFailure.findOne({ email: currentEmail });
    if (loginFailure) {

        let { numberOfFailures } = loginFailure;
        if (numberOfFailures > defaultValue.numberOfLoginFailuresAllowed) return res.redirect(`/login-failure-limit-reached?email=${ currentEmail }`); 

    }
    
    let isCurrentEmailFilled = currentEmail === '' ? false : true;
    let isCurrentEmailValid = emailValidator.validate(currentEmail);

    // Without stringify userValues comes out as a model which in at least one instance created weird behavior.
    let unprocessedUserValues = await User.findOne({ email: currentEmail });
    let userValues = JSON.parse(JSON.stringify(unprocessedUserValues));

    let doesUserExist = userValues === null ? false : true;

    // If there are any email errors clear out the password.
    if (isCurrentEmailFilled === false || isCurrentEmailValid === false) {

        currentPassword = '';
        cleanedFields.currentPassword = '';

    }

    let isPasswordFilled = currentPassword === '' ? false : true;
    let dbPassword = doesUserExist === true ? userValues.password : '';
    let isPasswordCorrect = await bcrypt.compare(currentPassword, dbPassword);

    // Increment login failure if needed.  This occurs even if email/account doesn't exist to stop hackers from blasting server.
    if (
        isCurrentEmailFilled === true &&
        isCurrentEmailValid  === true &&
        isPasswordFilled === true &&
        isPasswordCorrect === false
        ) {

        if (!loginFailure) {

            loginFailure = mongooseInstance.createLoginFailure(currentEmail);
            await loginFailure.save();

        } else {

            let { numberOfFailures } = loginFailure;
            numberOfFailures += 1;

            if (numberOfFailures > defaultValue.numberOfLoginFailuresAllowed) {

                // If locked out set numberOfFailures to max + 1
                await LoginFailure.updateOne({ email: currentEmail }, { numberOfFailures: defaultValue.numberOfLoginFailuresAllowed + 1 });
                return res.redirect(`/login-failure-limit-reached?email=${ currentEmail }`);

            } else {
                await LoginFailure.updateOne({ email: currentEmail }, { numberOfFailures });
            }

        }

    }

    if (
        doesUserExist === true &&
        isPasswordCorrect === true 
        ) {    

        // Check for and remove any login failures in the db.
        await LoginFailure.findOneAndRemove({ email: currentEmail });

        req.session.userValues = userValues;

        return res.redirect('/my-account');

    } else {

        // Create and redirect the errors to login where they will be rendered and deleted.
        let currentEmailError = errorMessage.getCurrentEmailError(isCurrentEmailFilled, isCurrentEmailValid);
        let currentPasswordError = errorMessage.getLoginPasswordError(isPasswordFilled, doesUserExist, isPasswordCorrect);

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.currentEmailError = currentEmailError;
        req.session.transfer.currentPasswordError = currentPasswordError;

        return res.redirect('/login');

    }

});

exports.postPasswordReset = wrapAsync(async function(req, res) {

    // Sanitize and process input.
    let cleanedFields = logicUserAccounts.cleanFields(formFields.passwordReset, req.body);
    let { changedPassword, confirmationPassword } = cleanedFields;

    // Reject if an empty hash is posted.
    let hash = req.query.hash ? req.query.hash : '';
    if (hash === '') return res.status(404).redirect('/page-not-found');

    // Reject if a fake hash is posted.
    let passwordResetRequest = await PasswordResetRequest.findOne({ confirmationHash: hash });
    if (!passwordResetRequest) return res.status(404).redirect('/page-not-found');

    let isChangedPasswordFilled = changedPassword === '' ? false : true;
    let isChangedPasswordInsideMaxLength = checks.checkIfInputInsideMaxLength(changedPassword, renderValue.passwordField.maxLength);
    let regExpPassword = new RegExp(regExpValue.password, 'i');
    let isChangedPasswordValidCharacters = regExpPassword.test(changedPassword);
    let doesChangedPasswordMeetRequirements = checks.checkPasswordMeetsRequirements(changedPassword);

    let isConfirmationPasswordFilled = confirmationPassword === '' ? false : true;
    let doPasswordsMatch = changedPassword === confirmationPassword ? true : false;

    if (
        isChangedPasswordFilled === true &&
        isChangedPasswordInsideMaxLength === true &&
        isChangedPasswordValidCharacters === true &&
        doesChangedPasswordMeetRequirements === true &&
        isConfirmationPasswordFilled === true &&
        doPasswordsMatch === true
        ) {

            let { email } = passwordResetRequest;
            let passwordHashed = await logicUserAccounts.hashPassword(changedPassword);
            await User.updateOne({ email }, { password: passwordHashed });
            await PasswordResetRequest.findOneAndRemove({ confirmationHash: hash });

            // Check for and remove any LoginFailure or old RecentPasswordResetSuccess in the db.
            await LoginFailure.findOneAndRemove({ email });
            await RecentPasswordResetSuccess.findOneAndRemove({ email });

            let recentPasswordResetSuccess = mongooseInstance.createRecentPasswordResetSuccess(email);
            await recentPasswordResetSuccess.save();

            return res.redirect(`/password-reset-success?email=${ email }`);

        } else {

            // Create and send the error to passwordReset where it will be used and deleted.
            let changedPasswordError = errorMessage.getChangedPasswordError(isChangedPasswordFilled, isChangedPasswordInsideMaxLength, isChangedPasswordValidCharacters, doesChangedPasswordMeetRequirements);
            let confirmationPasswordError = errorMessage.getChangedConfirmationPasswordError(isConfirmationPasswordFilled, doPasswordsMatch);

            req.session.transfer = {};
            req.session.transfer.cleanedFields = cleanedFields;
            req.session.transfer.changedPasswordError = changedPasswordError;
            req.session.transfer.confirmationPasswordError = confirmationPasswordError;

            return res.redirect(`/password-reset?hash=${ hash }`);

        }

});

exports.postPasswordResetRequest = wrapAsync(async function(req, res) {

    // Sanitize and process input.
    let cleanedFields = logicUserAccounts.cleanFields(formFields.passwordResetRequest, req.body);
    let { currentEmail } = cleanedFields;

    let isCurrentEmailFilled = currentEmail === '' ? false : true;
    let isCurrentEmailValid = emailValidator.validate(currentEmail);

    // These checks don't test to see if the email corresponds to an actual user.
    // If the email passes the checks and no user exists send the client to passwordResetRequestSent anyway.
    // This way hackers won't know if an email exists in the db.  
    if (isCurrentEmailFilled === false || isCurrentEmailValid === false) {

        // Create and send the error to passwordResetRequest where it will be used and deleted.
        let currentEmailError = errorMessage.getCurrentEmailError(isCurrentEmailFilled, isCurrentEmailValid);

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.currentEmailError = currentEmailError;

        return res.redirect('/password-reset-request');

    } 

    // If client attempts to reset password of an unverified account make him verify first.
    let unverifiedUser = await UnverifiedUser.findOne({ email: currentEmail });
    
    if (unverifiedUser) {

        let numberOfConfirmations = unverifiedUser.numberOfConfirmations;

        if (numberOfConfirmations >= defaultValue.numberOfEmailConfirmationsAllowed) {

            await UnverifiedUser.updateOne({ currentEmail }, { numberOfConfirmations: defaultValue.numberOfEmailConfirmationsAllowed + 1 });
            return res.redirect(`/confirmation-limit-reached?email=${ currentEmail }&resetattempt=true`);

        } else {
            return res.redirect(`/confirmation-sent?email=${ currentEmail }&resetattempt=true`);
        }  
    }

    // If a recent success occurred remove it before a new request is started.
    await RecentPasswordResetSuccess.findOneAndRemove({ email: currentEmail });

    let passwordResetRequest = await PasswordResetRequest.findOne({ email: currentEmail });

    let confirmationHash, numberOfRequests;

    if (passwordResetRequest) {

        confirmationHash = passwordResetRequest.confirmationHash;
        numberOfRequests = passwordResetRequest.numberOfRequests += 1;

        if (numberOfRequests > defaultValue.numberOfPasswordResetRequestsAllowed) {

            numberOfRequests = defaultValue.numberOfPasswordResetRequestsAllowed + 1;
            await PasswordResetRequest.updateOne({ email: currentEmail }, { numberOfRequests });
            return res.redirect(`/password-reset-limit-reached?email=${ currentEmail }`);

        } else {

            await PasswordResetRequest.updateOne({ email: currentEmail }, { numberOfRequests });

        }

    } else {

        confirmationHash = logicUserAccounts.createConfirmationHash(currentEmail);
        passwordResetRequest = await mongooseInstance.createPasswordResetRequest(currentEmail, confirmationHash);
        numberOfRequests = passwordResetRequest.numberOfRequests;
        await passwordResetRequest.save();

    }

    let doesUserExist = await User.exists({ email: currentEmail });

    if (doesUserExist === true) {

        let emailSubject = emailMessage.passwordResetRequestEmailSubject();
        let expirationTime = timeValue.getExpirationTime(timeValue.passwordResetRequestExpiration);
        let emailBody = emailMessage.passwordResetRequestEmailBody(confirmationHash, expirationTime);
        communication.sendEmail(currentEmail, emailSubject, emailBody);

    }

    return res.redirect(`/password-reset-request-sent?email=${ currentEmail }`);

});

exports.postRegister = wrapAsync(async function(req, res) {

    // Sanitize and process input.
    let cleanedFields = logicUserAccounts.cleanFields(formFields.register, req.body);
    let { newEmail, newPassword, confirmationPassword } = cleanedFields;
    let termsOfUse = logicUserAccounts.convertCheckboxToBoolean(cleanedFields.termsOfUse);

    let isNewEmailFilled = newEmail ? true : false;
    let isNewEmailInsideMaxLength = checks.checkIfInputInsideMaxLength(newEmail, renderValue.emailField.maxLength);
    let regExpEmail = new RegExp(regExpValue.email, 'i');
    let isNewEmailValidCharacters = regExpEmail.test(newEmail);
    let isNewEmailValid = emailValidator.validate(newEmail);
    let isNewEmailAvailableInUnverifiedUsers = !(await UnverifiedUser.exists({ email: newEmail }));
    let isNewEmailAvailableInUsers = !(await User.exists({ email: newEmail }));

    let isNewPasswordFilled = newPassword === '' ? false : true;
    let isNewPasswordInsideMaxLength = checks.checkIfInputInsideMaxLength(newPassword, renderValue.passwordField.maxLength);
    let regExpPassword = new RegExp(regExpValue.password, 'i');
    let isNewPasswordValidCharacters = regExpPassword.test(newPassword);
    let doesNewPasswordMeetRequirements = checks.checkPasswordMeetsRequirements(newPassword);

    // If there is any newPassword error clear out newPassword and confirmationPassword.
    if (
        isNewPasswordFilled === false ||
        isNewPasswordInsideMaxLength === false ||
        isNewPasswordValidCharacters === false ||
        doesNewPasswordMeetRequirements === false
    ) {
        newPassword = '';
        cleanedFields.newPassword = '';
        confirmationPassword = '';
        cleanedFields.confirmationPassword = '';
    }

    let isConfirmationPasswordFilled = confirmationPassword === '' ? false : true;
    let doPasswordsMatch = newPassword === confirmationPassword ? true : false;

    // If there is any confirmationPassword error clear it out.
    if (
        isConfirmationPasswordFilled === false ||
        doPasswordsMatch === false
    ) {
        confirmationPassword = '';
        cleanedFields.confirmationPassword = '';
    }

    let isTermsOfUseChecked = termsOfUse === true ? true : false;

    // If there are any errors uncheck termsOfUse.  However it only needs an error message if the user forgot to check it.
    if (
        isNewEmailFilled === false ||
        isNewEmailInsideMaxLength === false ||
        isNewEmailValidCharacters === false ||
        isNewEmailValid === false ||
        isNewEmailAvailableInUsers === false ||
        isNewPasswordFilled === false ||
        isNewPasswordInsideMaxLength === false ||
        isNewPasswordValidCharacters === false ||
        doesNewPasswordMeetRequirements ||
        isConfirmationPasswordFilled === false ||
        doPasswordsMatch === false ||
        isTermsOfUseChecked === false

    ) {
        termsOfUse = false;
        cleanedFields.termsOfUse = undefined;
    }

    if (
        isNewEmailFilled === true &&
        isNewEmailInsideMaxLength === true &&
        isNewEmailValidCharacters === true &&
        isNewEmailValid === true &&
        isNewEmailAvailableInUsers === true &&
        isNewPasswordFilled === true &&
        isNewPasswordInsideMaxLength  === true &&
        isNewPasswordValidCharacters === true &&
        doesNewPasswordMeetRequirements === true &&
        isConfirmationPasswordFilled === true &&
        doPasswordsMatch === true &&
        isTermsOfUseChecked === true
    ) {

        // The numberOfConfirmations counter is incremented in the registration-sent route.  This is used as a query to avoid doubling the increment if the client comes from this route.
        let newRegister = '';
        let unverifiedMultipleRegisters = '';

        // If an unverified user already exists save over it with new values but update the confirmation counter so that a hacker can't blast the server with same email an unlimited number of times.
        if (isNewEmailAvailableInUnverifiedUsers === false) {

            var unverifiedUser = await UnverifiedUser.findOne({ email: newEmail });

            let { numberOfConfirmations } = unverifiedUser;

            if (numberOfConfirmations >= defaultValue.numberOfEmailConfirmationsAllowed) {

                req.session.tooManyConfirmations = true;
                return res.redirect(`/confirmation-limit-reached?email=${ newEmail }`);

            }

            let hashedPassword = await logicUserAccounts.hashPassword(newPassword);
            await UnverifiedUser.updateOne({ email: newEmail }, { password: hashedPassword });
            unverifiedMultipleRegisters = '&unverifiedmultipleregisters=true';

        } else {

            // If for some reason there is anything in the DB delete it.  It is no longer needed.
            await LoginFailure.findOneAndRemove({ email: newEmail });
            await PasswordResetRequest.findOneAndRemove({ email: newEmail });
            await RecentDeletedAccount.findOneAndRemove({ email: newEmail });
            await RecentPasswordResetSuccess.findOneAndRemove({ email: newEmail });
            await StripeCancelKey.findOneAndRemove({ email: newEmail });
            await StripeCheckoutSession.findOneAndRemove({ email: newEmail });
            await StripeSuccessKey.findOneAndRemove({ email: newEmail });
            await UnverifiedUser.findOneAndRemove({ email: newEmail });
            await User.findOneAndRemove({ email: newEmail });

            let unverifiedUser = mongooseInstance.createUnverifiedUser(newEmail);
            let salt = cryptoRandomString({ length: 10 });
            unverifiedUser.confirmationHash = objectHash(newEmail + salt);
            unverifiedUser.password = await logicUserAccounts.hashPassword(newPassword);
            await unverifiedUser.save();
            newRegister = '&newregister=true';

        }

        return res.redirect(`/confirmation-sent?email=${ newEmail }${ newRegister }${ unverifiedMultipleRegisters }`);

    } else {

        // Create and send the errors to register where they will be used and deleted.
        let newEmailError = errorMessage.getNewEmailError(isNewEmailFilled, isNewEmailInsideMaxLength, isNewEmailValidCharacters, isNewEmailValid, isNewEmailAvailableInUnverifiedUsers, isNewEmailAvailableInUsers);
        let newPasswordError = errorMessage.getNewPasswordError(isNewPasswordFilled, isNewPasswordInsideMaxLength, isNewPasswordValidCharacters, doesNewPasswordMeetRequirements);
        let confirmationPasswordError = errorMessage.getNewConfirmationPasswordError(isConfirmationPasswordFilled, doPasswordsMatch);
        let termsOfUseError = isTermsOfUseChecked === true ? undefined : errorMessage.getTermsOfUseError;

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.newEmailError = newEmailError;
        req.session.transfer.newPasswordError = newPasswordError;
        req.session.transfer.confirmationPasswordError = confirmationPasswordError;
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

        var { cleanedFields, newEmailError, newPasswordError, confirmationPasswordError, termsOfUseError } = req.session.transfer;

        // Set object to previous form input.
        var inputFields = cleanedFields;

        delete req.session.transfer;

    } else {
        // If req.session data isn't used set every property to an empty string.
        var inputFields = logicUserAccounts.makeFieldsEmpty(formFields.register);
    }

    // For rendering.
    let activeLink = 'register';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;

    let emailAttributes = renderValue.emailField.attributes;
    let passwordAttributes = renderValue.passwordField.attributes;
    let patternNewEmail = regExpValue.email;
    let patternNewPassword = regExpValue.password;

    res.render('register', { userInput: inputFields, activeLink, contactEmail, loggedIn, emailAttributes, passwordAttributes, newEmailError, newPasswordError, confirmationPasswordError, termsOfUseError, patternNewEmail, patternNewPassword });

});

exports.verified = wrapAsync(async function(req, res) {

    // Initial checks.  If queries were absent or fake forward to page-not-found.
    let hash = req.query.hash ? req.query.hash : '';
    if (hash === '') return res.status(404).redirect('/page-not-found');

    let unverifiedUser = await UnverifiedUser.findOne({ confirmationHash: hash });
    if (!unverifiedUser) return res.status(404).redirect('/page-not-found');

    let { email } = unverifiedUser;

    // Create the verified user from the unverifiedUser.
    let newUser = mongooseInstance.createUser(unverifiedUser);
    await newUser.save();

    // Delete the unverifiedUser from the db.
    await UnverifiedUser.findOneAndRemove({ email });

    // If any of these are stored in the DB delete them.  They are no longer needed.
    await LoginFailure.findOneAndRemove({ email });
    await PasswordResetRequest.findOneAndRemove({ email });

    // For rendering.
    let activeLink = 'verified';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;

    res.render('verified', { activeLink, contactEmail, loggedIn });

});