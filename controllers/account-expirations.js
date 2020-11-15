"use strict";

const defaultValue = require('../models/default-values');
const timeValue = require('../models/time-values');

const { logErrorMessage } = require('./error-handling');

const { User } = require('../models/mongoose-schema');

exports.expireOldPremiumAccounts = async function() {

    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let users = await User.find({
            $and: [
                { 'expirationDate': { $lte: yesterday } },
                { companyProfileType: { $ne: defaultValue.accountDefault } }
            ]
        })
        .catch(function(error) {
            logErrorMessage(error);
        });

    if (users.length > 0) {

        users.forEach(async function(element) {

            let { email } = element;
        
            await User.updateOne({ email },
                { 
                    'alerts.firstExpirationAlertAlreadySent': false,
                    'alerts.secondExpirationAlertAlreadySent': false,
                    'alerts.finalExpirationAlertAlreadySent': false,
                    companyProfileType: defaultValue.accountDefault,
                    expirationDate: timeValue.freeAccountExpiration,
                    companyWebsite: '',
                    companyDescription: ''
                })
                .catch(function(error) {
                    logErrorMessage(error);
                });

        });

    }

};