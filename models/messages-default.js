"use strict";

const stripeValue = require('../models/values-messages-stripe');

exports.changeNone = 'No change made.';

exports.changeSuccessful = 'Change successful.';

exports.companyPropertyChangeVerb = {
    delete: 'deleted',
    add: 'added',
    update: 'updated'
}

exports.myAccountInformationEmpty = 'Please add.';

exports.changeScreenInformationEmpty = 'Not added.';

exports.confirmationResentBody = function(email, emailSubject, resetAttempt) {

    let topSentence = '';

    if (resetAttempt === 'true') {

        topSentence = `<p class="textLarge -bottomMarginMedium">Before you can reset your password you must first verify your account.</p>`;
    } 

    return `${ topSentence }<p class="textLarge -bottomMarginMedium">An additional confirmation email has been requested for <span class="highlightEffect">${ email }</span> and should arrive within the next few minutes. Please watch for an email titled: <span class="highlightEffect">${ emailSubject }</span>.</p>`;
}

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

// used on two pages
exports.upgradeSalesPitch = `Help support the site. Include a link to your website or social media page plus a company description for ${ stripeValue.costInDollarsProduct_1 } for 1 year. There is no contract or recurring billing.`;

exports.unverifiedPasswordResetAttemptHeadline = 'Please Verify First';

exports.URLNotActiveMessage = 'We tried to confirm your website but it didn\'t appear to be active.  Please confirm that your website address is correct.';