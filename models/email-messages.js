const siteValue = require('./site-values');

let paragraphBegin125 = '<p style=\"font-family: arial, helvetica, sans-serif; font-size: 1.25rem; color: rgb(64, 64, 64)\">';
let paragraphBegin1 = '<p style=\"font-family: arial, helvetica, sans-serif; font-size: 1rem; color: rgb(64, 64, 64)\">';
let spanHighLight = '<span style=\"color: rgb(19, 75, 122)\">';

exports.passwordResetRequestEmailBody = function(confirmationHash, expirationTime) {

    return `${ paragraphBegin125 }${ paragraphBegin1 }Recently a password reset request was made for your account at ${ siteValue.organization }.  To begin resetting your password please click the link below.\
    It will remain active for ${ expirationTime } after the initial request.</p>
    ${ paragraphBegin1 }<a href=\"${ siteValue.host }/password-reset?hash=${ confirmationHash }\">${ siteValue.host }/password-reset?hash=${ confirmationHash }</a></p>
    ${ paragraphBegin1 }If you did not request a password reset please disregard this email.</p>
    ${ paragraphBegin1 }Thank You!</p><p><a href=\"${ siteValue.website }\"><img src=\"${ siteValue.companyIcon }\"></a></p>`;

}

exports.passwordResetRequestEmailSubject = function() {
    return `Reset Your ${ siteValue.organization } Password`;
}

exports.emailChangedSubject = function() {
    return `The Login Email For Your ${ siteValue.organization } Account Was Changed`;
}

exports.emailChangedBody = function(email, changedEmail) {

    let htmlBody = `${ paragraphBegin125 }We wanted to let you know that the login email for your ${ siteValue.organization } account, ${ spanHighLight }${ email }</span> was recently changed to ${ changedEmail }.</p>
    ${ paragraphBegin125 }If this was you then no worries.  Please ignore this email.</p>
    ${ paragraphBegin125 }If you didn\'t change your login email your account may have been compromised.</p>
    ${ paragraphBegin125 }Please <a href=\"mailto:${ siteValue.contactEmail }?subject=Unauthorized Email Change&body=My login email, ${ email } should not have been changed to ${ changedEmail }.\">click this link</a> to contact an administrator and we will help you out.</p>
    ${ paragraphBegin125 }Thank You!</p>
    <p><a href=\"${ siteValue.website }\"><img src=\"${ siteValue.companyIcon }\"></a></p>`;

    return htmlBody;

}

exports.passwordChangedSubject = function() {
    return `The Password For Your ${ siteValue.organization } Account Was Changed`;
}

exports.passwordChangedBody = function(email) {

    let htmlBody = `${ paragraphBegin125 }We wanted to let you know that the password for your ${ siteValue.organization } account, ${ spanHighLight }${ email }</span> was recently changed.</p>
    ${ paragraphBegin125 }If this was you then no worries.  Please ignore this email.</p>
    ${ paragraphBegin125 }If you didn\'t change your password you can secure your account by following the link below to reset your password.</p>
    ${ paragraphBegin125 }<a href=\"${ siteValue.passwordResetRequestLink }\">Reset Your Password.</a></p>
    ${ paragraphBegin125 }Thank You!</p>
    <p><a href=\"${ siteValue.website }\"><img src=\"${ siteValue.companyIcon }\"></a></p>`;

    return htmlBody;

}

exports.verificationEmailBody = function(confirmationHash, isResetAttemptBeforeVerified) {

    let topSentence;

    if (isResetAttemptBeforeVerified === true) {

        topSentence = `${ paragraphBegin1 }Recently a password reset request was made for your account at ${ siteValue.organization }.  Your account must be activated before you can reset the password.  Please activate your account by clicking the link below and confirming your email.`;
    } else {

        topSentence = `${ paragraphBegin1 }Please activate your account at ${ siteValue.organization } by clicking the link below and confirming your email.</p>`;
    }

    return `${ topSentence }${ paragraphBegin1 }<a href=\"${ siteValue.host }/verified?hash=${ confirmationHash }\">${ siteValue.host }/verified?hash=${ confirmationHash }</a></p>\
    ${ paragraphBegin1 }Thank You!</p><p><a href=\"${ siteValue.website }\"><img src=\"${ siteValue.companyIcon }\"></a></p>`;
}

exports.urlNotActiveBody = function(formattedURL) {
    
    return `${ paragraphBegin1 }We couldn't reach the company website that you entered for your account at ${ siteValue.organization }.\
    ${ paragraphBegin1 }<a href=\"${ formattedURL }\">${ formattedURL }</a>.</p>
    ${ paragraphBegin1 }Please double-check your website and make sure the address is spelled correctly and that it is online.</p>
    ${ paragraphBegin1 }If you feel this message is in error, please re-enter your website and we\'ll check it again.</p>
    ${ paragraphBegin1 }<a href=\"${ siteValue.host }\\login\">Log in to your account.</a></p>
    
    ${ paragraphBegin1 }Thank You.</p>
    <p><a href=\"${ siteValue.website }\"><img src=\"${ siteValue.companyIcon }\"></a></p>`;

}

exports.urlNotActiveSubject = `${ siteValue.organization } - The Website You Entered Wasn\'t Active`;

exports.verificationEmailSubject = function() {
    return `Activate Your ${ siteValue.organization } Account`;
}