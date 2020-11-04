"use strict";

const defaultValue = require('../models/default-values');
const timeValue = require('../models/time-values');

const {
    StripeCheckoutSession,
    User,
    } = require('../models/mongoose-schema');


function createNewExpirationDate(upgradeRenewalDate, expirationDate) {

    let newExpirationStartPoint = String(expirationDate) === String(timeValue.freeAccountExpiration) ? new Date(upgradeRenewalDate) : new Date(expirationDate);
    let newExpirationYear = newExpirationStartPoint.getFullYear() + 1;
    newExpirationStartPoint.setFullYear(newExpirationYear);

    return newExpirationStartPoint;
    
}

exports.stripeSuccessUpdateDB = async function(eventDataObjectId) {

    // event.data.object.id should be equal to session.payment_intent
    let stripeCheckoutSession = await StripeCheckoutSession.findOne({ paymentIntent: eventDataObjectId });

    // If it doesn't exist it's because it was already deleted.
    if (!stripeCheckoutSession) return;

    let { email } = stripeCheckoutSession;

    let { expirationDate } = await User.findOne({ email });

    let upgradeRenewalDate = new Date();

    let updatedExpirationDate = createNewExpirationDate(upgradeRenewalDate, expirationDate);

    // The $push is used so that every upgrade date that ever occurs is stored in an array.
    await User.updateOne({ email },
        { companyProfileType: defaultValue.accountUpgrade,
            expirationDate: updatedExpirationDate,
            $push: {'upgradeRenewalDates': upgradeRenewalDate } }
    );

    // Once it has been used it is deleted.  This is the only place in the stripe chain of events where this document is deleted.
    await StripeCheckoutSession.findOneAndRemove({ paymentIntent: eventDataObjectId });

}