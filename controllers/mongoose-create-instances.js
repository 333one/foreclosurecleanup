"use strict";

const { 
    LoginFailure,
    PasswordResetRequest,
    RecentDeletedAccount,
    StripeCheckoutSession,
    UnverifiedUser,
    User
} = require('../models/mongoose-schema');

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

exports.createPasswordResetRequest = function(email, confirmationHash, successHash) {

    const passwordResetRequest = new PasswordResetRequest({
        confirmationHash,
        email, 
        successHash        
    });

    return passwordResetRequest;

}

exports.createStripeCheckoutSession = function(email, paymentIntent, stripeCancelKey, stripeSuccessKey) {

    const stripeCheckoutSession = new StripeCheckoutSession({
        email,
        paymentIntent,
        stripeCancelKey,
        stripeSuccessKey
    });

    return stripeCheckoutSession;

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