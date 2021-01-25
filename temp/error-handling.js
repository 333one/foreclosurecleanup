const path = require('path');

const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log' })
    ]
});

const communication = require('./communication');
const siteValue = require('../models/site-values');

function sendToLogger(error) {

    logger.log({
        time: new Date().toLocaleString("en-US", { timeZone: "America/Phoenix" }),
        level: 'error',
        message: error.message
    });
    
}

exports.customExpressErrorHandler = function(error, req, res, next) {

    if (siteValue.projectStatus === 'development') {

        console.log(error.message);
        console.log(error.stack);

    } else {

        sendToLogger(error);

        let emailSubject = `${ error.name } on ${ siteValue.organization } server`;
        let emailBody =  `<p style="bottom-margin: 32px">${ error.message }</p><p>${ error.stack }</p>`;
        communication.sendEmail(siteValue.errorEmail, siteValue.sendServerErrorsHere, emailSubject, emailBody);

    } 

    res.sendFile(path.join(__dirname, '../views/public/html/50x.html'));

};

exports.logErrorMessage = function(error) {

    sendToLogger(error);

}

exports.wrapAsync = function(wrappedFunction) {

    return function(req, res, next) {
        wrappedFunction(req, res, next).catch(next);
    }

}