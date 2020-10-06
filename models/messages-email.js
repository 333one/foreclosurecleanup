const siteValue = require('./values-site');

let paragraphBegin125 = '<p style="font-family: arial, helvetica, sans-serif; font-size: 1.25rem; color: rgb(64, 64, 64)">';
let paragraphBegin1 = '<p style="font-family: arial, helvetica, sans-serif; font-size: 1rem; color: rgb(64, 64, 64)">';

exports.emailVerificationEmailBody = function(confirmationHash, resetAttempt) {

    let topSentence;

    if (resetAttempt === 'true') {

        topSentence = `${ paragraphBegin1 }Recently a password reset request was made for your account at ${ siteValue.organization }.  Your account must be activated before you can reset the password.  Please activate your account by clicking the link below and confirming your email.`;
    } else {

        topSentence = `${ paragraphBegin1 }Please activate your account at ${ siteValue.organization } by clicking the link below and confirming your email.</p>`;
    }

    return `${ topSentence }${ paragraphBegin1 }<a href="${ siteValue.host }/verified?hash=${ confirmationHash }">${ siteValue.host }/verified?hash=${ confirmationHash }</a></p>\
    ${ paragraphBegin1 }Thank You!</p><p><a href="${ siteValue.website }"><img src="${ siteValue.companyIcon }"></a></p>`;
}

exports.emailVerificationEmailSubject = function() {
    return `Activate Your ${ siteValue.organization } Account`;
}

exports.passwordResetRequestEmailBody = function(confirmationHash, expirationTime) {
    return `${ paragraphBegin125 }${ paragraphBegin1 }Recently a password reset request was made for your account at ${ siteValue.organization }.  To begin resetting your password please click the link below.\
    It will remain active for ${ expirationTime } after the initial request.</p>
    ${ paragraphBegin1 }<a href="${ siteValue.host }/password-reset?hash=${ confirmationHash }">${ siteValue.host }/password-reset?hash=${ confirmationHash }</a></p>
    ${ paragraphBegin1 }If you did not request a password reset please disregard this email.</p>
    ${ paragraphBegin1 }Thank You!</p><p><a href="${ siteValue.website }"><img src="${ siteValue.companyIcon }"></a></p>`;
}

exports.passwordResetRequestEmailSubject = function() {
    return `Reset Your ${ siteValue.organization } Password`;
}