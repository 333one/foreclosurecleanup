const bodyParser = require('body-parser');
const express = require('express');

const middlewareDefault = require('./middleware-default');

const router = express.Router();

const urlEncoded = bodyParser.urlencoded({ extended: true });

router.get(['/', '/index'], middlewareDefault.homePage);
router.get('/foreclosure-cleanup-vendor-list', middlewareDefault.foreclosureCleanupVendorList);
router.get('/privacy-policy', middlewareDefault.privacyPolicy);
router.get('/terms-of-service', middlewareDefault.termsOfService);

router.post('/foreclosure-cleanup-vendor-list', urlEncoded, middlewareDefault.postForeclosureCleanupVendorList);

router.get('*', middlewareDefault.pageNotFound);

module.exports = router;