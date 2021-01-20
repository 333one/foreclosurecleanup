//  Old, fake date used as a filler for a required value in the User schema.
exports.freeAccountExpiration = new Date('Mon Jan 01 1900 00:00:00 GMT-0700 (Mountain Standard Time)');

exports.getExpirationTime = function(expiration) {

    let minutes = expiration / 60;
    let hours = minutes / 60;
    let days = hours / 24;

    if (minutes === 1) return `${ minutes } minute`;
    if (minutes < 60) return `${ minutes } minutes`;
    if (minutes === 60) return `${ hours } hour`;
    if (minutes < 1440) return `${ hours } hours`;
    if (minutes === 1440) return `${ days } day`;

}

exports.getNumberOfDaysUntilExpirationFragment = function(numberOfDaysUntilExpiration) {

    if (numberOfDaysUntilExpiration === 0) return 'today';
    if (numberOfDaysUntilExpiration === 1) return 'in 1 day';
    return `in ${ numberOfDaysUntilExpiration } days`;

}

// 1 day
exports.finalAlertBeforeExpiration = 1;

// 30 days
exports.firstAlertBeforeExpiration = 30;

// 20 minutes
exports.loginFailureExpiration = 20 * 60;

// 1 hour
exports.passwordResetRequestExpiration = 1 * 60 * 60;

// 7 days
exports.secondAlertBeforeExpiration = 7;

// 5 minutes
exports.shortTermActivityExpiration = 5 * 60;

// 2 years - 1 day.  Users can't extend their premium account again if it is more than this many days from expiration.
exports.upgradeAccountExtendsCutoff = 729;

// Premium accounts last 1 year.
exports.upgradeUserExpiration = 365 * 24 * 60 * 60;

// 2 hours
exports.unverifiedUserExpiration = 2 * 60 * 60;