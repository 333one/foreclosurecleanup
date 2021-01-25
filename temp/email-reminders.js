const communication = require('./communication');
const defaultValue = require('../models/default-values');
const emailMessage = require('../models/email-messages');
const logicUserAccounts = require('./logic-user-accounts');
const siteValue = require('../models/site-values');
const stripeValue = require('../models/stripe-values');
const timeValue = require('../models/time-values');

const { logErrorMessage } = require('./error-handling');

const { User } = require('../models/mongoose-schema');

function sendExpirationEmail(email, companyName, numberOfDaysUntilExpiration, price) {

    let emailSubject = emailMessage.alertBeforeExpirationSubject(numberOfDaysUntilExpiration);
    let emailBody = emailMessage.alertBeforeExpirationBody(companyName, numberOfDaysUntilExpiration, price);
    communication.sendEmail(siteValue.noReplyEmail, email, emailSubject, emailBody);

}

exports.firstAlertBeforeExpiration = async function() {

    let closestDate = new Date();
    closestDate.setDate(closestDate.getDate() + timeValue.secondAlertBeforeExpiration);

    let furthestDate = new Date();
    furthestDate.setDate(furthestDate.getDate() + timeValue.firstAlertBeforeExpiration);

    let users = await User.find({
            $and: [
                { 'expirationDate': { $gte: closestDate, $lte: furthestDate } },
                { companyProfileType: { $ne: defaultValue.accountDefault } },
                { 'alerts.firstExpirationAlertAlreadySent': { $ne: true } }
            ]
        })
        .catch(function(error) {
            logErrorMessage(error);
        });

    if (users.length > 0) {

        let price = stripeValue.costInDollarsProduct_1;

        users.forEach(async function(element) {

            let { email, companyName, expirationDate } = element;
            let numberOfDaysUntilExpiration = logicUserAccounts.getNumberOfDaysUntilExpiration(expirationDate);

            sendExpirationEmail(email, companyName, numberOfDaysUntilExpiration, price);
        
            await User.updateOne({ email }, { 'alerts.firstExpirationAlertAlreadySent' : true })
                .catch(function(error) {
                    logErrorMessage(error);
                });

        });

    }

}

exports.secondAlertBeforeExpiration = async function() {

    let closestDate = new Date();
    closestDate.setDate(closestDate.getDate() + timeValue.finalAlertBeforeExpiration);

    let furthestDate = new Date();
    furthestDate.setDate(furthestDate.getDate() + timeValue.secondAlertBeforeExpiration);

    let users = await User.find({
            $and: [
                { 'expirationDate': { $gte: closestDate, $lte: furthestDate } },
                { companyProfileType: { $ne: defaultValue.accountDefault } },
                { 'alerts.secondExpirationAlertAlreadySent': { $ne: true } }
            ]
        })
        .catch(function(error) {
            logErrorMessage(error);
        });

    if (users.length > 0) {

        let price = stripeValue.costInDollarsProduct_1;

        users.forEach(async function(element) {

            let { email, companyName, expirationDate } = element;
            let numberOfDaysUntilExpiration = logicUserAccounts.getNumberOfDaysUntilExpiration(expirationDate);

            sendExpirationEmail(email, companyName, numberOfDaysUntilExpiration, price);
        
            await User.updateOne({ email }, { 'alerts.secondExpirationAlertAlreadySent' : true })
                .catch(function(error) {
                    logErrorMessage(error);
                });

        });

    }

}

exports.finalAlertBeforeExpiration = async function() {
    
    let closestDate = new Date();

    let furthestDate = new Date();
    furthestDate.setDate(furthestDate.getDate() + timeValue.finalAlertBeforeExpiration);

    let users = await User.find({  
            $and: [
                { 'expirationDate': { $gte: closestDate, $lte: furthestDate } },
                { companyProfileType: { $ne: defaultValue.accountDefault } },
                { 'alerts.finalExpirationAlertAlreadySent': { $ne: true } }
            ]
        })
        .catch(function(error) {
            logErrorMessage(error);
        });

    if (users.length > 0) {

        let price = stripeValue.costInDollarsProduct_1;

        users.forEach(async function(element) {

            let { email, companyName, expirationDate } = element;
            let numberOfDaysUntilExpiration = logicUserAccounts.getNumberOfDaysUntilExpiration(expirationDate);

            sendExpirationEmail(email, companyName, numberOfDaysUntilExpiration, price);
        
            await User.updateOne({ email }, { 'alerts.finalExpirationAlertAlreadySent' : true })
                .catch(function(error) {
                    logErrorMessage(error);
                });

        });

    }
    
}