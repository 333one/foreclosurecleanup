// 2 hours
exports.falseEmailConfirmationRequestExpiration = 2 * 60 * 60;

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

// 20 minutes
exports.loginFailureExpiration = 20 * 60;

// Users can't extend their premium account again if it is more than this many days from expiration.
exports.premiumAccountExtendsCutoff = 729;

// Premium accounts last 1 year.
exports.premiumUserExpiration = 365 * 24 * 60 * 60;

// 1 hour
exports.passwordResetRequestExpiration = 1 * 60 * 60;

// 5 minutes
exports.recentRequestExpiration = 5 * 60;

// 30 days
exports.upgradeExpirationAlarmTime = 30;

// 2 hours
exports.unverifiedUserExpiration = 2 * 60 * 60;