"use strict";

let paragraphBegin125 = '<p style="font-family: arial, helvetica, sans-serif; font-size: 1.25rem; color: rgb(64, 64, 64)">';
let paragraphBegin1 = '<p style="font-family: arial, helvetica, sans-serif; font-size: 1rem; color: rgb(64, 64, 64)">';

exports.changeNone = 'No change made.';

exports.changeSuccessful = 'Change successful.';

exports.confirmationLimitReachedBody = function(email, emailSubject) {

    return `<p class="narrowScreen__text -bottomMarginLarge">We are sorry but the maximum number of confirmation emails that can be sent to <span class="highlightEffect">${ email }</span> has been reached.  Please check your inbox for emails titled: <span class="highlightEffect">${ emailSubject }</span>.</p>`;
}

exports.confirmationResentBody = function(email, emailSubject) {
    return `<p class="message__text">An additional confirmation email has been requested for <span class="highlightEffect">${ email }</span> and should arrive within the next few minutes. Please watch for an email titled: <span class="highlightEffect">${ emailSubject }</span>.</p>`;
}

exports.emailAlreadyInUse = 'We\'re sorry but the email you entered is already associated with a different account.  Please try a different email address.';

exports.emailExistingEmpty = 'Please enter your email address.';

exports.emailNotValid = 'The email you entered is not valid.';

exports.emailVerificationEmailBody = function(WEBSITE, ORGANIZATION, HOST, confirmationHash) {
    return `${ paragraphBegin125 }</p>${ paragraphBegin1 }Please activate your <a href="${ WEBSITE }">${ ORGANIZATION }</a> account by clicking the link below and confirming your email.</p>${ paragraphBegin1 }<a href="${ HOST }/verified?hash=${ confirmationHash }">${ HOST }/verified?hash=${ confirmationHash }</a></p>\
    ${ paragraphBegin1 }Thank You!</p><p><img src="https://www.foreclosurecleanup.org/images/foreclosure_cleanup_logo.png"></p>`;
}

exports.emailVerificationEmailSubject = function(ORGANIZATION) {
    return `Activate Your ${ ORGANIZATION } Account`;
}

exports.existingPasswordEmpty = 'Please enter your password.';

exports.existingPasswordIncorrect = 'The username and password combination you entered is incorrect.  Please try again.';

exports.fieldTooLong = function(fieldName, maxLength) {
    return `${ fieldName } must be ${ maxLength } characters or less.`;
}

exports.passwordResetRequestEmailBody = function(WEBSITE, ORGANIZATION, HOST, confirmationHash, expirationTime) {
    return `${ paragraphBegin125 }${ paragraphBegin1 }Recently a password reset request was made for your account at <a href="${ WEBSITE }">${ ORGANIZATION }</a>.  To begin resetting your password please click the link below.\
    It will remain active for ${ expirationTime } after the initial request.</p>
    ${ paragraphBegin1 }<a href="${ HOST }/password_reset?hash=${ confirmationHash }">${ HOST }/password_reset?hash=${ confirmationHash }</a></p>
    ${ paragraphBegin1 }If you did not request a password reset please disregard this email.</p>
    ${ paragraphBegin1 }Thank You!</p><p><img src="https://forinstance.io/images/forinstance_logo.png"></p>`;
}

exports.passwordResetRequestEmailSubject = function(ORGANIZATION) {
    return `Reset Your ${ ORGANIZATION } Password`;
}

exports.phoneNotValid = 'Please enter a valid phone number.'

exports.unverifiedPasswordResetAttemptBody = function(email, emailSubject) {
    return `<p class="message__text">Before you can reset your password you must verify your account.</p>
    <p class="message__text">An additional confirmation email has been requested for <span class="highlightEffect">${ email }</span> and should arrive within the next few minutes. Please watch for an email titled: <span class="highlightEffect">${emailSubject}</span>.</p>`;
}

exports.unverifiedConfirmationLimitReachedBody = function (email, emailSubject){

    return `<p class="narrowScreen__text -bottomMarginLarge">We are sorry but you must verify your email before you can reset your password.</p>
    <p class="narrowScreen__text -bottomMarginLarge">An additional confirmation email has been sent to <i>${ email }</i> and should arrive within the next few minutes. Please watch for an email titled: <i>${ emailSubject }</i></p>`;
}

exports.unverifiedPasswordResetAttemptHeadline = 'Please Verify First';