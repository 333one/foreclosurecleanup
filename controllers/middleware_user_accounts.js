"use strict";

const bcrypt = require('bcryptjs');
const cryptoRandomString = require('crypto-random-string');
const Filter = require('bad-words');
const objectHash = require('object-hash');
const path = require('path');
const USPS = require('usps-webtools-promise').default;
const validator = require('email-validator');

require('dotenv').config({ path: path.join(__dirname, '/models/.env') });

const communication = require('./communication');
const defaultAppValues = require('../models/default_app_values.js');
const defaultFields = require('../models/default_fields.js');
const defaultMessages = require('../models/default_messages.js');
const logic = require('./logic_user_accounts');
const logicMessages = require('./logic_messages');
const mongooseInstance = require('./mongoose_create_instances');
const tests = require('./tests');
const { wrapAsync } = require('./logic_user_accounts');

const filter = new Filter();

const usps = new USPS({
    userId: '840CONSU3673',
    // USPS returns ALL CAPS, this boolean turns on Proper Caps for both Street lines and City. This is an optional item.
    properCase: Boolean
});

const {
    FalseEmailConfirmationRequest,
    LoginFailure,
    PasswordResetRequest,
    RecentDeletedAccount,
    RecentPasswordResetSuccess,
    User,
    UnverifiedUser
    } = require('../models/mongoose_schema');

exports.accountDeleted = wrapAsync(async function(req, res, next) {

    let email = req.query.email ? req.query.email : '';

    let doesRecentDeletedAccountExist = await RecentDeletedAccount.exists( { email: email } );

    // If this account wasn't recently deleted forward to the homepage.
    if(!doesRecentDeletedAccountExist) return res.status(404).redirect('/page_not_found');

    req.session.destroy( function(error) {
        if (error) {
            res.clearCookie(process.env.SESSION_NAME);
        }
    });

    let activeLink = null;
    let loggedIn = false;
    
    res.render('account_deleted', { activeLink, loggedIn });
});

exports.addChangeBusinessAbout = wrapAsync(async function(req, res, next) {

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, phoneError } = req.session.transfer;
        delete req.session.transfer;

        // Set object to previous form input.
        var inputFields = cleanedFields;

    } else {
        // If req.session data isn't used set every property to an empty string.
        var inputFields = logic.makeFieldsEmpty(defaultFields.changeBusinessPhone);
    }

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;
    let phoneAttributes = defaultAppValues.phoneField.attributes;
    let currentPhone = req.session.userValues.phone;

    res.render('change_business_about', { userInput: inputFields, activeLink, loggedIn, phoneAttributes, currentPhone, phoneError });
});

exports.addChangeBusinessAddress = wrapAsync(async function(req, res, next) {

    // Create these now and set the value in the if block below.
    let inputFields = {};
    let addOrChangeProperty; 

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { 
            cleanedFields,
            businessCityError,
            businessStateError,
            businessStreetError,
            businessStreetTwoError,
            businessZipError
        } = req.session.transfer;

        delete req.session.transfer;

        // Set object to previous form input.
        inputFields = cleanedFields;

        addOrChangeProperty = req.session.userValues.businessCity ? 'change' : 'add';

    // If req.session.userValues.businessCity has a value then all location properties also have a value.
    } else if(req.session.userValues.businessCity) {

        // Set object to the values stored in the session.
        inputFields.businessCity = req.session.userValues.businessCity;
        inputFields.businessState = req.session.userValues.businessState;
        inputFields.businessStreet = req.session.userValues.businessStreet;
        inputFields.businessStreetTwo = req.session.userValues.businessStreetTwo;
        inputFields.businessZip = req.session.userValues.businessZip;

        addOrChangeProperty = 'change';

    } else {
        // If req.session data isn't used set every property to an empty string.
        inputFields = logic.makeFieldsEmpty(defaultFields.addChangeBusinessAddress);

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
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;
    let businessCityAttributes = defaultAppValues.businessCityField.attributes;
    let businessStreetAttributes = defaultAppValues.businessStreetField.attributes;
    let businessStreetTwoAttributes = defaultAppValues.businessStreetField.attributes;
    let businessZipAttributes = defaultAppValues.businessZipField.attributes;

    res.render('add_change_business_address', {
        userInput: inputFields,
        activeLink,
        loggedIn,
        addOrChangeProperty,
        businessCityError,
        businessStateError,
        businessStreetError,
        businessStreetTwoError,
        businessZipError,
        businessCityAttributes, 
        businessStreetAttributes,
        businessStreetTwoAttributes,
        businessZipAttributes,
        normalize
    });
});

exports.addChangeBusinessName = wrapAsync(async function(req, res, next) {

    // Create these now and set the value in the if block below.
    let inputFields = {};
    let addOrChangeProperty; 

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, businessNameError } = req.session.transfer;
        delete req.session.transfer;

        // Set object to previous form input.
        inputFields = cleanedFields;

        addOrChangeProperty = req.session.userValues.businessName ? 'change' : 'add';

    } else {

        // If req.session data isn't used set every property to an empty string.
        inputFields = logic.makeFieldsEmpty(defaultFields.addChangeBusinessName);

        addOrChangeProperty = req.session.userValues.businessName ? 'change' : 'add';
    }

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;
    let businessNameAttributes = defaultAppValues.businessNameField.attributes;
    let businessName = req.session.userValues.businessName ? req.session.userValues.businessName : defaultMessages.changeScreenInformationEmpty;

    res.render('add_change_business_name', { userInput: inputFields, activeLink, loggedIn, addOrChangeProperty, businessName, businessNameAttributes, businessNameError });
});

exports.addChangeBusinessPhone = wrapAsync(async function(req, res, next) {

    // Create these now and set the value in the if block below.
    let inputFields = {};
    let addOrChangeProperty; 

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, businessPhoneError } = req.session.transfer;
        delete req.session.transfer;

        // Set object to previous form input.
        inputFields = cleanedFields;

        addOrChangeProperty = req.session.userValues.businessPhone ? 'change' : 'add';

    } else {
        // If req.session data isn't used set every property to an empty string.
        inputFields = logic.makeFieldsEmpty(defaultFields.addChangeBusinessPhone);

        addOrChangeProperty = req.session.userValues.businessPhone ? 'change' : 'add';
    }

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;
    let businessPhoneAttributes = defaultAppValues.businessPhoneField.attributes;
    let businessPhone = req.session.userValues.businessPhone;

    res.render('add_change_business_phone', { userInput: inputFields, activeLink, loggedIn, addOrChangeProperty, businessPhone, businessPhoneAttributes, businessPhoneError });
});

exports.addChangeBusinessServices = wrapAsync(async function(req, res, next) {

    let addOrChangeProperty; 

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { businessServicesError } = req.session.transfer;
        delete req.session.transfer;

        addOrChangeProperty = req.session.userValues.businessServices ? 'change' : 'add';

    } else {
        // If req.session data isn't used set every property to an empty string.


        addOrChangeProperty = req.session.userValues.businessServices ? 'change' : 'add';
    }

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;

    res.render('add_change_business_services', { activeLink, loggedIn, addOrChangeProperty, businessServicesError });
});

exports.changeEmail = wrapAsync(async function(req, res, next) {
    
    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, newEmailError, emailConfirmationError, passwordError } = req.session.transfer;
        delete req.session.transfer;

        // Set object to previous form input.
        var inputFields = cleanedFields;

    } else {
        // If req.session data isn't used set every property to an empty string.
        var inputFields = logic.makeFieldsEmpty(defaultFields.changeEmail);
    }

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;
    let emailAttributes = defaultAppValues.emailField.attributes;
    let passwordAttributes = defaultAppValues.passwordField.attributes();
    let currentEmail = req.session.userValues.email;

    res.render('change_email', { userInput: inputFields, activeLink, loggedIn, emailAttributes, passwordAttributes, currentEmail, newEmailError, emailConfirmationError, passwordError });
});

exports.changePassword = wrapAsync(async function(req, res, next) {

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, passwordCurrentError, passwordError, passwordConfirmError } = req.session.transfer;

        if(passwordCurrentError) {
            var passwordCurrentErrorMessage = passwordCurrentError;
        }

        if(passwordError) {
            var passwordErrorMessage = passwordError.message;
            var passwordErrorType = passwordError.errorType;
        }
        
        if(passwordConfirmError) {
            var passwordConfirmErrorMessage = passwordConfirmError.message;
            var passwordConfirmErrorType = passwordConfirmError.errorType;
        }

        delete req.session.transfer;

        // Set object to previous form input.
        var inputFields = cleanedFields;

    } else {
        // If req.session data isn't used set every property to an empty string.
        var inputFields = logic.makeFieldsEmpty(defaultFields.changePassword);
    }

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;

    let passwordCurrentAttributes = defaultAppValues.passwordField.attributes();
    let passwordAttributes = defaultAppValues.passwordField.attributes(passwordErrorType);
    let passwordConfirmAttributes = defaultAppValues.passwordField.attributes(passwordConfirmErrorType);

    res.render('change_password', { userInput: inputFields, activeLink, loggedIn, passwordCurrentErrorMessage, passwordErrorMessage, passwordConfirmErrorMessage, passwordCurrentAttributes, passwordAttributes, passwordConfirmAttributes });
});

exports.confirmationLimitReached = wrapAsync(async function(req, res, next) {

    let email = req.query.email ? req.query.email : '';

    // If the email matches an unverified user grab it.
    let unverifiedUser = await UnverifiedUser.findOne({ email: email });

    // If the hash is wrong or not present redirect to the home page.
    if (email === '' || unverifiedUser === null) return res.status(404).redirect('/page_not_found');

    // If for some reason the user has never been to the registration sent page redirect them to that.
    if (unverifiedUser.numberOfConfirmations === 0) return res.redirect(`registration_sent?email=${email}`);

    // If the user has confirmation requests but hasn't gone over the limit redirect to confirmation_resent.
    if (unverifiedUser.numberOfConfirmations >= 1 && unverifiedUser.numberOfConfirmations < defaultAppValues.numberOfEmailConfirmationsAllowed) {
        return res.redirect(`confirmation_resent?email=${email}`);
    }

    // For rendering.
    let emailSubject = defaultMessages.emailVerificationEmailSubject(process.env.ORGANIZATION);
    let body = defaultMessages.confirmationLimitReachedBody(email, emailSubject);

    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;

    let expirationTime = logicMessages.getExpirationTime(defaultAppValues.unverifiedUserExpiration);

    res.render('confirmation_limit_reached', { body, email, activeLink, loggedIn, emailSubject, expirationTime });
});

exports.confirmationResent = wrapAsync(async function(req, res, next) {

    let email = req.query.email ? req.query.email : '';
    let resetAttempt = req.query.resetattempt ? req.query.resetattempt : '';

    // If the email matches an unverified user grab it.
    let unverifiedUser = await UnverifiedUser.findOne({ email: email });

    // If the hash is wrong or not present redirect to page_not_found.
    if (email === '' || unverifiedUser === null) return res.status(404).redirect('/page_not_found');

    // If for some reason the user has never been to the registration sent page redirect them to that.
    if (unverifiedUser.numberOfConfirmations === 0) return res.redirect(`registration_sent?email=${ email }`);
    
    // If the user has exceeded the maximum number of confirmations redirect them to the confirmation limit reached page.
    if (unverifiedUser.numberOfConfirmations >= defaultAppValues.numberOfEmailConfirmationsAllowed) return res.redirect(`/confirmation_limit_reached?email=${ email }`);

    let emailSubject = defaultMessages.emailVerificationEmailSubject(process.env.ORGANIZATION);

    // If an unverified user exists update the db and send the email.
    if(unverifiedUser) {

        var { confirmationHash } = unverifiedUser;

        await UnverifiedUser.updateOne({ email: email }, { numberOfConfirmations: unverifiedUser.numberOfConfirmations += 1 });
        
        var emailBody = defaultMessages.emailVerificationEmailBody(process.env.WEBSITE, process.env.ORGANIZATION, process.env.HOST, confirmationHash, resetAttempt);

        communication.sendEmail(email, emailSubject, emailBody);
    } 

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;

    let body = defaultMessages.confirmationResentBody(email, emailSubject, resetAttempt);

    res.render('confirmation_resent', { email, emailSubject, activeLink, loggedIn, body });
});

exports.dashboard = wrapAsync(async function(req, res, next) {

    // For rendering.
    let activeLink = 'dashboard';
    let loggedIn = req.session.userValues ? true : false;
    let {
        businessAbout,
        businessCity,
        businessName,
        businessPhone,
        BusinessServices,
        businessState,
        businessStreet,
        businessStreetTwo,
        businessZip,
        email,
        password,
    } = req.session.userValues;

    let businessStreetAssembled = logic.getBusinessStreetFull(businessStreet, businessStreetTwo);
    let businessRegionAssembled = logic.getBusinessRegionFull(businessCity, businessState, businessZip);

    let businessAboutDashboardValue = businessAbout ? businessAbout : defaultMessages.dashboardInformationEmpty;
    let businessNameDashboardValue = businessName ? businessName : defaultMessages.dashboardInformationEmpty;
    let businessPhoneDashboardValue = businessPhone ? businessPhone : defaultMessages.dashboardInformationEmpty;
    let businessRegionDashboardValue = businessRegionAssembled ? businessRegionAssembled : defaultMessages.dashboardInformationEmpty;
    let businessServicesDashboardValue = BusinessServices ? BusinessServices : defaultMessages.dashboardInformationEmpty;
    let businessStreetDashboardValue = businessStreetAssembled ? businessStreetAssembled : defaultMessages.dashboardInformationEmpty;
    let businessStreetTwoDashboardValue = businessStreetTwo ? businessStreetTwo : defaultMessages.dashboardInformationEmpty;

    let isBusinessAboutAdded = businessAboutDashboardValue === defaultMessages.dashboardInformationEmpty ? false : true;
    let isBusinessAddressAdded = businessStreetDashboardValue === defaultMessages.dashboardInformationEmpty ? false : true;
    let isBusinessNameAdded = businessNameDashboardValue === defaultMessages.dashboardInformationEmpty ? false : true;
    let isBusinessPhoneAdded = businessPhoneDashboardValue === defaultMessages.dashboardInformationEmpty ? false : true;
    let isBusinessServicesAdded = businessServicesDashboardValue === defaultMessages.dashboardInformationEmpty ? false : true;

    res.render('dashboard', {
        activeLink,
        loggedIn,
        businessAboutDashboardValue,
        businessNameDashboardValue,
        businessPhoneDashboardValue,
        businessRegionDashboardValue,
        businessServicesDashboardValue,
        businessStreetDashboardValue,
        businessStreetTwoDashboardValue,
        email,
        isBusinessAboutAdded,
        isBusinessAddressAdded,
        isBusinessNameAdded,
        isBusinessPhoneAdded,
        isBusinessServicesAdded,
        password
    });
});

exports.deleteYourAccount = wrapAsync(async function(req, res, next) {

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, deleteAccountError } = req.session.transfer;
        delete req.session.transfer;

        // Set object to previous form input.
        var inputFields = cleanedFields;

    } else {
        // If req.session data isn't used set every property to an empty string.
        var inputFields = logic.makeFieldsEmpty(defaultFields.changeYourName);
    }

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;
    let passwordAttributes = defaultAppValues.passwordField.attributes();

    res.render('delete_your_account', { userInput: inputFields, activeLink, loggedIn, passwordAttributes, deleteAccountError });
});

exports.flashMessages = wrapAsync(async function(req, res, next) {
    
    res.locals.firstName = req.flash('firstName');
    res.locals.changeResult = req.flash('changeResult');
    next();
});

exports.login = wrapAsync( async function(req, res, next) {

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, emailError, passwordError } = req.session.transfer;
        delete req.session.transfer;

        // Set object to previous form input.
        var inputFields = cleanedFields;

    } else {
        // If req.session data isn't used set every property to an empty string.
        var inputFields = logic.makeFieldsEmpty(defaultFields.login);
    }

    // For rendering.
    let activeLink = 'login';
    let loggedIn = req.session.userValues ? true : false;
    let emailAttributes  = defaultAppValues.emailField.attributes;
    let passwordAttributes = defaultAppValues.passwordField.attributes();

    res.render('login', { userInput: inputFields, activeLink, loggedIn, emailAttributes, passwordAttributes, emailError, passwordError });
});

exports.loginFailureLimitReached = wrapAsync(async function(req, res, next) {

    let email = req.query.email ? req.query.email : '';

    // If the hash matches an unverified user grab it.
    let loginFailure = await LoginFailure.findOne({ email: email });

    // If the hash is wrong or not present redirect to the home page.
    if (email === '' || loginFailure === null) return res.status(404).redirect('/page_not_found');

    let activeLink = null;
    let loggedIn = false;

    let expirationTime = logicMessages.getExpirationTime(defaultAppValues.loginFailureExpiration);

    res.render('login_failure_limit_reached', { activeLink, loggedIn, expirationTime });
});

exports.logout = wrapAsync(async function(req, res, next) {

    req.session.destroy( function(error) {

        if (error) {
            res.clearCookie(process.env.SESSION_NAME);
        }
        return res.redirect('/index');
    });
});

exports.pageNotFound = wrapAsync(async function(req, res, next) {

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;

    res.status(404).render('page_not_found', { activeLink, loggedIn });
});

exports.passwordReset = wrapAsync(async function(req, res, next) {

    // Check to see if hash is legitimate.
    let hash = req.query.hash ? req.query.hash : '';
    let passwordResetRequest = await PasswordResetRequest.findOne({ confirmationHash: hash });

    if(!passwordResetRequest) return res.status(404).redirect('/page_not_found');

    // If there is an error available from previous postPasswordReset grab it from req.session and then delete it.
    if (req.session.transfer) {
        var { cleanedFields, passwordError, passwordConfirmError } = req.session.transfer;

        if(passwordError) {
            var passwordErrorMessage = passwordError.message;
            var passwordErrorType = passwordError.errorType;
        }
        
        if(passwordConfirmError) {
            var passwordConfirmErrorMessage = passwordConfirmError.message;
            var passwordConfirmErrorType = passwordConfirmError.errorType;
        }

        delete req.session.transfer;

        // Set object to previous form input.
        var inputFields = cleanedFields;
    } else {
        // If req.session data isn't used set every property to an empty string.
        var inputFields = logic.makeFieldsEmpty(defaultFields.passwordReset);
    }

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;

    let passwordAttributes = defaultAppValues.passwordField.attributes(passwordErrorType);
    let passwordConfirmAttributes = defaultAppValues.passwordField.attributes(passwordConfirmErrorType);
    res.render('password_reset', { userInput: inputFields, hash, activeLink, loggedIn, passwordErrorMessage, passwordConfirmErrorMessage, passwordAttributes, passwordConfirmAttributes });
});

exports.passwordResetRequest = wrapAsync(async function(req, res, next) {

    // If transfer data exists from postPasswordResetRequest grab it from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, emailError } = req.session.transfer;
        delete req.session.transfer;

        // Set object to previous form input.
        var inputFields = cleanedFields;

    } else {
        // If transfer data doesn't exist set every property to an empty string.
        var inputFields = logic.makeFieldsEmpty(defaultFields.passwordResetRequest);
    }

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;
    let emailAttributes = defaultAppValues.emailField.attributes;

    res.render('password_reset_request', { userInput: inputFields, emailError, activeLink, loggedIn, emailAttributes });
});

exports.passwordResetRequestSent = wrapAsync(async function(req, res, next) {

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
        requests > defaultAppValues.numberOfPasswordResetRequestsAllowed ||
        passwordResetRequest === null
    ) {
        return res.status(404).redirect('/page_not_found');
    }

    let emailSubject = defaultMessages.passwordResetRequestEmailSubject(process.env.ORGANIZATION);
    let expirationTime = logicMessages.getExpirationTime(defaultAppValues.passwordResetRequestExpiration);

    let confirmationHash = await logic.getOrCreateConfirmationHash(email);
    let wasConfirmationLimitReached = await logic.incrementExistingPasswordResetOrCreateNew(email, confirmationHash, forward);
    if(wasConfirmationLimitReached) return res.redirect(`/password_reset_limit_reached?email=${ email }`);
    await logic.sendEmailIfNecessary(email, confirmationHash, emailSubject, expirationTime, forward); 

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;
    forward = 'false';
    
    res.render('password_reset_request_sent', { activeLink, loggedIn, forward, email, emailSubject, expirationTime });
});

exports.passwordResetLimitReached = wrapAsync(async function(req, res, next) {

    let email = req.query.email ? req.query.email : '';

    // Check to see if PasswordResetRequest exists.
    let passwordResetRequest = await PasswordResetRequest.findOne({ email: email });

    let wasLimitReached = false;
    if(passwordResetRequest) {
        if(passwordResetRequest.numberOfRequests >= defaultAppValues.numberOfPasswordResetRequestsAllowed) wasLimitReached = true;
    }

    // If the hash is wrong or not present redirect to the home page.
    if (email === '' || wasLimitReached === false) return res.status(404).redirect('/page_not_found');

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;
    let emailSubject = defaultMessages.passwordResetRequestEmailSubject(process.env.ORGANIZATION);
    let expirationTime = logicMessages.getExpirationTime(defaultAppValues.passwordResetRequestExpiration);

    res.render('password_reset_limit_reached', { email, activeLink, loggedIn, emailSubject, expirationTime });
});

exports.passwordResetSuccess = wrapAsync(async function(req, res, next) {

    let email = req.query.email ? req.query.email : '';

    // Check to see if RecentPasswordResetSuccess exists.
    let doesRecentPasswordResetSuccessExist = await RecentPasswordResetSuccess.exists({ email: email });

    // If credentials were fake forward to page_not_found.
    if (!doesRecentPasswordResetSuccessExist) return res.status(404).redirect('/page_not_found');

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;

    res.render('password_reset_success', { activeLink, loggedIn });
});


exports.postChangeEmail = wrapAsync(async function(req, res, next) {

    // Sanitize and process input.
    let cleanedFields = logic.cleanFields(defaultFields.changeEmail, req.body);
    let { newEmail, emailConfirmation, password } = cleanedFields;

    // Check for a change.  If nothing changed redirect to dashboard.
    let didEmailChange = req.session.userValues.email === newEmail ? false : true;

    if (didEmailChange === false) return res.redirect('/dashboard');

    let areAllFieldsFilled = tests.checkAllFieldsFilled(defaultFields.changeEmail, cleanedFields);
    let isEmailTooLong = tests.checkIfInputTooLong(newEmail, defaultAppValues.emailField.maxLength);
    let isEmailValid = validator.validate(newEmail);
    let doEmailsMatch = newEmail === emailConfirmation ? true : false;    
    let isPasswordCorrect = await bcrypt.compare(password, req.session.userValues.password);
    let doesUnverifiedUserAlreadyExist = await UnverifiedUser.exists({ email: newEmail });
    let userDBSearch = await User.exists({ email: newEmail });
    let doesUserAlreadyExist = userDBSearch === true && didEmailChange === true ? true : false;

    if (
        areAllFieldsFilled === true &&
        isEmailTooLong === false &&
        isEmailValid === true &&
        doEmailsMatch === true &&
        isPasswordCorrect === true &&
        doesUnverifiedUserAlreadyExist === false &&
        doesUserAlreadyExist === false
    ) {
        await User.updateOne({ email: req.session.userValues.email }, { email: newEmail });
        req.session.userValues.email = newEmail;
        return res.redirect('/dashboard');
    } else {

        // Create and redirect the errors to changeEmail where they will be rendered and deleted.
        let whyEmailUsed = 'change';
        let newEmailError = logicMessages.getNewEmailError(newEmail, whyEmailUsed, isEmailTooLong, isEmailValid, doesUserAlreadyExist, doesUnverifiedUserAlreadyExist);
        let emailConfirmationError = logicMessages.getEmailConfirmationError(emailConfirmation, doEmailsMatch);
        let passwordError = logicMessages.getSaveEmailPasswordError(password, isPasswordCorrect);

        // If there is an email error blank out emailConfirm field.  After any error always blank out password field.
        if (newEmailError) cleanedFields.emailConfirmation = '';
        cleanedFields.password = '';

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.newEmailError = newEmailError;
        req.session.transfer.emailConfirmationError = emailConfirmationError;
        req.session.transfer.passwordError = passwordError;

        return res.redirect('/change_email');
    }
});

exports.postChangePassword = wrapAsync(async function(req, res, next) {

    // Sanitize and process input.
    let cleanedFields = logic.cleanFields(defaultFields.changePassword, req.body);
    let { passwordConfirm, passwordCurrent, password } = cleanedFields;
    let { email } = req.session.userValues;

    let isCurrentPasswordCorrect = await bcrypt.compare(passwordCurrent, req.session.userValues.password);
    let isPasswordFilled = password === '' ? false : true;
    let isPasswordConfirmFilled = passwordConfirm === '' ? false : true;
    let isPasswordTooLong = tests.checkIfInputTooLong(password, defaultAppValues.passwordField.maxLength);
    let doesPasswordMeetRequirements = tests.checkPasswordMeetsRequirements(password);
    let doPasswordsMatch = password === passwordConfirm ? true : false;
    
    if (
        isCurrentPasswordCorrect === true &&
        isPasswordFilled === true &&
        isPasswordConfirmFilled === true &&
        isPasswordTooLong === false &&
        doesPasswordMeetRequirements === true &&
        doPasswordsMatch === true 
    ) {

        // If any of these are stored in the db delete them.
        await LoginFailure.findOneAndRemove({ email: email });
        await PasswordResetRequest.findOneAndRemove({ email: email });

        let passwordHashed = await logic.hashPassword(password);
        await User.updateOne({ email: email }, { password: passwordHashed });
        req.session.userValues.password = passwordHashed;
        return res.redirect('/dashboard');
    } else {
        
        // Create and redirect the errors to changePassword where they will be rendered and deleted.
        let whyPasswordUsed = 'changePassword';
        let passwordCurrentError = logicMessages.getPasswordError(whyPasswordUsed, passwordCurrent, isCurrentPasswordCorrect);
        let passwordError = logicMessages.getPasswordNewError(whyPasswordUsed, password, isPasswordTooLong, doesPasswordMeetRequirements);
        let passwordConfirmError = logicMessages.getPasswordConfirmError(whyPasswordUsed, passwordError, passwordConfirm, doPasswordsMatch);
        
        // If there is a current password error change it to an empty string for rendering at changePassword.
        if(passwordCurrentError) {
            cleanedFields.passwordCurrent = '';
        }

        // If there is a password error change the password and confirmation to an empty string for rendering at register.
        if(passwordError) {
            cleanedFields.password = '';
            cleanedFields.passwordConfirm = '';
        }

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.passwordCurrentError = passwordCurrentError;
        req.session.transfer.passwordError = passwordError;
        req.session.transfer.passwordConfirmError = passwordConfirmError;

        return res.redirect('change_password');
    }
});

exports.postAddChangeBusinessAddress = wrapAsync(async function(req, res, next) {

    // Sanitize and process input.
    let cleanedFields = logic.cleanFields(defaultFields.addChangeBusinessAddress, req.body);
    let { businessCity, businessState, businessStreet, businessStreetTwo, businessZip, overrideUsps, deleteProperty } = cleanedFields;

    if(deleteProperty === 'true') {
        await User.updateOne({ email: req.session.userValues.email }, { 
            businessCity: '',
            businessState: '',
            businessStreet: '',
            businessStreetTwo: '',
            businessZip: ''
        });

        req.session.userValues.businessCity = '';
        req.session.userValues.businessState = '';
        req.session.userValues.businessStreet = '';
        req.session.userValues.businessStreetTwo = '';
        req.session.userValues.businessZip = '';

        return res.redirect('/dashboard');
    }

    // Check for a change.  If nothing changed redirect to dashboard.
    let didBusinessAddressChange =
        req.session.userValues.businessCity === businessCity &&
        req.session.userValues.businessState === businessState &&
        req.session.userValues.businessStreet === businessStreet &&
        req.session.userValues.businessStreetTwo === businessStreetTwo &&
        req.session.userValues.businessZip === businessZip &&
        businessCity &&
        businessState &&
        businessStreet &&
        businessZip
        ? false : true;

    if (didBusinessAddressChange === false) return res.redirect('/dashboard');

    let isBusinessCityFilled = businessCity === '' ? false : true;
    let isBusinessCityTooShort = businessCity.length >= defaultAppValues.businessCityField.minLength ? false : true;
    let isBusinessCityTooLong = businessCity.length <= defaultAppValues.businessCityField.maxLength ? false : true;
    let isBusinessCityValidCharacters = /^[a-zA-Z'-\s]+$/.test(businessCity);

    let isBusinessStateFilled = businessState === '' ? false : true;
    let isBusinessStateValid = tests.checkBusinessStateValid(businessState);

    let isBusinessStreetFilled = businessStreet === '' ? false : true;
    let isBusinessStreetTooShort = businessStreet.length >= defaultAppValues.businessStreetField.minLength ? false : true;
    let isBusinessStreetTooLong = businessStreet.length <= defaultAppValues.businessStreetField.maxLength ? false : true;
    let isBusinessStreetValidCharacters = /^[a-zA-Z0-9'-\s]+$/.test(businessStreet);

    let isBusinessStreetTwoFilled = businessStreetTwo === '' ? false : true;

    let isBusinessStreetTwoTooShort;
    if(isBusinessStreetTwoFilled) {
        isBusinessStreetTwoTooShort = businessStreetTwo.length >= defaultAppValues.businessStreetField.minLength ? false : true;
    } else {
        isBusinessStreetTwoTooShort = false;
    }
    
    let isBusinessStreetTwoTooLong = businessStreetTwo.length <= defaultAppValues.businessStreetField.maxLength ? false : true;    
    let isBusinessStreetTwoValidCharacters = /^[a-zA-Z0-9'-\s\#]+$|^$/.test(businessStreetTwo);

    let isBusinessZipFilled = businessZip === '' ? false : true;
    let isBusinessZipFiveDigits = businessZip.length === 5 ? true : false;
    let isBusinessZipValidCharacters = /^[0-9]+$/.test(businessZip);

    let uspsNormalizedBusinessAddress = await usps.verify({
        street1: businessStreet,
        street2: businessStreetTwo,
        city: businessCity,
        state: businessState,
        zip: businessZip
    });

    let isBusinessAddressNormalized = tests.checkBusinessAddressNormalized(businessStreet, businessStreetTwo, businessCity, businessState, businessZip, uspsNormalizedBusinessAddress);

    // If USPS can't normalize the address it returns a .name property.  Without .name an error doesn't exist.
    let uspsNormalizationError = uspsNormalizedBusinessAddress.name;

    if (
        isBusinessCityFilled === true &&
        isBusinessCityTooShort === false &&
        isBusinessCityTooLong === false &&
        isBusinessCityValidCharacters === true &&
        isBusinessStateFilled === true &&
        isBusinessStateValid === true &&
        isBusinessStreetFilled === true &&
        isBusinessStreetTooShort === false &&
        isBusinessStreetTooLong === false &&
        isBusinessStreetValidCharacters === true &&
        isBusinessStreetTwoTooShort === false &&
        isBusinessStreetTwoTooLong === false &&
        isBusinessStreetTwoValidCharacters === true &&
        isBusinessZipFilled === true &&
        isBusinessZipFiveDigits === true &&
        isBusinessZipValidCharacters === true &&
        uspsNormalizationError === undefined &&
        (isBusinessAddressNormalized === true || overrideUsps === 'true')
    ) {
        await User.updateOne({ email: req.session.userValues.email }, { 
            businessCity: businessCity,
            businessState: businessState,
            businessStreet: businessStreet,
            businessStreetTwo: businessStreetTwo,
            businessZip: businessZip
        });

        req.session.userValues.businessCity = businessCity;
        req.session.userValues.businessState = businessState;
        req.session.userValues.businessStreet = businessStreet;
        req.session.userValues.businessStreetTwo = businessStreetTwo;
        req.session.userValues.businessZip = businessZip;

        return res.redirect('/dashboard');

    } else if (
        isBusinessCityFilled === true &&
        isBusinessCityTooShort === false &&
        isBusinessCityTooLong === false &&
        isBusinessCityValidCharacters === true &&
        isBusinessStateFilled === true &&
        isBusinessStateValid === true &&
        isBusinessStreetFilled === true &&
        isBusinessStreetTooShort === false &&
        isBusinessStreetTooLong === false &&
        isBusinessStreetValidCharacters === true &&
        isBusinessStreetTwoTooShort === false &&
        isBusinessStreetTwoTooLong === false &&
        isBusinessStreetTwoValidCharacters === true &&
        isBusinessZipFilled === true &&
        isBusinessZipFiveDigits === true &&
        isBusinessZipValidCharacters === true &&
        uspsNormalizationError === undefined &&
        isBusinessAddressNormalized === false

    ) {

        req.session.normalize = {};
        req.session.normalize.userInputStreet = businessStreet;
        req.session.normalize.userInputStreetTwo = businessStreetTwo;
        req.session.normalize.userInputCity = businessCity;
        req.session.normalize.userInputState = businessState;
        req.session.normalize.userInputZip = businessZip;
        req.session.normalize.uspsStreet = uspsNormalizedBusinessAddress.street1;
        req.session.normalize.uspsStreetTwo = uspsNormalizedBusinessAddress.street2;
        req.session.normalize.uspsCity = uspsNormalizedBusinessAddress.city;
        req.session.normalize.uspsState = uspsNormalizedBusinessAddress.state;
        req.session.normalize.uspsZip = uspsNormalizedBusinessAddress.Zip5;

        return res.redirect('/add_change_business_address');
    } else {
        
        let isBusinessRegionFilled = (businessCity, businessState, businessZip) ? true : false;

        // Create and redirect the errors to changeBusinessAddress where they will be rendered and deleted from the session.
        let businessCityError = logicMessages.getBusinessCityError(isBusinessCityFilled, isBusinessCityTooLong, isBusinessCityTooShort, isBusinessCityValidCharacters);
        let businessStateError = logicMessages.getBusinessStateError(isBusinessStateFilled, isBusinessStateValid);
        let businessStreetError = logicMessages.getBusinessStreetError(isBusinessStreetFilled, isBusinessStreetTooLong, isBusinessStreetTooShort, isBusinessStreetValidCharacters, isBusinessRegionFilled, uspsNormalizationError);
        let businessStreetTwoError = logicMessages.getBusinessStreetTwoError(isBusinessStreetTwoFilled, isBusinessStreetTwoTooLong, isBusinessStreetTwoTooShort, isBusinessStreetTwoValidCharacters);
        let businessZipError = logicMessages.getBusinessZipError(isBusinessZipFilled, isBusinessZipFiveDigits, isBusinessZipValidCharacters);

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.businessCityError = businessCityError;
        req.session.transfer.businessStateError = businessStateError;
        req.session.transfer.businessStreetError = businessStreetError;
        req.session.transfer.businessStreetTwoError = businessStreetTwoError;
        req.session.transfer.businessZipError = businessZipError;

        return res.redirect('/add_change_business_address');
    }
});

exports.postAddChangeBusinessName = wrapAsync(async function(req, res, next) {

    // Sanitize and process input.
    let cleanedFields = logic.cleanFields(defaultFields.addChangeBusinessName, req.body);
    let { businessName, deleteProperty } = cleanedFields;

    if(deleteProperty === 'true') {
        await User.updateOne({ email: req.session.userValues.email }, { 
            businessName: ''
        });

        req.session.userValues.businessName = '';

        return res.redirect('/dashboard');
    }

    // If nothing changed redirect to dashboard.
    let didBusinessNameChange = businessName === req.session.userValues.businessName ? false : true;
    let isBusinessNameFilled = businessName === '' ? false : true;

    if (didBusinessNameChange === false && isBusinessNameFilled === true) return res.redirect('/dashboard');

    let doesBusinessNameContainCharacterOrNumber = /[a-zA-Z0-9]+/.test(businessName);
    let isBusinessNameProfane = filter.isProfane(businessName);
    let isBusinessNameTooLong = businessName.length <= defaultAppValues.businessNameField.maxLength ? false : true;
    let isBusinessNameTooShort = businessName.length >= defaultAppValues.businessNameField.minLength ? false : true;
    let isBusinessNameValidCharacters = /^[a-zA-Z0-9'-\s]+$|^$/.test(businessName);

    if (
        doesBusinessNameContainCharacterOrNumber === true &&
        isBusinessNameFilled === true &&
        isBusinessNameProfane === false &&
        isBusinessNameTooLong === false &&
        isBusinessNameTooShort === false &&
        isBusinessNameValidCharacters === true
    ) {

        let capitalizedBusinessName = businessName.replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase());
        await User.updateOne({ email : req.session.userValues.email }, { businessName: capitalizedBusinessName });

        req.session.userValues.businessName = capitalizedBusinessName;
        return res.redirect('/dashboard');
    } else {

        // Create and redirect the errors to changeBusinessName where they will be rendered and deleted.
        let businessNameError = logicMessages.getBusinessNameError(isBusinessNameFilled, isBusinessNameTooLong, isBusinessNameTooShort, isBusinessNameProfane, isBusinessNameValidCharacters, doesBusinessNameContainCharacterOrNumber);

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.businessNameError = businessNameError;

        return res.redirect('/add_change_business_name');
    }
});

exports.postAddChangeBusinessPhone = wrapAsync(async function(req, res, next) {

    // Sanitize and process input.
    let cleanedFields = logic.cleanFields(defaultFields.addChangeBusinessPhone, req.body);
    let { businessPhone, deleteProperty } = cleanedFields;

    if(deleteProperty === 'true') {
        await User.updateOne({ email: req.session.userValues.email }, { 
            businessPhone: ''
        });

        req.session.userValues.businessPhone = '';

        return res.redirect('/dashboard');
    }

    // Dismantle and rebuild businessPhone.  formatPhone strips out all characters that aren't numbers and returns businessPhone in E.164 format.  
    let businessPhoneFormatted = logic.formatBusinessPhone(businessPhone);

    // Check for a change.  If nothing changed redirect to dashboard.
    let didBusinessPhoneChange = req.session.userValues.businessPhone === businessPhoneFormatted ? false : true;
    let isBusinessPhoneFilled = businessPhone === '' ? false : true;

    if (didBusinessPhoneChange === false && isBusinessPhoneFilled === true) return res.redirect('/dashboard');

    let isBusinessPhoneValid = tests.checkBusinessPhoneValid(businessPhoneFormatted);

    if (
        isBusinessPhoneFilled === true &&
        isBusinessPhoneValid === true
    ) {

        await User.updateOne({ email: req.session.userValues.email }, { businessPhone: businessPhoneFormatted });

        req.session.userValues.businessPhone = businessPhoneFormatted;
        return res.redirect('/dashboard');

    } else {
        
        // Create and redirect the errors to changeBusinessPhone where they will be rendered and deleted.
        let businessPhoneError = logicMessages.getBusinessPhoneError(isBusinessPhoneFilled, isBusinessPhoneValid);

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.businessPhoneError = businessPhoneError;

        return res.redirect('/add_change_business_phone');
    }
});

exports.postAddChangeBusinessServices = wrapAsync(async function(req, res, next) {

    // Sanitize and process input.
    let cleanedFields = logic.cleanFields(defaultFields.addChangeBusinessServices, req.body);
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
        deleteProperty
    } = cleanedFields;

    if(deleteProperty === 'true') {
        await User.updateOne({ email: req.session.userValues.email }, { 
            serviceBoardingSecuring: false,
            serviceDebrisRemovalTrashout: false,
            serviceEvictionManagement: false,
            serviceFieldInspection: false,
            serviceHandymanGeneralMaintenance: false,
            serviceLandscapeMaintenance: false,
            serviceLockChanges: false,
            serviceOverseePropertyRehabilitation: false,
            servicePoolMaintenance: false,
            servicePropertyCleaning: false,
            serviceWinterizations: false
        });

        req.session.userValues.serviceBoardingSecuring = false;
        req.session.userValues.serviceDebrisRemovalTrashout = false;
        req.session.userValues.serviceEvictionManagement = false;
        req.session.userValues.serviceFieldInspection = false;
        req.session.userValues.serviceHandymanGeneralMaintenance = false;
        req.session.userValues.serviceLandscapeMaintenance = false;
        req.session.userValues.serviceLockChanges = false;
        req.session.userValues.serviceOverseePropertyRehabilitation = false;
        req.session.userValues.servicePoolMaintenance = false;
        req.session.userValues.servicePropertyCleaning = false;
        req.session.userValues.serviceWinterizations = false;

        return res.redirect('/dashboard');
    }

    // Check for a change.  If nothing changed redirect to dashboard.
    let didBusinessServicesChange =
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
        serviceBoardingSecuring &&
        serviceDebrisRemovalTrashout &&
        serviceEvictionManagement &&
        serviceFieldInspection &&
        serviceHandymanGeneralMaintenance &&
        serviceLandscapeMaintenance &&
        serviceLockChanges &&
        serviceOverseePropertyRehabilitation &&
        servicePoolMaintenance &&
        servicePropertyCleaning &&
        serviceWinterizations
        ? false : true;

    if (didBusinessServicesChange === false) return res.redirect('/dashboard');

    let isBusinessServicesFilled =
        serviceBoardingSecuring === undefined &&
        serviceDebrisRemovalTrashout === undefined &&
        serviceEvictionManagement === undefined &&
        serviceFieldInspection === undefined &&
        serviceHandymanGeneralMaintenance === undefined &&
        serviceLandscapeMaintenance === undefined &&
        serviceLockChanges === undefined &&
        serviceOverseePropertyRehabilitation === undefined &&
        servicePoolMaintenance === undefined &&
        servicePropertyCleaning === undefined &&
        serviceWinterizations === undefined
        ? false : true;

    if (
        isBusinessServicesFilled === true 
    ) {

        let businessServicesCombined = Object.entries(cleanedFields).reduce((accumulator, [key, value]) => (value ? (accumulator[key] = value, accumulator) : accumulator), {});  

        await User.updateOne({ email: req.session.userValues.email },
            {
                businessServices: 
            });

        req.session.userValues.businessServices = businessServicesCombined;
        return res.redirect('/dashboard');

    } else {
        
        // Create and redirect the errors to changeBusinessPhone where they will be rendered and deleted.
        let businessServicesError = logicMessages.getBusinessServicesError(isBusinessServicesFilled);

        req.session.transfer = {};
        req.session.transfer.businessServicesError = businessServicesError;

        return res.redirect('/add_change_business_services');
    }
});

exports.postDeleteYourAccount = wrapAsync(async function(req, res, next) {

    // Sanitize and process input.
    let cleanedFields = logic.cleanFields(defaultFields.deleteYourAccount, req.body);
    let { password } = cleanedFields;

    let email = req.session.userValues.email || '';
    let dbPassword = req.session.userValues.password || '';

    let isPasswordCorrect = await bcrypt.compare(password, dbPassword);
    
    if(isPasswordCorrect) {

        await User.findOneAndRemove({ email: email });

        // Create a temporary key stored in the db to be used to access the account_deleted route.
        let recentDeletedAccount = mongooseInstance.createRecentDeletedAccount(email);
        await recentDeletedAccount.save();

        // Check for and remove any login failures in the db.
        await logic.removeLoginFailures(email);

        return res.redirect(`/account_deleted?email=${email}`);
    }

    // Create and redirect the error to deleteYourAccount where it will be rendered and deleted.
    let whyPasswordUsed = 'delete account';
    let deleteAccountError = logicMessages.getPasswordError(whyPasswordUsed, password, isPasswordCorrect);

    req.session.transfer = {};
    req.session.transfer.deleteAccountError = deleteAccountError;

    return res.redirect('/delete_your_account');
});

exports.postLogin = wrapAsync(async function(req, res, next) {

    // Sanitize and process input.
    let cleanedFields = logic.cleanFields(defaultFields.login, req.body);
    let { email, password } = cleanedFields;

    let isEmailValid = validator.validate(email);
    let userValues = await User.findOne({ email: email });
    let doesLoginExist = userValues === null ? false : true;

    let dbPassword = userValues ? userValues.password : '';
    let isPasswordCorrect = await bcrypt.compare(password, dbPassword);

    // Check to see if client should be locked out because of multiple failed password attempts.
    let loginFailure = await LoginFailure.findOne({ email: email });
    let lockedOut;

    if(loginFailure) {
        lockedOut = loginFailure.numberOfFailures >= defaultAppValues.numberOfLoginFailuresAllowed ? true : false;
    } else {
        lockedOut = false;
    }
    
    // Increment login failure if needed.  This occurs even if email/account doesn't exist to stop hackers from blasting server.
    if(password && !isPasswordCorrect) {

        if(!loginFailure) {
            loginFailure = mongooseInstance.createLoginFailure(email);
            await loginFailure.save();
        } else {
            loginFailure.numberOfFailures += 1;
            await LoginFailure.updateOne({ email: email }, { numberOfFailures: loginFailure.numberOfFailures });
        }
        
        if(loginFailure.numberOfFailures >= defaultAppValues.numberOfLoginFailuresAllowed) {
            lockedOut = true;
        }
    }

    if(lockedOut) {
        
        return res.redirect(`/login_failure_limit_reached?email=${email}`);
    }

    if (
        doesLoginExist === true &&
        isPasswordCorrect === true &&
        lockedOut === false
        ) {    

        // Check for and remove any login failures in the db.
        await logic.removeLoginFailures(email);

        req.session.userValues = userValues;
        return res.redirect('/dashboard');
    } else {

        // Create and redirect the errors to login where they will be rendered and deleted.
        let emailError = logicMessages.getLoginEmailError(email, isEmailValid);
        let whyPasswordUsed = 'login';
        let passwordError = logicMessages.getPasswordError(whyPasswordUsed, password, isPasswordCorrect);

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.emailError = emailError;
        req.session.transfer.passwordError = passwordError;

        return res.redirect('/login');
    }
});

exports.postPasswordReset = wrapAsync(async function(req, res, next) {

    // Sanitize and process input.
    let cleanedFields = logic.cleanFields(defaultFields.passwordReset, req.body);
    let { password, passwordConfirm } = cleanedFields;
    let hash = req.query.hash ? req.query.hash : '';

    let areAllFieldsFilled = tests.checkAllFieldsFilled(defaultFields.passwordReset, cleanedFields);
    let isPasswordTooLong = tests.checkIfInputTooLong(password, defaultAppValues.passwordField.maxLength);
    let doesPasswordMeetRequirements = tests.checkPasswordMeetsRequirements(password);
    let doPasswordsMatch = password === passwordConfirm ? true : false;

    if (
        areAllFieldsFilled === true &&
        doPasswordsMatch === true &&
        doesPasswordMeetRequirements === true &&
        isPasswordTooLong === false
        ) {

            let passwordResetRequest = await PasswordResetRequest.findOne({ confirmationHash: hash });
            let { email } = passwordResetRequest;
            let passwordHashed = await logic.hashPassword(password);
            await User.updateOne({ email: email }, { password: passwordHashed });
            await PasswordResetRequest.findOneAndRemove({ confirmationHash: hash });

            let recentPasswordResetSuccess = mongooseInstance.createRecentPasswordResetSuccess(email);
            await recentPasswordResetSuccess.save();

            // Check for and remove any login failures in the db.
            await logic.removeLoginFailures(email);

            return res.redirect(`/password_reset_success?email=${ email }`);
        } else {

            // Create and send the error to passwordReset where it will be used and deleted.
            let whyPasswordUsed = 'passwordChange';
            let passwordError = logicMessages.getPasswordNewError(whyPasswordUsed, password, isPasswordTooLong, doesPasswordMeetRequirements);
            let passwordConfirmError = logicMessages.getPasswordConfirmError(whyPasswordUsed, passwordError, passwordConfirm, doPasswordsMatch);

            req.session.transfer = {};
            req.session.transfer.cleanedFields = cleanedFields;
            req.session.transfer.passwordError = passwordError;
            req.session.transfer.passwordConfirmError = passwordConfirmError;

            return res.redirect(`/password_reset?hash=${ hash }`);
        }
});

exports.postPasswordResetRequest = wrapAsync(async function(req, res, next) {

    // Sanitize and process input.
    let cleanedFields = logic.cleanFields(defaultFields.passwordResetRequest, req.body);
    let { email } = cleanedFields;

    let isEmailValid = validator.validate(email);
    let isEmailTooLong = tests.checkIfInputTooLong(email, defaultAppValues.emailField.maxLength);

    if (
        email === '' ||
        isEmailValid === false ||
        isEmailTooLong === true
        ) {

        // Create and send the error to passwordResetRequest where it will be used and deleted.
        let emailError = logicMessages.getEmailError(email, isEmailValid, isEmailTooLong);

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.emailError = emailError;

        return res.redirect('/password_reset_request');
    } 

    // If client attempts to reset password of an unverified account make him verify first.
    let unverifiedUser = await UnverifiedUser.findOne({ email: email });
    
    if (unverifiedUser) {

        return res.redirect(`/confirmation_resent?email=${ email }&resetattempt=true`);
    }

    let confirmationHash = await logic.getOrCreateConfirmationHash(email);
    let wasConfirmationLimitReached = await logic.incrementExistingPasswordResetOrCreateNew(email, confirmationHash);
    if(wasConfirmationLimitReached) return res.redirect(`/password_reset_limit_reached?email=${ email }`);

    let emailSubject = defaultMessages.passwordResetRequestEmailSubject(process.env.ORGANIZATION);
    let expirationTime = logicMessages.getExpirationTime(defaultAppValues.passwordResetRequestExpiration);
    await logic.sendEmailIfNecessary(email, confirmationHash, emailSubject, expirationTime); 

    // If the email passes the checks and no unverified user exists send the client to passwordResetRequestSent.
    // Notify client that the request for that email was received whether or not the user exists.  This way hackers won't know if an email exists in the db.  
    return res.redirect(`/password_reset_request_sent?email=${ email }&forward=true`);
});

exports.postRegister = wrapAsync(async function(req, res, next) {

    // Sanitize and process input.
    let cleanedFields = logic.cleanFields(defaultFields.register, req.body);
    let { email, password, passwordConfirm, termsOfUse } = cleanedFields;
    
    let areAllFieldsFilled = tests.checkAllFieldsFilled(defaultFields.register, cleanedFields);
    let isEmailValid = validator.validate(email);
    let isEmailTooLong = tests.checkIfInputTooLong(email, defaultAppValues.emailField.maxLength);

    let doesUnverifiedUserAlreadyExist = await UnverifiedUser.exists({ email: email });
    let doesUserAlreadyExist = await User.exists({ email: email });

    let doesPasswordMeetRequirements = tests.checkPasswordMeetsRequirements(password);
    let doPasswordsMatch = password === passwordConfirm ? true : false;
    let isPasswordTooLong = tests.checkIfInputTooLong(password, defaultAppValues.passwordField.maxLength);

    let isTermsOfUseChecked = termsOfUse ? true : false;

    if (
        areAllFieldsFilled === true &&
        isEmailValid === true &&
        isEmailTooLong === false &&
        doesUserAlreadyExist === false &&
        doesPasswordMeetRequirements === true &&
        doPasswordsMatch === true &&
        isPasswordTooLong === false &&
        isTermsOfUseChecked
    ) {

        // If an unverified user already exists save over it with new values but update the confirmation counter so that a hacker can't blast the server with same email an unlimited number of times.
        if(doesUnverifiedUserAlreadyExist === true) {

            var unverifiedUser = await UnverifiedUser.findOne({ email: email });

            let { numberOfConfirmations } = unverifiedUser;

            if (numberOfConfirmations >= defaultAppValues.numberOfEmailConfirmationsAllowed) {
                req.session.tooManyConfirmations = true;
                return res.redirect('/confirmation_limit_reached');
            }

            let hashedPassword = await logic.hashPassword(password);
            await UnverifiedUser.updateOne({ email: email}, {password: hashedPassword, numberOfConfirmations: numberOfConfirmations += 1 });
        } else {

            // If one of these is stored in the db delete it.  It is no longer needed.
            await FalseEmailConfirmationRequest.findOneAndRemove({ email: email });
            await RecentDeletedAccount.findOneAndRemove({ email: email });

            var unverifiedUser = mongooseInstance.createUnverifiedUser(email);
            let salt = cryptoRandomString({ length: 10 });
            unverifiedUser.confirmationHash = objectHash(email + salt);
            unverifiedUser.password = await logic.hashPassword(password);
            await unverifiedUser.save();
        }

        let emailSubject = defaultMessages.emailVerificationEmailSubject(process.env.ORGANIZATION);
        let htmlMessage = defaultMessages.emailVerificationEmailBody(process.env.WEBSITE, process.env.ORGANIZATION, process.env.HOST, unverifiedUser.confirmationHash);
        communication.sendEmail(email, emailSubject, htmlMessage);

        return res.redirect(`/registration_sent?email=${email}`);

    } else {

        // Create and send the errors to register where they will be used and deleted.
        let whyEmailUsed = 'register';
        let emailError = logicMessages.getNewEmailError(email, whyEmailUsed, isEmailTooLong, isEmailValid, doesUserAlreadyExist);
        let whyPasswordUsed = 'register';
        let passwordError = logicMessages.getPasswordNewError(whyPasswordUsed, password, isPasswordTooLong, doesPasswordMeetRequirements);
        let passwordConfirmError = logicMessages.getPasswordConfirmError(whyPasswordUsed, passwordError, passwordConfirm, doPasswordsMatch);
        let termsOfUseError = termsOfUse ? '' : 'Please agree to the terms of use and read the privacy policy.';

        // If there is a password error change the password and confirmation to an empty string for rendering at register.
        if(passwordError) {
            cleanedFields.password = '';
            cleanedFields.passwordConfirm = '';
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

// If the user is logged in redirect to the dashboard.
exports.redirectDashboard = wrapAsync(async function(req, res, next) {

    if (req.session.userValues) {

        return res.redirect('/dashboard');
    }

    return next();
});

exports.redirectLogin = wrapAsync(async function(req, res, next) {

    if (!req.session.userValues) {

        return res.redirect('/login');
    }
    
    return next();
});

exports.register = wrapAsync(async function(req, res, next) {

    // If there is data available from previous postRegister gather it from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, emailError, passwordError, passwordConfirmError, termsOfUseError } = req.session.transfer;

        if(passwordError) {
            var passwordErrorMessage = passwordError.message;
            var passwordErrorType = passwordError.errorType;
        }
        
        if(passwordConfirmError) {
            var passwordConfirmErrorMessage = passwordConfirmError.message;
            var passwordConfirmErrorType = passwordConfirmError.errorType;
        }

        delete req.session.transfer;

        // Set object to previous form input.
        var inputFields = cleanedFields;

    } else {
        // If req.session data isn't used set every property to an empty string.
        var inputFields = logic.makeFieldsEmpty(defaultFields.register);
    }

    // For rendering.
    let activeLink = 'register';
    let loggedIn = req.session.userValues ? true : false;
    let emailAttributes = defaultAppValues.emailField.attributes;
    let passwordAttributes = defaultAppValues.passwordField.attributes(passwordErrorType);
    let passwordConfirmAttributes = defaultAppValues.passwordField.attributes(passwordConfirmErrorType);

    res.render('register', { userInput: inputFields, activeLink, loggedIn, emailAttributes, passwordAttributes, passwordConfirmAttributes, emailError, passwordErrorMessage, passwordConfirmErrorMessage, termsOfUseError });
});

exports.registrationSent = wrapAsync(async function(req, res, next) {

    let email = req.query.email ? req.query.email : '';

    // If the hash matches an unverified user grab it.
    let unverifiedUser = await UnverifiedUser.findOne({ email: email });

    // If the hash is wrong or not present redirect to the home page.
    if (email === '' || unverifiedUser === null) {
        return res.status(404).redirect('/page_not_found');
    }

    await UnverifiedUser.updateOne({ email: email }, { numberOfConfirmations: unverifiedUser.numberOfConfirmations += 1 });

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;
    let emailSubject = defaultMessages.emailVerificationEmailSubject(process.env.ORGANIZATION);

    res.render('registration_sent', { activeLink, loggedIn, email, emailSubject });
});

exports.verified = wrapAsync(async function(req, res, next) {

    let hash = req.query.hash ? req.query.hash : '';

    // If the hash matches an unverified user grab it.
    let unverifiedUser = await UnverifiedUser.findOne({ confirmationHash: hash });

    // If the hash is wrong or not present redirect to the home page.
    if (hash === '' || unverifiedUser === null) {
        return res.status(404).redirect('/page_not_found');
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
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;

    res.render('verified', { activeLink, loggedIn });
});