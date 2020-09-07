exports.changeAboutMyBusiness = ['aboutMyBusiness'];

exports.addChangeBusinessAddress = ['businessCity', 'businessState', 'businessStreet', 'businessStreetTwo', 'businessZip', 'overrideUsps', 'deleteProperty'];

exports.addChangeBusinessName = ['businessName', 'deleteProperty'];

exports.addChangeBusinessServices = [
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

exports.addChangeBusinessPhone = ['businessPhone', 'deleteProperty'];

exports.changeEmail = ['newEmail', 'emailConfirmation', 'password'];

exports.changePassword = ['passwordCurrent', 'password', 'passwordConfirm'];

exports.deleteYourAccount = ['password'];

exports.login = ['email', 'password'];

exports.passwordReset = ['password', 'passwordConfirm'];

exports.passwordResetRequest = ['email'];

exports.register = ['email', 'password', 'passwordConfirm', 'termsOfUse'];

exports.requestAnotherConfirmation = ['email'];