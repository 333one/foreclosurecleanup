"use strict"

exports.businessAboutUsField = {
    maxLength: 100,
    rows: 5,
    get attributes() {
        return `rows=${this.rows} maxLength=${this.maxLength}`
    }
}

exports.businessAddressField = {
    minLength: 5,
    maxLength: 50,
    get attributes() {
        return `type=text minLength=${this.minLength} maxLength=${this.maxLength}`
    }
}

exports.businessUnitField = {
    size: 8,
    maxLength: 8,
    get attributes() {
        return `type=text size=${this.size} maxLength=${this.maxLength}`
    }
}

exports.businessWebsiteField = {
    minLength: 5,
    maxLength: 50,
    get attributes() {
        return `type=text minLength=${this.minLength} maxLength=${this.maxLength}`
    }
}

exports.businessZipCodeField = {
    minLength: 5,
    maxLength: 5,
    get attributes() {
        return `type=text minLength=${this.minLength} maxLength=${this.maxLength}`
    }
}

exports.companyDescriptionField = {
    maxLength: 250,
    get attributes() {
        return `type=text maxLength=${this.maxLength}`
    }
}

exports.emailField = {
    minLength: 5,
    maxLength: 50,
    get attributes() {
        return `type=email minLength=${this.minLength} maxLength=${this.maxLength}`
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

exports.phoneField = {
    minLength: 10,
    maxLength: 20,
    get attributes() {
        return `type=tel minLength=${this.minLength} maxLength=${this.maxLength}`
    }
}

exports.unverifiedUserExpiration = 2 * 60 * 60;

exports.yourNameField = {
    maxLength: 25,
    get attributes() {
        return `type=text maxLength=${this.maxLength}`
    }
}