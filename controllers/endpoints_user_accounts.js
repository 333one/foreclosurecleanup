"use strict";

const bodyParser = require('body-parser');
const express = require('express');
const flash = require('connect-flash');

const middleware = require('./middleware_user_accounts');
const {
    redirectDashboard,
    redirectLogin
    } = require('./middleware_user_accounts'); 

const router = express.Router();

const urlEncoded = bodyParser.urlencoded({ extended: true });

router.use(flash());

router.use(middleware.flashMessages);

router.get('/account_deleted', middleware.accountDeleted);
router.get('/add_change_business_about', redirectLogin, middleware.addChangeBusinessAbout);
router.get('/add_change_business_address', redirectLogin, middleware.addChangeBusinessAddress);
router.get('/add_change_business_name', redirectLogin, middleware.addChangeBusinessName);
router.get('/add_change_business_phone', redirectLogin, middleware.addChangeBusinessPhone);
router.get('/add_change_business_services', redirectLogin, middleware.addChangeBusinessServices);
router.get('/change_email', redirectLogin, middleware.changeEmail);
router.get('/change_password', redirectLogin, middleware.changePassword);
router.get('/confirmation_limit_reached', middleware.confirmationLimitReached);
router.get('/confirmation_resent', middleware.confirmationResent);
router.get('/dashboard', redirectLogin, middleware.dashboard);
router.get('/delete_your_account', redirectLogin, middleware.deleteYourAccount);
router.get('/login', redirectDashboard, middleware.login);
router.get('/login_failure_limit_reached', middleware.loginFailureLimitReached);
router.get('/logout', redirectLogin, middleware.logout);
router.get('/password_reset', middleware.passwordReset);
router.get('/password_reset_limit_reached', middleware.passwordResetLimitReached);
router.get('/password_reset_request', middleware.passwordResetRequest); 
router.get('/password_reset_request_sent', middleware.passwordResetRequestSent); 
router.get('/password_reset_success', middleware.passwordResetSuccess);
router.get('/register', middleware.register);
router.get('/registration_sent', middleware.registrationSent);
router.get('/verified', redirectDashboard, middleware.verified);

router.post('/add_change_business_address', urlEncoded, redirectLogin, middleware.postAddChangeBusinessAddress);
router.post('/add_change_business_name', urlEncoded, redirectLogin, middleware.postAddChangeBusinessName);
router.post('/add_change_business_phone', urlEncoded, redirectLogin, middleware.postAddChangeBusinessPhone);
router.post('/add_change_business_services', urlEncoded, redirectLogin, middleware.postAddChangeBusinessServices);
router.post('/change_email', urlEncoded, redirectLogin, middleware.postChangeEmail);
router.post('/change_password', urlEncoded, redirectLogin, middleware.postChangePassword);
router.post('/delete_your_account', urlEncoded, redirectLogin, middleware.postDeleteYourAccount);
router.post('/login', urlEncoded, redirectDashboard, middleware.postLogin);
router.post('/password_reset', urlEncoded, middleware.postPasswordReset);
router.post('/password_reset_request', urlEncoded, middleware.postPasswordResetRequest); 
router.post('/register', urlEncoded, redirectDashboard, middleware.postRegister);

module.exports = router;