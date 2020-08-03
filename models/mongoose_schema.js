"use strict";

const defaultAppValues = require('./default_app_values.js');

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

const RecentDeletedAccountSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: defaultAppValues.recentRequestExpiration
    }
});

const RecentPasswordResetSuccessSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: defaultAppValues.recentRequestExpiration
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
    businessAbout: {
        type: String,
        default: '',
        required: false
    },
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
    serviceBoardingSecuring: {
        type: String,
        default: false,
        required: false
    },   
    serviceDebrisRemovalTrashout: {
        type: String,
        default: false,
        required: false
    },
    serviceEvictionManagement: {
        type: String,
        default: false,
        required: false
    },
    serviceFieldInspection: {
        type: String,
        default: false,
        required: false
    },
    serviceHandymanGeneralMaintenance: {
        type: String,
        default: false,
        required: false
    },
    serviceLandscapeMaintenance: {
        type: String,
        default: false,
        required: false
    },
    serviceLockChanges: {
        type: String,
        default: false,
        required: false
    },
    serviceOverseePropertyRehabilitation: {
        type: String,
        default: false,
        required: false
    },
    servicePoolMaintenance: {
        type: String,
        default: false,
        required: false
    },
    servicePropertyCleaning: {
        type: String,
        default: false,
        required: false
    },
    serviceWinterizations: {
        type: String,
        default: false,
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