const mongoose = require('mongoose');
const timeZone = require('mongoose-timezone');

const defaultValue = require('../models/default-values');
const stripeValue = require('../models/stripe-values');
const timeValue = require('../models/time-values');

// Building blocks

let accountDataUnverifiedUser = {
    confirmationHash: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: timeValue.unverifiedUserExpiration
    },
    numberOfConfirmations: {
        type: Number,
        default: 0,
        required: true,
    }
}

let accountDataVerifiedUser = {
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
    companyProfileType: {
        type: String,
        default: defaultValue.accountDefault,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
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
    upgradeRenewalDates: {
        type: Array
    }
}

let companyCoreProperties = {
    companyCity: {
        type: String,
        default: ''
    },
    companyLocation: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [],
            index: '2dsphere'
        }
    },
    companyName: {
        type: String,
        default: ''
    },
    companyPhone: {
        type: String,
        default: ''
    },
    companyState: {
        type: String,
        default: ''
    },
    companyStreet: {
        type: String,
        default: ''
    },
    companyStreetTwo: {
        type: String,
        default: ''
    },
    companyZip: {
        type: String,
        default: ''
    }
}

let companyPremiumProperties = {
    companyDescription: {
        type: String,
        default: ''
    },
    companyLogo: {
        fileName: {
            type: String,
            default: ''
        },
        width: {
            type: String,
            default: ''
        },
        height: {
            type: String,
            default: ''
        },
        listOfPreviousCompanyLogos: {
            type: Array
        }
    },
    companyWebsite: {
        type: String,
        default: ''
    },
    shouldBrowserFocusOnURLNotActiveError: {
        type: Boolean,
        default: false,
        required: true
    },
    urlNotActiveError: {
        type: Boolean,
        default: false,
        required: true
    }
}

let companyServices = {
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
}

let login = {
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
};

// Objects

let unverifiedUserObject = {
    ...accountDataUnverifiedUser,
    ...login
}

let verifiedUserObject = {
    ...accountDataVerifiedUser,
    ...companyCoreProperties,
    ...companyPremiumProperties,
    ...companyServices,
    ...login
}

// Schema

const LoginFailureSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now,
        expires: timeValue.loginFailureExpiration
    },
    email: {
        type: String,
        required: true
    },
    numberOfFailures: {
        type: Number,
        default: 1,
        required: true
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

const UnverifiedUserSchema = new mongoose.Schema(unverifiedUserObject);

const UserSchema = new mongoose.Schema(verifiedUserObject);

// Mongoose stores the time in the wrong timezone.  This fixes that.
UserSchema.plugin(timeZone, { paths: ['expirationDate'] });

// Models

const LoginFailure = mongoose.model('loginFailure', LoginFailureSchema);
const PasswordResetRequest = mongoose.model('passwordResetRequest', PasswordResetRequestSchema);
const RecentDeletedAccount = mongoose.model('recentDeletedAccount', RecentDeletedAccountSchema);
const StripeCheckoutSession = mongoose.model('stripeCheckoutSession', StripeCheckoutSessionSchema);
const UnverifiedUser = mongoose.model('unverifiedUser', UnverifiedUserSchema);
const User = mongoose.model('user', UserSchema);

module.exports = { 
    LoginFailure,
    PasswordResetRequest,
    RecentDeletedAccount,
    StripeCheckoutSession,
    UnverifiedUser,
    User
};