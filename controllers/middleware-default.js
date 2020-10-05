"use strict";

const { logErrorMessage, wrapAsync } = require('./error-handling');

exports.foreclosureCleanupVendorList = wrapAsync(async function(req, res) {
    
    // For rendering.
    let activeLink = 'foreclosure-cleanup-vendor-list';
    let contactEmail = process.env.CONTACT_EMAIL;
    let loggedIn = req.session.userValues ? true : false;

    res.render('foreclosure-cleanup-vendor-list', { activeLink, contactEmail, loggedIn });
});

exports.homePage = wrapAsync(async function(req, res) {
    
    // For rendering.
    let activeLink = 'index';
    let contactEmail = process.env.CONTACT_EMAIL;
    let loggedIn = req.session.userValues ? true : false;

    res.render('index', { activeLink, contactEmail, loggedIn });
});

exports.pageNotFound = wrapAsync(async function(req, res) {

    // For rendering.
    let activeLink = 'page-not-found';
    let contactEmail = process.env.CONTACT_EMAIL;
    let loggedIn = req.session.userValues ? true : false;
    
    res.status(404).render('page-not-found', { activeLink, contactEmail, loggedIn });
});

exports.privacyPolicyTermsService = wrapAsync(async function(req, res) {
    
    // For rendering.
    let activeLink = 'privacy-policy-terms-service';
    let contactEmail = process.env.CONTACT_EMAIL;
    let loggedIn = req.session.userValues ? true : false;

    res.render('privacy-policy-terms-service', { activeLink, contactEmail, loggedIn });
});