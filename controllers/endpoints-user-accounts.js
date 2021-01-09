const bodyParser = require('body-parser');
const express = require('express');

const middlewareUserAccounts = require('./middleware-user-accounts');
const { redirectIfNoUpgrade, redirectLogin, redirectMyAccount } = require('./middleware-user-accounts'); 

const router = express.Router();

const urlEncoded = bodyParser.urlencoded({ extended: true });

router.get('/account-deleted', middlewareUserAccounts.accountDeleted);
router.get('/account-suspended', middlewareUserAccounts.accountSuspended);
router.get('/add-change-company-address', redirectLogin, middlewareUserAccounts.addChangeCompanyAddress);
router.get('/add-change-company-description', redirectLogin, redirectIfNoUpgrade, middlewareUserAccounts.addChangeCompanyDescription);
router.get('/add-change-company-logo', redirectLogin, redirectIfNoUpgrade, middlewareUserAccounts.addChangeCompanyLogo);
router.get('/add-change-company-name', redirectLogin, middlewareUserAccounts.addChangeCompanyName);
router.get('/add-change-company-phone', redirectLogin, middlewareUserAccounts.addChangeCompanyPhone);
router.get('/add-change-company-services', redirectLogin, middlewareUserAccounts.addChangeCompanyServices);
router.get('/add-change-company-website', redirectLogin, redirectIfNoUpgrade, middlewareUserAccounts.addChangeCompanyWebsite);
router.get('/change-email', redirectLogin, middlewareUserAccounts.changeEmail);
router.get('/change-password', redirectLogin, middlewareUserAccounts.changePassword);
router.get('/confirmation-limit-reached', middlewareUserAccounts.confirmationLimitReached);
router.get('/confirmation-sent', middlewareUserAccounts.confirmationSent);
router.get('/delete-your-account', redirectLogin, middlewareUserAccounts.deleteYourAccount);
router.get('/login', redirectMyAccount, middlewareUserAccounts.login);
router.get('/login-failure-limit-reached', redirectMyAccount, middlewareUserAccounts.loginFailureLimitReached);
router.get('/logout', redirectLogin, middlewareUserAccounts.logout);
router.get('/my-account', redirectLogin, middlewareUserAccounts.myAccount);
router.get('/password-reset', middlewareUserAccounts.passwordReset);
router.get('/password-reset-limit-reached', middlewareUserAccounts.passwordResetLimitReached);
router.get('/password-reset-request', middlewareUserAccounts.passwordResetRequest); 
router.get('/password-reset-request-sent', middlewareUserAccounts.passwordResetRequestSent); 
router.get('/password-reset-success', middlewareUserAccounts.passwordResetSuccess);
router.get('/register', middlewareUserAccounts.register);
router.get('/verified', redirectMyAccount, middlewareUserAccounts.verified);

router.post('/add-change-company-address', urlEncoded, redirectLogin, middlewareUserAccounts.postAddChangeCompanyAddress);
router.post('/add-change-company-description', urlEncoded, redirectLogin, redirectIfNoUpgrade, middlewareUserAccounts.postAddChangeCompanyDescription);
router.get('/add-change-company-logo', urlEncoded, redirectLogin, redirectIfNoUpgrade, middlewareUserAccounts.postAddChangeCompanyLogo);
router.post('/add-change-company-name', urlEncoded, redirectLogin, middlewareUserAccounts.postAddChangeCompanyName);
router.post('/add-change-company-phone', urlEncoded, redirectLogin, middlewareUserAccounts.postAddChangeCompanyPhone);
router.post('/add-change-company-services', urlEncoded, redirectLogin, middlewareUserAccounts.postAddChangeCompanyServices);
router.post('/add-change-company-website', urlEncoded, redirectLogin, redirectIfNoUpgrade, middlewareUserAccounts.postAddChangeCompanyWebsite);
router.post('/change-email', urlEncoded, redirectLogin, middlewareUserAccounts.postChangeEmail);
router.post('/change-password', urlEncoded, redirectLogin, middlewareUserAccounts.postChangePassword);
router.post('/delete-your-account', urlEncoded, redirectLogin, middlewareUserAccounts.postDeleteYourAccount);
router.post('/login', urlEncoded, redirectMyAccount, middlewareUserAccounts.postLogin);
router.post('/password-reset', urlEncoded, middlewareUserAccounts.postPasswordReset);
router.post('/password-reset-request', urlEncoded, middlewareUserAccounts.postPasswordResetRequest); 
router.post('/register', urlEncoded, redirectMyAccount, middlewareUserAccounts.postRegister);

module.exports = router;