"use strict";

const mongoose = require('mongoose');
const timeZone = require('mongoose-timezone');

const defaultValue = require('../models/default-values');
const stripeValue = require('../models/stripe-values');
const timeValue = require('../models/time-values');

const LoginFailureSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    numberOfFailures: {
        type: Number,
        default: 1,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: timeValue.loginFailureExpiration
    }

});

const PasswordResetRequestSchema = new mongoose.Schema({
    confirmationHash: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: timeValue.passwordResetRequestExpiration
    },
    email: {
        type: String,
        required: true
    },
    numberOfRequests: {
        type: Number,
        default: 1,
        required: true,
    },
    successHash: {
        type: String,
        required: true
    }

});

const RecentDeletedAccountSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now,
        expires: timeValue.shortTermActivityExpiration
    },
    email: {
        type: String,
        required: true
    }

});

const StripeCheckoutSessionSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now,
        expires: stripeValue.checkoutSessionExpiration
    },
    email: {
        type: String,
        required: true
    },
    paymentIntent: {
        type: String,
        required: true
    },
    stripeCancelKey: {
        type: String,
        required: true
    },
    stripeSuccessKey: {
        type: String,
        required: true
    },
    wasDbAlreadyUpdatedByWebhook: {
        type: Boolean,
        default: false,
        required: true
    }

});

const UnverifiedUserSchema = new mongoose.Schema({
    confirmationHash: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: timeValue.unverifiedUserExpiration
    },
    email: {
        type: String,
        required: true
    },
    numberOfConfirmations: {
        type: Number,
        default: 0,
        required: true,
    },
    password: {
        type: String,
        required: true
    }

});

const UserSchema = new mongoose.Schema({
    accountSuspended: {
        type: Boolean,
        default: false,
        required: true
    },
    alerts: {
        firstExpirationAlertAlreadySent: {
            type: Boolean,
            default: false,
            required: true
        },
        secondExpirationAlertAlreadySent: {
            type: Boolean,
            default: false,
            required: true
        },
        finalExpirationAlertAlreadySent: {
            type: Boolean,
            default: false,
            required: true
        }
    },
    companyCity: {
        type: String,
        default: '',
        required: false
    },
    companyDescription: {
        type: String,
        default: '',
        required: false
    },
    companyName: {
        type: String,
        default: '',
        required: false
    },
    companyPhone: {
        type: String,
        default: '',
        required: false
    },
    companyProfileType: {
        type: String,
        default: defaultValue.accountDefault,
        required: true
    },
    companyState: {
        type: String,
        default: '',
        required: false
    },
    companyStreet: {
        type: String,
        default: '',
        required: false
    },
    companyStreetTwo: {
        type: String,
        default: '',
        required: false
    },
    companyWebsite: {
        type: String,
        default: '',
        required: false
    },
    companyZip: {
        type: String,
        default: '',
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    email: {
        type: String,
        required: true
    },
    expirationDate: {
        type: Date,
        default: timeValue.freeAccountExpiration,
        required: true
    },
    live: {
        type: Boolean,
        default: false,
        required: true
    },                                  
    password: {
        type: String,
        required: true
    },
    shouldBrowserFocusOnURLNotActiveError: {
        type: Boolean,
        default: false,
        required: true
    },
    upgradeRenewalDates: {
        type: Array
    },
    urlNotActiveError: {
        type: Boolean,
        default: false,
        required: true
    },
    boardingSecuring: {
        type: Boolean,
        default: false,
        required: true
    },   
    debrisRemovalTrashout: {
        type: Boolean,
        default: false,
        required: true
    },
    evictionManagement: {
        type: Boolean,
        default: false,
        required: true
    },
    fieldInspection: {
        type: Boolean,
        default: false,
        required: true
    },
    handymanGeneralMaintenance: {
        type: Boolean,
        default: false,
        required: true
    },
    landscapeMaintenance: {
        type: Boolean,
        default: false,
        required: true
    },
    lockChanges: {
        type: Boolean,
        default: false,
        required: true
    },
    overseePropertyRehabilitation: {
        type: Boolean,
        default: false,
        required: true
    },
    poolMaintenance: {
        type: Boolean,
        default: false,
        required: true
    },
    propertyCleaning: {
        type: Boolean,
        default: false,
        required: true
    },
    winterizations: {
        type: Boolean,
        default: false,
        required: true
    }
    
});

const LoginFailure = mongoose.model('loginFailure', LoginFailureSchema);
const PasswordResetRequest = mongoose.model('passwordResetRequest', PasswordResetRequestSchema);
const RecentDeletedAccount = mongoose.model('recentDeletedAccount', RecentDeletedAccountSchema);
const StripeCheckoutSession = mongoose.model('stripeCheckoutSession', StripeCheckoutSessionSchema);
const UnverifiedUser = mongoose.model('unverifiedUser', UnverifiedUserSchema);

UserSchema.plugin(timeZone, { paths: ['expirationDate'] });
const User = mongoose.model('user', UserSchema);


module.exports = { 
    LoginFailure,
    PasswordResetRequest,
    RecentDeletedAccount,
    StripeCheckoutSession,
    UnverifiedUser,
    User
};