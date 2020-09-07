"use strict";

const { 
    FalseEmailConfirmationRequest,
    LoginFailure,
    PasswordResetRequest,
    RecentDeletedAccount,
    RecentPasswordResetSuccess,
    UnverifiedUser,
    User
} = require('../models/mongoose-schema');

exports.createFalseEmailConfirmationRequest = function(email) {

    const fakeEmailRequest = new FalseEmailConfirmationRequest({
        email: email
    });

    return fakeEmailRequest;
}

exports.createLoginFailure = function(email) {

    const loginFailure = new LoginFailure({
        email: email
    });

    return loginFailure;
}

exports.createRecentDeletedAccount = function(email) {

    const recentDeletedAccount = new RecentDeletedAccount({
        email: email
    });

    return recentDeletedAccount;
}

exports.createRecentPasswordResetSuccess = function(email) {
    const recentPasswordResetSuccess = new RecentPasswordResetSuccess({
        email: email
    });

    return recentPasswordResetSuccess;
}

exports.createPasswordResetRequest = function(email, confirmationHash) {

    const passwordResetRequest = new PasswordResetRequest({
        email: email,
        confirmationHash: confirmationHash
    });

    return passwordResetRequest;
}

exports.createUnverifiedUser = function(email) {

    const unverifiedUser = new UnverifiedUser({
        email: email,
        password: undefined,
        confirmationHash: undefined
    });

    return unverifiedUser;
}

exports.createUser = function(unverifiedUser) {

    const user = new User({
        email: unverifiedUser.email,
        password: unverifiedUser.password
    });

    return user;
}