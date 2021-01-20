const defaultValue = require('../models/default-values');
const renderValue = require('../models/rendering-values');

exports.addChangeCompanyAddress = [
    'companyCity',
    'companyState',
    'companyStreet',
    'companyStreetTwo',
    'companyZip',
    'useOriginalInput',
    'deleteProperty'
];

exports.addChangeCompanyDescription = ['companyDescription', 'deleteProperty'];

exports.addChangeCompanyName = ['companyName', 'deleteProperty'];

exports.addChangeCompanyPhone = ['companyPhone', 'deleteProperty'];

exports.addChangeCompanyServices = ['deleteProperty', ...defaultValue.listOfCompanyServices];

exports.addChangeCompanyWebsite = ['companyWebsite', 'deleteProperty'];

exports.changeEmail = ['changedEmail', 'confirmationEmail', 'currentPassword'];

exports.changePassword = ['currentPassword', 'changedPassword', 'confirmationPassword'];

exports.deleteYourAccount = ['currentPassword'];

exports.foreclosureCleanupVendorList = ['searchRadius', renderValue.searchZipField.name, 'searchType', ...defaultValue.listOfCompanyServices];

exports.login = ['currentEmail', 'currentPassword'];

exports.passwordReset = ['changedPassword', 'confirmationPassword'];

exports.passwordResetRequest = ['currentEmail'];

exports.register = ['newEmail', 'newPassword', 'confirmationPassword', 'privacyTerms'];