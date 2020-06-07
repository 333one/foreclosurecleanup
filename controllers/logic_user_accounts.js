"use strict";

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const path = require('path');
const phoneNormalizer = require('phone');
const zxcvbn = require('zxcvbn');

const defaultAppValues = require('../models/default_app_values.js');
const messages = require('../models/default_messages');
const { 
    FalseEmailConfirmationRequest,
    LoginFailure,
    PasswordResetRequest,
    User,
    UnverifiedUser
} = require('../models/mongoose_schema');

// Custom path to .env file.
require('dotenv').config({ path: path.join(__dirname, '../models/.env') });

exports.checkAllFieldsFilled = function(defaultFields, userInputFields) {

    for(let element of defaultFields) {
        if (userInputFields[element] === '' || userInputFields[element] === undefined) {
            return false;
        }
    }

    return true;
}

exports.checkForPreviousErrors = function(emailError, firstNameError, lastNameError, phoneError) {

    if(emailError || firstNameError || lastNameError || phoneError) {
        return true;
    }
    return false;
}

exports.checkIfInputTooLong = function(field, maxLength) {

    return field.length > maxLength ? true : false;
}

exports.checkPasswordMeetsRequirements = function(password) {

    return zxcvbn(password).score >= 2 ? true : false;
}

exports.checkPhoneValid = function(phone) {

    if (phoneNormalizer(phone, '', true).length === 0) {
        return false;
    }

    return true;
};

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
    }

    // Trim white space from each property.
    for(let property in reqBody) {
        reqBody[property] = reqBody[property].trim();
        // reqBody[property] = reqBody[property].replace(/\s+/g, '');
    }

    return reqBody;
}

exports.createFalseEmailConfirmationRequest = function(email) {

    const fakeEmailRequest = new FalseEmailConfirmationRequest({
        email: email
    });

    return fakeEmailRequest;
}

exports.createLoginFailure = function(email) {

    const loginFailure = new LoginFailure({
        email: email
    });

    return loginFailure;
}

exports.createPasswordResetRequest = function(email, firstName, confirmationHash) {

    const passwordResetRequest = new PasswordResetRequest({
        email: email,
        firstName: firstName,
        confirmationHash: confirmationHash
    });

    return passwordResetRequest;
}

exports.createUnverifiedUser = function(email) {

    const unverifiedUser = new UnverifiedUser({
        email: email,
        password: undefined,
        confirmationHash: undefined
    });

    return unverifiedUser;
}

exports.createUser = function(unverifiedUser) {

    const user = new User({
        email: unverifiedUser.email,
        password: unverifiedUser.password
    });

    return user;
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

exports.formatPhone = function(phone) {

    let cleanedPhone = phone.replace(/\D/g,'');

    let normalizedPhone = phoneNormalizer(phone, '', true).length === 0 ? ('+1' + cleanedPhone) : phoneNormalizer(phone, '', true).join('').slice(0, 12);

    if (normalizedPhone.length < 6) {
        return normalizedPhone.slice(2, 5);
    }

    if (normalizedPhone.length < 9) {
        return normalizedPhone.slice(2, 5) + '-' + normalizedPhone.slice(5);
    }

    if (normalizedPhone.length < 13) {
        return normalizedPhone.slice(2, 5) + '-' + normalizedPhone.slice(5, 8) + '-' + normalizedPhone.slice(8, 12);
    }

    return '';
}

exports.getDeleteAccountError = function(password, isPasswordCorrect) {

    if (password === '') {
        return messages.existingPasswordEmpty;
    } 

    if (isPasswordCorrect === false) {
        return 'The password you entered was incorrect.  Please try again.';
    } 
}

exports.getEmailError = function(email, isEmailValid, isEmailTooLong, doesUserAlreadyExist, doesUnverifiedUserAlreadyExist) {
    
    if (email === '') {
        return 'Please enter your email address.';
    } 

    if (isEmailTooLong === true) {
        return messages.fieldTooLong('email address', defaultAppValues.emailField.maxLength);
    } 

    if (isEmailValid === false) {
        return messages.emailNotValid;
    }

    if (doesUnverifiedUserAlreadyExist === true ||  doesUserAlreadyExist === true) {
        return messages.emailAlreadyInUse;
    }
}

exports.getEmailConfirmationError = function(emailReenter, doEmailsMatch) {

    if (emailReenter === '') {
        return 'Please confirm your new your email.';
    }

    if (doEmailsMatch === false) {
        return 'Email confirmation did not match.  Please re-enter your new email address.';
    }
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

    if (email === '') {
        return messages.emailExistingEmpty;
    } 

    if (isEmailValid === false) {
        return messages.emailNotValid;
    }
}

exports.getLoginPasswordError = function(password, passwordCorrect, emailError) {

    if (password === '' && emailError === undefined) {
        return messages.existingPasswordEmpty;
    } 

    if (passwordCorrect === false && emailError === undefined) {
        return messages.existingPasswordIncorrect;
    } 
}

exports.getNewEmailError = function(email, whyEmailUsed, isEmailTooLong, isEmailValid, doesUserAlreadyExist, doesUnverifiedUserAlreadyExist) {
    
    if (email === '') {
        if (whyEmailUsed === 'change') return 'Please enter your new email.';
        if (whyEmailUsed === 'register') return 'Please enter your email.';
    } 

    if (isEmailTooLong === true) {
        return messages.fieldTooLong('email address', defaultAppValues.emailField.maxLength);
    } 

    if (isEmailValid === false) {
        return messages.emailNotValid;
    }

    if (doesUnverifiedUserAlreadyExist === true || doesUserAlreadyExist === true) {
        return messages.emailAlreadyInUse;
    }
}

exports.getNewPasswordError = function(whyPasswordUsed, password, isPasswordTooLong, doesPasswordMeetRequirements) {

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
        returnObject.message = messages.fieldTooLong('Password', defaultAppValues.passwordField.maxLength);
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

    if (password === '') {
        return 'Please enter and confirm your password.';
    }

    if (isPasswordTooLong === true) {
        return messages.fieldTooLong('password', defaultAppValues.passwordField.maxLength);
    } 

    if (doesPasswordMeetRequirements === false) {
        return 'Password was not strong enough, please try again.';
    }

    if (passwordConfirm === '') {
        return 'Please enter and confirm your password.';
    }

    if (doPasswordsMatch === false) {
        return 'Password confirmation did not match.  Please try again.';
    }

    if (nonPasswordError === true) {
        return 'Please re-enter and confirm your password.';
    }
}

exports.getPhoneError = function(phone, isPhoneValid) {

    if (phone === '') {
        return 'Please enter your phone number.'
    }
    
    if (isPhoneValid === false) {
        return messages.phoneNotValid;
    } 
}

exports.getRegistrationNameError = function(nameType, name, isNameTooLong, isValidCharacters, isProfane) {

    if (name === '') {
        return `Please enter your ${nameType} name.`
    }

    if (isNameTooLong === true) {
        let capitalizedNameType = nameType.charAt(0).toUpperCase() + nameType.slice(1) || '';
        return messages.fieldTooLong(`${ capitalizedNameType } name`, defaultAppValues.yourNameField.maxLength);
    } 

    if (isValidCharacters === false) {
        return 'Invalid character entered.  Please use only letters.';
    }

    if (isProfane === true) {
        return `Please enter a valid ${nameType} name.`;
    } 
}

exports.getSaveEmailPasswordError = function(passwordCurrent, isPasswordCorrect) {

    if (passwordCurrent === '') {
        return messages.existingPasswordEmpty;
    }

    if (isPasswordCorrect === false) {
        return 'The password you used was incorrect.  Please try again.';
    }
}

exports.getSaveNameError = function(isNameTooLong, isNameValidCharacters, isNameProfane) {

    if (isNameTooLong === true) {
        return messages.fieldTooLong('first name', defaultAppValues.yourNameField.maxLength);
    }

    if (isNameProfane === true) {
        return 'Please enter a valid name.';
    }

    if (isNameValidCharacters === false) {
        return 'Please only use letters for your name.';
    }
}

exports.getSavePasswordError = function(passwordCurrent, isCurrentPasswordCorrect) {

    if (passwordCurrent === '') {
        return messages.existingPasswordEmpty;
    }

    if (isCurrentPasswordCorrect === false) {
        return messages.existingPasswordIncorrect;
    }
}

exports.getSavePhoneError = function(phone, isPhoneValid) {

    if (phone === '') {
        return 'Please enter your new phone number.';
    }
    
    if (isPhoneValid === false) {
        return messages.phoneNotValid;
    } 
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

exports.makeFieldsEmpty = function(defaultFields) {

    let emptyFields = {};
    defaultFields.forEach(function(element) {
        emptyFields[element] = '';
    });

    return emptyFields;
}

exports.removeLoginFailures = async function(email) {

    let doesLoginFailureExist = await LoginFailure.exists({ email: email });

    if(doesLoginFailureExist) {
        await LoginFailure.findOneAndRemove({ email: email });
    }
}

exports.sendEmail = async function(emailRecipient, emailSubject, htmlMessage) {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: process.env.ADMIN_EMAIL_SERVER,
        port: 587,
        secure: false, // true for 465, most likely false for other ports like 587 or 25
        auth: {
            user: process.env.ADMIN_EMAIL_SENDER, 
            pass: process.env.ADMIN_EMAIL_PASSWORD 
        }
    });

    // send mail with defined transport object
    await transporter.sendMail({
        from: `"${ process.env.ADMIN_EMAIL_SENDER_NAME }" ${ process.env.ADMIN_EMAIL_SENDER }`,
        // from: process.env.ADMIN_EMAIL_SENDER, 
        to: emailRecipient, 
        subject: emailSubject, 
        text: ``, 
        html: htmlMessage
    });
}

exports.wrapAsync = function(fn) {
    return function(req, res, next) {
        fn(req, res, next).catch(next);
    }
}