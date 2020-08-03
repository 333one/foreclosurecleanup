"use strict";

const express = require('express');

const middlewareDefault = require('./middleware_default');

const router = express.Router();

router.get(['/', '/index'], middlewareDefault.homePage);
router.get('/foreclosure_cleanup_vendor_list', middlewareDefault.foreclosureCleanupVendorList);
router.get('/privacy_policy_terms_service', middlewareDefault.privacyPolicyTermsService);

router.get(['page_not_found', '*'], middlewareDefault.pageNotFound);

router.use(middlewareDefault.errorHandler);

module.exports = router;