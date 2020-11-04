"use strict"

const cryptoRandomString = require('crypto-random-string');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const defaultValue = require('../models/default-values');
const logicStripe = require('./logic-stripe');
const mongooseInstance = require('./mongoose-create-instances');
const siteValue = require('../models/site-values');
const stripeValue = require('../models/stripe-values');

const { logErrorMessage, wrapAsync } = require('./error-handling');

const {
    StripeCancelKey,
    StripeSuccessKey
    } = require('../models/mongoose-schema');

exports.upgradeExtendPremium = wrapAsync(async function(req, res) {

    let { companyProfileType } = req.session.userValues;

    let isAccountUpgraded = companyProfileType === defaultValue.accountUpgrade ? true : false;

    let title, headline, bodyText, buttonText;
    if (isAccountUpgraded === true) {

        title = 'Extend Your Premium Account';
        headline = 'Extend The Duration Of Your Premium Account';
        bodyText = `Extend your premium account an additional 12 months for just ${ stripeValue.costInDollarsProduct_1 } for 12 months.`;
        buttonText = 'Extend Your Account';

    } else {

        title = 'Upgrade Your Account To Premium';
        headline = 'Upgrade Your Account To Premium';
        bodyText = `Include a link to your company's website or social media page plus add a company description for just ${ stripeValue.costInDollarsProduct_1 } for 12 months.`;
        buttonText = 'Upgrade Your Account';

    }

    // For rendering.
    let activeLink = 'upgrade-extend-premium';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;

    res.render('upgrade-extend-premium', { activeLink, contactEmail, loggedIn, stripePublicKey: process.env.STRIPE_PUBLIC_KEY, title, headline, bodyText, buttonText });

});

exports.postCreateCheckoutSession = wrapAsync(async function(req, res) {

    let stripeCancelString = cryptoRandomString({ length: 32 });
    let stripeSuccessString = cryptoRandomString({ length: 32 });
    let stripeCancelPath = `/my-account?cancel=${ stripeCancelString }`;
    let stripeSuccessPath = `/my-account?success=${ stripeSuccessString }`;
    let stripeCancelUrl = `${ siteValue.host }${ stripeCancelPath }`;
    let stripeSuccessUrl = `${ siteValue.host }${ stripeSuccessPath }`;
    
    const session = await stripe.checkout.sessions.create({

        submit_type: 'auto',
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: stripeValue.productDataName_1,
                        description: stripeValue.productDataDescription_1,
                        images: [stripeValue.productDataImages_1_a]
                    },
                    unit_amount: stripeValue.productDataUnitAmount_1,
                },
                quantity: 1,
            }
        ],
        locale: 'en',
        mode: 'payment',
        cancel_url: stripeCancelUrl,
        success_url: stripeSuccessUrl

    });

    // session.payment_intent is a unique identifier and used as a key.  In webhookPremiumUpgrade event.data.object.id should hold the same value.
    let paymentIntent = session.payment_intent;
    let { email } = req.session.userValues;
    
    // Not necessarily needed but if for some reason these exist in the DB delete them before you create new ones.
    await StripeCancelKey.findOneAndRemove({ email });
    await StripeSuccessKey.findOneAndRemove({ email });

    let stripeCheckoutSession = mongooseInstance.createStripeCheckoutSession(email, paymentIntent);
    await stripeCheckoutSession.save();

    let stripeCancel = mongooseInstance.createStripeCancelSuccessKey(email, stripeCancelString, paymentIntent, StripeCancelKey);
    await stripeCancel.save();

    let stripeSuccess = mongooseInstance.createStripeCancelSuccessKey(email, stripeSuccessString, paymentIntent, StripeSuccessKey);
    await stripeSuccess.save();

    res.json({ id: session.id });

});

exports.webhookPremiumUpgrade = wrapAsync(async function(req, res) {
    // The Stripe server uses a GET request to hit this route whenever there is a payment_intent.succeeded on the account.

    const payload = req.body;

    const endpointSecret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET;

    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
        logErrorMessage(err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Now that the event is created use event.data.object.id as a key to see if the DB needs to be updated.
    // Both webhookPremiumUpgrade and myAccount can upgrade the DB.  Whichever is faster does the job.
    // Redundancy in webhookPremiumUpgrade ensures that the DB is updated even if the session is lost because the client or server crashed.
    if (event.type === 'payment_intent.succeeded') {

        await logicStripe.stripeSuccessUpdateDB(event.data.object.id);
        
    }

    res.status(200).end();

});