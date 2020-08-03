"use strict"

exports.recentRequestExpiration = 5 * 60;

exports.businessAboutUsField = {
    maxLength: 100,
    rows: 5,
    get attributes() {
        return `rows=${this.rows} maxLength=${this.maxLength}`;
    }
}

exports.businessCityField = {
    minLength: 3,
    maxLength: 35,
    get attributes() {
        return `type=text maxLength=${this.maxLength}`;
    }
}

exports.businessNameField = {
    minLength: 2,
    maxLength: 35,
    get attributes() {
        return `type=text maxLength=${this.maxLength}`;
    }
}

exports.businessPhoneField = {
    minLength: 10,
    maxLength: 20,
    get attributes() {
        return `type=tel maxLength=${this.maxLength}`;
    }
}

exports.businessStreetField = {
    minLength: 5,
    maxLength: 60,
    get attributes() {
        return `type=text maxLength=${this.maxLength}`;
    }
}

exports.businessWebsiteField = {
    minLength: 5,
    maxLength: 50,
    get attributes() {
        return `type=text minLength=${this.minLength} maxLength=${this.maxLength}`;
    }
}

exports.businessZipField = {
    minLength: 5,
    maxLength: 5,
    get attributes() {
        return `type=text maxLength=${this.maxLength}`;
    }
}

exports.emailField = {
    minLength: 5,
    maxLength: 50,
    get attributes() {
        return `type=email maxLength=${this.maxLength}`;
    }
}

exports.falseEmailConfirmationRequestExpiration = 2 * 60 * 60;

exports.loginFailureExpiration = 20 * 60;

exports.numberOfEmailConfirmationsAllowed = 4;

exports.numberOfLoginFailuresAllowed = 4;

exports.numberOfPasswordResetRequestsAllowed = 4;

exports.passwordField = {
    size: 1,
    maxLength: 25,
    attributes(errorType = null) {
        return `type=password size=${this.size} maxLength=${this.maxLength} data-errortype=${ errorType }`;
    }
}

exports.passwordResetRequestExpiration = 1 * 60 * 60;

exports.unverifiedUserExpiration = 2 * 60 * 60;