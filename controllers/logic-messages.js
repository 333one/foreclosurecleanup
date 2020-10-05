"use strict";

const path = require('path');

const defaultAppValues = require('../models/default-app-values.js');
const defaultMessages = require('../models/default-messages');

// Custom path to .env file.
require('dotenv').config({ path: path.join(__dirname, '../models/.env') });

exports.getCompanyCityError = function(isCompanyCityFilled, isCompanyCityTooLong, isCompanyCityTooShort, isCompanyCityValidCharacters) {

    if (isCompanyCityFilled === false) return 'Please enter the city where your company is located.';
    if (isCompanyCityTooLong === true) return defaultMessages.fieldTooLong('company\'s city', defaultAppValues.companyCityField.maxLength);
    if (isCompanyCityTooShort === true) return defaultMessages.fieldTooShort('company\'s city', defaultAppValues.companyCityField.minLength);
    if (isCompanyCityValidCharacters === false) return 'Please only use valid characters from A - Z.';
}

exports.getCompanyDescriptionError = function(isCompanyDescriptionFilled, isCompanyDescriptionTooLong, isCompanyDescriptionTooShort, isCompanyDescriptionProfane, isCompanyDescriptionValidCharacters) {

    if (isCompanyDescriptionFilled === false) return 'Please enter your company\'s name.';
    if (isCompanyDescriptionTooLong === true) return defaultMessages.fieldTooLong('company\'s description', defaultAppValues.companyDescriptionField.maxLength);
    if (isCompanyDescriptionTooShort === true) return defaultMessages.fieldTooShort('company\'s description', defaultAppValues.companyDescriptionField.minLength);
    if (isCompanyDescriptionProfane === true) return 'Please do not use profanity in your company\'s description.';
    if (isCompanyDescriptionValidCharacters === false) return validCharacterMessage(defaultAppValues.messageCompanyDescriptionPattern); 
}

exports.getCompanyNameError = function(isCompanyNameFilled, isCompanyNameTooLong, isCompanyNameTooShort, isCompanyNameProfane, isCompanyNameValidCharacters, doesCompanyNameContainCharacterOrNumber) {

    if (isCompanyNameFilled === false) return 'Please enter your company\'s name.';
    if (isCompanyNameTooLong === true) return defaultMessages.fieldTooLong('company\'s name', defaultAppValues.companyNameField.maxLength);
    if (isCompanyNameTooShort === true) return defaultMessages.fieldTooShort('company\'s name', defaultAppValues.companyNameField.minLength);
    if (isCompanyNameProfane === true) return 'Please enter a valid name.';
    if (doesCompanyNameContainCharacterOrNumber === false) return 'Your company\'s name must include at least 1 letter or number.';
    if (isCompanyNameValidCharacters === false) return validCharacterMessage(defaultAppValues.messageCompanyNamePattern); 
}

exports.getCompanyPhoneError = function(isCompanyPhoneFilled, isCompanyPhoneValid) {

    if (isCompanyPhoneFilled === false) return 'Please enter your company\'s phone number.';
    if (isCompanyPhoneValid === false) return 'Please enter a valid phone number.';
}

exports.getCompanyServicesError = function(isCompanyServicesFilled) {

    if (isCompanyServicesFilled === false) return 'Please enter the services that your company offers.';
}

exports.getCompanyStateError = function(isCompanyStateFilled, isCompanyStateValid) {

    if (isCompanyStateFilled === false) return 'Please enter the state where your company is located.';
    if (isCompanyStateValid === false) return 'Please enter a valid state.';
}

exports.getCompanyStreetError = function(isCompanyStreetFilled, isCompanyStreetTooLong, isCompanyStreetTooShort, isCompanyStreetValidCharacters, isCompanyRegionFilled, uspsNormalizationError) {

    if (isCompanyStreetFilled === false) return 'Please enter the street address where your company is located.';
    if (isCompanyStreetTooLong === true) return defaultMessages.fieldTooLong('company\'s street address', defaultAppValues.companyStreetField.maxLength);
    if (isCompanyStreetTooShort === true) return defaultMessages.fieldTooShort('company\'s street address', defaultAppValues.companyStreetField.minLength);
    if (isCompanyStreetValidCharacters === false) return 'Please only use valid characters from A - Z, 0 - 9, \', and - .';
    if (isCompanyRegionFilled === false) return undefined;
    if (uspsNormalizationError) return 'We are sorry but this address was not found in the US Postal Service database.  Please check your address and try again.';
}

exports.getCompanyStreetTwoError = function(isCompanyStreetTwoFilled, isCompanyStreetTwoTooLong, isCompanyStreetTwoTooShort, isCompanyStreetTwoValidCharacters) {

    if (isCompanyStreetTwoFilled === false) return undefined;
    if (isCompanyStreetTwoTooLong === true) return defaultMessages.fieldTooLong('company\'s street address', defaultAppValues.companyStreetField.maxLength);
    if (isCompanyStreetTwoTooShort === true) return defaultMessages.fieldTooShort('company\'s street address', defaultAppValues.companyStreetField.minLength);
    if (isCompanyStreetTwoValidCharacters === false) return 'Please only use valid characters from A - Z, 0 - 9, #, \', and - .';
}

exports.getCompanyWebsiteError = function(isCompanyWebsiteFilled, isCompanyWebsiteTooLong, isCompanyWebsiteValid, isCompanyWebsiteValidCharacters) {

    if (isCompanyWebsiteFilled === false) return 'Please enter your company\'s website or social media page.';
    if (isCompanyWebsiteTooLong === true) return defaultMessages.fieldTooLong('company\'s website', defaultAppValues.companyWebsiteField.maxLength);
    if (isCompanyWebsiteValid === false) return 'Please enter a valid website address.';
    if (isCompanyWebsiteValidCharacters === false) return 'Please enter a valid website address.';
    if (isCompanyWebsiteValidCharacters === false) return `${ validCharacterMessage(defaultAppValues.messageCompanyWebsitePattern) }.  If you need to use a character outside these please <a href="${ process.env.CONTACT_EMAIL }">contact us</a> and we will see if that is possible`; 
}

exports.getCompanyZipError = function(isCompanyZipFilled, isCompanyZipFiveDigits, isCompanyZipValidCharacters) {

    if (isCompanyZipFilled === false) return 'Please enter the zip code where your company is located.';
    if (isCompanyZipFiveDigits === false) return 'Please enter a 5 digit zip code.';
    if (isCompanyZipValidCharacters === false) return 'Please only use valid characters from 0 - 9.';
}

exports.getDeleteAccountError = function(password, isPasswordCorrect) {

    if (password === '') return defaultMessages.existingPasswordEmpty;
    if (isPasswordCorrect === false) return 'The password you entered was incorrect.  Please try again.';
}

exports.getEmailError = function(email, isEmailValid, isEmailTooLong, doesUserAlreadyExist, doesUnverifiedUserAlreadyExist) {
    
    if (email === '') return 'Please enter your email address.';
    if (isEmailTooLong === true) return defaultMessages.fieldTooLong('email address', defaultAppValues.emailField.maxLength);
    if (isEmailValid === false) return defaultMessages.emailNotValid;
    if (doesUnverifiedUserAlreadyExist === true ||  doesUserAlreadyExist === true) return defaultMessages.emailAlreadyInUse;
}

exports.getEmailConfirmationError = function(emailReenter, doEmailsMatch) {

    if (emailReenter === '') return 'Please confirm your new your email.';
    if (doEmailsMatch === false) return 'Email confirmation did not match.  Please re-enter your new email address.';
}

exports.getExpirationTime = function(expiration) {

    let minutes = expiration / 60;
    let hours = minutes / 60;
    let days = hours / 24;

    if (minutes === 1) return `${ minutes } minute`;
    if (minutes < 60) return `${ minutes } minutes`;
    if (minutes === 60) return `${ hours } hour`;
    if (minutes < 1440) return `${ hours } hours`;
    if (minutes === 1440) return `${ days } day`;
}

exports.getLoginEmailError = function(email, isEmailValid) {

    if (email === '') return defaultMessages.emailExistingEmpty;
    if (isEmailValid === false) return defaultMessages.emailNotValid;
}

exports.getLoginPasswordError = function(password, passwordCorrect, emailError) {

    if (password === '' && emailError === undefined) return defaultMessages.existingPasswordEmpty;
    if (passwordCorrect === false && emailError === undefined) return defaultMessages.existingPasswordIncorrect;
}

exports.getNewEmailError = function(email, whyEmailUsed, isEmailTooLong, isEmailValid, doesUserAlreadyExist, doesUnverifiedUserAlreadyExist, isEmailValidCharacters) {
    
    if (email === '') {
        if (whyEmailUsed === 'change') return 'Please enter your new email.';
        if (whyEmailUsed === 'register') return 'Please enter your email.';
    } 

    if (isEmailTooLong === true) return defaultMessages.fieldTooLong('email address', defaultAppValues.emailField.maxLength);
    if (isEmailValid === false) return defaultMessages.emailNotValid;
    if (doesUnverifiedUserAlreadyExist === true || doesUserAlreadyExist === true) return defaultMessages.emailAlreadyInUse;
    if (isEmailValidCharacters === false) return `${ validCharacterMessage(defaultAppValues.messageEmailPattern) }.  If you need to use a character outside these please <a href="${ process.env.CONTACT_EMAIL }">contact us</a> and we will see if that is possible`; ;
}

exports.getPasswordNewError = function(whyPasswordUsed, password, isPasswordTooLong, doesPasswordMeetRequirements, isPasswordValidCharacters) {

    let returnObject = {};

    if (password === '') {
        returnObject.errorType = 'empty';
        if (whyPasswordUsed === 'register') {
            returnObject.message = 'please enter your password.';
        } else {
            returnObject.message = 'please enter your new password.';
        }
        
        return returnObject;
    }

    if (isPasswordTooLong === true) {
        returnObject.errorType = 'tooLong';
        returnObject.message = defaultMessages.fieldTooLong('Password', defaultAppValues.passwordField.maxLength);
        return returnObject;
    } 

    if (doesPasswordMeetRequirements === false) {
        returnObject.errorType = 'weak';
        returnObject.message = 'Password was not strong enough, please try again.';
        return returnObject;
    }

    if (isPasswordValidCharacters === false) {
        returnObject.errorType = undefined;
        returnObject.message = patternPassword;
        return returnObject;
    } 
}

exports.getPasswordConfirmError = function(whyPasswordUsed, passwordError, passwordConfirm, doPasswordsMatch) {

    let returnObject = {};

    if (passwordConfirm === '' || passwordError) {
        returnObject.errorType = 'empty';
        returnObject.message = whyPasswordUsed === 'changePassword' ? 'Please confirm your new password.' : 'Please confirm your password.';
        return returnObject;
    }

    if (doPasswordsMatch === false) {
        returnObject.errorType = 'didNotMatch';
        returnObject.message = 'Password confirmation did not match.  Please try again.';
        return returnObject;
    }
}

exports.getPasswordError = function(whyPasswordUsed, password, isPasswordCorrect) {

    if (password === '') {
        if (whyPasswordUsed === 'changePassword') return 'Please enter your current password.';
        return 'Please enter your password.';
    }

    if (!isPasswordCorrect) {
        if (whyPasswordUsed === 'login') return 'That password/username combination was incorrect.';
        if (whyPasswordUsed === 'changePassword') return 'That did not match your current password.';
        if (whyPasswordUsed === 'deleteAccount') return 'Password incorrect.'
    }
}

exports.getPasswordErrors = function(password, isPasswordTooLong, passwordConfirm, doesPasswordMeetRequirements, doPasswordsMatch, nonPasswordError) {

    if (password === '') return 'Please enter and confirm your password.';
    if (isPasswordTooLong === true) return defaultMessages.fieldTooLong('password', defaultAppValues.passwordField.maxLength);
    if (doesPasswordMeetRequirements === false) return 'Password was not strong enough, please try again.';
    if (passwordConfirm === '') return 'Please enter and confirm your password.';
    if (doPasswordsMatch === false) return 'Password confirmation did not match.  Please try again.';
    if (nonPasswordError === true) return 'Please re-enter and confirm your password.';
}

exports.getPhoneError = function(phone, isPhoneValid) {

    if (phone === '') return 'Please enter your company\'s phone number.';
    if (isPhoneValid === false) return defaultMessages.phoneNotValid;
}

exports.getSaveEmailPasswordError = function(passwordCheck, isPasswordCorrect) {

    if (passwordCheck === '') return defaultMessages.existingPasswordEmpty;
    if (isPasswordCorrect === false) return 'The password you used was incorrect.  Please try again.';
}

exports.getSavePasswordError = function(passwordCurrent, isCurrentPasswordCorrect) {

    if (passwordCurrent === '') return defaultMessages.existingPasswordEmpty;
    if (isCurrentPasswordCorrect === false) return defaultMessages.existingPasswordIncorrect;
}

function validCharacterMessage(pattern) {
    return `Please only use valid characters from ${ pattern }.`;
}