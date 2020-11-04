"use strict";

const stripeValue = require('../models/stripe-values');

let resetAttemptBeforeVerifiedLine = '<p class="textLarge -bottomMarginMedium">Before you can reset your password you must first verify your account.</p>';

exports.changeNone = 'No change made.';

exports.changeSuccessful = 'Change successful.';

exports.companyPropertyChangeVerb = {
    delete: 'deleted',
    add: 'added',
    update: 'updated'
}

exports.myAccountInformationEmpty = 'Please add.';

exports.changeScreenInformationEmpty = 'Not added.';

exports.confirmationSentBody = function(
    email,
    emailSubject,
    isNewRegister,
    isUnverifiedMultipleRegisters,
    isConfirmationResent,
    isResetAttemptBeforeVerified
    ) {

    let headline;
    if (isNewRegister === true || isUnverifiedMultipleRegisters === true) headline = 'Thanks For Registering';
    if (isConfirmationResent === true || isResetAttemptBeforeVerified === true) headline = 'Confirmation Email Resent';

    let resentText;
    if (isNewRegister === true) {
        resentText = 'A confirmation email has been sent to ';
    } else {
        resentText = 'An additional confirmation email has been resent to ';
    }

    let topLine = '';
    if (isResetAttemptBeforeVerified === true) {
        topLine = resetAttemptBeforeVerifiedLine;
    }

    let body = `<h3 class="headlineLarge -centerAlign -bottomMarginMedium">${ headline }</h3>\
            ${ topLine }\
            <p class=\"textLarge -bottomMarginMedium\">${ resentText } <span class=\"highlightEffect\">${ email }</span> \
            and should arrive within a few minutes. Please watch for an email titled: <span class=\"highlightEffect\">${ emailSubject }.</span></p>\
            <p class=\"textMedium -centerAlign -bottomMarginLarge\"><a href=\"confirmation-sent?email=${ email }&resend=true\">Resend confirmation email</a>.</p>`;

    return body;
}

exports.confirmationLimitReachedBody = function(email, emailSubject, expirationTime, isResetAttemptBeforeVerified) {

    let htmlBody;

    let bodyText = `To activate your account please check your inbox for emails titled: <span class=\"highlightEffect\">${ emailSubject }</span>.</p> \
    <p class=\"textLarge -bottomMarginMedium\">If you don't see these emails in your main inbox please check your Promotions or Junk folders.</p> \
    <p class=\"textLarge -bottomMarginLarge\">If you cannot find a confirmation email please register again in ${ expirationTime }.</p>`;

    let topLine = '';
    if (isResetAttemptBeforeVerified === true) {
        topLine = resetAttemptBeforeVerifiedLine;
    }

    htmlBody = `<h3 class="narrowScreen__headline -bottomMarginMedium">Confirmation Limit Reached</h3>\
    ${ topLine }\
    <p class="textLarge -bottomMarginMedium">We are sorry but the maximum number of confirmation emails that can be sent to <span class="highlightEffect">${ email }</span> \
    has been reached. ${ bodyText }`;

    return htmlBody;
}

exports.confirmationSentUnverified = function() {

    let reregisterBody = getConfirmationSentBody('reregister');
    let body = `<h3 class="headlineLarge -centerAlign -bottomMarginMedium">Thanks For Registering</h3>${ reregisterBody }`;

    return body;
}

exports.confirmationResentBody = function(email, emailSubject, resetAttempt) {

    let topSentence = '';

    if (resetAttempt === 'true') {
        topSentence = `<p class="textLarge -bottomMarginMedium">Before you can reset your password you must first verify your account.</p>`;
    } 

    return `${ topSentence }<p class="textLarge -bottomMarginMedium">An additional confirmation email has been requested for <span class="highlightEffect">${ email }</span> and should arrive within the next few minutes. Please watch for an email titled: <span class="highlightEffect">${ emailSubject }</span>.</p>`;

}

exports.noChange = function(companyProperty) {

    let sentenceFragment;
    if (companyProperty === 'address' || companyProperty === 'description' || companyProperty === 'name'  || companyProperty === 'phone number' || companyProperty === 'website') {
        sentenceFragment = `company\'s ${ companyProperty } was`;
    } else if (companyProperty === 'services') {
        sentenceFragment = `company's ${ companyProperty } were`;
    } else if (companyProperty === 'email' || companyProperty === 'password'){
        sentenceFragment = ` ${ companyProperty } was`;
    }

    return `Your ${ sentenceFragment } not changed.`;
    
}

exports.successfulChange = function(companyProperty, changeVerb) {

    let sentenceFragment;
    if (companyProperty === 'address' || companyProperty === 'description' || companyProperty === 'name'  || companyProperty === 'phone number' || companyProperty === 'website') {
        sentenceFragment = `company\'s ${ companyProperty } was`;
    } else if (companyProperty === 'services') {
        sentenceFragment = `company's ${ companyProperty } were`;
    } else if (companyProperty === 'email' || companyProperty === 'password'){
        sentenceFragment = ` ${ companyProperty } was`;
    }

    return `Your ${ sentenceFragment } successfully ${ changeVerb }.`;

}

// used on two pages
exports.upgradeSalesPitch = `Help support the site. Include a link to your website or social media page plus a company description for ${ stripeValue.costInDollarsProduct_1 } for 12 months. There are no contracts or recurring billing.`;

exports.unverifiedPasswordResetAttemptHeadline = 'Please Verify First';

exports.urlNotActiveMessage = 'We tried to reach your company website but it didn\'t appear to be active.  Please double-check to make sure your website is spelled correctly and that it is online.  If you feel this message is in error, please re-enter your website and we\'ll check it again.';