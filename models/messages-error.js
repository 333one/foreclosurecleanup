"use strict";

const path = require('path');

const regexpValue = require('./values-messages-regexp');
const renderValue = require('./values-rendering');

// Custom path to .env file.
require('dotenv').config({ path: path.join(__dirname, '/.env') });

let phoneNotValid = 'Please enter a valid phone number.';

let emailAlreadyInUse = 'We\'re sorry but the email you entered is already associated with a different account.  Please try a different email address.';

let emailExistingEmpty = 'Please enter your email address.';

let emailNotValid = 'The email you entered is not valid.';

let existingPasswordEmpty = 'Please enter your password.';

let existingPasswordIncorrect = 'The username and password combination you entered is incorrect.  Please try again.';

function fieldTooLong (fieldName, maxLength) {
    return `Your ${ fieldName } must be ${ maxLength } characters or less.`;
}

function fieldTooShort(fieldName, maxLength) {
    return `Your ${ fieldName } must be ${ maxLength } characters or more.`;
}

function invalidCharacterMessage(pattern) {
    return `Please only use valid ${ pattern }.`;
}

exports.confirmationLimitReachedBody = function(email, emailSubject) {

    return `<p class="textLarge -bottomMarginMedium">We are sorry but the maximum number of confirmation emails that can be sent to <span class="highlightEffect">${ email }</span> has been reached.  Please check your inbox for emails titled: <span class="highlightEffect">${ emailSubject }</span>.</p>`;
}

exports.getCompanyCityError = function(isCompanyCityFilled, isCompanyCityTooLong, isCompanyCityTooShort, isCompanyCityValidCharacters) {

    if (isCompanyCityFilled === false) return 'Please enter the city where your company is located.';
    if (isCompanyCityTooLong === true) return fieldTooLong('company\'s city', renderValue.companyCityField.maxLength);
    if (isCompanyCityTooShort === true) return fieldTooShort('company\'s city', renderValue.companyCityField.minLength);
    if (isCompanyCityValidCharacters === false) return invalidCharacterMessage(regexpValue.messageCompanyCity); 
}

exports.getCompanyDescriptionError = function(isCompanyDescriptionFilled, isCompanyDescriptionTooLong, isCompanyDescriptionTooShort, isCompanyDescriptionProfane, isCompanyDescriptionValidCharacters) {

    if (isCompanyDescriptionFilled === false) return 'Please enter your company\'s name.';
    if (isCompanyDescriptionTooLong === true) return fieldTooLong('company\'s description', renderValue.companyDescriptionField.maxLength);
    if (isCompanyDescriptionTooShort === true) return fieldTooShort('company\'s description', renderValue.companyDescriptionField.minLength);
    if (isCompanyDescriptionProfane === true) return 'Please do not use profanity in your company\'s description.';
    if (isCompanyDescriptionValidCharacters === false) return invalidCharacterMessage(regexpValue.messageCompanyDescription); 
}

exports.getCompanyNameError = function(isCompanyNameFilled, isCompanyNameTooLong, isCompanyNameTooShort, isCompanyNameProfane, isCompanyNameValidCharacters, doesCompanyNameContainCharacterOrNumber) {

    if (isCompanyNameFilled === false) return 'Please enter your company\'s name.';
    if (isCompanyNameTooLong === true) return fieldTooLong('company\'s name', renderValue.companyNameField.maxLength);
    if (isCompanyNameTooShort === true) return fieldTooShort('company\'s name', renderValue.companyNameField.minLength);
    if (isCompanyNameProfane === true) return 'Please enter a valid name.';
    if (doesCompanyNameContainCharacterOrNumber === false) return 'Your company\'s name must include at least 1 letter or number.';
    if (isCompanyNameValidCharacters === false) return invalidCharacterMessage(regexpValue.messageCompanyName); 
}

exports.getCompanyPhoneError = function(isCompanyPhoneFilled, isCompanyPhoneValid, isCompanyPhoneValidCharacters) {

    if (isCompanyPhoneFilled === false) return 'Please enter your company\'s phone number.';
    if (isCompanyPhoneValid === false) return 'Please enter a valid phone number.';
    if (isCompanyPhoneValidCharacters === false) return invalidCharacterMessage(regexpValue.messageCompanyPhone); 
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
    if (isCompanyStreetTooLong === true) return fieldTooLong('company\'s street address', renderValue.companyStreetField.maxLength);
    if (isCompanyStreetTooShort === true) return fieldTooShort('company\'s street address', renderValue.companyStreetField.minLength);
    if (isCompanyStreetValidCharacters === false) return invalidCharacterMessage(regexpValue.messageCompanyStreet);
    if (isCompanyRegionFilled === false) return undefined;
    if (uspsNormalizationError) return 'We are sorry but this address was not found in the US Postal Service database.  Please check your address and try again.';
}

exports.getCompanyStreetTwoError = function(isCompanyStreetTwoFilled, isCompanyStreetTwoTooLong, isCompanyStreetTwoTooShort, isCompanyStreetTwoValidCharacters) {

    if (isCompanyStreetTwoFilled === false) return undefined;
    if (isCompanyStreetTwoTooLong === true) return fieldTooLong('company\'s street address', renderValue.companyStreetField.maxLength);
    if (isCompanyStreetTwoTooShort === true) return fieldTooShort('company\'s street address', renderValue.companyStreetField.minLength);
    if (isCompanyStreetTwoValidCharacters === false) return invalidCharacterMessage(regexpValue.messageCompanyStreetTwo);
}

exports.getCompanyWebsiteError = function(isCompanyWebsiteFilled, isCompanyWebsiteTooLong, isCompanyWebsiteValid, isCompanyWebsiteValidCharacters) {

    if (isCompanyWebsiteFilled === false) return 'Please enter your company\'s website or social media page.';
    if (isCompanyWebsiteTooLong === true) return fieldTooLong('company\'s website', renderValue.companyWebsiteField.maxLength);
    if (isCompanyWebsiteValid === false) return 'Please enter a valid website address.';
    if (isCompanyWebsiteValidCharacters === false) return 'Please enter a valid website address.';
    if (isCompanyWebsiteValidCharacters === false) return `${ invalidCharacterMessage(regexpValue.messageCompanyWebsite) }.  If you need to use a character outside these please <a href="${ process.env.CONTACT_EMAIL }">contact us</a> and we will see if that is possible`; 
}

exports.getCompanyZipError = function(isCompanyZipFilled, isCompanyZipFiveDigits, isCompanyZipValidCharacters) {

    if (isCompanyZipFilled === false) return 'Please enter the zip code where your company is located.';
    if (isCompanyZipFiveDigits === false) return 'Please enter a 5 digit zip code.';
    if (isCompanyZipValidCharacters === false) return invalidCharacterMessage(regexpValue.messageCompanyZip);
}

exports.getDeleteAccountError = function(password, isPasswordCorrect) {

    if (password === '') return existingPasswordEmpty;
    if (isPasswordCorrect === false) return 'The password you entered was incorrect.  Please try again.';
}

exports.getEmailError = function(email, isEmailValid, isEmailTooLong, doesUserAlreadyExist, doesUnverifiedUserAlreadyExist) {
    
    if (email === '') return 'Please enter your email address.';
    if (isEmailTooLong === true) return fieldTooLong('email address', renderValue.emailField.maxLength);
    if (isEmailValid === false) return emailNotValid;
    if (doesUnverifiedUserAlreadyExist === true ||  doesUserAlreadyExist === true) return emailAlreadyInUse;
}

exports.getEmailConfirmationError = function(emailReenter, doEmailsMatch) {

    if (emailReenter === '') return 'Please confirm your new your email.';
    if (doEmailsMatch === false) return 'Email confirmation did not match.  Please re-enter your new email address.';
}

exports.getLoginEmailError = function(email, isEmailValid) {

    if (email === '') return emailExistingEmpty;
    if (isEmailValid === false) return emailNotValid;
}

exports.getLoginPasswordError = function(password, passwordCorrect, emailError) {

    if (password === '' && emailError === undefined) return existingPasswordEmpty;
    if (passwordCorrect === false && emailError === undefined) return existingPasswordIncorrect;
}

exports.getNewEmailError = function(email, whyEmailUsed, isEmailTooLong, isEmailValid, doesUserAlreadyExist, doesUnverifiedUserAlreadyExist, isEmailValidCharacters) {
    
    if (email === '') {
        if (whyEmailUsed === 'change') return 'Please enter your new email.';
        if (whyEmailUsed === 'register') return 'Please enter your email.';
    } 

    if (isEmailTooLong === true) return fieldTooLong('email address', renderValue.emailField.maxLength);
    if (isEmailValid === false) return emailNotValid;
    if (doesUnverifiedUserAlreadyExist === true || doesUserAlreadyExist === true) return emailAlreadyInUse;
    if (isEmailValidCharacters === false) return `${ invalidCharacterMessage(regexpValue.messageEmail) }.  If you need to use a character outside these please <a href="${ process.env.CONTACT_EMAIL }">contact us</a> and we will see if that is possible`; ;
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
        returnObject.message = fieldTooLong('Password', renderValue.passwordField.maxLength);
        return returnObject;
    } 

    if (doesPasswordMeetRequirements === false) {
        returnObject.errorType = 'weak';
        returnObject.message = 'Password was not strong enough, please try again.';
        return returnObject;
    }

    if (isPasswordValidCharacters === false) {
        returnObject.errorType = undefined;
        returnObject.message = invalidCharacterMessage(regexpValue.messagePassword);
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
    if (isPasswordTooLong === true) return fieldTooLong('password', renderValue.passwordField.maxLength);
    if (doesPasswordMeetRequirements === false) return 'Password was not strong enough, please try again.';
    if (passwordConfirm === '') return 'Please enter and confirm your password.';
    if (doPasswordsMatch === false) return 'Password confirmation did not match.  Please try again.';
    if (nonPasswordError === true) return 'Please re-enter and confirm your password.';
}

exports.getPhoneError = function(phone, isPhoneValid) {

    if (phone === '') return 'Please enter your company\'s phone number.';
    if (isPhoneValid === false) return phoneNotValid;
}

exports.getSaveEmailPasswordError = function(passwordCheck, isPasswordCorrect) {

    if (passwordCheck === '') return existingPasswordEmpty;
    if (isPasswordCorrect === false) return 'The password you used was incorrect.  Please try again.';
}

exports.getSavePasswordError = function(passwordCurrent, isCurrentPasswordCorrect) {

    if (passwordCurrent === '') return existingPasswordEmpty;
    if (isCurrentPasswordCorrect === false) return existingPasswordIncorrect;
}

exports.unverifiedConfirmationLimitReachedBody = function (email, emailSubject){

    return `<p class="textLarge -bottomMarginMedium">We are sorry but you must verify your email before you can reset your password.</p>
    <p class="textLarge -bottomMarginLarge">An additional confirmation email has been sent to <i>${ email }</i> and should arrive within the next few minutes. Please watch for an email titled: <i>${ emailSubject }</i></p>`;
}