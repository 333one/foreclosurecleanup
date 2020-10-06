"use strict";

const { 
    FalseEmailConfirmationRequest,
    LoginFailure,
    PasswordResetRequest,
    RecentDeletedAccount,
    RecentPasswordResetSuccess,
    StripeCheckoutSession,
    UnverifiedUser,
    User
} = require('../models/mongoose-schema');

exports.createFalseEmailConfirmationRequest = function(email) {

    const fakeEmailRequest = new FalseEmailConfirmationRequest({
        email
    });

    return fakeEmailRequest;
}

exports.createLoginFailure = function(email) {

    const loginFailure = new LoginFailure({
        email
    });

    return loginFailure;
}

exports.createRecentDeletedAccount = function(email) {

    const recentDeletedAccount = new RecentDeletedAccount({
        email
    });

    return recentDeletedAccount;
}

exports.createRecentPasswordResetSuccess = function(email) {
    const recentPasswordResetSuccess = new RecentPasswordResetSuccess({
        email
    });

    return recentPasswordResetSuccess;
}

exports.createPasswordResetRequest = function(confirmationHash, email) {

    const passwordResetRequest = new PasswordResetRequest({
        confirmationHash,
        email        
    });

    return passwordResetRequest;
}

exports.createStripeCheckoutSession = function(email, paymentIntent) {

    const stripeCheckoutSession = new StripeCheckoutSession({
        email,
        paymentIntent
    });

    return stripeCheckoutSession;
}

exports.createStripeCancelSuccessKey = function(email, entryKey, paymentIntent, StripeEntryKeyConstructor) {

    const stripeCancelSuccessKey = new StripeEntryKeyConstructor({
        email,
        entryKey,
        paymentIntent
    });

    return stripeCancelSuccessKey;
}

exports.createUnverifiedUser = function(email) {

    const unverifiedUser = new UnverifiedUser({
        email,
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