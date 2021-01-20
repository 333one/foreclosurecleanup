const bodyParser = require('body-parser');
const express = require('express');

const middlewareStripe = require('./middleware-stripe');
const { redirectLogin } = require('./middleware-user-accounts'); 

const router = express.Router();

const bodyParserRaw = bodyParser.raw({ type: 'application/json' });

router.get('/upgrade-premium', redirectLogin, middlewareStripe.redirectFromUpgrade, middlewareStripe.upgradePremium);

router.post('/create-checkout-session', bodyParserRaw, redirectLogin, middlewareStripe.postCreateCheckoutSession);
router.post('/webhook-premium-upgrade', bodyParserRaw, middlewareStripe.webhookPremiumUpgrade);

module.exports = router;