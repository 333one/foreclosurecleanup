"use strict";

const bodyParser = require('body-parser');
const express = require('express');
const flash = require('connect-flash');

const middleware = require('./middleware_user_accounts');
const {
    redirectDashboard,
    redirectIfNoAccountDeleted,
    redirectIfNoConfirmationRequestAllowed,
    redirectIfNoPasswordResetRequestSent,
    redirectIfNoTooManyConfirmations,
    redirectIfNoTooManyLoginFailures,
    redirectIfPasswordResetLimitNotReached,
    redirectIfTooManyConfirmations,
    redirectIfTooManyLoginFailures,
    redirectIfTooManyPasswordResets,
    redirectLogin,
    redirectIfNoPasswordResetSuccess,
    redirectNoSuccessProperty
    } = require('./middleware_user_accounts'); 

const router = express.Router();

const urlEncoded = bodyParser.urlencoded({ extended: true });

router.use(flash());

router.use(middleware.flashMessages);

router.get('/account_deleted', redirectIfNoAccountDeleted, middleware.accountDeleted);
router.get('/change_email', redirectLogin, middleware.changeEmail);
router.get('/change_password', redirectLogin, middleware.changePassword);
router.get('/change_phone', redirectLogin, middleware.changePhone);
router.get('/change_your_name', redirectLogin, middleware.changeYourName);
router.get('/confirmation_limit_reached', middleware.confirmationLimitReached);
router.get('/confirmation_resent', middleware.confirmationResent);
router.get('/dashboard', redirectLogin, middleware.dashboard);
router.get('/delete_your_account', redirectLogin, middleware.deleteYourAccount);
router.get('/login', redirectDashboard, middleware.login);
router.get('/login_failure_limit_reached', middleware.loginFailureLimitReached);
router.get('/logout', redirectLogin, middleware.logout);
router.get('/password_reset', middleware.passwordReset);
router.get('/password_reset_limit_reached', redirectIfPasswordResetLimitNotReached, middleware.passwordResetLimitReached);
router.get('/password_reset_request', middleware.passwordResetRequest); 
router.get('/password_reset_request_sent', redirectIfNoPasswordResetRequestSent, redirectIfTooManyPasswordResets, middleware.passwordResetRequestSent); 
router.get('/password_reset_success', redirectIfNoPasswordResetSuccess, middleware.passwordResetSuccess);
router.get('/register', middleware.register);
router.get('/registration_sent', middleware.registrationSent);
router.get('/request_another_confirmation', redirectDashboard, middleware.requestAnotherConfirmation);
router.get('/verified', redirectDashboard, middleware.verified);

router.post('/change_email', urlEncoded, redirectLogin, middleware.postChangeEmail);
router.post('/change_your_name', urlEncoded, redirectLogin, middleware.postChangeYourName);
router.post('/change_password', urlEncoded, redirectLogin, middleware.postChangePassword);
router.post('/change_phone', urlEncoded, redirectLogin, middleware.postChangePhone);
router.post('/delete_your_account', urlEncoded, redirectLogin, middleware.postDeleteYourAccount);
router.post('/login', urlEncoded, redirectDashboard, middleware.postLogin);
router.post('/password_reset', urlEncoded, middleware.postPasswordReset);
router.post('/password_reset_request', urlEncoded, middleware.postPasswordResetRequest); 
router.post('/register', urlEncoded, redirectDashboard, middleware.postRegister);
router.post('/request_another_confirmation', urlEncoded, redirectDashboard, middleware.postRequestAnotherConfirmation);

module.exports = router;