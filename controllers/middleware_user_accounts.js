"use strict";

const bcrypt = require('bcryptjs');
const Filter = require('bad-words');
const objectHash = require('object-hash');
const path = require('path');
const validator = require('email-validator');
const winston = require('winston');

require('dotenv').config({ path: path.join(__dirname, '/models/.env') });

const logic = require('./logic_user_accounts');
const { wrapAsync } = require('./logic_user_accounts');
const defaultAppValues = require('../models/default_app_values.js');
const {
    changeEmailFields,
    changeYourNameFields,
    changePasswordFields,
    changePhoneFields,
    deleteYourAccountFields,
    loginFields, 
    passwordResetFields,
    passwordResetRequestFields,
    registerFields,
    requestAnotherConfirmationFields
    } = require('../models/default_fields.js');

const {
    changeNone,
    changeSuccessful,
    confirmationLimitReachedBody,
    confirmationResentBody,
    confirmationResentHeadline,
    emailVerificationEmailBody,
    emailVerificationEmailSubject,
    passwordResetRequestEmailBody,
    passwordResetRequestEmailSubject,
    unverifiedConfirmationLimitReachedBody,
    unverifiedConfirmationAttemptHeadline,
    unverifiedPasswordResetAttemptBody,
    unverifiedPasswordResetAttemptHeadline
    } = require('../models/default_messages.js');

const {
    FalseEmailConfirmationRequest,
    LoginFailure,
    PasswordResetRequest,
    User,
    UnverifiedUser
    } = require('../models/mongoose_schema');

const cryptoRandomString = require('crypto-random-string');
const filter = new Filter();

const logger = winston.createLogger({
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log' })
    ]
});

exports.accountDeleted = wrapAsync(async function(req, res, next) {

    req.session.destroy( function(error) {
        if (error) {
            res.clearCookie(process.env.SESSION_NAME);
        }
    });

    let activeLink = null;
    let loggedIn = false;
    
    res.render('account_deleted', { activeLink, loggedIn });
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
        var inputFields = logic.makeFieldsEmpty(changeEmailFields);
    }

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;
    let emailAttributes = defaultAppValues.emailField;
    let passwordAttributes = defaultAppValues.passwordField.attributes();
    let currentEmail = req.session.userValues.email;

    res.render('change_email', { userInput: inputFields, activeLink, loggedIn, emailAttributes, passwordAttributes, currentEmail, newEmailError, emailConfirmationError, passwordError });
});

exports.changePassword = wrapAsync(async function(req, res, next) {

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, passwordCurrentError, passwordError, passwordConfirmError } = req.session.transfer;

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
        var inputFields = logic.makeFieldsEmpty(changePhoneFields);
    }

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;

    let passwordCurrentAttributes = defaultAppValues.passwordField.attributes();
    let passwordAttributes = defaultAppValues.passwordField.attributes(passwordErrorType);
    let passwordConfirmAttributes = defaultAppValues.passwordField.attributes(passwordConfirmErrorType);

    res.render('change_password', { userInput: inputFields, activeLink, loggedIn, passwordCurrentError, passwordErrorMessage, passwordConfirmErrorMessage, passwordCurrentAttributes, passwordAttributes, passwordConfirmAttributes });
});

exports.changePhone = wrapAsync(async function(req, res, next) {

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, phoneError } = req.session.transfer;
        delete req.session.transfer;

        // Set object to previous form input.
        var inputFields = cleanedFields;

    } else {
        // If req.session data isn't used set every property to an empty string.
        var inputFields = logic.makeFieldsEmpty(changePhoneFields);
    }

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;
    let phoneAttributes = defaultAppValues.phoneField;
    let currentPhone = req.session.userValues.phone;

    res.render('change_phone', { userInput: inputFields, activeLink, loggedIn, phoneAttributes, currentPhone, phoneError });
});

exports.changeYourName = wrapAsync(async function(req, res, next) {

    // Grab the data from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, firstNameError, lastNameError } = req.session.transfer;
        delete req.session.transfer;

        // Set object to previous form input.
        var inputFields = cleanedFields;

    } else {
        // If req.session data isn't used set every property to an empty string.
        var inputFields = logic.makeFieldsEmpty(changeYourNameFields);
    }

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;
    let yourNameAttributes = defaultAppValues.yourNameField;
    let currentFirstName = req.session.userValues.firstName;
    let currentLastName = req.session.userValues.lastName;

    res.render('change_your_name', { userInput: inputFields, activeLink, loggedIn, yourNameAttributes, currentFirstName, currentLastName, firstNameError, lastNameError });
});

exports.confirmationLimitReached = wrapAsync(async function(req, res, next) {

    let email = req.query.email || '';

    // If the email matches an unverified user grab it.
    let unverifiedUser = await UnverifiedUser.findOne({ email: email });

    // If the hash is wrong or not present redirect to the home page.
    if (email === '' || unverifiedUser === null) {
        return res.redirect('/');
    }

    // If for some reason the user has never been to the registration sent page redirect them to that.
    if (unverifiedUser.numberOfConfirmations === 0) {
        return res.redirect(`registration_sent?email=${email}`);
    }

    // If the user has confirmation requests but hasn't gone over the limit redirect to confirmation_resent.
    if (unverifiedUser.numberOfConfirmations >= 1 && unverifiedUser.numberOfConfirmations < defaultAppValues.numberOfEmailConfirmationsAllowed) {
        return res.redirect(`confirmation_resent?email=${email}`);
    }

    // For rendering.
    let emailSubject = emailVerificationEmailSubject(process.env.ORGANIZATION);
    let body = confirmationLimitReachedBody(email, emailSubject);

    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;

    let expirationTime = logic.getExpirationTime(defaultAppValues.unverifiedUserExpiration);

    res.render('confirmation_limit_reached', { body, email, activeLink, loggedIn, emailSubject, expirationTime });
});

exports.confirmationResent = wrapAsync(async function(req, res, next) {

    let email = req.query.email || '';

    // If the email matches an unverified user grab it.
    let unverifiedUser = await UnverifiedUser.findOne({ email: email });

    // If the hash is wrong or not present redirect to the home page.
    if (email === '' || unverifiedUser === null) {
        return res.redirect('/');
    }

    // If for some reason the user has never been to the registration sent page redirect them to that.
    if (unverifiedUser.numberOfConfirmations === 0) {
        return res.redirect(`registration_sent?email=${email}`);
    }
    
    // If the user has exceeded the maximum number of confirmations redirect them to the confirmation limit reached page.
    if (unverifiedUser.numberOfConfirmations >= defaultAppValues.numberOfEmailConfirmationsAllowed) {
        return res.redirect(`/confirmation_limit_reached?email=${email}`);
    }

    let emailSubject = emailVerificationEmailSubject(process.env.ORGANIZATION);

    // If an unverified user exists update the db and send the email.
    if(unverifiedUser) {

        var { confirmationHash } = unverifiedUser;

        await UnverifiedUser.updateOne({ email: email }, { numberOfConfirmations: unverifiedUser.numberOfConfirmations += 1 });
        
        var emailBody = emailVerificationEmailBody(process.env.WEBSITE, process.env.ORGANIZATION, process.env.HOST, confirmationHash);

        logic.sendEmail(email, emailSubject, emailBody);
    } 

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;

    let body = confirmationResentBody(email, emailSubject);

    res.render('confirmation_resent', { email, emailSubject, activeLink, loggedIn, body });
});

exports.dashboard = wrapAsync(async function(req, res, next) {

    // For rendering.
    let activeLink = 'dashboard';
    let loggedIn = req.session.userValues ? true : false;
    let { email, firstName, lastName, phone, password } = req.session.userValues;
    let accountChangeMessage = res.locals.changeResult[0] || undefined;

    res.render('dashboard', { activeLink, loggedIn, email, firstName, lastName, phone, password, accountChangeMessage });
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
        var inputFields = logic.makeFieldsEmpty(changeYourNameFields);
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
        var inputFields = logic.makeFieldsEmpty(changeYourNameFields);
    }

    // For rendering.
    let activeLink = 'login';
    let loggedIn = req.session.userValues ? true : false;
    let emailAttributes  = defaultAppValues.emailField;
    let passwordAttributes = defaultAppValues.passwordField.attributes();

    res.render('login', { userInput: inputFields, activeLink, loggedIn, emailAttributes, passwordAttributes, emailError, passwordError });
});

exports.loginFailureLimitReached = wrapAsync(async function(req, res, next) {

    let email = req.query.email || '';

    // If the hash matches an unverified user grab it.
    let loginFailure = await LoginFailure.findOne({ email: email });

    // If the hash is wrong or not present redirect to the home page.
    if (email === '' || loginFailure === null) {
        return res.redirect('/');
    }

    let activeLink = null;
    let loggedIn = false;

    let expirationTime = logic.getExpirationTime(defaultAppValues.loginFailureExpiration);

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

exports.passwordReset = wrapAsync(async function(req, res, next) {

    // Once the client reaches this point these keys are no longer needed.
    delete req.session.email;
    delete req.session.passwordResetRequestSent;

    // Check to see if hash is legitimate.
    let hash = req.query.hash || '';
    let passwordResetRequest = await PasswordResetRequest.findOne({ confirmationHash: hash });

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
        var inputFields = logic.makeFieldsEmpty(passwordResetFields);
    }

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;

    if (passwordResetRequest) {
        let passwordAttributes = defaultAppValues.passwordField.attributes(passwordErrorType);
        let passwordConfirmAttributes = defaultAppValues.passwordField.attributes(passwordConfirmErrorType);
        res.render('password_reset', { userInput: inputFields, hash, activeLink, loggedIn, passwordErrorMessage, passwordConfirmErrorMessage, passwordAttributes, passwordConfirmAttributes });
    } else {

        res.status(404).render('page_not_found', { activeLink, loggedIn });
    }
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
        var inputFields = logic.makeFieldsEmpty(passwordResetRequestFields);
    }

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;
    let emailAttributes = defaultAppValues.emailField;

    res.render('password_reset_request', { userInput: inputFields, activeLink, loggedIn, emailAttributes, emailError });
});

exports.passwordResetRequestSent = wrapAsync(async function(req, res, next) {

    let { email } = req.session;

    // Whether the user exists or not create the password reset request.  The upper limit on requests will stop spammers from repeatedly requesting a reset for a non user.
    let retrievedPasswordResetRequest = await PasswordResetRequest.findOne({ email: email });
    let retrievedUser = await User.findOne({ email: email });

    let confirmationHash = retrievedPasswordResetRequest ? retrievedPasswordResetRequest.confirmationHash : null;
    
    if(retrievedPasswordResetRequest) {

        await PasswordResetRequest.updateOne({ email: email }, { numberOfRequests: retrievedPasswordResetRequest.numberOfRequests += 1 });
    } else {

        let salt = cryptoRandomString({ length: 16 });
        confirmationHash = objectHash(email + salt);
        let passwordResetRequest = logic.createPasswordResetRequest(email, firstName, confirmationHash);
        await passwordResetRequest.save();
    }

    // emailSubject must be created prior to checking for retrievedUsed because it is always used in res.render.
    let emailSubject = passwordResetRequestEmailSubject(process.env.ORGANIZATION);

    let expirationTime = logic.getExpirationTime(defaultAppValues.passwordResetRequestExpiration);

    // If User exists create and send the email
    if(retrievedUser) {

        let emailBody = passwordResetRequestEmailBody(process.env.WEBSITE, process.env.ORGANIZATION, process.env.HOST, confirmationHash, expirationTime);
        logic.sendEmail(email, emailSubject, emailBody);
    }

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;
    
    res.render('password_reset_request_sent', { activeLink, loggedIn, email, emailSubject, expirationTime });
});

exports.passwordResetLimitReached = wrapAsync(async function(req, res, next) {

    let { email } = req.session;

    // These keys are no longer needed.
    delete req.session.email;
    delete req.session.passwordResetRequestSent;

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;
    let emailSubject = emailVerificationEmailSubject(process.env.ORGANIZATION);

    let expirationTime = logic.getExpirationTime(defaultAppValues.passwordResetRequestExpiration);

    res.render('password_reset_limit_reached', { email, activeLink, loggedIn, emailSubject, expirationTime });
});

exports.passwordResetSuccess = wrapAsync(async function(req, res, next) {

    // These key was created in postPasswordReset.
    // It is no longer needed after success.
    delete req.session.passwordResetSuccess;

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;

    res.render('password_reset_success', { activeLink, loggedIn });
});


exports.postChangeEmail = wrapAsync(async function(req, res, next) {

    // Sanitize and process input.
    let cleanedFields = logic.cleanFields(changeEmailFields, req.body);
    let { newEmail, emailConfirm, password } = cleanedFields;

    // Check for a change.  If nothing changed redirect to dashboard.
    let didEmailChange = req.session.userValues.email === newEmail ? false : true;

    if (didEmailChange === false) {
        req.flash('changeResult', changeNone);
        return res.redirect('/dashboard');
    }

    let areAllFieldsFilled = logic.checkAllFieldsFilled(changeEmailFields, cleanedFields);
    let isEmailTooLong = logic.checkIfInputTooLong(newEmail, defaultAppValues.emailField.maxLength);
    let isEmailValid = validator.validate(newEmail);
    let doEmailsMatch = newEmail === emailConfirm ? true : false;    
    let isPasswordCorrect = await bcrypt.compare(password, req.session.userValues.password);
    let doesUnverifiedUserAlreadyExist = await UnverifiedUser.exists( { email: newEmail } );
    let userDBSearch = await User.exists({ email: newEmail });
    let doesUserAlreadyExist = userDBSearch === true && didEmailChange === true ? true : false;

    if (
        areAllFieldsFilled === true &&
        doEmailsMatch === true &&
        doesUserAlreadyExist === false &&
        doesUnverifiedUserAlreadyExist === false &&
        isEmailTooLong === false &&
        isEmailValid === true &&
        isPasswordCorrect === true
    ) {
        await User.updateOne({ email: req.session.userValues.email }, { email: newEmail });
        req.session.userValues.email = newEmail;
        req.flash('changeResult', changeSuccessful);
        return res.redirect('/dashboard');
    } else {

        // Create and redirect the errors to changeEmail where they will be rendered and deleted.
        let whyEmailUsed = 'change';
        let newEmailError = logic.getNewEmailError(newEmail, whyEmailUsed, isEmailTooLong, isEmailValid, doesUserAlreadyExist, doesUnverifiedUserAlreadyExist);
        let emailConfirmationError = logic.getEmailConfirmationError(emailConfirm, doEmailsMatch);
        let passwordError = logic.getSaveEmailPasswordError(password, isPasswordCorrect);

        // If there is an email error blank out emailConfirm field.  After any error always blank out password field.
        if (newEmailError) cleanedFields.emailConfirm = '';
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
    let cleanedFields = logic.cleanFields(changePasswordFields, req.body);
    let { passwordCurrent, password, passwordConfirm } = cleanedFields;

    let isCurrentPasswordCorrect = await bcrypt.compare(passwordCurrent, req.session.userValues.password);
    let isPasswordNewFilled = password === '' ? false : true;
    let isPasswordConfirmFilled = passwordConfirm === '' ? false : true;
    let isPasswordTooLong = logic.checkIfInputTooLong(password, defaultAppValues.passwordField.maxLength);
    let doesPasswordMeetRequirements = logic.checkPasswordMeetsRequirements(password);
    let doPasswordsMatch = password === passwordConfirm ? true : false;
    
    if (
        isCurrentPasswordCorrect === true &&
        isPasswordNewFilled === true &&
        isPasswordConfirmFilled === true &&
        isPasswordTooLong === false &&
        doesPasswordMeetRequirements === true &&
        doPasswordsMatch === true 
    ) {

        // If any of these are stored in the db delete them.
        await LoginFailure.findOneAndRemove({ email: email });
        await PasswordResetRequest.findOneAndRemove({ email: email });

        let passwordHashed = await logic.hashPassword(password);
        await User.updateOne({ email: req.session.userValues.email }, { password: passwordHashed });
        req.session.userValues.password = passwordHashed;
        req.flash('changeResult', changeSuccessful);
        return res.redirect('/dashboard');
    } else {
        
        // Create and redirect the errors to changePassword where they will be rendered and deleted.
        let whyPasswordUsed = 'changePassword';
        let passwordCurrentError = logic.getPasswordError(whyPasswordUsed, passwordCurrent, isCurrentPasswordCorrect);
        let passwordError = logic.getNewPasswordError(whyPasswordUsed, password, isPasswordTooLong, doesPasswordMeetRequirements);
        let passwordConfirmError = logic.getPasswordConfirmError(whyPasswordUsed, passwordError, passwordConfirm, doPasswordsMatch);
        
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

exports.postChangePhone = wrapAsync(async function(req, res, next) {

    // Sanitize and process input.
    let cleanedFields = logic.cleanFields(changePhoneFields, req.body);
    let { phone } = cleanedFields;

    // formatPhone strips out all characters that aren't numbers.
    // If phone is empty after formatPhone set it to userValues.phone.
    let phoneFormatted = logic.formatPhone(phone);

    // Check for a change.  If nothing changed redirect to dashboard.
    let didPhoneChange = req.session.userValues.phone === phoneFormatted ? false : true;

    if (didPhoneChange === false) {
        req.flash('changeResult', changeNone);
        return res.redirect('/dashboard');
    }

    let isPhoneFilled = phone === '' ? false : true;
    let isPhoneValid = logic.checkPhoneValid(phoneFormatted);

    if (
        isPhoneFilled === true &&
        isPhoneValid === true
    ) {
        await User.updateOne({ email: req.session.userValues.email }, { phone: phoneFormatted });

        req.session.userValues.phone = phoneFormatted;
        req.flash('changeResult', changeSuccessful);
        return res.redirect('/dashboard');

    } else {
        
        // Create and redirect the errors to changePhone where they will be rendered and deleted.
        let phoneError = logic.getSavePhoneError(phone, isPhoneValid);

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.phoneError = phoneError;

        return res.redirect('/change_phone');
    }
});

exports.postChangeYourName = wrapAsync(async function(req, res, next) {

    // Sanitize and process input.
    let cleanedFields = logic.cleanFields(changeYourNameFields, req.body);
    let { firstName, lastName } = cleanedFields;

    // If a name is empty after formatting set it to userValues.
    firstName = logic.formatName(firstName) || req.session.userValues.firstName;
    lastName = logic.formatName(lastName) || req.session.userValues.lastName;

    // If nothing changed redirect to dashboard.
    let didNamesChange =
        firstName === req.session.userValues.firstName &&
        lastName === req.session.userValues.lastName
        ? false : true;

    if (didNamesChange === false) {
        req.flash('changeResult', changeNone);
        return res.redirect('/dashboard');
    }

    let isFirstNameTooLong = logic.checkIfInputTooLong(firstName, defaultAppValues.yourNameField.maxLength);
    let isLastNameTooLong = logic.checkIfInputTooLong(lastName, defaultAppValues.yourNameField.maxLength);
    let isFirstNameValidCharacters = /^[a-zA-Z' ]+$/.test(firstName);
    let isLastNameValidCharacters = /^[a-zA-Z' ]+$/.test(lastName);
    let isFirstNameProfane = filter.isProfane(firstName);
    let isLastNameProfane = filter.isProfane(lastName);

    if (
        isFirstNameTooLong === false &&
        isLastNameTooLong === false &&
        isFirstNameProfane === false &&
        isLastNameProfane === false &&
        isFirstNameValidCharacters === true &&
        isLastNameValidCharacters === true
    ) {
        await User.updateOne({ email : req.session.userValues.email }, { firstName: firstName, lastName: lastName });

        req.session.userValues.firstName = firstName;
        req.session.userValues.lastName = lastName;
        req.flash('changeResult', changeSuccessful);
        return res.redirect('/dashboard');
    } else {

        // Create and redirect the errors to changeYourName where they will be rendered and deleted.
        let firstNameError = logic.getSaveNameError(isFirstNameTooLong, isFirstNameValidCharacters, isFirstNameProfane);
        let lastNameError = logic.getSaveNameError(isLastNameTooLong, isLastNameValidCharacters, isLastNameProfane);

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.firstNameError = firstNameError;
        req.session.transfer.lastNameError = lastNameError;

        return res.redirect('/change_your_name');
    }
});

exports.postDeleteYourAccount = wrapAsync(async function(req, res, next) {

    // Sanitize and process input.
    let cleanedFields = logic.cleanFields(deleteYourAccountFields, req.body);
    let { password } = cleanedFields;

    let email = req.session.userValues.email || '';
    let dbPassword = req.session.userValues.password || '';

    let isPasswordCorrect = await bcrypt.compare(password, dbPassword);
    
    if(isPasswordCorrect) {

        await User.findOneAndRemove({ email: email });

        // Check for and remove any login failures in the db.
        await logic.removeLoginFailures(email, req.session);

        req.session.accountDeleted = true;
        return res.redirect('/account_deleted');
    }

    // Create and redirect the error to deleteYourAccount where it will be rendered and deleted.
    let whyPasswordUsed = 'delete account';
    let deleteAccountError = logic.getPasswordError(whyPasswordUsed, password, isPasswordCorrect);

    req.session.transfer = {};
    req.session.transfer.deleteAccountError = deleteAccountError;

    return res.redirect('/delete_your_account');
});

exports.postLogin = wrapAsync(async function(req, res, next) {

    // Sanitize and process input.
    let cleanedFields = logic.cleanFields(loginFields, req.body);
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
            loginFailure = logic.createLoginFailure(email);
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
        let emailError = logic.getLoginEmailError(email, isEmailValid);
        let whyPasswordUsed = 'login';
        let passwordError = logic.getPasswordError(whyPasswordUsed, password, isPasswordCorrect);

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.emailError = emailError;
        req.session.transfer.passwordError = passwordError;

        return res.redirect('/login');
    }
});

exports.postPasswordReset = wrapAsync(async function(req, res, next) {

    // Sanitize and process input.
    let cleanedFields = logic.cleanFields(passwordResetFields, req.body);
    let { password, passwordConfirm } = cleanedFields;
    let hash = req.query.hash || '';

    let areAllFieldsFilled = logic.checkAllFieldsFilled(passwordResetFields, cleanedFields);
    let isPasswordTooLong = logic.checkIfInputTooLong(password, defaultAppValues.passwordField.maxLength);
    let doesPasswordMeetRequirements = logic.checkPasswordMeetsRequirements(password);
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

            // Check for and remove any login failures in the db.
            await logic.removeLoginFailures(email, req.session);

            // This key allows entry to password reset success.
            // It is deleted in password reset success.
            req.session.passwordResetSuccess = true;

            let retrievedUser = await User.findOne({ email: email });
            let { firstName } = retrievedUser;

            req.flash('firstName', firstName);
            return res.redirect('/password_reset_success');
        } else {

            // Create and send the error to passwordReset where it will be used and deleted.
            let whyPasswordUsed = 'passwordChange';
            let passwordError = logic.getNewPasswordError(whyPasswordUsed, password, isPasswordTooLong, doesPasswordMeetRequirements);
            let passwordConfirmError = logic.getPasswordConfirmError(whyPasswordUsed, passwordError, passwordConfirm, doPasswordsMatch);

            req.session.transfer = {};
            req.session.transfer.cleanedFields = cleanedFields;
            req.session.transfer.passwordError = passwordError;
            req.session.transfer.passwordConfirmError = passwordConfirmError;

            return res.redirect(`/password_reset?hash=${ hash }`);
        }
});

exports.postPasswordResetRequest = wrapAsync(async function(req, res, next) {

    // Sanitize and process input.
    let cleanedFields = logic.cleanFields(passwordResetRequestFields, req.body);
    let { email } = cleanedFields;

    let isEmailValid = validator.validate(email);
    let isEmailTooLong = logic.checkIfInputTooLong(email, defaultAppValues.emailField.maxLength)

    if (
        email === '' ||
        isEmailValid === false ||
        isEmailTooLong === true
        ) {

        // Create and send the error to passwordResetRequest where it will be used and deleted.
        let emailError = logic.getEmailError(email, isEmailValid, isEmailTooLong);

        req.session.transfer = {};
        req.session.transfer.cleanedFields = cleanedFields;
        req.session.transfer.emailError = emailError;

        return res.redirect('/password_reset_request');
    } 

    // This key is deleted in passwordResetSuccess and verified.
    req.session.email = email;

    let unverifiedUser = await UnverifiedUser.findOne({ email: email });

    // If client attempts to reset password of an unverified account make him verify first.
    if (unverifiedUser) {

        // This key allows entry to confirmationResent and tells that route to use an alternate headline and body.  It is deleted in confirmationResent.
        req.session.unverifiedPasswordResetAttempt = true;

        return res.redirect('/confirmation_resent');
    }

    // If the email passes the checks and no unverified user exists send the client to passwordResetRequestSent.

    // This key allows entry to passwordResetRequestSent.
    // It is deleted in passwordLimitReached and passwordReset.
    req.session.passwordResetRequestSent = true;

    // Whether or not the user exists notify client that the request for that email was received.  That way hackers won't know if an email exists in the db.  
    return res.redirect('/password_reset_request_sent');
});

exports.postRegister = wrapAsync(async function(req, res, next) {

    // Sanitize and process input.
    let cleanedFields = logic.cleanFields(registerFields, req.body);
    let { email, password, passwordConfirm, termsOfUse } = cleanedFields;
    
    let areAllFieldsFilled = logic.checkAllFieldsFilled(registerFields, cleanedFields);
    let isEmailValid = validator.validate(email);
    let isEmailTooLong = logic.checkIfInputTooLong(email, defaultAppValues.emailField.maxLength);

    let doesUnverifiedUserAlreadyExist = await UnverifiedUser.exists({ email: email });
    let doesUserAlreadyExist = await User.exists({ email: email });

    let doesPasswordMeetRequirements = logic.checkPasswordMeetsRequirements(password);
    let doPasswordsMatch = password === passwordConfirm ? true : false;
    let isPasswordTooLong = logic.checkIfInputTooLong(password, defaultAppValues.passwordField.maxLength);

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

            var unverifiedUser = logic.createUnverifiedUser(email);
            let salt = cryptoRandomString({ length: 10 });
            unverifiedUser.confirmationHash = objectHash(email + salt);
            unverifiedUser.password = await logic.hashPassword(password);
            await unverifiedUser.save();
        }

        let emailSubject = emailVerificationEmailSubject(process.env.ORGANIZATION);
        let htmlMessage = emailVerificationEmailBody(process.env.WEBSITE, process.env.ORGANIZATION, process.env.HOST, unverifiedUser.confirmationHash);
        logic.sendEmail(email, emailSubject, htmlMessage);

        return res.redirect(`/registration_sent?email=${email}`);

    } else {

        // Create and send the errors to register where they will be used and deleted.
        let whyEmailUsed = 'register';
        let emailError = logic.getNewEmailError(email, whyEmailUsed, isEmailTooLong, isEmailValid, doesUserAlreadyExist);
        let whyPasswordUsed = 'register';
        let passwordError = logic.getNewPasswordError(whyPasswordUsed, password, isPasswordTooLong, doesPasswordMeetRequirements);
        let passwordConfirmError = logic.getPasswordConfirmError(whyPasswordUsed, passwordError, passwordConfirm, doPasswordsMatch);
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

exports.postRequestAnotherConfirmation = wrapAsync(async function(req, res, next) {

    // Sanitize and process input.
    let cleanedFields = logic.cleanFields(requestAnotherConfirmationFields, req.body);
    let { email } = cleanedFields;

    let isEmailTooLong = logic.checkIfInputTooLong(email, defaultAppValues.emailField.maxLength);
    let isEmailValid = validator.validate(email);
    let emailPassesBasicTests = !isEmailTooLong && isEmailValid ? true : false;

    let unverifiedUser = await UnverifiedUser.findOne({ email: email });
    
    // If an unverified user exists or if the email entered didn't contain an error redirect.
    // If an unverified user doesn't exist no email will be sent after redirect but client won't be notified of this in case they are hacking.
    if(unverifiedUser || emailPassesBasicTests) {

        let falseEmailConfirmationRequest = await FalseEmailConfirmationRequest.findOne({ email: email });
        // If an unverified user and fake request doesn't already exist create a fake request.
        // Let the fake request go through even if it is for the email of a verified user.  If the potential hacker doesn't get a warning he can't use it to fish.
        // This is used to stop an endless stream of fake requests for an email address.
        // It is incremented in confirmationResent as requests are made.
        if(!unverifiedUser && !falseEmailConfirmationRequest) {
            falseEmailConfirmationRequest = logic.createFalseEmailConfirmationRequest(email);
            await falseEmailConfirmationRequest.save();
        }

        // This key is used in confirmationResent to look up the unverifiedUser with Mongoose.
        // It is deleted in verified after the account is verified.
        req.session.email = email;

        // This key allows entry to the confirmationResent route.
        // It is removed in the verified route.
        req.session.confirmationRequestAllowed = true;

        return res.redirect('/confirmation_resent');
    }

    // Create and send the errors to requestAnotherConfirmation where they will be used and deleted.

    let emailError = logic.getEmailError(email, isEmailValid, isEmailTooLong);

    req.session.transfer = {};
    req.session.transfer.cleanedFields = cleanedFields;
    req.session.transfer.emailError = emailError;    

    return res.redirect('request_another_confirmation');
});

// If the user is logged in redirect to the dashboard.
exports.redirectDashboard = wrapAsync(async function(req, res, next) {

    if (req.session.userValues) {

        return res.redirect('/dashboard');
    }

    return next();
});

exports.redirectIfNoAccountDeleted = wrapAsync(async function(req, res, next) {

    if(!req.session.accountDeleted) {

        return res.redirect('/');
    }
    
    return next();
});

exports.redirectIfNoConfirmationRequestAllowed = wrapAsync(async function(req, res, next) {

    if(!req.session.confirmationRequestAllowed && !req.session.unverifiedPasswordResetAttempt) {

        return res.redirect('/');
    }

    return next();
});

exports.redirectIfNoPasswordResetRequestSent = wrapAsync(async function(req, res, next) {

    if(!req.session.passwordResetRequestSent) {

        return res.redirect('/');
    }

    return next();
});

exports.redirectIfNoPasswordResetSuccess = wrapAsync(async function(req, res, next) {

    if(!req.session.passwordResetSuccess) {

        return res.redirect('/');
    }

    return next();
});

exports.redirectIfNoTooManyConfirmations = wrapAsync(async function(req, res, next) {

    if(!req.session.tooManyConfirmations) {

        return res.redirect('/');
    }
    
    return next();
});

exports.redirectIfNoTooManyLoginFailures = wrapAsync(async function(req, res, next) {

    if(!req.session.tooManyLoginFailures) {

        return res.redirect('/');
    }
    
    return next();
});

exports.redirectIfPasswordResetLimitNotReached = wrapAsync(async function(req, res, next) {

    let { email } = req.session;

    if(email) {

        let passwordResetRequest = await PasswordResetRequest.findOne({ email: email });

        let numberOfRequests = passwordResetRequest ? passwordResetRequest.numberOfRequests : null;

        if (numberOfRequests >= defaultAppValues.numberOfPasswordResetRequestsAllowed) {
            return next();
        }
    }

    return res.redirect('/');
});

exports.redirectIfTooManyConfirmations = wrapAsync(async function(req, res, next) {

    if (req.session.email) {

        let falseEmailConfirmationRequest = await FalseEmailConfirmationRequest.findOne({ email: req.session.email });
        let unverifiedUser = await UnverifiedUser.findOne({ email: req.session.email });
        
        let numberOfConfirmations;

        if (falseEmailConfirmationRequest) {
            numberOfConfirmations = falseEmailConfirmationRequest.numberOfConfirmations || null;
        } else if (unverifiedUser) {
            numberOfConfirmations = unverifiedUser.numberOfConfirmations || null;
        }

        if (numberOfConfirmations >= defaultAppValues.numberOfEmailConfirmationsAllowed) {
            req.session.tooManyConfirmations = true;
            return res.redirect('/confirmation_limit_reached');
        }

        return next();
    } 

    return res.redirect('/');
});

exports.redirectIfTooManyLoginFailures = wrapAsync(async function(req, res, next) {

    if (req.body.email) {

        let loginFailure = await LoginFailure.findOne({ email: req.body.email });
        let numberOfFailures = loginFailure ? loginFailure.numberOfFailures : null;

        if(numberOfFailures >= defaultAppValues.numberOfLoginFailuresAllowed) {
            req.session.tooManyLoginFailures = true;
            return res.redirect('/login_failure_limit_reached'); 
        }
    }

    return next();    
});

exports.redirectIfTooManyPasswordResets = wrapAsync(async function(req, res, next) {

    let { email } = req.session;

    if(email) {

        let passwordResetRequest = await PasswordResetRequest.findOne({ email: email });

        let numberOfRequests = passwordResetRequest ? passwordResetRequest.numberOfRequests : null;

        if (numberOfRequests >= defaultAppValues.numberOfPasswordResetRequestsAllowed) {
            return res.redirect('/password_reset_limit_reached');
        }

        return next();
    } 

    return res.redirect('/');
});

exports.redirectLogin = wrapAsync(async function(req, res, next) {

    if (!req.session.userValues) {

        return res.redirect('/login');
    }
    
    return next();
});

exports.redirectNoSuccessProperty = wrapAsync(async function(req, res, next) {

    if (!req.session.registerSuccessful) {

        return res.redirect('/');
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
        var inputFields = logic.makeFieldsEmpty(registerFields);
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

    let email = req.query.email || '';

    // If the hash matches an unverified user grab it.
    let unverifiedUser = await UnverifiedUser.findOne({ email: email });

    // If the hash is wrong or not present redirect to the home page.
    if (email === '' || unverifiedUser === null) {
        return res.redirect('/');
    }

    await UnverifiedUser.updateOne({ email: email }, { numberOfConfirmations: unverifiedUser.numberOfConfirmations += 1 });

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;
    let emailSubject = emailVerificationEmailSubject(process.env.ORGANIZATION);

    res.render('registration_sent', { activeLink, loggedIn, email, emailSubject });
});

exports.requestAnotherConfirmation = wrapAsync(async function(req, res, next) {

    // If there is data available from previous postRegister gather it from req.session and then delete it.
    if (req.session.transfer) {

        var { cleanedFields, emailError } = req.session.transfer;
        delete req.session.transfer;

        // Set object to previous form input.
        var inputFields = cleanedFields;

    } else {
        // If req.session data isn't used set every property to an empty string.
        var inputFields = logic.makeFieldsEmpty(requestAnotherConfirmationFields);
    }

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;
    let emailAttributes = defaultAppValues.emailField;
    let { emailField } = defaultAppValues;


    res.render('request_another_confirmation', { userInput: inputFields, loggedIn, emailAttributes, activeLink, emailField, emailError });
});

exports.verified = wrapAsync(async function(req, res, next) {

    let hash = req.query.hash || '';

    // If the hash matches an unverified user grab it.
    let unverifiedUser = await UnverifiedUser.findOne({ confirmationHash: hash });

    // If the hash is wrong or not present redirect to the home page.
    if (hash === '' || unverifiedUser === null) {
        return res.redirect('/');
    }

    let { email } = unverifiedUser;

    // Create the verified user from the unverifiedUser.
    let newUser = logic.createUser(unverifiedUser);
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