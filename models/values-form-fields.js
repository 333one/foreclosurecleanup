exports.addChangeCompanyAddress = ['companyCity', 'companyState', 'companyStreet', 'companyStreetTwo', 'companyZip', 'overrideUsps', 'deleteProperty'];

exports.addChangeCompanyDescription = ['companyDescription', 'deleteProperty'];

exports.addChangeCompanyName = ['companyName', 'deleteProperty'];

exports.addChangeCompanyPhone = ['companyPhone', 'deleteProperty'];

exports.addChangeCompanyServices = [
    'serviceBoardingSecuring',
    'serviceDebrisRemovalTrashout',
    'serviceEvictionManagement',
    'serviceFieldInspection',
    'serviceHandymanGeneralMaintenance',
    'serviceLandscapeMaintenance',
    'serviceLockChanges',
    'serviceOverseePropertyRehabilitation',
    'servicePoolMaintenance',
    'servicePropertyCleaning',
    'serviceWinterizations',
    'deleteProperty'
];

exports.addChangeCompanyWebsite = ['companyWebsite', 'deleteProperty'];

exports.changeEmail = ['newEmail', 'emailConfirmation', 'passwordCheck'];

exports.changePassword = ['passwordCurrent', 'password', 'passwordConfirm'];

exports.deleteYourAccount = ['password'];

exports.login = ['email', 'password'];

exports.passwordReset = ['password', 'passwordConfirm'];

exports.passwordResetRequest = ['email'];

exports.register = ['email', 'password', 'passwordConfirm', 'termsOfUse'];

exports.requestAnotherConfirmation = ['email'];