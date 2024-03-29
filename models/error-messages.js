const defaultValue = require('./default-values');
const regexpValue = require('./regexp-values');
const renderValue = require('./rendering-values');

let emailNotValid = 'The email you entered is not valid.';

exports.getChangedConfirmationPasswordError = function(isConfirmationPasswordFilled, doPasswordsMatch) {
    
    let adjective = ' new';

    if (isConfirmationPasswordFilled === false) return confirmationPasswordNotFilled(adjective);
    if (doPasswordsMatch === false) return confirmationPasswordDoesNotMatch(adjective);

}

exports.getChangedEmailConfirmationError = function(isConfirmationEmailFilled, doEmailsMatch) {

    if (isConfirmationEmailFilled === false) return `Please confirm your new email.`;
    if (doEmailsMatch === false) return `Confirmation email did not match.  Please re-enter your new email address.`;

}

exports.getChangedEmailError = function(
    isChangedEmailFilled,
    isChangedEmailInsideMaxLength,
    isChangedEmailValidCharacters,
    isChangedEmailValid,
    isChangedEmailAvailableInUnverifiedUsers,
    isChangedEmailAvailableInUsers
    ) {

    if (isChangedEmailFilled === false) return fieldNotFilled('new email');

    let commonEmailError = getCommonEmailError(
        isChangedEmailInsideMaxLength,
        isChangedEmailValidCharacters,
        isChangedEmailValid,
        isChangedEmailAvailableInUnverifiedUsers,
        isChangedEmailAvailableInUsers
        );

    return commonEmailError;

}

exports.getChangedPasswordError = function(
    isChangedPasswordFilled,
    isChangedPasswordInsideMaxLength,
    isChangedPasswordValidCharacters,
    doesChangedPasswordMeetRequirements
    ) {

    let adjective = ' new';

    if (isChangedPasswordFilled === false) return fieldNotFilled('new password');
    if (isChangedPasswordInsideMaxLength === false) return fieldTooLong('password', renderValue.passwordField.maxLength);
    if (isChangedPasswordValidCharacters === false) return invalidCharacterMessage(regexpValue.messagePassword); 
    if (doesChangedPasswordMeetRequirements === false) return changedNewPasswordDoesNotMeetRequirements(adjective);

}

exports.getCompanyCityError = function(
    isCompanyCityFilled,
    isCompanyCityValidCharacters,
    isCompanyCityInsideMinLength,
    isCompanyCityInsideMaxLength
    ) {

    let owner = 'company'
    let possessive = owner + '\'s';
    let field = 'city';

    let possessiveField = `${ possessive } ${ field }`;

    if (isCompanyCityFilled === false) return fieldNotFilled(possessiveField);
    if (isCompanyCityValidCharacters === false) return invalidCharacterMessage(regexpValue.messageCompanyCity);
    if (isCompanyCityInsideMinLength === false) return fieldTooShort(possessiveField, renderValue.companyCityField.minLength);
    if (isCompanyCityInsideMaxLength === false) return fieldTooLong(possessiveField, renderValue.companyCityField.maxLength);

}

exports.getCompanyDescriptionError = function(
    isCompanyDescriptionFilled,
    isCompanyDescriptionFamilyFriendly,
    isCompanyDescriptionValidCharacters,
    isCompanyDescriptionInsideMinLength,
    isCompanyDescriptionInsideMaxLength
    ) {

    let owner = 'company'
    let possessive = owner + '\'s';
    let field = 'description';

    let possessiveField = `${ possessive } ${ field }`;

    if (isCompanyDescriptionFilled === false) return fieldNotFilled(possessiveField);
    if (isCompanyDescriptionFamilyFriendly === false) return familyFriendlyMessage(possessiveField);
    if (isCompanyDescriptionValidCharacters === false) return invalidCharacterMessage(regexpValue.messageCompanyDescription);
    if (isCompanyDescriptionInsideMinLength === false) return fieldTooShort(possessiveField, renderValue.companyDescriptionField.minLength);
    if (isCompanyDescriptionInsideMaxLength === false) return fieldTooLong(possessiveField, renderValue.companyDescriptionField.maxLength);
    
}

exports.getCompanyLogoError = function(
    wereReqFieldsValid,
    wasCompanyLogoSubmitted,
    isFileAnImage,
    isFileTypeValid,
    isFileSizeUnderLimit,
    originalname,
    size,
    maxVendorLogoUploadFileSize
    ) {

    let owner = 'company'
    let possessive = owner + '\'s';
    let field = 'image';
    let action = 'submit';

    let possessiveField = `${ possessive } ${ field }`;

    if (wereReqFieldsValid === false) return 'Please submit a valid image file.';

    if (wasCompanyLogoSubmitted === false) return fieldNotFilled(possessiveField, action);

    if (isFileAnImage === false || isFileTypeValid === false) return `Your file, ${ originalname } is not saved in a format we can accept.  Please upload an image in jpg or png format.`;
    
    let { bytesPerMB } = defaultValue;
    let displaySize = (size / bytesPerMB).toFixed(2);
    let displayMaxVendorLogoUploadFileSize = Math.round(maxVendorLogoUploadFileSize / bytesPerMB);

    if (isFileSizeUnderLimit === false) return `Your image file, ${ originalname } is ${ displaySize } megabytes which is over the maximum limit of ${ displayMaxVendorLogoUploadFileSize } megabytes.  Please compress your image and try again or select a new image.`;

}

exports.getCompanyNameError = function(
    isCompanyNameFilled,
    isCompanyNameFamilyFriendly,
    isCompanyNameValidCharacters,
    doesCompanyNameContainAtLeastOneCharacter,
    isCompanyNameInsideMinLength,
    isCompanyNameInsideMaxLength
    ) {

    let owner = 'company'
    let possessive = owner + '\'s';
    let field = 'name';

    let possessiveField = `${ possessive } ${ field }`;

    if (isCompanyNameFilled === false) return fieldNotFilled(possessiveField);
    if (isCompanyNameFamilyFriendly === false) return familyFriendlyMessage(possessiveField);
    if (isCompanyNameValidCharacters === false) return invalidCharacterMessage(regexpValue.messageCompanyName);
    if (doesCompanyNameContainAtLeastOneCharacter === false) return `Your ${ possessiveField } must include at least 1 letter.`;
    if (isCompanyNameInsideMinLength === false) return fieldTooShort(possessiveField, renderValue.companyNameField.minLength);
    if (isCompanyNameInsideMaxLength === false) return fieldTooLong(possessiveField, renderValue.companyNameField.maxLength);

}

exports.getCompanyPhoneError = function(isCompanyPhoneFilled, isCompanyPhoneValidCharacters, isCompanyPhoneValid) {

    let owner = 'company'
    let possessive = owner + '\'s';
    let field = 'phone number';

    let ownerField = `${ owner } ${ field }`;
    let possessiveField = `${ possessive } ${ field }`;

    if (isCompanyPhoneFilled === false) return fieldNotFilled(possessiveField);
    if (isCompanyPhoneValidCharacters === false) return invalidCharacterMessage(regexpValue.messageCompanyPhone);
    if (isCompanyPhoneValid === false) return valueNotValid(ownerField);

}

exports.getCompanyServicesError = function(isAtLeastOneCompanyServiceFilled, wereAllServiceValuesValid) {

    let owner = 'company'
    let possessive = owner + '\'s';
    let field = 'services';

    let ownerField = `${ owner } ${ field }`;
    let possessiveField = `${ possessive } ${ field }`;  

    if (isAtLeastOneCompanyServiceFilled === false) return fieldNotFilled(possessiveField);
    if (wereAllServiceValuesValid === false) return `Please enter valid ${ ownerField }.`;
    
}

exports.getCompanyStateError = function(isCompanyStateFilled, isCompanyStateValid) {

    let owner = 'company'
    let possessive = owner + '\'s';
    let field = 'state';

    let ownerField = `${ owner } ${ field }`;
    let possessiveField = `${ possessive } ${ field }`;    

    if (isCompanyStateFilled === false) return fieldNotFilled(possessiveField);
    if (isCompanyStateValid === false) return valueNotValid(ownerField);

}

exports.getCompanyStreetError = function(
    isCompanyStreetFilled,
    isCompanyStreetValidCharacters,
    isCompanyStreetInsideMinLength,
    isCompanyStreetInsideMaxLength,
    isCompanyAddressValid,
    doesGeoLocationContainCompanyZip
    ) {

    let owner = 'company'
    let possessive = owner + '\'s';
    let field = 'street';

    let possessiveField = `${ possessive } ${ field }`;

    if (isCompanyStreetFilled === false) return fieldNotFilled(possessiveField);
    if (isCompanyStreetValidCharacters === false) return invalidCharacterMessage(regexpValue.messageCompanyStreet);
    if (isCompanyStreetInsideMinLength === false) return fieldTooShort(possessiveField, renderValue.companyStreetField.minLength);
    if (isCompanyStreetInsideMaxLength === false) return fieldTooLong(possessiveField, renderValue.companyStreetField.maxLength);
    if (isCompanyAddressValid === false) return 'We are sorry but this address was not found in the US Postal Service database.  Please check your address and try again.';
    if (doesGeoLocationContainCompanyZip === false) return 'We are sorry but we were not able to geocode this address.  This may be because your business uses a nonstandard address such as a PO Box.  Without a geocode it\'s not possible to include your company in search results.  If you feel this is incorrect please check your address and try again.';

}

exports.getCompanyStreetTwoError = function(isCompanyStreetTwoValidCharacters, isCompanyStreetTwoInsideMinLength, isCompanyStreetTwoInsideMaxLength) {

    let owner = 'company'
    let possessive = owner + '\'s';
    let field = 'street address for line two';

    let possessiveField = `${ possessive } ${ field }`;

    if (isCompanyStreetTwoValidCharacters === false) return invalidCharacterMessage(regexpValue.messageCompanyStreetTwo);
    if (isCompanyStreetTwoInsideMinLength === false) return fieldTooShort(possessiveField, renderValue.companyStreetTwoField.minLength);
    if (isCompanyStreetTwoInsideMaxLength === false) return fieldTooLong(possessiveField, renderValue.companyStreetTwoField.maxLength);

}

exports.getCompanyWebsiteError = function(
    isCompanyWebsiteFilled,
    isCompanyWebsiteValidCharacters,
    isCompanyWebsiteValid,
    isCompanyWebsiteInsideMinLength,
    isCompanyWebsiteInsideMaxLength
    ) {

    let owner = 'company'
    let possessive = owner + '\'s';
    let field = 'website';

    let ownerField = `${ owner } ${ field }`;
    let possessiveField = `${ possessive } ${ field }`;

    if (isCompanyWebsiteFilled === false) return fieldNotFilled(possessiveField);
    if (isCompanyWebsiteValidCharacters === false) return invalidCharacterMessage(regexpValue.messageCompanyWebsite);
    if (isCompanyWebsiteValid === false) return valueNotValid(ownerField);
    if (isCompanyWebsiteInsideMinLength === false) return fieldTooShort(possessiveField, renderValue.companyWebsiteField.minLength);
    if (isCompanyWebsiteInsideMaxLength === false) return fieldTooLong(possessiveField, renderValue.companyWebsiteField.maxLength);

}

exports.getCompanyZipError = function(isCompanyZipFilled, isCompanyZipValidCharacters, isCompanyZipFiveDigits) {

    let owner = 'company'
    let possessive = owner + '\'s';
    let field = 'zip code';

    let possessiveField = `${ possessive } ${ field }`;

    if (isCompanyZipFilled === false) return fieldNotFilled(possessiveField);
    if (isCompanyZipValidCharacters === false) return invalidCharacterMessage(regexpValue.messageCompanyZip);
    if (isCompanyZipFiveDigits === false) return `Your ${ possessiveField } must be 5 digits.`;

}

exports.getCurrentEmailError = function(isCurrentEmailFilled, isCurrentEmailValid) {
    
    if (isCurrentEmailFilled === false) return fieldNotFilled('email');
    if (isCurrentEmailValid === false) return emailNotValid;

}

exports.getCurrentPasswordError = function(isCurrentPasswordFilled, isCurrentPasswordCorrect) {
    
    if (isCurrentPasswordFilled === false) return 'For your security please enter your current password.';
    if (isCurrentPasswordCorrect === false) return 'Password incorrect.';

}

exports.getLoginPasswordError = function(isPasswordFilled, doesUserExist, isPasswordCorrect) {

    if (isPasswordFilled === false) return fieldNotFilled('password');
    if (doesUserExist === false || isPasswordCorrect === false) return 'The username and password combination you entered is incorrect.  Please try again.';

}

exports.getNewConfirmationPasswordError = function(isConfirmationPasswordFilled, doPasswordsMatch) {
    
    let adjective = '';

    if (isConfirmationPasswordFilled === false) return confirmationPasswordNotFilled(adjective);
    if (doPasswordsMatch === false) return confirmationPasswordDoesNotMatch(adjective);

}

exports.getNewEmailError = function(
    isNewEmailFilled,
    isNewEmailInsideMaxLength,
    isNewEmailValidCharacters,
    isNewEmailValid,
    isNewEmailAvailableInUnverifiedUsers,
    isNewEmailAvailableInUsers
    ) {

    if (isNewEmailFilled === false) return fieldNotFilled('email');

    let commonEmailError = getCommonEmailError(
        isNewEmailInsideMaxLength,
        isNewEmailValidCharacters,
        isNewEmailValid,
        isNewEmailAvailableInUnverifiedUsers,
        isNewEmailAvailableInUsers
        );
        
    return commonEmailError;

}

exports.getNewPasswordError = function(
    isNewPasswordFilled,
    isNewPasswordInsideMaxLength,
    isNewPasswordValidCharacters,
    doesNewPasswordMeetRequirements
    ) {

    let adjective = '';

    if (isNewPasswordFilled === false) return fieldNotFilled('password');
    if (isNewPasswordInsideMaxLength === false) return fieldTooLong('password', renderValue.passwordField.maxLength);
    if (isNewPasswordValidCharacters === false) return invalidCharacterMessage(regexpValue.messagePassword); 
    if (doesNewPasswordMeetRequirements === false) return changedNewPasswordDoesNotMeetRequirements(adjective);

}

exports.getSearchServicesError = function(isAtLeastOneServiceChecked, wereAllServiceValuesValid) {

    if (isAtLeastOneServiceChecked === false || wereAllServiceValuesValid === false) return 'Please select at least one service for your project.';

}

exports.getSearchRadiusError = function(isSearchRadiusFilled, isSearchRadiusValid) {

    if (isSearchRadiusFilled === false) return 'Please select a radius in miles.';
    if (isSearchRadiusValid === false) return 'Please select a valid radius in miles.';

}

exports.getSearchZipCodeError = function(isSearchZipCodeFilled, isSearchZipCodeValidCharacters, isSearchZipCodeFiveDigits, isSearchZipCodeRealAndInUsa) {

    if (isSearchZipCodeFilled === false) return 'Please enter the zip code of your project.';
    if (isSearchZipCodeValidCharacters === false) return 'Please enter a zip code that contains numbers only.';
    if (isSearchZipCodeFiveDigits === false) return 'Please enter a 5 digit zip code.'
    if (isSearchZipCodeRealAndInUsa === false) return 'Please enter a valid zip code located in the United States.';

}

exports.getPrivacyTermsError = function(isPrivacyTermsChecked) {

    if (isPrivacyTermsChecked === false) return 'Check the box if you have read and agree to our Privacy Policy and Terms Of Service.';

}

function changedNewPasswordDoesNotMeetRequirements(adjective) {

    return `Your${ adjective } password was not strong enough, please try again.`;

}

function confirmationPasswordDoesNotMatch(adjective) {

    return `Password confirmation did not match.  Please confirm your${ adjective } password again.`;

}

function confirmationPasswordNotFilled(adjective) {

    return `Please confirm your${ adjective } password.`;

}

function familyFriendlyMessage(field) {

    return `Your ${ field } must be family friendly.`;

}

function fieldNotFilled(fragment, action ='enter') {

    return `Please ${ action } your ${ fragment }.`;

}

function fieldTooLong(field, maxLength) {

    return `Your ${ field } must be ${ maxLength } characters or less.`;

}

function fieldTooShort(field, maxLength) {

    return `Your ${ field } must be ${ maxLength } characters or more.`;

}

function getCommonEmailError(
    isEmailInsideMaxLength,
    isEmailValidCharacters,
    isEmailValid,
    isEmailAvailableInUnverifiedUsers,
    isEmailAvailableInUsers
    ) {

    if (isEmailInsideMaxLength === false) return fieldTooLong('email address', renderValue.emailField.maxLength);
    
    if (isEmailValidCharacters === false) return invalidCharacterMessage(regexpValue.messageEmail);

    if (isEmailValid === false) return emailNotValid;

    if (isEmailAvailableInUnverifiedUsers === false || isEmailAvailableInUsers === false) return 'We\'re sorry but the email you entered is already associated with a different account.  Please try a different email address.';

}

function invalidCharacterMessage(pattern) {

    return `Please only use valid ${ pattern }.`;
    
}

function valueNotValid(fragment) {

    return `Please enter a valid ${ fragment }.`;

} 