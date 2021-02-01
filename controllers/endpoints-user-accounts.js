const bodyParser = require('body-parser');
const cryptoRandomString = require('crypto-random-string');

const express = require('express');
const router = express.Router();

const path = require('path');

// multer
const multer = require('multer');
const { vendorLogoUploadFolder } = require('../models/default-values');
const storage = multer.diskStorage({
    
    destination: vendorLogoUploadFolder,
    filename: function (req, file, cb) {

        let newDate = new Date();

        let todaysDate = newDate.getDate();
        let todaysMonth = newDate.getMonth();
        let todaysYear = newDate.getFullYear() - 2000;

        let firstRandomString = cryptoRandomString({ length: 4, type: 'alphanumeric' });
        let secondRandomString = cryptoRandomString({ length: 4, type: 'alphanumeric' });
        let thirdRandomString = cryptoRandomString({ length: 4, type: 'alphanumeric' });

        cb(null, firstRandomString + todaysDate + secondRandomString + todaysMonth + thirdRandomString + todaysYear + path.extname(file.originalname));

    }

});
const defaultValue = require('../models/default-values');
const upload = multer({ storage, limits: { fields: 1, fieldSize: 50, fileSize: defaultValue.maxVendorLogoUploadFileSizeCutoff } });

const middlewareUserAccounts = require('./middleware-user-accounts');
const { redirectIfNoUpgrade, redirectLogin, redirectMyAccount } = require('./middleware-user-accounts'); 

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

router.post('/add-change-company-address', redirectLogin, urlEncoded, middlewareUserAccounts.postAddChangeCompanyAddress);
router.post('/add-change-company-description', redirectLogin, redirectIfNoUpgrade, urlEncoded, middlewareUserAccounts.postAddChangeCompanyDescription);
router.post('/add-change-company-logo', redirectLogin, redirectIfNoUpgrade, upload.single('companyLogo'), middlewareUserAccounts.postAddChangeCompanyLogo);
router.post('/add-change-company-name', redirectLogin, urlEncoded, middlewareUserAccounts.postAddChangeCompanyName);
router.post('/add-change-company-phone', redirectLogin, urlEncoded, middlewareUserAccounts.postAddChangeCompanyPhone);
router.post('/add-change-company-services', redirectLogin, urlEncoded, middlewareUserAccounts.postAddChangeCompanyServices);
router.post('/add-change-company-website', redirectLogin, redirectIfNoUpgrade, urlEncoded, middlewareUserAccounts.postAddChangeCompanyWebsite);
router.post('/change-email', redirectLogin, urlEncoded, middlewareUserAccounts.postChangeEmail);
router.post('/change-password', redirectLogin, urlEncoded, middlewareUserAccounts.postChangePassword);
router.post('/delete-your-account', redirectLogin, urlEncoded, middlewareUserAccounts.postDeleteYourAccount);
router.post('/login', redirectMyAccount, urlEncoded, middlewareUserAccounts.postLogin);
router.post('/password-reset', urlEncoded, middlewareUserAccounts.postPasswordReset);
router.post('/password-reset-request', urlEncoded, middlewareUserAccounts.postPasswordResetRequest); 
router.post('/register', redirectMyAccount, urlEncoded, middlewareUserAccounts.postRegister);

module.exports = router;