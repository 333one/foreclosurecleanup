"use strict";

const defaultAppValues = require('./default-app-values.js');

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
        expires: defaultAppValues.falseEmailConfirmationRequestExpiration
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
        expires: defaultAppValues.loginFailureExpiration
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
        expires: defaultAppValues.passwordResetRequestExpiration
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

const PremiumUserSchema = new mongoose.Schema({
    businessAbout: {
        type: String,
        default: '',
        required: false
    },
    businessWeb: {
        type: String,
        default: '',
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: defaultAppValues.premiumUserExpiration
    },
    email: {
        type: String,
        required: true
    }
});

const RecentDeletedAccountSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now,
        expires: defaultAppValues.recentRequestExpiration
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
        expires: defaultAppValues.recentRequestExpiration
    },
    email: {
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
        expires: defaultAppValues.unverifiedUserExpiration
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
    businessCity: {
        type: String,
        default: '',
        required: false
    },
    businessName: {
        type: String,
        default: '',
        required: false
    },
    businessPhone: {
        type: String,
        default: '',
        required: false
    },
    businessState: {
        type: String,
        default: '',
        required: false
    },
    businessStreet: {
        type: String,
        default: '',
        required: false
    },
    businessStreetTwo: {
        type: String,
        default: '',
        required: false
    },
    businessZip: {
        type: String,
        default: '',
        required: false
    },
    live: {
        type: Boolean,
        default: false,
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
    createdAt: {
        type: Date,
        default: Date.now,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const FalseEmailConfirmationRequest = mongoose.model('falseEmailConfirmationRequest', FalseEmailConfirmationRequestSchema);
const LoginFailure = mongoose.model('loginFailure', LoginFailureSchema);
const PasswordResetRequest = mongoose.model('passwordResetRequest', PasswordResetRequestSchema);
const RecentDeletedAccount = mongoose.model('recentDeletedAccount', RecentDeletedAccountSchema);
const RecentPasswordResetSuccess = mongoose.model('recentPasswordResetSuccess', RecentPasswordResetSuccessSchema);
const UnverifiedUser = mongoose.model('unverifiedUser', UnverifiedUserSchema);
const User = mongoose.model('user', UserSchema);

module.exports = { FalseEmailConfirmationRequest, LoginFailure, PasswordResetRequest, RecentDeletedAccount, RecentPasswordResetSuccess, UnverifiedUser, User };