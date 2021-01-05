const defaultValue = require('../models/default-values');
const logicUserAccounts = require('./logic-user-accounts');

const { StripeCheckoutSession, User } = require('../models/mongoose-schema');

exports.stripeSuccessUpdateDB = async function(eventDataObjectId, stripeCheckoutSession, todaysDate, updatedExpirationDate) {

    // Both myAccount and webhookPremiumUpgrade use this function to attempt to update the DB.
    // myAccount always deletes StripeCheckoutSession after success inside myAccount.  webhookPremiumUpgrade never deletes it.
    // StripeCheckoutSession is always deleted after 72 hours.

    // myAccount passes all 4 parameters, webhookPremiumUpgrade only passes eventDataObjectId.

    // If stripeCheckoutSession doesn't exist this is being called by the webhook.
    if (!stripeCheckoutSession) {

        // event.data.object.id should be equal to session.payment_intent
        stripeCheckoutSession = await StripeCheckoutSession.findOne({ paymentIntent: eventDataObjectId });
        if (!stripeCheckoutSession) return;

    }

    let { email, wasDbAlreadyUpdatedByWebhook } = stripeCheckoutSession;

    if (wasDbAlreadyUpdatedByWebhook === false) {

        // If at this point updatedExpirationDate doesn't exist this means the webhook called this, not myAccount.  
        // In that case update wasDbAlreadyUpdatedByWebhook so that if the webhook comes through multiple times it doesn't keep resaving the same data to DB.
        if (!updatedExpirationDate) {

            await StripeCheckoutSession.updateOne({ paymentIntent: eventDataObjectId }, { wasDbAlreadyUpdatedByWebhook: true });

        }

    } else if (wasDbAlreadyUpdatedByWebhook === true) {

        return;

    }

    // If updatedExpirationDate doesn't exist this is being called by the webhook.
    if (!updatedExpirationDate) {

        let { expirationDate } = await User.findOne({ email });

        todaysDate = new Date();
        updatedExpirationDate = logicUserAccounts.createNewExpirationDate(todaysDate, expirationDate);

    }

    // The $push is used so that every upgrade date that ever occurs is stored in an array.
    await User.updateOne({ email }, {
        companyProfileType: defaultValue.accountUpgrade,
        expirationDate: updatedExpirationDate,
        'alerts.firstExpirationAlertAlreadySent': false,
        'alerts.secondExpirationAlertAlreadySent': false,
        'alerts.finalExpirationAlertAlreadySent': false,        
        $push: { 'upgradeRenewalDates': todaysDate }
    });

}