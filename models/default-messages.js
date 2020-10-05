"use strict";

const defaultAppValues = require('../models/default-app-values.js');
const { addChangeCompanyDescription } = require('./default-fields.js');

let paragraphBegin125 = '<p style="font-family: arial, helvetica, sans-serif; font-size: 1.25rem; color: rgb(64, 64, 64)">';
let paragraphBegin1 = '<p style="font-family: arial, helvetica, sans-serif; font-size: 1rem; color: rgb(64, 64, 64)">';

exports.changeNone = 'No change made.';

exports.changeSuccessful = 'Change successful.';

exports.companyPropertyChangeVerb = {
    delete: 'deleted',
    add: 'added',
    update: 'updated'
}

exports.confirmationLimitReachedBody = function(email, emailSubject) {

    return `<p class="textLarge -bottomMarginMedium">We are sorry but the maximum number of confirmation emails that can be sent to <span class="highlightEffect">${ email }</span> has been reached.  Please check your inbox for emails titled: <span class="highlightEffect">${ emailSubject }</span>.</p>`;
}

exports.confirmationResentBody = function(email, emailSubject, resetAttempt) {

    let topSentence = '';

    if (resetAttempt === 'true') {

        topSentence = `<p class="textLarge -bottomMarginMedium">Before you can reset your password you must first verify your account.</p>`;
    } 

    return `${ topSentence }<p class="textLarge -bottomMarginMedium">An additional confirmation email has been requested for <span class="highlightEffect">${ email }</span> and should arrive within the next few minutes. Please watch for an email titled: <span class="highlightEffect">${ emailSubject }</span>.</p>`;
}

exports.emailAlreadyInUse = 'We\'re sorry but the email you entered is already associated with a different account.  Please try a different email address.';

exports.emailExistingEmpty = 'Please enter your email address.';

exports.emailNotValid = 'The email you entered is not valid.';

exports.emailVerificationEmailBody = function(WEBSITE, ORGANIZATION, HOST, confirmationHash, resetAttempt) {

    let topSentence;

    if (resetAttempt === 'true') {

        topSentence = `${ paragraphBegin1 }Recently a password reset request was made for your account at ${ ORGANIZATION }.  Your account must be activated before you can reset the password.  Please activate your account by clicking the link below and confirming your email.`;
    } else {

        topSentence = `${ paragraphBegin1 }Please activate your account at ${ ORGANIZATION } by clicking the link below and confirming your email.</p>`;
    }

    return `${ topSentence }${ paragraphBegin1 }<a href="${ HOST }/verified?hash=${ confirmationHash }">${ HOST }/verified?hash=${ confirmationHash }</a></p>\
    ${ paragraphBegin1 }Thank You!</p><p><a href="https://www.foreclosurecleanup.org"><img src="https://www.foreclosurecleanup.org/images/foreclosure-cleanup-logo.png"></a></p>`;
}

exports.emailVerificationEmailSubject = function(ORGANIZATION) {
    return `Activate Your ${ ORGANIZATION } Account`;
}

exports.existingPasswordEmpty = 'Please enter your password.';

exports.existingPasswordIncorrect = 'The username and password combination you entered is incorrect.  Please try again.';

exports.fieldTooLong = function(fieldName, maxLength) {
    return `Your ${ fieldName } must be ${ maxLength } characters or less.`;
}

exports.fieldTooShort = function(fieldName, maxLength) {
    return `Your ${ fieldName } must be ${ maxLength } characters or more.`;
}

exports.myAccountInformationEmpty = 'Please add.';

exports.changeScreenInformationEmpty = 'Not added.';

exports.passwordResetRequestEmailBody = function(WEBSITE, COMPANYICON, ORGANIZATION, HOST, confirmationHash, expirationTime) {
    return `${ paragraphBegin125 }${ paragraphBegin1 }Recently a password reset request was made for your account at ${ ORGANIZATION }.  To begin resetting your password please click the link below.\
    It will remain active for ${ expirationTime } after the initial request.</p>
    ${ paragraphBegin1 }<a href="${ HOST }/password-reset?hash=${ confirmationHash }">${ HOST }/password-reset?hash=${ confirmationHash }</a></p>
    ${ paragraphBegin1 }If you did not request a password reset please disregard this email.</p>
    ${ paragraphBegin1 }Thank You!</p><p><a href="${ WEBSITE }"><img src="${ COMPANYICON }"></a></p>`;
}

exports.passwordResetRequestEmailSubject = function(ORGANIZATION) {
    return `Reset Your ${ ORGANIZATION } Password`;
}

exports.phoneNotValid = 'Please enter a valid phone number.';

exports.stripeCancelMessage = `We are sorry but there was a problem during payment through Stripe.  Please <a href="mailto:${ process.env.CONTACT_EMAIL }>contact us</a> if you need help upgrading your account.`;
exports.stripeSuccessMessage = 'Premium Upgrade Successful';

exports.successfulChange = function(companyProperty, changeVerb) {

    let sentenceFragment;
    if (companyProperty === 'address' || companyProperty === 'description' || companyProperty === 'name'  || companyProperty === 'website') {
        sentenceFragment = `company's ${ companyProperty } was`;
    } else if (companyProperty === 'services') {
        sentenceFragment = `company's ${ companyProperty } were`;
    } else if (companyProperty === 'email' || companyProperty === 'password'){
        sentenceFragment = ` ${ companyProperty } was`;
    }

    return `Your company's ${ sentenceFragment } successfully ${ changeVerb }.`;
}

exports.unverifiedConfirmationLimitReachedBody = function (email, emailSubject){

    return `<p class="textLarge -bottomMarginMedium">We are sorry but you must verify your email before you can reset your password.</p>
    <p class="textLarge -bottomMarginLarge">An additional confirmation email has been sent to <i>${ email }</i> and should arrive within the next few minutes. Please watch for an email titled: <i>${ emailSubject }</i></p>`;
}

exports.upgradeSalesPitch = `Help support the site. Include a link to your website or social media page plus a company description for ${ defaultAppValues.costInDollarsProduct_1 } for 1 year. There is no contract or recurring billing.`;

exports.unverifiedPasswordResetAttemptHeadline = 'Please Verify First';

exports.URLNotActiveMessage = 'We tried to confirm your website but it didn\'t appear to be active.  Please confirm that your website address is correct.';