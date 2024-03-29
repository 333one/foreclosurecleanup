const defaultValue = require('./default-values');
const regExpValue = require('./regexp-values');
const siteValue = require('./site-values');
const stripeValue = require('./stripe-values');
const timeValue = require('./time-values');

let paragraphBegin75 = '<p style=\"font-family: arial, helvetica, sans-serif; font-size: .75rem; color: rgb(64, 64, 64)\">';
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
        ${ paragraphBegin1 }If you are interested please <a href="${ siteValue.host }\\login">log in to your account</a> and click ${ spanItalics }Renew Your Premium Account</span>.</p>
        ${ paragraphBegin125 }Thank You!</p>
        ${ paragraphBegin75 }If the link above didn\'t work please click or copy and paste the following link into your browser and hit enter, ${ siteValue.host }\\login\\</p>
        ${ paragraphBegin1 }<a href="${ siteValue.host }"><img src="${ siteValue.companyIcon }" width="267" height="50"></a></p>
        ${ paragraphBegin1 }<img src="${ siteValue.proJournalIcon }" width="138" height="50"></p>`;

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
        ${ paragraphBegin1 }Please <a href="mailto:${ siteValue.contactEmail }?subject=Unauthorized Email Change&body=My login email, ${ email } should not have been changed
            to ${ changedEmail }.">click this link</a> to contact an administrator and we will help you out.</p>
        ${ paragraphBegin125 }Thank You!</p>
        ${ paragraphBegin1 }<a href="${ siteValue.host }"><img src="${ siteValue.companyIcon }" width="267" height="50"></a></p>`;

    return emailBody;

}

exports.emailChangedSubject = function() {

    return `The Login Email For Your ${ siteValue.organization } Account Was Changed`;

}

exports.passwordChangedBody = function(email) {

    let emailBody = `${ paragraphBegin1 }We wanted to let you know that the password for your ${ siteValue.organization } account, ${ spanHighLight }${ email }</span> 
            was recently changed.</p>
        ${ paragraphBegin1 }If this was you then no worries.  Please ignore this email.</p>
        ${ paragraphBegin1 }If you didn't change your password you can secure your account by following the link below to reset your password.</p>
        ${ paragraphBegin1 }<a href="${ siteValue.passwordResetRequestLink }">Reset My Password.</a></p>
        ${ paragraphBegin125 }Thank You!</p>
        ${ paragraphBegin1 }<a href="${ siteValue.host }"><img src="${ siteValue.companyIcon }" width="267" height="50"></a></p>`;

    return emailBody;

}

exports.emailPremiumUpgradeBody = function() {

    let emailBody = `${ paragraphBegin1 }Your account at ${ siteValue.organization } was successfully upgraded to a ${ defaultValue.accountUpgrade }.</p>
    ${ paragraphBegin1 }When you have time please <a href="${ siteValue.host }/login">log in</a> to your account and add your company's logo, website and description.</p>
    ${ paragraphBegin125 }Thank for helping us pay the bills!</p>
    ${ paragraphBegin1 }<a href="${ siteValue.host }"><img src="${ siteValue.companyIcon }" width="267" height="50"></a></p>
    ${ paragraphBegin1 }<img src="${ siteValue.proJournalIcon }" width="138" height="50"></p>
    ${ paragraphBegin1 }<strong>Watch for a payment of ${ stripeValue.costInDollarsProduct_1 } to Pro Journal, LLC on your payment or statement.</strong></p>`;

    return emailBody;

}

exports.passwordChangedSubject = function() {
    return `The Password For Your ${ siteValue.organization } Account Was Changed`;
}

exports.passwordResetRequestEmailBody = function(confirmationHash, expirationTime) {

    let emailBody = `${ paragraphBegin1 }${ paragraphBegin1 }Recently a password reset request was made for your account at ${ siteValue.organization }. To begin resetting
        your password please click the link below. It will remain active for ${ expirationTime } after the initial request.</p>
    ${ paragraphBegin1 }<a href="${ siteValue.host }/password-reset?hash=${ confirmationHash }">Reset My Password</a></p>
    ${ paragraphBegin1 }If you did not request a password reset please disregard this email.</p>
    ${ paragraphBegin125 }Thank You!</p>
    ${ paragraphBegin75 }If the link above didn't work please click or copy and paste the following link into your browser and hit enter, ${ siteValue.host }/password-reset?hash=${ confirmationHash }</p>
    ${ paragraphBegin1 }<a href="${ siteValue.host }"><img src="${ siteValue.companyIcon }" width="267" height="50"></a></p>`;

    return emailBody;

}

exports.passwordResetRequestEmailSubject = function() {

    return `Reset Your ${ siteValue.organization } Password`;

}

exports.premiumUpgradeSubject = function() {

    return `Your Account At ${ siteValue.organization } Was Successfully Upgraded`;

}

exports.urlNotActiveBody = function(formattedURL) {
    
    let emailBody = `${ paragraphBegin1 }We couldn't reach the company website that you entered for your account at ${ siteValue.organization }.
        ${ paragraphBegin1 }<a href="${ formattedURL }">${ formattedURL }</a>.</p>
        ${ paragraphBegin1 }Please double-check your website and make sure the address is spelled correctly and that it is online.</p>
        ${ paragraphBegin1 }If you feel this message is in error, please re-enter your website and we\'ll check it again.</p>
        ${ paragraphBegin1 }<a href="${ siteValue.host }/login">Log in to your account.</a></p>
        ${ paragraphBegin125 }Thank You.</p>
        ${ paragraphBegin75 }If the link above didn\'t work please click or copy and paste the following link into your browser and hit enter, ${ siteValue.host }/login</p>
        ${ paragraphBegin1 }<a href="${ siteValue.host }"><img src="${ siteValue.companyIcon }" width="267" height="50"></a></p>`;

    return emailBody;

}

exports.urlNotActiveSubject = `${ siteValue.organization } - The Website You Entered Wasn\'t Active`;

exports.verificationEmailBody = function(confirmationHash, isResetAttemptBeforeVerified) {

    let topSentence;

    if (isResetAttemptBeforeVerified === true) {

        topSentence = `${ paragraphBegin1 }Recently a password reset request was made for your account at ${ siteValue.organization }.
            Your account must be activated before you can reset the password.  Please activate your account by clicking the link below and confirming your email.`;

    } else {

        topSentence = `${ paragraphBegin1 }Activate your account at ${ siteValue.organization } by clicking the link below and confirming your email.</p>`;

    }

    let emailBody = `${ topSentence }${ paragraphBegin1 }<a href="${ siteValue.host }/verified?hash=${ confirmationHash }">Activate My Account</a></p>
        ${ paragraphBegin125 }Thank You!</p>
        ${ paragraphBegin1 }<a href="${ siteValue.host }"><img src="${ siteValue.companyIcon }" width="267" height="50"></a></p>
        ${ paragraphBegin1 }<img src="${ siteValue.proJournalIcon }" width="138" height="50"></p>
        ${ paragraphBegin75 }If the link above didn't work please click or copy and paste the following link into your browser and hit enter, ${ siteValue.host }/verified?hash=${ confirmationHash }</p>`;

    return emailBody;

}

exports.verificationEmailSubject = function() {

    return `Activate Your ${ siteValue.organization } Account`;
    
}