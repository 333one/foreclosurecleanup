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
    email: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        default: '',
        required: false
    },
    lastName: {
        type: String,
        default: '',
        required: false
    },
    phone: {
        type: String,
        default: '',
        required: false
    },
    password: {
        type: String,
        required: true
    }
});

const FalseEmailConfirmationRequest = mongoose.model('falseEmailConfirmationRequest', FalseEmailConfirmationRequestSchema);
const LoginFailure = mongoose.model('loginFailure', LoginFailureSchema);
const PasswordResetRequest = mongoose.model('passwordResetRequest', PasswordResetRequestSchema);
const User = mongoose.model('user', UserSchema);
const UnverifiedUser = mongoose.model('unverifiedUser', UnverifiedUserSchema);

module.exports = { FalseEmailConfirmationRequest, LoginFailure, PasswordResetRequest, User, UnverifiedUser };