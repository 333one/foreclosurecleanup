const schedule = require('node-schedule');

const accountExpirations = require('./account-expirations');
const emailReminders = require('./email-reminders');

exports.turnOnScheduledEvents = function() {

    // Run this at 1am every night.
    const scheduleAccountExpirations = schedule.scheduleJob('* 1 * * *', function() {
        accountExpirations.expireOldPremiumAccounts();
    });

    // Run this at 1:15am every night.
    const scheduleFirstAlertEmailReminders = schedule.scheduleJob('15 1 * * *', function() {
        emailReminders.firstAlertBeforeExpiration();
    });

    // Run this at 1:30am every night.
    const scheduleSecondAlertEmailReminders = schedule.scheduleJob('30 1 * * *', function() {
        emailReminders.secondAlertBeforeExpiration();
    });

    // Run this at 1:45am every night.
    const scheduleFinalAlertEmailReminders = schedule.scheduleJob('45 1 * * *', function() {
        emailReminders.finalAlertBeforeExpiration();
    });

}