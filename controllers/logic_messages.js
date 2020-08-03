"use strict";

const path = require('path');

const defaultAppValues = require('../models/default_app_values.js');
const defaultMessages = require('../models/default_messages');

// Custom path to .env file.
require('dotenv').config({ path: path.join(__dirname, '../models/.env') });

exports.getBusinessCityError = function(isBusinessCityFilled, isBusinessCityTooLong, isBusinessCityTooShort, isBusinessCityValidCharacters) {

    if (isBusinessCityFilled === false) return 'Please enter the city where your company is located.';
    if (isBusinessCityTooLong === true) return defaultMessages.fieldTooLong('company\'s city', defaultAppValues.businessCityField.maxLength);
    if (isBusinessCityTooShort === true) return defaultMessages.fieldTooShort('company\'s city', defaultAppValues.businessCityField.minLength);
    if (isBusinessCityValidCharacters === false) return 'Please only use valid characters from A - Z.';
}

exports.getBusinessNameError = function(isBusinessNameFilled, isBusinessNameTooLong, isBusinessNameTooShort, isBusinessNameProfane, isBusinessNameValidCharacters, doesBusinessNameContainCharacterOrNumber) {

    if (isBusinessNameFilled === false) return 'Please enter your company\'s name.';
    if (isBusinessNameTooLong === true) return defaultMessages.fieldTooLong('company\'s name', defaultAppValues.businessNameField.maxLength);
    if (isBusinessNameTooShort === true) return defaultMessages.fieldTooShort('company\'s name', defaultAppValues.businessNameField.minLength);
    if (isBusinessNameProfane === true) return 'Please enter a valid name.';
    if (isBusinessNameValidCharacters === false) return 'Please only use valid characters from A - Z, 0 - 9, \', and - .'; 
    if (doesBusinessNameContainCharacterOrNumber === false) return 'Your company\'s name must include at least 1 letter or number.';
}

exports.getBusinessPhoneError = function(isBusinessPhoneFilled, isBusinessPhoneValid) {

    if (isBusinessPhoneFilled === false) return 'Please enter your company\'s phone number.';
    if (isBusinessPhoneValid === false) return 'Please enter a valid phone number.';
}

exports.getBusinessServicesError = function(isBusinessServicesFilled) {

    if (isBusinessServicesFilled === false) return 'Please enter the services that your company offers.';
}

exports.getBusinessStateError = function(isBusinessStateFilled, isBusinessStateValid) {

    if(isBusinessStateFilled === false) return 'Please enter the state where your company is located.';
    if(isBusinessStateValid === false) return 'Please enter a valid state.';
}

exports.getBusinessStreetError = function(isBusinessStreetFilled, isBusinessStreetTooLong, isBusinessStreetTooShort, isBusinessStreetValidCharacters, isBusinessRegionFilled, uspsNormalizationError) {

    if(isBusinessStreetFilled === false) return 'Please enter the street address where your company is located.';
    if(isBusinessStreetTooLong === true) return defaultMessages.fieldTooLong('company\'s street address', defaultAppValues.businessStreetField.maxLength);
    if(isBusinessStreetTooShort === true) return defaultMessages.fieldTooShort('company\'s street address', defaultAppValues.businessStreetField.minLength);
    if(isBusinessStreetValidCharacters === false) return 'Please only use valid characters from A - Z, 0 - 9, \', and - .';
    if(isBusinessRegionFilled === false) return undefined;
    if(uspsNormalizationError) return 'We are sorry but this address was not found in the US Postal Service database.  Please check your address and try again.';
}

exports.getBusinessStreetTwoError = function(isBusinessStreetTwoFilled, isBusinessStreetTwoTooLong, isBusinessStreetTwoTooShort, isBusinessStreetTwoValidCharacters) {

    if(isBusinessStreetTwoFilled === false) return undefined;
    if(isBusinessStreetTwoTooLong === true) return defaultMessages.fieldTooLong('company\'s street address', defaultAppValues.businessStreetField.maxLength);
    if(isBusinessStreetTwoTooShort === true) return defaultMessages.fieldTooShort('company\'s street address', defaultAppValues.businessStreetField.minLength);
    if(isBusinessStreetTwoValidCharacters === false) return 'Please only use valid characters from A - Z, 0 - 9, #, \', and - .';
}

exports.getBusinessZipError = function(isBusinessZipFilled, isBusinessZipFiveDigits, isBusinessZipValidCharacters) {

    if(isBusinessZipFilled === false) return 'Please enter the zip code where your company is located.';
    if(isBusinessZipFiveDigits === false) return 'Please enter a 5 digit zip code.';
    if(isBusinessZipValidCharacters === false) return 'Please only use valid characters from 0 - 9.';
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

    if(minutes === 1) return `${ minutes } minute`;
    if(minutes < 60) return `${ minutes } minutes`;
    if(minutes === 60) return `${ hours } hour`;
    if(minutes < 1440) return `${ hours } hours`;
    if(minutes === 1440) return `${ days } day`;
}

exports.getLoginEmailError = function(email, isEmailValid) {

    if (email === '') return defaultMessages.emailExistingEmpty;
    if (isEmailValid === false) return defaultMessages.emailNotValid;
}

exports.getLoginPasswordError = function(password, passwordCorrect, emailError) {

    if (password === '' && emailError === undefined) return defaultMessages.existingPasswordEmpty;
    if (passwordCorrect === false && emailError === undefined) return defaultMessages.existingPasswordIncorrect;
}

exports.getNewEmailError = function(email, whyEmailUsed, isEmailTooLong, isEmailValid, doesUserAlreadyExist, doesUnverifiedUserAlreadyExist) {
    
    if (email === '') {
        if (whyEmailUsed === 'change') return 'Please enter your new email.';
        if (whyEmailUsed === 'register') return 'Please enter your email.';
    } 

    if (isEmailTooLong === true) return defaultMessages.fieldTooLong('email address', defaultAppValues.emailField.maxLength);
    if (isEmailValid === false) return defaultMessages.emailNotValid;
    if (doesUnverifiedUserAlreadyExist === true || doesUserAlreadyExist === true) return defaultMessages.emailAlreadyInUse;
}

exports.getPasswordNewError = function(whyPasswordUsed, password, isPasswordTooLong, doesPasswordMeetRequirements) {

    let returnObject = {};

    if (password === '') {
        returnObject.errorType = 'empty';
        if(whyPasswordUsed === 'register') {
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
        if(whyPasswordUsed === 'changePassword') return 'Please enter your current password.';
        return 'Please enter your password.';
    }

    if(!isPasswordCorrect) {
        if(whyPasswordUsed === 'login') return 'That password/username combination was incorrect.';
        if(whyPasswordUsed === 'changePassword') return 'That did not match your current password.';
        if(whyPasswordUsed === 'deleteAccount') return 'Password incorrect.'
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

exports.getSaveEmailPasswordError = function(passwordCurrent, isPasswordCorrect) {

    if (passwordCurrent === '') return defaultMessages.existingPasswordEmpty;
    if (isPasswordCorrect === false) return 'The password you used was incorrect.  Please try again.';
}

exports.getSavePasswordError = function(passwordCurrent, isCurrentPasswordCorrect) {

    if (passwordCurrent === '') return defaultMessages.existingPasswordEmpty;
    if (isCurrentPasswordCorrect === false) return defaultMessages.existingPasswordIncorrect;
}
