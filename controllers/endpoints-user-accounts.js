"use strict";

const bodyParser = require('body-parser');
const express = require('express');

const middleware = require('./middleware-user-accounts');
const {
    redirectLogin,
    redirectMyAccount
    } = require('./middleware-user-accounts'); 

const defaultAppValues = require('../models/default-app-values.js');

const router = express.Router();

const urlEncoded = bodyParser.urlencoded({ extended: true });
const bodyParserRaw = bodyParser.raw({ type: 'application/json' });

router.get('/account-deleted', middleware.accountDeleted);
router.get(defaultAppValues.linkAddChangeBusinessAddress, redirectLogin, middleware.addChangeBusinessAddress);
router.get(defaultAppValues.linkAddChangeBusinessDescription, redirectLogin, middleware.addChangeBusinessDescription);
router.get(defaultAppValues.linkAddChangeBusinessName, redirectLogin, middleware.addChangeBusinessName);
router.get(defaultAppValues.linkAddChangeBusinessPhone, redirectLogin, middleware.addChangeBusinessPhone);
router.get(defaultAppValues.linkAddChangeBusinessServices, redirectLogin, middleware.addChangeBusinessServices);
router.get('/change-email', redirectLogin, middleware.changeEmail);
router.get('/change-password', redirectLogin, middleware.changePassword);
router.get('/confirmation-limit-reached', middleware.confirmationLimitReached);
router.get('/confirmation-resent', middleware.confirmationResent);
router.get('/my-account', redirectLogin, middleware.myAccount);
router.get('/delete-your-account', redirectLogin, middleware.deleteYourAccount);
router.get('/login', redirectMyAccount, middleware.login);
router.get('/login-failure-limit-reached', middleware.loginFailureLimitReached);
router.get('/logout', redirectLogin, middleware.logout);
router.get('/password-reset', middleware.passwordReset);
router.get('/password-reset-limit-reached', middleware.passwordResetLimitReached);
router.get('/password-reset-request', middleware.passwordResetRequest); 
router.get('/password-reset-request-sent', middleware.passwordResetRequestSent); 
router.get('/password-reset-success', middleware.passwordResetSuccess);
router.get('/register', middleware.register);
router.get('/registration-sent', middleware.registrationSent);
router.get('/verified', redirectMyAccount, middleware.verified);

router.post('/add-change-business-address', urlEncoded, redirectLogin, middleware.postAddChangeBusinessAddress);
router.post('/add-change-business-name', urlEncoded, redirectLogin, middleware.postAddChangeBusinessName);
router.post('/add-change-business-phone', urlEncoded, redirectLogin, middleware.postAddChangeBusinessPhone);
router.post('/add-change-business-services', urlEncoded, redirectLogin, middleware.postAddChangeBusinessServices);
router.post('/change-email', urlEncoded, redirectLogin, middleware.postChangeEmail);
router.post('/change-password', urlEncoded, redirectLogin, middleware.postChangePassword);
router.post('/create-checkout-session', bodyParserRaw, redirectLogin, middleware.postCreateCheckoutSession);
router.post('/delete-your-account', urlEncoded, redirectLogin, middleware.postDeleteYourAccount);
router.post('/login', urlEncoded, redirectMyAccount, middleware.postLogin);
router.post('/password-reset', urlEncoded, middleware.postPasswordReset);
router.post('/password-reset-request', urlEncoded, middleware.postPasswordResetRequest); 
router.post('/register', urlEncoded, redirectMyAccount, middleware.postRegister);

module.exports = router;