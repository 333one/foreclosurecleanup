const defaultValue = require('./default-values');
const siteValue = require('./site-values');

let costProduct_1 = 2000;

exports.cancelMessage = `We are sorry but there was a problem during payment through Stripe.  Please <a href=\"mailto:${ siteValue.contactEmail }\">contact us</a>
    if you need help upgrading your account.`;

// 1 hour, realistically needed for less than 30 seconds in 99% of cases.
exports.cancelSuccessKeyExpiration = 60 * 60;

// 72 hours
// Stripe attempts to deliver your webhooks for up to three days with an exponential back off.
exports.checkoutSessionExpiration = 3 * 24 * 60 * 60;

exports.costInDollarsProduct_1 = `$${costProduct_1 / 100}`;

exports.productDataDescription_1 = `Upgrade your account to a ${ defaultValue.accountUpgrade } for 12 months.  Thanks for supporting the site!`;

exports.productDataImages_1_a = 'https://www.foreclosurecleanup.org/images/foreclosure-cleanup-stripe-image.png';

exports.productDataName_1 = `Upgrade To A ${ defaultValue.accountUpgrade }`;

exports.productDataUnitAmount_1 = costProduct_1;

exports.successUpgradeMessage = `Your account was upgraded to a ${ defaultValue.accountUpgrade }.`;

exports.successExtendMessage = `Your ${ defaultValue.accountUpgrade } was extended for an additional year.`;