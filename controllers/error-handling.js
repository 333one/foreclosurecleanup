"use strict";

const path = require('path');

const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log' })
    ]
});

const siteValue = require('../models/site-values');

function sendToLogger(error) {

    logger.log({
        time: new Date().toLocaleString("en-US", { timeZone: "America/Phoenix" }),
        level: 'error',
        message: error.message
    });
    
}

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

exports.wrapAsync = function(wrappedFunction) {

    return function(req, res, next) {
        wrappedFunction(req, res, next).catch(next);
    }

}