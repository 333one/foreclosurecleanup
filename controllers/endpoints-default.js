"use strict";

const express = require('express');

const middlewareDefault = require('./middleware-default');

const router = express.Router();

router.get(['/', '/index'], middlewareDefault.homePage);
router.get('/foreclosure-cleanup-vendor-list', middlewareDefault.foreclosureCleanupVendorList);
router.get('/privacy-policy-terms-service', middlewareDefault.privacyPolicyTermsService);

router.get(['page-not-found', '*'], middlewareDefault.pageNotFound);

module.exports = router;