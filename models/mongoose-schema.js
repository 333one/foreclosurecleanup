"use strict";

const defaultValue = require('../models/default-values');
const stripeValue = require('../models/stripe-values');
const timeValue = require('../models/time-values');

const mongoose = require('mongoose');

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

const RecentPasswordResetSuccessSchema = new mongoose.Schema({
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

const StripeCancelKeySchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now,
        expires: stripeValue.cancelSuccessKeyExpiration
    },
    email: {
        type: String,
        required: true
    },
    entryKey: {
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
    }
});

const StripeSuccessKeySchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now,
        expires: stripeValue.cancelSuccessKeyExpiration
    },
    email: {
        type: String,
        required: true
    },
    entryKey: {
        type: String,
        required: true
    },
    paymentIntent: {
        type: String,
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
        default: Date.now
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
const RecentPasswordResetSuccess = mongoose.model('recentPasswordResetSuccess', RecentPasswordResetSuccessSchema);
const StripeCancelKey = mongoose.model('stripeCancelKey', StripeCancelKeySchema);
const StripeCheckoutSession = mongoose.model('stripeCheckoutSession', StripeCheckoutSessionSchema);
const StripeSuccessKey = mongoose.model('stripeSuccessKey', StripeSuccessKeySchema);
const UnverifiedUser = mongoose.model('unverifiedUser', UnverifiedUserSchema);
const User = mongoose.model('user', UserSchema);

module.exports = { LoginFailure, PasswordResetRequest, RecentDeletedAccount, RecentPasswordResetSuccess, StripeCancelKey, StripeCheckoutSession, StripeSuccessKey, UnverifiedUser, User };