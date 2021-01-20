const defaultValue = require('../models/default-values');

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

exports.createMongooseSearchObject = function(searchRadiusNumerical, longAndLat, servicesObject) {

    let searchObject = {
        $and: [
            { companyLocation: {
                    $geoWithin: {
                        $centerSphere: [longAndLat, searchRadiusNumerical / defaultValue.radiusOfEarthInMiles]
                    }
                }
            },
            {
                $or: [

                ]
            },
            {
                live: true
            }
        ]

    }

    for (const key in servicesObject) {
        if (servicesObject[key] === true) searchObject.$and[1].$or.push({ [key]: true });
    }

    return searchObject;

}

exports.createMongooseSelectObject = function() {

    let selectObject = {
        companyProfileType: 1,
        companyName: 1,
        companyPhone: 1,
        companyCity: 1,
        companyState: 1,
        companyStreet: 1,
        companyStreetTwo: 1,
        companyZip: 1,
        companyDescription: 1,
        companyLogo: 1,
        companyWebsite: 1
    }

    for (const element of defaultValue.listOfCompanyServices) {
        selectObject[element] = 1;
    }

    return selectObject;

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