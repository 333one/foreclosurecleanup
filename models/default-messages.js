const defaultValue = require('../models/default-values');
const stripeValue = require('../models/stripe-values');

let resetAttemptBeforeVerifiedLine = '<p class="myAccount__bodyTextLarge -marginBottomTwo">Before you can reset your password you must first verify your account.</p>';

exports.companyPropertyChangeVerb = {
    delete: 'deleted',
    add: 'added',
    update: 'updated'
}

exports.confirmationLimitReachedBody = function(email, emailSubject, expirationTime, isResetAttemptBeforeVerified) {

    let bodyText = `To activate your account please check your inbox for emails titled: <span class=\"highlightEffect\">${ emailSubject }</span>.</p>
    <p class=\"myAccount__bodyTextLarge -marginBottomTwo\">If you don't see these emails in your main inbox please check your Promotions or Junk folders.</p>
    <p class=\"myAccount__bodyTextLarge -marginBottomFour\">If you cannot find a confirmation email please register again in ${ expirationTime }.</p>`;

    let topSentence = '';
    if (isResetAttemptBeforeVerified === true) {
        topSentence = resetAttemptBeforeVerifiedLine;
    }

    let htmlBody = `<h3 class="headlineLarge">Confirmation Limit Reached</h3>
    ${ topSentence }
    <p class="myAccount__bodyTextLarge -marginBottomTwo">We are sorry but the maximum number of confirmation emails that can be sent to <span class="highlightEffect">${ email }</span> has been reached. ${ bodyText }`;

    return htmlBody;
}

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

    let topSentence = '';
    if (isResetAttemptBeforeVerified === true) {
        topSentence = resetAttemptBeforeVerifiedLine;
    }

    let htmlBody = `<h3 class="headlineLarge -centerAlign -marginBottomTwo">${ headline }</h3>
        ${ topSentence }
        <p class=\"myAccount__bodyTextLarge -marginBottomTwo\">${ resentText } <span class=\"highlightEffect\">${ email }</span> 
        and should arrive within a few minutes. Please watch for an email titled: <span class=\"highlightEffect\">${ emailSubject }.</span></p>
        <p class=\"font125 -centerAlign -marginBottomFour\"><a href=\"confirmation-sent?email=${ email }&resend=true\">Resend confirmation email</a>.</p>`;

    return htmlBody;
    
}

exports.myAccountInformationEmpty = 'Please add.';

exports.noChange = function(companyProperty) {

    let sentenceFragment;
    if (
        companyProperty === 'address' ||
        companyProperty === 'description' ||
        companyProperty === 'name'  ||
        companyProperty === 'phone number' ||
        companyProperty === 'website'
        ) {

        sentenceFragment = `company\'s ${ companyProperty } was`;

    } else if (companyProperty === 'services') {

        sentenceFragment = `company's ${ companyProperty } were`;

    } else if (companyProperty === 'email' || companyProperty === 'password') {

        sentenceFragment = ` ${ companyProperty } was`;

    }

    return `Your ${ sentenceFragment } not changed.`;
    
}

exports.successfulChange = function(companyProperty, changeVerb) {

    let sentenceFragment;
    if (
        companyProperty === 'address' ||
        companyProperty === 'description' ||
        companyProperty === 'logo' ||
        companyProperty === 'name'  ||
        companyProperty === 'phone number' ||
        companyProperty === 'website'
        ) {

        sentenceFragment = `company\'s ${ companyProperty } was`;

    } else if (companyProperty === 'services') {

        sentenceFragment = `company's ${ companyProperty } were`;

    } else if (companyProperty === 'email' || companyProperty === 'password') {

        sentenceFragment = ` ${ companyProperty } was`;

    }

    return `Your ${ sentenceFragment } successfully ${ changeVerb }.`;

}

exports.upgradeCheckItOut = `See what a ${ defaultValue.accountUpgrade } looks like.`;

exports.upgradeRequired = `This feature requires a ${ defaultValue.accountUpgrade } upgrade.`

exports.upgradeSalesPitch = `${ defaultValue.accountUpgrade }s appear first in search results, include a link to your company's website or social media page, a company logo and a company description for just ${ stripeValue.costInDollarsProduct_1 } per year. There are no contracts or recurring billing.`;

exports.urlNotActiveMessage = 'We tried to reach your company website but it didn\'t appear to be active.  Please double-check to make sure your website is spelled correctly and that it is online.  If you feel this message is in error, please re-enter your website and we\'ll check it again.';