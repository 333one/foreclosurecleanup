"use strict"

const cryptoRandomString = require('crypto-random-string');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const logicUserAccounts = require('./logic-user-accounts');
const mongooseInstance = require('./mongoose-create-instances');
const siteValue = require('../models/values-site');
const stripeValue = require('../models/values-messages-stripe');

const { logErrorMessage, wrapAsync } = require('./error-handling');

const {
    StripeCancelKey,
    StripeSuccessKey
    } = require('../models/mongoose-schema');

exports.renewExtendPremium = wrapAsync(async function(req, res) {

    // For rendering.
    let activeLink = 'renew-extend-premium';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;

    res.render('renew-extend-premium', { activeLink, contactEmail, loggedIn, stripePublicKey: process.env.STRIPE_PUBLIC_KEY });
});

exports.upgradePremium = wrapAsync(async function(req, res) {

    // For rendering.
    let activeLink = 'upgrade-premium';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;

    res.render('upgrade-premium', { activeLink, contactEmail, loggedIn, stripePublicKey: process.env.STRIPE_PUBLIC_KEY });
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

    // request-id is the identifier used to lookup the session in the webhook.
    let paymentIntent = session.payment_intent;
    let { email } = req.session.userValues;
    
    // Create the checkout session.  This will be checked in the webhook.
    let stripeCheckoutSession = mongooseInstance.createStripeCheckoutSession(email, paymentIntent);
    await stripeCheckoutSession.save();

    let stripeCancel = mongooseInstance.createStripeCancelSuccessKey(email, stripeCancelString, paymentIntent, StripeCancelKey);
    await stripeCancel.save();
    let stripeSuccess = mongooseInstance.createStripeCancelSuccessKey(email, stripeSuccessString, paymentIntent, StripeSuccessKey);
    await stripeSuccess.save();

    res.json({ id: session.id });
});

exports.webhookPremiumUpgrade = wrapAsync(async function(req, res) {

    const payload = req.body;

    const endpointSecret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET;

    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
        console.log(err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {

        // If myAccount has already updated DB it returns.
        logicUserAccounts.stripeSuccessUpdateDB(event.data.object.id);
    }

    res.status(200).end();
});