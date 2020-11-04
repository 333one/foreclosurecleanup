"use strict";

const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log' })
    ]
});

const siteValue = require('../models/site-values');

exports.customExpressErrorHandler = function(error, req, res, next) {

    sendToLogger(error)

    // For rendering.
    let activeLink = 'error500';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;

    res.render('error500', { activeLink, contactEmail, loggedIn });
};

exports.logErrorMessage = function(error) {

    sendToLogger(error);
}

function sendToLogger(error) {

    logger.log({
        time: new Date().toLocaleString("en-US", { timeZone: "America/Phoenix" }),
        level: 'error',
        message: error.message
    });
}

exports.wrapAsync = function(fn) {
    return function(req, res, next) {
        fn(req, res, next).catch(next);
    }
}