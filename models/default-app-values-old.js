"use strict"

let costProduct_1 = 2000

exports.accountDefault = 'Free Profile';
exports.accountUpgrade = 'Premium Profile';

exports.companyCityField = {
    minLength: 3,
    maxLength: 35,
    get attributes() {
        return `type=text maxLength=${this.maxLength}`;
    }
}

exports.companyDescriptionField = {
    minLength: 10,
    maxLength: 200,
    rows: 5,
    get attributes() {
        return `rows=${this.rows} minLength=${ this.minLength } maxLength=${this.maxLength}`;
    }
}

exports.companyNameField = {
    minLength: 2,
    maxLength: 35,
    get attributes() {
        return `type=text maxLength=${this.maxLength}`;
    }
}

exports.companyPhoneField = {
    minLength: 10,
    maxLength: 20,
    get attributes() {
        return `type=tel maxLength=${this.maxLength}`;
    }
}

exports.companyStreetField = {
    minLength: 5,
    maxLength: 60,
    get attributes() {
        return `type=text maxLength=${this.maxLength}`;
    }
}

exports.companyWebsiteField = {
    maxLength: 50,
    get attributes() {
        return `type=text maxLength=${this.maxLength}`;
    }
}

exports.companyZipField = {
    minLength: 5,
    maxLength: 5,
    get attributes() {
        return `type=text maxLength=${this.maxLength}`;
    }
}

exports.companyIcon = 'https://www.foreclosurecleanup.org/images/foreclosure-cleanup-logo.png';

exports.costInDollarsProduct_1 = `$${costProduct_1 / 100}`;

exports.emailField = {
    minLength: 5,
    maxLength: 50,
    get attributes() {
        return `type=email maxLength=${this.maxLength}`;
    }
}

exports.falseEmailConfirmationRequestExpiration = 2 * 60 * 60;

//  This old, fake date is used as a filler for a required value in the User Schema.
exports.freeAccountExpiration = new Date('Mon Jan 01 1900 00:00:00 GMT-0700 (Mountain Standard Time)');

exports.host = 'http://localhost:8080';

exports.loginFailureExpiration = 20 * 60;

// 30 days
exports.upgradeExpirationAlarmTime = 30;

exports.numberOfEmailConfirmationsAllowed = 4;

exports.numberOfLoginFailuresAllowed = 4;

exports.numberOfPasswordResetRequestsAllowed = 4;

exports.organization = 'Foreclosure Cleanup.org';

exports.stripeCancelSuccessKeyExpiration = 60 * 60;

exports.stripeCheckoutSessionExpiration = 24 * 60 * 60;

exports.stripeProductDataDescription_1 = 'Upgrade your account to Premium for 12 months.  Thanks for supporting the site!';
exports.stripeProductDataImages_1_a = 'https://www.foreclosurecleanup.org/images/foreclosure-cleanup-stripe-image.png';
exports.stripeProductDataName_1 = 'Upgrade To Premium';
exports.stripeProductDataUnitAmount_1 = costProduct_1;

exports.passwordField = {
    size: 1,
    maxLength: 25,
    attributes(errorType = null) {
        return `type=password size=${this.size} maxLength=${this.maxLength} data-errortype=${ errorType }`;
    }
}

exports.patternCapitalizeEveryWord = '(^\\w{1})|(\\s{1}\\w{1})';

exports.patternCharacterOrNumber = '[A-Z0-9]';

exports.patternCompanyCity = "[A-Z\\-\\' ]";
exports.messageCompanyCityPattern = 'letters A - Z or special characters - \'';

exports.patternCompanyDescription = "[A-Z0-9,.?!\\'#$%&\\-= ]";
exports.messageCompanyDescriptionPattern = 'letters A - Z, numbers 0 - 9 or special characters , . ? ! \' # $ % & - =';

exports.patternEmail = "[A-Z0-9.!#$%&\'*+-/=?^_`{|}~]";
exports.messageEmailPattern = 'letters A - Z, numbers 0 - 9 or special characters . ! # $ % & \' * + - / = ? ^ _ ` { | } ~';

exports.patternCompanyName = "[A-Z0-9\\-\\' ]";
exports.messageCompanyNamePattern = 'letters A - Z, numbers 0 - 9 or special characters - \'';

exports.patternPassword = "[A-Z0-9`~!@#$%^&*()_=+[{]}\|;:,<.>/?\\-\\'\"]";
exports.messagePasswordPattern = 'letters A - Z, numbers 0 - 9 or special characters `~ ! @ # $ % ^ & * ( ) _ = + [ { ] } \ | ; : , < . > / ? - \' "';

exports.patternCompanyStreet = "[A-Z0-9 ]";
exports.messageCompanyStreetPattern = 'letters A - Z and numbers 0 - 9';

exports.patternCompanyStreetTwo = "[A-Z0-9\\-\\ ]";
exports.messageCompanyStreetTwoPattern = 'letters A - Z, numbers 0 - 9 or special character - ';

exports.patternCompanyWebsite = "[A-Z0-9\\-._~]";
exports.messageCompanyWebsitePattern = 'letters A - Z, numbers 0 - 9 or special characters - . _ ~';

exports.patternCompanyZip = '[0-9]';
exports.messageCompanyZipPattern = 'numbers 0 - 9';

// Users can't extend their premium account again if it is more than this many days from expiration.
exports.premiumAccountExtendsCutoff = 729;

// Premium accounts last 1 year.
exports.premiumUserExpiration = 365 * 24 * 60 * 60;

exports.passwordResetRequestExpiration = 1 * 60 * 60;

exports.port = 8080;

exports.recentRequestExpiration = 5 * 60;

exports.serviceBoardingSecuring = 'Boarding&nbsp;&amp;&nbsp;Securing';
exports.serviceDebrisRemovalTrashout = 'Debris&nbsp;Removal&nbsp;&amp;&nbsp;Trashout';
exports.serviceEvictionManagement = 'Eviction&nbsp;Management';
exports.serviceFieldInspection = 'Field&nbsp;Inspection';
exports.serviceHandymanGeneralMaintenance = 'Handyman&nbsp;&amp;&nbsp;General&nbsp;Maintenance';
exports.serviceLandscapeMaintenance = 'Landscape&nbsp;Maintenance';
exports.serviceLockChanges = 'Lock&nbsp;Changes';
exports.serviceOverseePropertyRehabilitation = 'Oversee&nbsp;Property&nbsp;Rehabilitation';
exports.servicePoolMaintenance = 'Pool&nbsp;Maintenance';
exports.servicePropertyCleaning = 'Property&nbsp;Cleaning';
exports.serviceWinterizations = 'Winterizations';

exports.unverifiedUserExpiration = 2 * 60 * 60;

exports.website = 'https://www.foreclosurecleanup.org'