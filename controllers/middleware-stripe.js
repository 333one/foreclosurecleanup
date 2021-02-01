const cryptoRandomString = require('crypto-random-string');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const defaultValue = require('../models/default-values');
const logicStripe = require('./logic-stripe');
const mongooseLogic = require('./mongoose-logic');
const siteValue = require('../models/site-values');
const stripeValue = require('../models/stripe-values');

const { logErrorMessage, wrapAsync } = require('./error-handling');


exports.redirectFromUpgrade = wrapAsync(async function(req, res, next) {

    // If the account is upgraded it can't go to the upgrade page.
    if (req.session.userValues.companyProfileType !== defaultValue.accountDefault) return res.redirect('/my-account');
    
    return next();
    
});

exports.upgradePremium = wrapAsync(async function(req, res) {

    let defaultProfileName = defaultValue.accountDefault;
    let upgradedProfileName = defaultValue.accountUpgrade;
    let costInDollarsProduct_1 = stripeValue.costInDollarsProduct_1;

    // For rendering.
    let activeLink = 'upgrade-premium';
    let contactEmail = siteValue.contactEmail.email;
    let loggedIn = true;
    let { projectStatus } = siteValue;


    res.render('upgrade-premium', { activeLink, contactEmail, loggedIn, projectStatus, defaultProfileName, upgradedProfileName, costInDollarsProduct_1 });

});

exports.postCreateCheckoutSession = wrapAsync(async function(req, res) {

    let stripeCancelKey = cryptoRandomString({ length: 32 });
    let stripeCancelUrl = `${ siteValue.host }/my-account?cancel=${ stripeCancelKey }`;

    let stripeSuccessKey = cryptoRandomString({ length: 32 });
    let stripeSuccessUrl = `${ siteValue.host }/my-account?success=${ stripeSuccessKey }`;
    
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

    let stripeCheckoutSession = mongooseLogic.createStripeCheckoutSession(email, paymentIntent, stripeCancelKey, stripeSuccessKey);
    await stripeCheckoutSession.save();

    res.json({ id: session.id });

});

exports.webhookPremiumUpgrade = wrapAsync(async function(req, res) {
    // The Stripe server uses a GET request to hit this route whenever there is a payment_intent.succeeded on the account.

    const payload = req.body;

    let endpointSecret;
    if (projectStatus === 'production') {
        endpointSecret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET;
    } else {
        endpointSecret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET_TEST;
    }

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