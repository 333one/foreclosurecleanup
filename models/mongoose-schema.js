"use strict";

const defaultValue = require('../models/values-default');
const stripeValue = require('../models/values-messages-stripe');
const timeValue = require('../models/values-time');

const mongoose = require('mongoose');

const FalseEmailConfirmationRequestSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    numberOfConfirmations: {
        type: Number,
        default: 0,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: timeValue.falseEmailConfirmationRequestExpiration
    }
});

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
        expires: timeValue.recentRequestExpiration
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
        expires: timeValue.recentRequestExpiration
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
    serviceBoardingSecuring: {
        type: String,
        default: 'no',
        required: true
    },   
    serviceDebrisRemovalTrashout: {
        type: String,
        default: 'no',
        required: true
    },
    serviceEvictionManagement: {
        type: String,
        default: 'no',
        required: true
    },
    serviceFieldInspection: {
        type: String,
        default: 'no',
        required: true
    },
    serviceHandymanGeneralMaintenance: {
        type: String,
        default: 'no',
        required: true
    },
    serviceLandscapeMaintenance: {
        type: String,
        default: 'no',
        required: true
    },
    serviceLockChanges: {
        type: String,
        default: 'no',
        required: true
    },
    serviceOverseePropertyRehabilitation: {
        type: String,
        default: 'no',
        required: true
    },
    servicePoolMaintenance: {
        type: String,
        default: 'no',
        required: true
    },
    servicePropertyCleaning: {
        type: String,
        default: 'no',
        required: true
    },
    serviceWinterizations: {
        type: String,
        default: 'no',
        required: true
    },
    upgradeRenewalDates: {
        type: Array
    },
    URLNotActiveError: {
        type: Boolean,
        default: false,
        required: true
    }
});

const FalseEmailConfirmationRequest = mongoose.model('falseEmailConfirmationRequest', FalseEmailConfirmationRequestSchema);
const LoginFailure = mongoose.model('loginFailure', LoginFailureSchema);
const PasswordResetRequest = mongoose.model('passwordResetRequest', PasswordResetRequestSchema);
const RecentDeletedAccount = mongoose.model('recentDeletedAccount', RecentDeletedAccountSchema);
const RecentPasswordResetSuccess = mongoose.model('recentPasswordResetSuccess', RecentPasswordResetSuccessSchema);
const StripeCancelKey = mongoose.model('stripeCancelKey', StripeCancelKeySchema);
const StripeCheckoutSession = mongoose.model('stripeCheckoutSession', StripeCheckoutSessionSchema);
const StripeSuccessKey = mongoose.model('stripeSuccessKey', StripeSuccessKeySchema);
const UnverifiedUser = mongoose.model('unverifiedUser', UnverifiedUserSchema);
const User = mongoose.model('user', UserSchema);

module.exports = { FalseEmailConfirmationRequest, LoginFailure, PasswordResetRequest, RecentDeletedAccount, RecentPasswordResetSuccess, StripeCancelKey, StripeCheckoutSession, StripeSuccessKey, UnverifiedUser, User };