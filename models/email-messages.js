"use strict";

const regExpValue = require('../models/regexp-values');
const siteValue = require('./site-values');
const timeValue = require('../models/time-values');

let paragraphBegin1 = '<p style=\"font-family: arial, helvetica, sans-serif; font-size: 1rem; color: rgb(64, 64, 64)\">';
let paragraphBegin125 = '<p style=\"font-family: arial, helvetica, sans-serif; font-size: 1.25rem; color: rgb(64, 64, 64)\">';
let spanHighLight = '<span style=\"color: rgb(19, 75, 122)\">';
let spanItalics = '<span style=\"font-style: italic\">';

exports.alertBeforeExpirationBody = function(companyName, numberOfDaysUntilExpiration, price) {

    let companyNameFragment = !companyName ? '' : `for ${ companyName }`;

    let numberOfDaysUntilExpirationFragment = timeValue.getNumberOfDaysUntilExpirationFragment(numberOfDaysUntilExpiration);

    let emailBody = `${ paragraphBegin1 }We wanted to let you know that your Premium account ${ companyNameFragment } at ${ siteValue.organization } will expire 
        ${ numberOfDaysUntilExpirationFragment }.</p>
        ${ paragraphBegin1 }Your Premium account includes a link to your company's website or social media page plus your company's description.</p>
        ${ paragraphBegin1 }Renewing your Premium account for 12 months costs just ${ price } and helps to support the site.</p>
        ${ paragraphBegin1 }If you are interested please <a href=\"${ siteValue.host }\\login\">log in to your account</a> and click ${ spanItalics }Renew Your Premium Account</span>.</p>
        ${ paragraphBegin125 }Thank You!</p>
        <p><a href=\"${ siteValue.website }\"><img src=\"${ siteValue.companyIcon }\"></a></p>`;

    return emailBody;

}

exports.alertBeforeExpirationSubject = function(numberOfDaysUntilExpiration) {

    let numberOfDaysUntilExpirationFragment = timeValue.getNumberOfDaysUntilExpirationFragment(numberOfDaysUntilExpiration);
    let capitalizeEveryWordPattern = new RegExp(regExpValue.capitalizeEveryWord, 'g');
    let capitalizedFragment = numberOfDaysUntilExpirationFragment.replace(capitalizeEveryWordPattern, function(match) { return match.toUpperCase() });

    return `${ siteValue.organization }, Your Premium Account Will Expire ${ capitalizedFragment }`;

}

exports.emailChangedBody = function(email, changedEmail) {

    let emailBody = `${ paragraphBegin1 }We wanted to let you know that the login email for your ${ siteValue.organization } account, ${ spanHighLight }${ email }</span>
            was recently changed to ${ changedEmail }.</p>
        ${ paragraphBegin1 }If this was you then no worries.  Please ignore this email.</p>
        ${ paragraphBegin1 }If you didn\'t change your login email your account may have been compromised.</p>
        ${ paragraphBegin1 }Please <a href=\"mailto:${ siteValue.contactEmail }?subject=Unauthorized Email Change&body=My login email, ${ email } should not have been changed
            to ${ changedEmail }.\">click this link</a> to contact an administrator and we will help you out.</p>
        ${ paragraphBegin125 }Thank You!</p>
        <p><a href=\"${ siteValue.website }\"><img src=\"${ siteValue.companyIcon }\"></a></p>`;

    return emailBody;

}

exports.emailChangedSubject = function() {

    return `The Login Email For Your ${ siteValue.organization } Account Was Changed`;

}

exports.passwordChangedBody = function(email) {

    let emailBody = `${ paragraphBegin1 }We wanted to let you know that the password for your ${ siteValue.organization } account, ${ spanHighLight }${ email }</span> 
            was recently changed.</p>
        ${ paragraphBegin1 }If this was you then no worries.  Please ignore this email.</p>
        ${ paragraphBegin1 }If you didn\'t change your password you can secure your account by following the link below to reset your password.</p>
        ${ paragraphBegin1 }<a href=\"${ siteValue.passwordResetRequestLink }\">Reset Your Password.</a></p>
        ${ paragraphBegin125 }Thank You!</p>
        <p><a href=\"${ siteValue.website }\"><img src=\"${ siteValue.companyIcon }\"></a></p>`;

    return emailBody;

}

exports.passwordChangedSubject = function() {
    return `The Password For Your ${ siteValue.organization } Account Was Changed`;
}

exports.passwordResetRequestEmailBody = function(confirmationHash, expirationTime) {

    let emailBody = `${ paragraphBegin1 }${ paragraphBegin1 }Recently a password reset request was made for your account at ${ siteValue.organization }. To begin resetting
        your password please click the link below. It will remain active for ${ expirationTime } after the initial request.</p>
    ${ paragraphBegin1 }<a href=\"${ siteValue.host }/password-reset?hash=${ confirmationHash }\">${ siteValue.host }/password-reset?hash=${ confirmationHash }</a></p>
    ${ paragraphBegin1 }If you did not request a password reset please disregard this email.</p>
    ${ paragraphBegin125 }Thank You!</p><p><a href=\"${ siteValue.website }\"><img src=\"${ siteValue.companyIcon }\"></a></p>`;

    return emailBody;

}

exports.passwordResetRequestEmailSubject = function() {

    return `Reset Your ${ siteValue.organization } Password`;

}

exports.urlNotActiveBody = function(formattedURL) {
    
    let emailBody = `${ paragraphBegin1 }We couldn't reach the company website that you entered for your account at ${ siteValue.organization }.
        ${ paragraphBegin1 }<a href=\"${ formattedURL }\">${ formattedURL }</a>.</p>
        ${ paragraphBegin1 }Please double-check your website and make sure the address is spelled correctly and that it is online.</p>
        ${ paragraphBegin1 }If you feel this message is in error, please re-enter your website and we\'ll check it again.</p>
        ${ paragraphBegin1 }<a href=\"${ siteValue.host }\\login\">Log in to your account.</a></p>
        ${ paragraphBegin125 }Thank You.</p>
        <p><a href=\"${ siteValue.website }\"><img src=\"${ siteValue.companyIcon }\"></a></p>`;

    return emailBody;

}

exports.urlNotActiveSubject = `${ siteValue.organization } - The Website You Entered Wasn\'t Active`;

exports.verificationEmailBody = function(confirmationHash, isResetAttemptBeforeVerified) {

    let topSentence;

    if (isResetAttemptBeforeVerified === true) {

        topSentence = `${ paragraphBegin1 }Recently a password reset request was made for your account at ${ siteValue.organization }.
            Your account must be activated before you can reset the password.  Please activate your account by clicking the link below and confirming your email.`;

    } else {

        topSentence = `${ paragraphBegin1 }Please activate your account at ${ siteValue.organization } by clicking the link below and confirming your email.</p>`;

    }

    let emailBody = `${ topSentence }${ paragraphBegin1 }<a href=\"${ siteValue.host }/verified?hash=${ confirmationHash }\">${ siteValue.host }/verified?hash=${ confirmationHash }</a></p>
        ${ paragraphBegin125 }Thank You!</p><p><a href=\"${ siteValue.website }\"><img src=\"${ siteValue.companyIcon }\"></a></p>`;

    return emailBody;

}

exports.verificationEmailSubject = function() {

    return `Activate Your ${ siteValue.organization } Account`;
    
}