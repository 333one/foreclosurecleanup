const path = require('path');

const bcrypt = require('bcryptjs');

const cryptoRandomString = require('crypto-random-string');
const emailValidator = require('email-validator');

const Filter = require('bad-words');
const filter = new Filter();

const fs = require('fs');

const MapboxClient = require('mapbox');
const client = new MapboxClient(process.env.MAPBOX_DEFAULT_PUBLIC_TOKEN);

const objectHash = require('object-hash');
const sizeOf = require('image-size');
const sharp = require('sharp');

const USPS = require('usps-webtools-promise').default;
const usps = new USPS({
	userId: process.env.USPS_USER_ID,
	// USPS returns ALL CAPS, this boolean turns on Proper Caps for both Street lines and City. This is an optional item.
	properCase: Boolean
});

const validator = require('validator');

const checks = require('./checks');
const communication = require('./communication');
const defaultMessage = require('../models/default-messages');
const defaultValue = require('../models/default-values');
const emailMessage = require('../models/email-messages');
const errorMessage = require('../models/error-messages');
const formFields = require('../models/forms-default-fields');
const submissionProcessing = require('./submission-processing');
const logicDefault = require('./logic-default');
const logicStripe = require('./logic-stripe');
const logicUserAccounts = require('./logic-user-accounts');
const logoutSteps = require('./logout-steps');
const mongooseLogic = require('./mongoose-logic');
const regExpValue = require('../models/regexp-values');
const renderValue = require('../models/rendering-values');
const siteValue = require('../models/site-values');
const stripeValue = require('../models/stripe-values');
const timeValue = require('../models/time-values');
const { logErrorMessage, wrapAsync } = require('./error-handling');

const { LoginFailure, PasswordResetRequest, RecentDeletedAccount, StripeCheckoutSession, User, UnverifiedUser } = require('../models/mongoose-schema');

exports.accountDeleted = wrapAsync(async function (req, res) {
	// Initial checks.  If queries were absent or fake forward to page-not-found.
	let email = req.query.email ? req.query.email : '';
	if (email === '') return res.status(404).redirect('/page-not-found');

	let doesRecentDeletedAccountExist = await RecentDeletedAccount.exists({
		email
	});
	if (!doesRecentDeletedAccountExist) return res.status(404).redirect('/page-not-found');

	// For rendering.
	let activeLink = 'account-deleted';
	let contactEmail = siteValue.contactEmail.email;
	let loggedIn = false;
	let { projectStatus } = siteValue;

	res.render('account-deleted', {
		activeLink,
		contactEmail,
		loggedIn,
		projectStatus
	});
});

exports.accountSuspended = wrapAsync(async function (req, res) {
	// Initial checks.  If queries were absent or fake forward to page-not-found.
	let email = req.query.email ? req.query.email : '';
	if (email === '') return res.status(404).redirect('/page-not-found');

	let userValues = await User.findOne({ email }).select({ accountSuspended: 1 }).lean();

	if (userValues) {
		let { accountSuspended } = userValues;
		if (accountSuspended !== true) return res.redirect('/');
	} else {
		return res.redirect('/');
	}

	// For rendering.
	let activeLink = 'account-suspended';
	let contactEmail = siteValue.contactEmail.email;
	let loggedIn = false;
	let { projectStatus } = siteValue;

	res.render('account-suspended', {
		activeLink,
		contactEmail,
		loggedIn,
		projectStatus
	});
});

exports.addChangeCompanyAddress = wrapAsync(async function (req, res) {
	// Create these now and set the value in the if block below.
	let inputFields = {};
	let addOrChangeProperty = req.session.userValues.companyCity && req.session.userValues.companyState && req.session.userValues.companyStreet && req.session.userValues.companyZip ? 'change' : 'add';

	// Grab the data from req.session and then delete it.
	if (req.session.transfer) {
		var { cleanedForm, companyCityError, companyStateError, companyStreetError, companyStreetTwoError, companyZipError } = req.session.transfer;

		delete req.session.transfer;

		// Set object to previous form input.
		inputFields = cleanedForm;
	} else {
		// If req.session data isn't used set every property to an empty string.
		inputFields = submissionProcessing.makeFieldsEmpty(formFields.addChangeCompanyAddress);
	}

	let capitalizedAddOrChange = addOrChangeProperty.charAt(0).toUpperCase() + addOrChangeProperty.slice(1);
	let htmlTitle = `${capitalizedAddOrChange} Company Address`;

	let showUspsNormalizedVsOriginal = false;
	if (req.session.originalInput && req.session.uspsNormalized) {
		showUspsNormalizedVsOriginal = true;

		var originalInput = {};

		let setOriginalInputArray = formFields.addChangeCompanyAddress.filter(function (element) {
			return element !== 'deleteProperty' || element !== 'useOriginalInput';
		});

		setOriginalInputArray.forEach(function (element) {
			originalInput[element] = req.session.originalInput[element];
		});

		var uspsNormalized = {};

		let setUspsNormalizedArray = formFields.addChangeCompanyAddress.filter(function (element) {
			return element !== 'deleteProperty' || element !== 'useOriginalInput';
		});

		setUspsNormalizedArray.forEach(function (element) {
			uspsNormalized[element] = req.session.uspsNormalized[element];
		});

		delete req.session.originalInput;
		delete req.session.uspsNormalized;
	}

	let { companyCity, companyState, companyStreet, companyStreetTwo, companyZip } = req.session.userValues;

	let companyAddressMyAccountValue = logicDefault.assembleCompanyStreet(companyCity, companyState, companyStreet, companyStreetTwo, companyZip);

	// For rendering.
	let activeLink = 'add-change-company-address';
	let contactEmail = siteValue.contactEmail.email;
	let loggedIn = true;
	let { projectStatus } = siteValue;

	let companyCityAttributes = renderValue.companyCityField.attributes;
	let companyStreetAttributes = renderValue.companyStreetField.attributes;
	let companyStreetTwoAttributes = renderValue.companyStreetTwoField.attributes;
	let companyZipAttributes = renderValue.companyZipField.attributes;

	res.render('add-change-company-address', {
		userInput: inputFields,
		activeLink,
		contactEmail,
		loggedIn,
		projectStatus,
		addOrChangeProperty,
		companyAddressMyAccountValue,
		companyCityError,
		companyStateError,
		companyStreetError,
		companyStreetTwoError,
		companyZipError,
		companyCityAttributes,
		companyStreetAttributes,
		companyStreetTwoAttributes,
		companyZipAttributes,
		htmlTitle,
		showUspsNormalizedVsOriginal,
		originalInput,
		uspsNormalized
	});
});

exports.addChangeCompanyDescription = wrapAsync(async function (req, res) {
	// Create these now and set the value in the if block below.
	let inputFields = {};
	let addOrChangeProperty = req.session.userValues.companyDescription ? 'change' : 'add';

	// Grab the data from req.session and then delete it.
	if (req.session.transfer) {
		var { cleanedForm, companyDescriptionError } = req.session.transfer;
		delete req.session.transfer;

		// Set object to previous form input.
		inputFields = cleanedForm;
	} else {
		// If req.session data isn't used set every property to an empty string.
		inputFields = submissionProcessing.makeFieldsEmpty(formFields.addChangeCompanyDescription);
	}

	let capitalizedAddOrChange = addOrChangeProperty.charAt(0).toUpperCase() + addOrChangeProperty.slice(1);
	let htmlTitle = `${capitalizedAddOrChange} Company Description`;

	// For rendering.
	let activeLink = 'add-change-company-description';
	let contactEmail = siteValue.contactEmail.email;
	let loggedIn = true;
	let { projectStatus } = siteValue;

	let companyDescription = req.session.userValues.companyDescription;
	let companyDescriptionAttributes = renderValue.companyDescriptionField.attributes;
	let companyDescriptionMaxLength = renderValue.companyDescriptionField.maxLength;

	res.render('add-change-company-description', {
		userInput: inputFields,
		activeLink,
		contactEmail,
		loggedIn,
		projectStatus,
		addOrChangeProperty,
		companyDescription,
		companyDescriptionAttributes,
		companyDescriptionMaxLength,
		companyDescriptionError,
		htmlTitle
	});
});

exports.addChangeCompanyLogo = wrapAsync(async function (req, res) {
	// Create this now and set the value in the if block below.
	let addOrChangeProperty = req.session.userValues.companyLogo.fileName ? 'change' : 'add';

	// Grab the data from req.session and then delete it.
	if (req.session.transfer) {
		var { companyLogoError } = req.session.transfer;
		delete req.session.transfer;
	}

	let capitalizedAddOrChange = addOrChangeProperty.charAt(0).toUpperCase() + addOrChangeProperty.slice(1);
	let htmlTitle = `${capitalizedAddOrChange} Company Logo`;

	// For rendering.
	let activeLink = 'add-change-company-logo';
	let contactEmail = siteValue.contactEmail.email;
	let loggedIn = true;
	let { projectStatus } = siteValue;

	let companyLogoPath = defaultValue.vendorLogoViewFolder;
	let companyLogoFileName = req.session.userValues.companyLogo.fileName;
	let companyLogoWidth = req.session.userValues.companyLogo.width;
	let companyLogoHeight = req.session.userValues.companyLogo.height;
	let companyLogoName = formFields.addChangeCompanyLogo[0];
	let companyLogoField = renderValue.companyLogoField;

	res.render('add-change-company-logo', {
		activeLink,
		contactEmail,
		loggedIn,
		projectStatus,
		addOrChangeProperty,
		companyLogoPath,
		companyLogoFileName,
		companyLogoWidth,
		companyLogoHeight,
		companyLogoName,
		companyLogoField,
		companyLogoError,
		htmlTitle
	});
});

exports.addChangeCompanyName = wrapAsync(async function (req, res) {
	// Create these now and set the value in the if block below.
	let inputFields = {};
	let addOrChangeProperty = req.session.userValues.companyName ? 'change' : 'add';

	// Grab the data from req.session and then delete it.
	if (req.session.transfer) {
		var { cleanedForm, companyNameError } = req.session.transfer;
		delete req.session.transfer;

		// Set object to previous form input.
		inputFields = cleanedForm;
	} else {
		// If req.session data isn't used set every property to an empty string.
		inputFields = submissionProcessing.makeFieldsEmpty(formFields.addChangeCompanyName);
	}

	let capitalizedAddOrChange = addOrChangeProperty.charAt(0).toUpperCase() + addOrChangeProperty.slice(1);
	let htmlTitle = `${capitalizedAddOrChange} Company Name`;

	// For rendering.
	let activeLink = 'add-change-company-name';
	let contactEmail = siteValue.contactEmail.email;
	let loggedIn = true;
	let { projectStatus } = siteValue;

	let companyName = req.session.userValues.companyName;
	let companyNameAttributes = renderValue.companyNameField.attributes;

	res.render('add-change-company-name', {
		userInput: inputFields,
		activeLink,
		contactEmail,
		loggedIn,
		projectStatus,
		addOrChangeProperty,
		companyName,
		companyNameAttributes,
		companyNameError,
		htmlTitle
	});
});

exports.addChangeCompanyPhone = wrapAsync(async function (req, res) {
	// Create these now and set the value in the if block below.
	let inputFields = {};
	let addOrChangeProperty = req.session.userValues.companyPhone ? 'change' : 'add';

	// Grab the data from req.session and then delete it.
	if (req.session.transfer) {
		var { cleanedForm, companyPhoneError } = req.session.transfer;
		delete req.session.transfer;

		// Set object to previous form input.
		inputFields = cleanedForm;
	} else {
		// If req.session data isn't used set every property to an empty string.
		inputFields = submissionProcessing.makeFieldsEmpty(formFields.addChangeCompanyPhone);
	}

	let capitalizedAddOrChange = addOrChangeProperty.charAt(0).toUpperCase() + addOrChangeProperty.slice(1);
	let htmlTitle = `${capitalizedAddOrChange} Company Phone Number`;

	// For rendering.
	let activeLink = 'add-change-company-phone';
	let contactEmail = siteValue.contactEmail.email;
	let loggedIn = true;
	let { projectStatus } = siteValue;

	let companyPhone = req.session.userValues.companyPhone;
	let companyPhoneAttributes = renderValue.companyPhoneField.attributes;

	res.render('add-change-company-phone', {
		userInput: inputFields,
		activeLink,
		contactEmail,
		loggedIn,
		projectStatus,
		addOrChangeProperty,
		companyPhone,
		companyPhoneAttributes,
		companyPhoneError,
		htmlTitle
	});
});

exports.addChangeCompanyServices = wrapAsync(async function (req, res) {
	let inputFields = {};
	let { companyProfileType } = req.session.userValues;
	let addOrChangeProperty = req.session.userValues.boardingSecuring === false && req.session.userValues.debrisRemovalTrashout === false && req.session.userValues.evictionManagement === false && req.session.userValues.fieldInspection === false && req.session.userValues.handymanGeneralMaintenance === false && req.session.userValues.landscapeMaintenance === false && req.session.userValues.lockChanges === false && req.session.userValues.overseePropertyRehabilitation === false && req.session.userValues.poolMaintenance === false && req.session.userValues.propertyCleaning === false && req.session.userValues.winterizations === false ? 'add' : 'change';

	// Grab the data from req.session and then delete it.
	if (req.session.transfer) {
		var { cleanedForm, companyServicesError } = req.session.transfer;
		delete req.session.transfer;

		// Set object to previous form input.
		inputFields = cleanedForm;
	} else {
		let reqSessionUserValuesDereferenced = JSON.parse(JSON.stringify(req.session.userValues));
		inputFields = logicDefault.convertBooleanToString(reqSessionUserValuesDereferenced, defaultValue.listOfCompanyServices);
	}

	let capitalizedAddOrChange = addOrChangeProperty.charAt(0).toUpperCase() + addOrChangeProperty.slice(1);
	let htmlTitle = `${capitalizedAddOrChange} Company Services`;

	// For rendering.
	let activeLink = 'add-change-company-services';
	let contactEmail = siteValue.contactEmail.email;
	let loggedIn = true;
	let { projectStatus } = siteValue;

	let isAccountUpgraded = companyProfileType === defaultValue.accountUpgrade ? true : false;

	let labelBoardingSecuring = renderValue.boardingSecuring;
	let labelDebrisRemovalTrashout = renderValue.debrisRemovalTrashout;
	let labelEvictionManagement = renderValue.evictionManagement;
	let labelFieldInspection = renderValue.fieldInspection;
	let labelHandymanGeneralMaintenance = renderValue.handymanGeneralMaintenance;
	let labelLandscapeMaintenance = renderValue.landscapeMaintenance;
	let labelLockChanges = renderValue.lockChanges;
	let labelOverseePropertyRehabilitation = renderValue.overseePropertyRehabilitation;
	let labelPoolMaintenance = renderValue.poolMaintenance;
	let labelPropertyCleaning = renderValue.propertyCleaning;
	let labelWinterizations = renderValue.winterizations;

	res.render('add-change-company-services', {
		userInput: inputFields,
		activeLink,
		contactEmail,
		loggedIn,
		projectStatus,
		isAccountUpgraded,
		addOrChangeProperty,
		loggedIn,
		htmlTitle,
		labelBoardingSecuring,
		labelDebrisRemovalTrashout,
		labelEvictionManagement,
		labelFieldInspection,
		labelHandymanGeneralMaintenance,
		labelLandscapeMaintenance,
		labelLockChanges,
		labelOverseePropertyRehabilitation,
		labelPoolMaintenance,
		labelPropertyCleaning,
		labelWinterizations,
		companyServicesError
	});
});

exports.addChangeCompanyWebsite = wrapAsync(async function (req, res) {
	// Create these now and set the value in the if block below.
	let inputFields = {};
	let addOrChangeProperty = req.session.userValues.companyWebsite ? 'change' : 'add';

	// Grab the data from req.session and then delete it.
	if (req.session.transfer) {
		var { cleanedForm, companyWebsiteError } = req.session.transfer;
		delete req.session.transfer;

		// Set object to previous form input.
		inputFields = cleanedForm;
	} else {
		// If req.session data isn't used set every property to an empty string.
		inputFields = submissionProcessing.makeFieldsEmpty(formFields.addChangeCompanyWebsite);
	}

	let capitalizedAddOrChange = addOrChangeProperty.charAt(0).toUpperCase() + addOrChangeProperty.slice(1);
	let htmlTitle = `${capitalizedAddOrChange} Company Website`;

	// For rendering.
	let activeLink = 'add-change-company-website';
	let contactEmail = siteValue.contactEmail.email;
	let loggedIn = true;
	let { projectStatus } = siteValue;

	let companyWebsiteAttributes = renderValue.companyWebsiteField.attributes;
	let companyWebsite = req.session.userValues.companyWebsite;

	res.render('add-change-company-website', {
		userInput: inputFields,
		activeLink,
		contactEmail,
		loggedIn,
		projectStatus,
		addOrChangeProperty,
		companyWebsite,
		companyWebsiteAttributes,
		companyWebsiteError,
		htmlTitle
	});
});

exports.changeEmail = wrapAsync(async function (req, res) {
	let { email } = req.session.userValues;

	// Grab the data from req.session and then delete it.
	if (req.session.transfer) {
		var { cleanedForm, changedEmailError, confirmationEmailError, currentPasswordError } = req.session.transfer;

		delete req.session.transfer;

		// Set object to previous form input.
		var inputFields = cleanedForm;
	} else {
		// If req.session inputs aren't used set every property to an empty string.
		var inputFields = submissionProcessing.makeFieldsEmpty(formFields.changeEmail);
	}

	// For rendering.
	let activeLink = 'change-email';
	let contactEmail = siteValue.contactEmail.email;
	let loggedIn = true;
	let { projectStatus } = siteValue;

	let emailAttributes = renderValue.emailField.attributes;
	let passwordAttributes = renderValue.passwordField.attributes;
	let currentEmail = email;

	res.render('change-email', {
		userInput: inputFields,
		activeLink,
		contactEmail,
		loggedIn,
		projectStatus,
		emailAttributes,
		passwordAttributes,
		currentEmail,
		changedEmailError,
		confirmationEmailError,
		currentPasswordError
	});
});

exports.changePassword = wrapAsync(async function (req, res) {
	// Grab the data from req.session and then delete it.
	if (req.session.transfer) {
		var { cleanedForm, currentPasswordError, changedPasswordError, confirmationPasswordError } = req.session.transfer;

		delete req.session.transfer;

		// Set object to previous form input.
		var inputFields = cleanedForm;
	} else {
		// If req.session data isn't used set every property to an empty string.
		var inputFields = submissionProcessing.makeFieldsEmpty(formFields.changePassword);
	}

	// For rendering.
	let activeLink = 'change-password';
	let contactEmail = siteValue.contactEmail.email;
	let loggedIn = true;
	let { projectStatus } = siteValue;

	let allPasswordsAttributes = renderValue.passwordField.attributes;

	res.render('change-password', {
		userInput: inputFields,
		activeLink,
		contactEmail,
		loggedIn,
		projectStatus,
		currentPasswordError,
		changedPasswordError,
		confirmationPasswordError,
		allPasswordsAttributes
	});
});

exports.confirmationLimitReached = wrapAsync(async function (req, res) {
	// Initial checks.  If queries were absent or fake forward to page-not-found.
	let email = req.query.email ? req.query.email : '';
	if (email === '') return res.status(404).redirect('/page-not-found');

	let unverifiedUser = await UnverifiedUser.findOne({ email }).select({ numberOfConfirmations: 1 }).lean();
	if (!unverifiedUser) return res.status(404).redirect('/page-not-found');

	// If number is out of range redirect to page-not-found.  Counter stops incrementing at max + 1 and stays at that number.
	let { numberOfConfirmations } = unverifiedUser;
	if (numberOfConfirmations != defaultValue.numberOfEmailConfirmationsAllowed + 1) return res.status(404).redirect('/page-not-found');

	let isResetAttemptBeforeVerified = req.query.resetattempt === 'true' ? true : false;

	let emailSubject = emailMessage.verificationEmailSubject();
	let expirationTime = timeValue.getExpirationTime(timeValue.unverifiedUserExpiration);

	let htmlBody = defaultMessage.confirmationLimitReachedBody(email, emailSubject, expirationTime, isResetAttemptBeforeVerified);

	// For rendering.
	let activeLink = 'confirmation-limit-reached';
	let contactEmail = siteValue.contactEmail.email;
	let loggedIn = req.session.userValues ? true : false;
	let { projectStatus } = siteValue;

	res.render('confirmation-limit-reached', {
		activeLink,
		contactEmail,
		loggedIn,
		projectStatus,
		htmlBody
	});
});

exports.confirmationSent = wrapAsync(async function (req, res) {
	// If the email is not present redirect to page-not-found.
	let email = req.query.email ? req.query.email : '';
	if (email === '') return res.status(404).redirect('/page-not-found');

	let isNewRegister = req.query.newregister === 'true' ? true : false;
	let isUnverifiedMultipleRegisters = req.query.unverifiedmultipleregisters === 'true' ? true : false;
	let isConfirmationResent = req.query.resend === 'true' ? true : false;
	let isResetAttemptBeforeVerified = req.query.resetattempt === 'true' ? true : false;

	// If none of the queries are present or correct redirect to page-not-found.
	if (isNewRegister === false && isUnverifiedMultipleRegisters === false && isConfirmationResent === false && isResetAttemptBeforeVerified === false) return res.status(404).redirect('/page-not-found');

	// If no user exists redirect to page-not-found.
	let unverifiedUser = await UnverifiedUser.findOne({ email }).select({ confirmationHash: 1, numberOfConfirmations: 1 }).lean();
	if (!unverifiedUser) return res.status(404).redirect('/page-not-found');

	let { confirmationHash, numberOfConfirmations } = unverifiedUser;

	let incrementedNumberOfConfirmations = (numberOfConfirmations += 1);
	if (incrementedNumberOfConfirmations > defaultValue.numberOfEmailConfirmationsAllowed) {
		await UnverifiedUser.updateOne(
			{ email },
			{
				numberOfConfirmations: defaultValue.numberOfEmailConfirmationsAllowed + 1
			}
		);
		return res.redirect(`/confirmation-limit-reached?email=${email}`);
	}

	await UnverifiedUser.updateOne({ email }, { numberOfConfirmations: incrementedNumberOfConfirmations });

	let emailSubject = emailMessage.verificationEmailSubject();
	let emailBody = emailMessage.verificationEmailBody(confirmationHash, isResetAttemptBeforeVerified);

	communication.sendEmail(siteValue.noReplyEmail, email, emailSubject, emailBody);

	let htmlBody = defaultMessage.confirmationSentBody(email, emailSubject, isNewRegister, isUnverifiedMultipleRegisters, isConfirmationResent, isResetAttemptBeforeVerified);

	// For rendering.
	let activeLink = 'confirmation-sent';
	let contactEmail = siteValue.contactEmail.email;
	let loggedIn = req.session.userValues ? true : false;
	let { projectStatus } = siteValue;

	res.render('confirmation-sent', {
		activeLink,
		contactEmail,
		loggedIn,
		projectStatus,
		htmlBody,
		email,
		emailSubject
	});
});

exports.deleteYourAccount = wrapAsync(async function (req, res) {
	// Grab the data from req.session and then delete it.
	if (req.session.transfer) {
		var { cleanedForm, currentPasswordError } = req.session.transfer;
		delete req.session.transfer;

		// Set object to previous form input.
		var inputFields = cleanedForm;
	} else {
		// If req.session data isn't used set every property to an empty string.
		var inputFields = submissionProcessing.makeFieldsEmpty(formFields.deleteYourAccount);
	}

	// For rendering.
	let activeLink = 'delete-your-account';
	let contactEmail = siteValue.contactEmail.email;
	let loggedIn = true;
	let { projectStatus } = siteValue;

	let passwordAttributes = renderValue.passwordField.attributes;

	res.render('delete-your-account', {
		userInput: inputFields,
		activeLink,
		contactEmail,
		loggedIn,
		projectStatus,
		passwordAttributes,
		currentPasswordError
	});
});

exports.login = wrapAsync(async function (req, res) {
	// Grab the data from req.session and then delete it.
	if (req.session.transfer) {
		var { cleanedForm, currentEmailError, currentPasswordError } = req.session.transfer;
		delete req.session.transfer;

		// Set object to previous form input.
		var inputFields = cleanedForm;

		// Clear currentPassword for rendering.
		inputFields.currentPassword = '';
	} else {
		// If req.session data isn't used set every property to an empty string.
		var inputFields = submissionProcessing.makeFieldsEmpty(formFields.login);
	}

	// For rendering.
	let activeLink = 'login';
	let contactEmail = siteValue.contactEmail.email;
	let loggedIn = req.session.userValues ? true : false;
	let { projectStatus } = siteValue;

	let emailAttributes = renderValue.emailField.attributes;
	let passwordAttributes = renderValue.passwordField.attributes;

	res.render('login', {
		userInput: inputFields,
		activeLink,
		contactEmail,
		loggedIn,
		projectStatus,
		emailAttributes,
		passwordAttributes,
		currentEmailError,
		currentPasswordError
	});
});

exports.loginFailureLimitReached = wrapAsync(async function (req, res) {
	// Initial checks.  If queries were absent or fake forward to page-not-found.
	let email = req.query.email ? req.query.email : '';
	if (email === '') return res.status(404).redirect('/page-not-found');

	let loginFailure = await LoginFailure.findOne({ email }).select({ numberOfFailures: 1 }).lean();
	if (!loginFailure) return res.status(404).redirect('/page-not-found');

	// If numberOfFailures doesn't equal max + 1 the client shouldn't be here.
	let { numberOfFailures } = loginFailure;
	if (numberOfFailures != defaultValue.numberOfLoginFailuresAllowed + 1) return res.redirect('/page-not-found');

	// For rendering.
	let activeLink = 'login-failure-limit-reached';
	let contactEmail = siteValue.contactEmail.email;
	let loggedIn = false;
	let { projectStatus } = siteValue;

	let expirationTime = timeValue.getExpirationTime(timeValue.loginFailureExpiration);

	res.render('login-failure-limit-reached', {
		activeLink,
		contactEmail,
		loggedIn,
		projectStatus,
		expirationTime
	});
});

exports.logout = wrapAsync(async function (req, res) {
	return logoutSteps.logoutUser(req, res, '/');
});

exports.myAccount = wrapAsync(async function (req, res) {
	let { companyCity, companyDescription, companyName, companyPhone, companyProfileType, companyState, companyStreet, companyStreetTwo, companyWebsite, companyZip, createdAt, email, expirationDate, password, boardingSecuring, debrisRemovalTrashout, evictionManagement, fieldInspection, handymanGeneralMaintenance, landscapeMaintenance, lockChanges, overseePropertyRehabilitation, poolMaintenance, propertyCleaning, winterizations, shouldBrowserFocusOnURLNotActiveError, urlNotActiveError } = req.session.userValues;

	let companyLogoFileName = req.session.userValues.companyLogo.fileName;
	let companyLogoWidth = req.session.userValues.companyLogo.width;
	let companyLogoHeight = req.session.userValues.companyLogo.height;

	let isAccountUpgraded = companyProfileType === defaultValue.accountUpgrade ? true : false;

	// Session values are stored as strings.  In this route expirationDate is used multiple times and only useful as a Date object.
	expirationDate = new Date(expirationDate);

	// Start the Message / Stripe section.
	// Both queries should never exist in the same response.  If they do this indicates shenanigans.  Log out the user and redirect them to the home page.
	if (req.query.success && req.query.cancel) return logoutSteps.logoutUser(req, res, '/');

	let successMessage, noChangeMessage, failMessage;

	// The success query string, success=${ stripeSuccessString } is set up in middlewareStripe.postCreateCheckoutSession.
	// If req.query.success exists it is because Stripe sent the user here after a successful purchase.
	if (req.query.success) {
		let stripeCheckoutSession = await StripeCheckoutSession.findOne({
			stripeSuccessKey: req.query.success
		});
		if (stripeCheckoutSession) {
			let todaysDate = new Date();
			let updatedExpirationDate = logicUserAccounts.createNewExpirationDate(todaysDate, expirationDate);
			let { paymentIntent } = stripeCheckoutSession;

			// Both webhookPremiumUpgrade and myAccount can update the DB.  Whichever is faster does the job.
			// This redundancy from webhookPremiumUpgrade ensures that the DB update always happens even if the session is lost because the client or server crashed.
			await logicStripe.stripeSuccessUpdateDB(paymentIntent, stripeCheckoutSession, todaysDate, updatedExpirationDate);

			await StripeCheckoutSession.findOneAndDelete({
				stripeSuccessKey: req.query.success
			});

			if (isAccountUpgraded === false) {
				// Notify the user of the change.
				let emailSubject = emailMessage.premiumUpgradeSubject();
				let emailBody = emailMessage.emailPremiumUpgradeBody();
				communication.sendEmail(siteValue.noReplyEmail, email, emailSubject, emailBody);

				successMessage = stripeValue.successUpgradeMessage;
				isAccountUpgraded = true;
				req.session.userValues.companyProfileType = defaultValue.accountUpgrade;
				companyProfileType = defaultValue.accountUpgrade;
			} else {
				successMessage = stripeValue.successExtendMessage;
			}

			req.session.userValues.expirationDate = updatedExpirationDate;
			expirationDate = updatedExpirationDate;
		}
	}

	// If req.query.cancel exists it is because Stripe sent the user here after a failed purchase.
	if (req.query.cancel) {
		let doesStripeCheckoutSessionExist = await StripeCheckoutSession.exists({
			stripeCancelKey: req.query.cancel
		});
		if (doesStripeCheckoutSessionExist === true) {
			failMessage = stripeValue.cancelMessage;
			await StripeCheckoutSession.findOneAndDelete({
				stripeCancelKey: req.query.cancel
			});
		}
	}

	// A successMessage is created whenever there is a successful addChange on the account properties.
	if (req.session.userValues.successMessage) {
		successMessage = req.session.userValues.successMessage;
		delete req.session.userValues.successMessage;
	}

	// A noChangeMessage is created whenever there is a successful addChange on the account properties.
	if (req.session.userValues.noChangeMessage) {
		noChangeMessage = req.session.userValues.noChangeMessage;
		delete req.session.userValues.noChangeMessage;
	}

	// This value comes from logicUserAccounts.testFormattedURL.
	// When a company website is changed or added the update to the session and DB happens immediately.
	// testFormattedURL runs in the background to check if the URL is active.  After the check is done the result is stored in the DB.
	if (urlNotActiveError === true) {
		var urlNotActiveMessage = defaultMessage.urlNotActiveMessage;

		if (shouldBrowserFocusOnURLNotActiveError === true) {
			// Updated in the DB and on the session so that it focuses only one time when a URL error occurs.
			await User.updateOne({ email }, { shouldBrowserFocusOnURLNotActiveError: false });
			req.session.userValues.shouldBrowserFocusOnURLNotActiveError = false;
		}
	}

	// Prepare Date information for rendering.
	let memberSince = `${new Intl.DateTimeFormat('en-US', {
		month: 'long'
	}).format(new Date(createdAt))} ${new Date(createdAt).getFullYear()}`;

	if (isAccountUpgraded === true) {
		var numberOfDaysUntilExpiration = logicUserAccounts.getNumberOfDaysUntilExpiration(expirationDate);
		var isUpgradeExpirationSoon = checks.checkIfUpgradeExpirationSoon(numberOfDaysUntilExpiration);
		var numberOfDaysUntilExpirationFragment = isUpgradeExpirationSoon === true ? timeValue.getNumberOfDaysUntilExpirationFragment(numberOfDaysUntilExpiration) : undefined;
		var areAccountUpgradesExtendsAvailable = numberOfDaysUntilExpiration < timeValue.upgradeAccountExtendsCutoff ? true : false;
		var premiumExpirationDate = logicUserAccounts.getPremiumExpirationDateString(expirationDate);
	}

	// These next steps are used determine the rendering value for company services.
	let doCompanyServicesHaveValue = checks.checkDoAnyCompanyServicesHaveValue(boardingSecuring, debrisRemovalTrashout, evictionManagement, fieldInspection, handymanGeneralMaintenance, landscapeMaintenance, lockChanges, overseePropertyRehabilitation, poolMaintenance, propertyCleaning, winterizations);

	let companyServicesMyAccountValue;
	if (doCompanyServicesHaveValue === true) {
		companyServicesMyAccountValue = logicUserAccounts.assembleCompanyServices(boardingSecuring, debrisRemovalTrashout, evictionManagement, fieldInspection, handymanGeneralMaintenance, landscapeMaintenance, lockChanges, overseePropertyRehabilitation, poolMaintenance, propertyCleaning, winterizations);
	} else {
		companyServicesMyAccountValue = defaultMessage.myAccountInformationEmpty;
	}

	// The next steps are used to determine if the account is Live and for rendering.
	let companyDescriptionMyAccountValue = companyDescription ? companyDescription : defaultMessage.myAccountInformationEmpty;
	let companyLogoMyAccountValue = companyLogoFileName ? companyLogoFileName : defaultMessage.myAccountInformationEmpty;
	let companyNameMyAccountValue = companyName ? companyName : defaultMessage.myAccountInformationEmpty;
	let companyPhoneMyAccountValue = companyPhone ? companyPhone : defaultMessage.myAccountInformationEmpty;
	let companyWebsiteMyAccountValue = companyWebsite ? companyWebsite : defaultMessage.myAccountInformationEmpty;

	if (companyCity && companyState && companyStreet && companyZip) {
		var companyAddressMyAccountValue = logicDefault.assembleCompanyStreet(companyCity, companyState, companyStreet, companyStreetTwo, companyZip);
	} else {
		companyAddressMyAccountValue = defaultMessage.myAccountInformationEmpty;
	}

	// Check to see if properties were added.  During rendering, typeof === string check won't work because all accountValues store a string even if it is empty ''.
	let isCompanyAddressAdded = companyAddressMyAccountValue === defaultMessage.myAccountInformationEmpty ? false : true;
	let isCompanyDescriptionAdded = companyDescriptionMyAccountValue === defaultMessage.myAccountInformationEmpty ? false : true;
	let isCompanyLogoAdded = companyLogoMyAccountValue === defaultMessage.myAccountInformationEmpty ? false : true;
	let isCompanyNameAdded = companyNameMyAccountValue === defaultMessage.myAccountInformationEmpty ? false : true;
	let isCompanyPhoneAdded = companyPhoneMyAccountValue === defaultMessage.myAccountInformationEmpty ? false : true;
	let isCompanyServicesAdded = companyServicesMyAccountValue === defaultMessage.myAccountInformationEmpty ? false : true;
	let isCompanyWebsiteAdded = companyWebsiteMyAccountValue === defaultMessage.myAccountInformationEmpty ? false : true;

	let isAccountLive = isCompanyAddressAdded === true && isCompanyNameAdded === true && isCompanyPhoneAdded === true && isCompanyServicesAdded === true ? true : false;

	// This tells the user which properties he needs to add to make his account live.
	let companyPropertiesUnfilled = logicUserAccounts.assembleCompanyPropertiesUnfilled(isCompanyNameAdded, isCompanyPhoneAdded, isCompanyAddressAdded, isCompanyServicesAdded);

	// For rendering.
	let activeLink = 'my-account';
	let contactEmail = siteValue.contactEmail.email;
	let loggedIn = true;
	let { projectStatus } = siteValue;

	let companyLogoPath = defaultValue.vendorLogoViewFolder;

	res.render('my-account', {
		activeLink,
		contactEmail,
		loggedIn,
		projectStatus,
		areAccountUpgradesExtendsAvailable,
		companyAddressMyAccountValue,
		companyDescriptionMyAccountValue,
		companyNameMyAccountValue,
		companyLogoPath,
		companyLogoMyAccountValue,
		companyLogoWidth,
		companyLogoHeight,
		companyPhoneMyAccountValue,
		companyProfileType,
		companyPropertiesUnfilled,
		companyServicesMyAccountValue,
		companyWebsiteMyAccountValue,
		contactEmail,
		costInDollarsProduct_1: stripeValue.costInDollarsProduct_1,
		email,
		failMessage,
		isAccountLive,
		isAccountUpgraded,
		isCompanyAddressAdded,
		isCompanyDescriptionAdded,
		isCompanyLogoAdded,
		isCompanyNameAdded,
		isCompanyPhoneAdded,
		isCompanyServicesAdded,
		isCompanyWebsiteAdded,
		isUpgradeExpirationSoon,
		memberSince,
		noChangeMessage,
		numberOfDaysUntilExpirationFragment,
		password,
		premiumExpirationDate,
		shouldBrowserFocusOnURLNotActiveError,
		successMessage,
		upgradedProfileName: defaultValue.accountUpgrade,
		upgradeCheckItOut: defaultMessage.upgradeCheckItOut,
		upgradeRequired: defaultMessage.upgradeRequired,
		upgradeSalesPitch: defaultMessage.upgradeSalesPitch,
		urlNotActiveMessage
	});
});

exports.pageNotFound = wrapAsync(async function (req, res) {
	// For rendering.
	let activeLink = 'page-not-found';
	let contactEmail = siteValue.contactEmail.email;
	let loggedIn = req.session.userValues ? true : false;
	let { projectStatus } = siteValue;

	res.status(404).render('page-not-found', {
		activeLink,
		contactEmail,
		loggedIn
	});
});

exports.passwordReset = wrapAsync(async function (req, res) {
	// Initial checks.  If queries were absent or fake forward to page-not-found.
	let hash = req.query.hash ? req.query.hash : '';
	if (hash === '') return res.status(404).redirect('/page-not-found');

	let doesPasswordResetRequestExist = await PasswordResetRequest.exists({
		confirmationHash: hash
	});
	if (doesPasswordResetRequestExist === false) return res.status(404).redirect('/page-not-found');

	// If there is an error available from previous postPasswordReset grab it from req.session and then delete it.
	if (req.session.transfer) {
		var { cleanedForm, changedPasswordError, confirmationPasswordError } = req.session.transfer;

		delete req.session.transfer;

		// Set object to previous form input.
		var inputFields = cleanedForm;
	} else {
		// If req.session data isn't used set every property to an empty string.
		var inputFields = submissionProcessing.makeFieldsEmpty(formFields.passwordReset);
	}

	// For rendering.
	let activeLink = 'password-reset';
	let contactEmail = siteValue.contactEmail.email;
	let loggedIn = req.session.userValues ? true : false;
	let { projectStatus } = siteValue;

	let passwordAttributes = renderValue.passwordField.attributes;

	res.render('password-reset', {
		userInput: inputFields,
		activeLink,
		contactEmail,
		loggedIn,
		projectStatus,
		hash,
		changedPasswordError,
		confirmationPasswordError,
		passwordAttributes
	});
});

exports.passwordResetRequest = wrapAsync(async function (req, res) {
	// If transfer data exists from postPasswordResetRequest grab it from req.session and then delete it.
	if (req.session.transfer) {
		var { cleanedForm, currentEmailError } = req.session.transfer;
		delete req.session.transfer;

		// Set object to previous form input.
		var inputFields = cleanedForm;
	} else {
		// If transfer data doesn't exist set every property to an empty string.
		var inputFields = submissionProcessing.makeFieldsEmpty(formFields.passwordResetRequest);
	}

	// For rendering.
	let activeLink = 'password-reset-request';
	let contactEmail = siteValue.contactEmail.email;
	let loggedIn = req.session.userValues ? true : false;
	let { projectStatus } = siteValue;

	let emailAttributes = renderValue.emailField.attributes;

	res.render('password-reset-request', {
		userInput: inputFields,
		activeLink,
		contactEmail,
		loggedIn,
		projectStatus,
		currentEmailError,
		emailAttributes
	});
});

exports.passwordResetRequestSent = wrapAsync(async function (req, res) {
	// Initial checks.  If queries were absent or fake forward to page-not-found.
	let email = req.query.email ? req.query.email : '';
	if (email === '') return res.status(404).redirect('/page-not-found');

	let doesPasswordResetRequestExist = await PasswordResetRequest.exists({
		email
	});
	if (doesPasswordResetRequestExist === false) return res.status(404).redirect('/page-not-found');

	let emailSubject = emailMessage.passwordResetRequestEmailSubject();
	let expirationTime = timeValue.getExpirationTime(timeValue.passwordResetRequestExpiration);

	// For rendering.
	let activeLink = 'password-reset-request-sent';
	let contactEmail = siteValue.contactEmail.email;
	let loggedIn = req.session.userValues ? true : false;
	let { projectStatus } = siteValue;

	res.render('password-reset-request-sent', {
		activeLink,
		contactEmail,
		loggedIn,
		projectStatus,
		email,
		emailSubject,
		expirationTime
	});
});

exports.passwordResetLimitReached = wrapAsync(async function (req, res) {
	// Initial checks.  If queries were absent or fake forward to page-not-found.
	let email = req.query.email ? req.query.email : '';
	if (email === '') return res.status(404).redirect('/page-not-found');

	let passwordResetRequest = await PasswordResetRequest.findOne({ email }).select({ numberOfRequests: 1 }).lean();
	if (!passwordResetRequest) return res.status(404).redirect('/page-not-found');

	// If number is out of range redirect to page-not-found.  Counter stops incrementing at max + 1 and stays at that number.
	let { numberOfRequests } = passwordResetRequest;
	if (numberOfRequests !== defaultValue.numberOfEmailConfirmationsAllowed + 1) return res.status(404).redirect('/page-not-found');

	// For rendering.
	let activeLink = 'password-reset-limit-reached';
	let contactEmail = siteValue.contactEmail.email;
	let loggedIn = req.session.userValues ? true : false;
	let { projectStatus } = siteValue;

	let emailSubject = emailMessage.passwordResetRequestEmailSubject();
	let expirationTime = timeValue.getExpirationTime(timeValue.passwordResetRequestExpiration);

	res.render('password-reset-limit-reached', {
		activeLink,
		contactEmail,
		loggedIn,
		projectStatus,
		email,
		emailSubject,
		expirationTime
	});
});

exports.passwordResetSuccess = wrapAsync(async function (req, res) {
	// Initial checks.  If queries were absent or fake forward to page-not-found.
	let successHash = req.query.hash ? req.query.hash : '';
	if (successHash === '') return res.status(404).redirect('/page-not-found');

	let doesPasswordResetRequestExist = await PasswordResetRequest.exists({
		successHash
	});
	if (doesPasswordResetRequestExist === false) return res.status(404).redirect('/page-not-found');

	// For rendering.
	let activeLink = 'password-reset-success';
	let contactEmail = siteValue.contactEmail.email;
	let loggedIn = req.session.userValues ? true : false;
	let { projectStatus } = siteValue;

	res.render('password-reset-success', {
		activeLink,
		contactEmail,
		loggedIn,
		projectStatus
	});
});

exports.postChangeEmail = wrapAsync(async function (req, res) {
	// Sanitize and process input.
	let cleanedForm = submissionProcessing.cleanForm(formFields.changeEmail, req.body);
	let { changedEmail, confirmationEmail, currentPassword } = cleanedForm;
	let { email } = req.session.userValues;

	let changeProperty = 'email';

	// lowercase all email addresses
	let changedEmailLowercase = changedEmail.toLowerCase();
	let confirmationEmailLowercase = confirmationEmail.toLowerCase();

	let isChangedEmailFilled = changedEmailLowercase === '' ? false : true;

	// Check for a change.  If nothing changed redirect to MyAccount.
	let isEmailUnchanged = email === changedEmailLowercase ? true : false;
	if (isChangedEmailFilled === true && isEmailUnchanged === true) {
		req.session.userValues.noChangeMessage = defaultMessage.noChange(changeProperty);
		return res.redirect('/my-account');
	}

	let isChangedEmailInsideMaxLength = changedEmailLowercase.length <= renderValue.emailField.maxLength ? true : false;
	let regExpChangedEmail = new RegExp(regExpValue.email);
	let isChangedEmailValidCharacters = regExpChangedEmail.test(changedEmailLowercase);
	let isChangedEmailValid = emailValidator.validate(changedEmailLowercase);
	let isChangedEmailAvailableInUnverifiedUsers = !(await UnverifiedUser.exists({
		email: changedEmailLowercase
	}));
	let isChangedEmailAvailableInUsers = !(await User.exists({
		email: changedEmailLowercase
	}));

	// If changedEmail has any errors clear out changedEmail and confirmationEmail.
	if (isChangedEmailFilled === false || isChangedEmailInsideMaxLength === false || isChangedEmailValidCharacters === false || isChangedEmailValid === false || isChangedEmailAvailableInUnverifiedUsers === false || isChangedEmailAvailableInUsers === false) {
		cleanedForm.changedEmail = '';
		confirmationEmailLowercase = '';
		cleanedForm.confirmationEmail = '';
	}

	let isConfirmationEmailFilled = confirmationEmailLowercase === '' ? false : true;
	let doEmailsMatch = changedEmailLowercase === confirmationEmailLowercase ? true : false;

	// If confirmationEmail has any errors clear it out.
	if (isConfirmationEmailFilled === false || doEmailsMatch === false) {
		cleanedForm.confirmationEmail = '';
	}

	let isCurrentPasswordFilled = currentPassword === '' ? false : true;
	let isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, req.session.userValues.password);

	// If currentPassword has any errors clear it out.
	if (isCurrentPasswordFilled === false || isCurrentPasswordCorrect === false) {
		cleanedForm.currentPassword = '';
	}

	if (isChangedEmailFilled === true && isChangedEmailInsideMaxLength === true && isChangedEmailValidCharacters === true && isChangedEmailValid === true && isChangedEmailAvailableInUnverifiedUsers === true && isChangedEmailAvailableInUsers === true && isConfirmationEmailFilled === true && doEmailsMatch === true && isCurrentPasswordFilled === true && isCurrentPasswordCorrect === true) {
		await User.updateOne({ email }, { email: changedEmailLowercase });

		let changeProperty = 'email';
		let changeVerb = defaultMessage.companyPropertyChangeVerb.update;
		req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);
		req.session.userValues.email = changedEmailLowercase;

		// Notify the user of the change.
		let emailSubject = emailMessage.emailChangedSubject();
		let emailBody = emailMessage.emailChangedBody(email, changedEmailLowercase);
		communication.sendEmail(siteValue.noReplyEmail, email, emailSubject, emailBody);

		return res.redirect('/my-account');
	} else {
		// Create and redirect the errors to changeEmail where they will be rendered and deleted.
		let changedEmailError = errorMessage.getChangedEmailError(isChangedEmailFilled, isChangedEmailInsideMaxLength, isChangedEmailValidCharacters, isChangedEmailValid, isChangedEmailAvailableInUnverifiedUsers, isChangedEmailAvailableInUsers);
		let confirmationEmailError = errorMessage.getChangedEmailConfirmationError(isConfirmationEmailFilled, doEmailsMatch);
		let currentPasswordError = errorMessage.getCurrentPasswordError(isCurrentPasswordFilled, isCurrentPasswordCorrect);

		req.session.transfer = {};
		req.session.transfer.cleanedForm = cleanedForm;
		req.session.transfer.changedEmailError = changedEmailError;
		req.session.transfer.confirmationEmailError = confirmationEmailError;
		req.session.transfer.currentPasswordError = currentPasswordError;

		return res.redirect('/change-email');
	}
});

exports.postChangePassword = wrapAsync(async function (req, res) {
	// Sanitize and process input.
	let cleanedForm = submissionProcessing.cleanForm(formFields.changePassword, req.body);
	let { currentPassword, changedPassword, confirmationPassword } = cleanedForm;
	let { email } = req.session.userValues;

	let changeProperty = 'password';

	let isCurrentPasswordFilled = currentPassword === '' ? false : true;
	let isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, req.session.userValues.password);

	// If currentPassword has any errors clear it out for rendering.
	if (isCurrentPasswordFilled === false || isCurrentPasswordCorrect === false) {
		currentPassword = '';
		cleanedForm.currentPassword = '';
	}

	let isChangedPasswordFilled = changedPassword === '' ? false : true;
	let isChangedPasswordInsideMaxLength = changedPassword.length <= renderValue.passwordField.maxLength ? true : false;
	let regExpPassword = new RegExp(regExpValue.password, 'i');
	let isChangedPasswordValidCharacters = regExpPassword.test(changedPassword);
	let doesChangedPasswordMeetRequirements = checks.checkIfPasswordMeetsRequirements(changedPassword);

	// If changedPassword has any errors clear it out and confirmationPassword which will trigger an error for it as well.
	if (isChangedPasswordFilled === false || isChangedPasswordInsideMaxLength === false || isChangedPasswordValidCharacters === false || doesChangedPasswordMeetRequirements === false) {
		changedPassword = '';
		cleanedForm.changedPassword = '';
		confirmationPassword = '';
		cleanedForm.confirmationPassword = '';
	}

	let isConfirmationPasswordFilled = confirmationPassword === '' ? false : true;
	let doPasswordsMatch = changedPassword === confirmationPassword ? true : false;

	// If confirmationPassword has any errors clear it out for rendering.
	if (isConfirmationPasswordFilled === false || doPasswordsMatch === false) {
		confirmationPassword = '';
		cleanedForm.confirmationPassword = '';
	}

	// If nothing changed send user back to my-account.  Don't check unless isCurrentPasswordCorrect is true.
	if (isCurrentPasswordCorrect === true && doPasswordsMatch === true) {
		let isPasswordUnchanged = await bcrypt.compare(changedPassword, req.session.userValues.password);

		if (isPasswordUnchanged === true) {
			req.session.userValues.noChangeMessage = defaultMessage.noChange(changeProperty);
			return res.redirect('/my-account');
		}
	}

	if (isCurrentPasswordFilled === true && isCurrentPasswordCorrect === true && isChangedPasswordFilled === true && isChangedPasswordInsideMaxLength === true && isChangedPasswordValidCharacters === true && doesChangedPasswordMeetRequirements === true && isConfirmationPasswordFilled === true && doPasswordsMatch === true) {
		// If any of these are stored in the DB delete them.
		await Promise.all([LoginFailure.findOneAndDelete({ email }), PasswordResetRequest.findOneAndDelete({ email })]);

		let passwordHashed = await logicUserAccounts.hashPassword(changedPassword);

		await User.updateOne({ email }, { password: passwordHashed });

		// Notify the user of the change.
		let emailSubject = emailMessage.passwordChangedSubject();
		let emailBody = emailMessage.passwordChangedBody(email);
		communication.sendEmail(siteValue.noReplyEmail, email, emailSubject, emailBody);

		let changeProperty = 'password';
		let changeVerb = defaultMessage.companyPropertyChangeVerb.update;
		req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);
		req.session.userValues.password = passwordHashed;

		return res.redirect('/my-account');
	} else {
		// Create and redirect the errors to changePassword where they will be rendered and deleted.
		let currentPasswordError = errorMessage.getCurrentPasswordError(isCurrentPasswordFilled, isCurrentPasswordCorrect);
		let changedPasswordError = errorMessage.getChangedPasswordError(isChangedPasswordFilled, isChangedPasswordInsideMaxLength, isChangedPasswordValidCharacters, doesChangedPasswordMeetRequirements);
		let confirmationPasswordError = errorMessage.getChangedConfirmationPasswordError(isConfirmationPasswordFilled, doPasswordsMatch);

		req.session.transfer = {};
		req.session.transfer.cleanedForm = cleanedForm;
		req.session.transfer.currentPasswordError = currentPasswordError;
		req.session.transfer.changedPasswordError = changedPasswordError;
		req.session.transfer.confirmationPasswordError = confirmationPasswordError;

		return res.redirect('/change-password');
	}
});

exports.postAddChangeCompanyAddress = wrapAsync(async function (req, res) {
	// Before the form is sanitized req.body.state must be added if the user forgot to select a value.  Otherwise the whole form is deemed to be fake because it didn't include all properties.  All potentially fake form submissions are cleared out during sanitization.
	if (!req.body.companyState) {
		req.body.companyState = '';
	}

	// Sanitize and process input.
	let cleanedForm = submissionProcessing.cleanForm(formFields.addChangeCompanyAddress, req.body);
	let { companyCity, companyState, companyStreet, companyStreetTwo, companyZip, useOriginalInput, deleteProperty } = cleanedForm;
	let { email } = req.session.userValues;

	let changeProperty = 'address';
	let changeVerb;

	if (deleteProperty === 'true') {
		await User.updateOne(
			{ email },
			{
				companyStreet: '',
				companyStreetTwo: '',
				companyCity: '',
				companyState: '',
				companyZip: '',
				companyLocation: {
					type: 'Point',
					coordinates: new Array()
				},
				live: false
			}
		);

		// Set all of the userValues with these property names to ''.
		let setToEmptyStringArray = formFields.addChangeCompanyAddress.filter(function (element) {
			return element !== 'deleteProperty' || element !== 'useOriginalInput';
		});

		setToEmptyStringArray.forEach(function (element) {
			req.session.userValues[element] = '';
		});

		req.session.userValues.live = false;

		changeVerb = defaultMessage.companyPropertyChangeVerb.delete;
		req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

		return res.redirect('/my-account');
	}

	let isCompanyStreetFilled = companyStreet === '' ? false : true;
	let isCompanyStreetTwoFilled = companyStreetTwo === '' ? false : true;
	let isCompanyCityFilled = companyCity === '' ? false : true;
	let isCompanyStateFilled = companyState === '' ? false : true;
	let isCompanyZipFilled = companyZip === '' ? false : true;

	// Eliminate ALL CAPS and Capitalize the input.  This needs to be done before values are compared.
	// Since only the first letter of each word is capitalized this will screw up words like McAlister.
	// In those rare cases that will be fixed when the user selects the USPS formatted address.
	let capitalizeEveryWordPattern = new RegExp(regExpValue.capitalizeEveryWord, 'g');

	if (isCompanyStreetFilled === true) {
		let companyStreetLowercase = companyStreet.toLowerCase();
		companyStreet = companyStreetLowercase.replace(capitalizeEveryWordPattern, function (match) {
			return match.toUpperCase();
		});
		cleanedForm.companyStreet = companyStreet;
	}

	if (isCompanyStreetTwoFilled === true) {
		let companyStreetTwoLowercase = companyStreetTwo.toLowerCase();
		companyStreetTwo = companyStreetTwoLowercase.replace(capitalizeEveryWordPattern, function (match) {
			return match.toUpperCase();
		});
		cleanedForm.companyStreetTwo = companyStreetTwo;
	}

	if (isCompanyCityFilled === true) {
		let companyCityLowercase = companyCity.toLowerCase();
		companyCity = companyCityLowercase.replace(capitalizeEveryWordPattern, function (match) {
			return match.toUpperCase();
		});
		cleanedForm.companyCity = companyCity;
	}

	// Check for a change.  If the form is filled out and nothing changed redirect to my-account using next 2 blocks.
	let isCompanyAddressUnchanged = req.session.userValues.companyCity === companyCity && req.session.userValues.companyState === companyState && req.session.userValues.companyStreet === companyStreet && req.session.userValues.companyStreetTwo === companyStreetTwo && req.session.userValues.companyZip === companyZip ? true : false;

	if (isCompanyAddressUnchanged === true && isCompanyStreetFilled === true && isCompanyCityFilled === true && isCompanyStateFilled === true && isCompanyZipFilled === true) {
		req.session.userValues.noChangeMessage = defaultMessage.noChange(changeProperty);
		return res.redirect('/my-account');
	}

	let regExpCompanyStreet = new RegExp(regExpValue.companyStreet, 'i');
	let isCompanyStreetValidCharacters = regExpCompanyStreet.test(companyStreet);
	let isCompanyStreetInsideMinLength = companyStreet.length >= renderValue.companyStreetField.minLength ? true : false;
	let isCompanyStreetInsideMaxLength = companyStreet.length <= renderValue.companyStreetField.maxLength ? true : false;

	if (isCompanyStreetTwoFilled === true) {
		let regExpCompanyStreetTwo = new RegExp(regExpValue.companyStreetTwo, 'i');
		var isCompanyStreetTwoValidCharacters = regExpCompanyStreetTwo.test(companyStreetTwo);
		var isCompanyStreetTwoInsideMinLength = companyStreetTwo.length >= renderValue.companyStreetTwoField.minLength ? true : false;
		var isCompanyStreetTwoInsideMaxLength = companyStreetTwo.length <= renderValue.companyStreetTwoField.maxLength ? true : false;
	}

	let regExpCompanyCity = new RegExp(regExpValue.companyCity, 'i');
	let isCompanyCityValidCharacters = regExpCompanyCity.test(companyCity);
	let isCompanyCityInsideMinLength = companyCity.length >= renderValue.companyCityField.minLength ? true : false;
	let isCompanyCityInsideMaxLength = companyCity.length <= renderValue.companyCityField.maxLength ? true : false;

	let isCompanyStateValid = checks.checkIfCompanyStateValid(companyState);

	let isCompanyZipFiveDigits = companyZip.length === 5 ? true : false;

	let regExpCompanyZip = new RegExp(regExpValue.companyZip, 'i');
	let isCompanyZipValidCharacters = regExpCompanyZip.test(companyZip);

	// Don't waste the bandwidth on usps.verify or client.geocodeForward if there are other errors to deal with first.
	if (isCompanyStreetFilled === true && isCompanyStreetInsideMinLength === true && isCompanyStreetInsideMaxLength === true && isCompanyStreetValidCharacters === true && isCompanyStreetTwoInsideMinLength !== false && isCompanyStreetTwoInsideMaxLength !== false && isCompanyStreetTwoValidCharacters !== false && isCompanyCityFilled === true && isCompanyCityInsideMinLength === true && isCompanyCityInsideMaxLength === true && isCompanyCityValidCharacters === true && isCompanyStateFilled === true && isCompanyStateValid === true && isCompanyZipFilled === true && isCompanyZipFiveDigits === true && isCompanyZipValidCharacters === true) {
		var uspsNormalized = await usps.verify({
			street1: companyStreet,
			street2: companyStreetTwo,
			city: companyCity,
			state: companyState,
			zip: companyZip
		});

		// If USPS can't normalize the address it returns a .name property that holds the value 'USPS Webtools Error'.
		// If there is no error .name is not returned.
		var isCompanyAddressValid = uspsNormalized.name === undefined ? true : false;

		var isCompanyAddressNormalized = checks.checkIfCompanyAddressNormalized(companyStreet, companyStreetTwo, companyCity, companyState, companyZip, uspsNormalized);

		let companyStreetTwoWithCommaSpace = companyStreetTwo ? `${companyStreetTwo}, ` : '';
		let assembledAddressForGeoLocation = `${companyStreet}, ${companyStreetTwoWithCommaSpace}${companyCity}, ${companyState}, ${companyZip}`;

		var geoLocation = await client.geocodeForward(assembledAddressForGeoLocation, { autocomplete: false, limit: 3, types: 'address' });

		// If geoLocation comes back with an array process it.
		if (geoLocation.entity.features.length > 0) {
			geoLocationAnswerLatLong = logicDefault.getGeoLocationAnswerLatLong(companyZip, geoLocation);
			var { isZipCodeRealAndInUsa, zipCodeLongAndLat } = geoLocationAnswerLatLong;
		}
	}

	// If the client selects use original input this check lets that address through.
	if (isCompanyStreetFilled === true && isCompanyStreetInsideMinLength === true && isCompanyStreetInsideMaxLength === true && isCompanyStreetValidCharacters === true && isCompanyStreetTwoInsideMinLength !== false && isCompanyStreetTwoInsideMaxLength !== false && isCompanyStreetTwoValidCharacters !== false && isCompanyCityFilled === true && isCompanyCityInsideMinLength === true && isCompanyCityInsideMaxLength === true && isCompanyCityValidCharacters === true && isCompanyStateFilled === true && isCompanyStateValid === true && isCompanyZipFilled === true && isCompanyZipFiveDigits === true && isCompanyZipValidCharacters === true && isCompanyAddressValid === true && isZipCodeRealAndInUsa === true && (isCompanyAddressNormalized === true || useOriginalInput === 'true')) {
		// True / False boolean.  If every account property has a value the account is live.
		let areAllAccountPropertiesFilled = checks.checkAreAllAccountPropertiesFilled(req.session.userValues, 'companyAddress');

		await User.updateOne(
			{ email },
			{
				companyStreet,
				companyStreetTwo,
				companyCity,
				companyState,
				companyZip,
				live: areAllAccountPropertiesFilled,
				companyLocation: {
					type: 'Point',
					coordinates: zipCodeLongAndLat
				}
			}
		);

		let wasCompanyAddressAdded = req.session.userValues.companyStreet === '' && req.session.userValues.companyCity === '' && req.session.userValues.companyState === '' && req.session.userValues.companyZip === '' ? true : false;

		changeVerb = wasCompanyAddressAdded === true ? defaultMessage.companyPropertyChangeVerb.add : defaultMessage.companyPropertyChangeVerb.update;
		req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

		req.session.userValues.companyStreet = companyStreet;
		req.session.userValues.companyStreetTwo = companyStreetTwo;
		req.session.userValues.companyCity = companyCity;
		req.session.userValues.companyState = companyState;
		req.session.userValues.companyZip = companyZip;

		return res.redirect('/my-account');

		// During this check everything works but the address isn't normalized so they are sent to a screen that asks them if they want normalized or original.
	} else if (isCompanyStreetFilled === true && isCompanyStreetInsideMinLength === true && isCompanyStreetInsideMaxLength === true && isCompanyStreetValidCharacters === true && isCompanyStreetTwoInsideMinLength !== false && isCompanyStreetTwoInsideMaxLength !== false && isCompanyStreetTwoValidCharacters !== false && isCompanyCityFilled === true && isCompanyCityInsideMinLength === true && isCompanyCityInsideMaxLength === true && isCompanyCityValidCharacters === true && isCompanyStateFilled === true && isCompanyStateValid === true && isCompanyZipFilled === true && isCompanyZipFiveDigits === true && isCompanyZipValidCharacters === true && isCompanyAddressValid === true && isCompanyAddressNormalized === false) {
		req.session.uspsNormalized = {};
		req.session.uspsNormalized.companyStreet = uspsNormalized.street1;
		req.session.uspsNormalized.companyStreetTwo = uspsNormalized.street2;
		req.session.uspsNormalized.companyCity = uspsNormalized.city;
		req.session.uspsNormalized.companyState = uspsNormalized.state;
		req.session.uspsNormalized.companyZip = uspsNormalized.Zip5;

		req.session.originalInput = {};
		req.session.originalInput.companyStreet = cleanedForm.companyStreet;
		req.session.originalInput.companyStreetTwo = cleanedForm.companyStreetTwo;
		req.session.originalInput.companyCity = cleanedForm.companyCity;
		req.session.originalInput.companyState = cleanedForm.companyState;
		req.session.originalInput.companyZip = cleanedForm.companyZip;

		return res.redirect('/add-change-company-address');
	} else {
		// Create and redirect the errors to changeCompanyAddress where they will be rendered and deleted from the session.
		let companyStreetError = errorMessage.getCompanyStreetError(isCompanyStreetFilled, isCompanyStreetValidCharacters, isCompanyStreetInsideMinLength, isCompanyStreetInsideMaxLength, isCompanyAddressValid, isZipCodeRealAndInUsa);
		let companyStreetTwoError = errorMessage.getCompanyStreetTwoError(isCompanyStreetTwoValidCharacters, isCompanyStreetTwoInsideMinLength, isCompanyStreetTwoInsideMaxLength);
		let companyCityError = errorMessage.getCompanyCityError(isCompanyCityFilled, isCompanyCityValidCharacters, isCompanyCityInsideMinLength, isCompanyCityInsideMaxLength);
		let companyStateError = errorMessage.getCompanyStateError(isCompanyStateFilled, isCompanyStateValid);
		let companyZipError = errorMessage.getCompanyZipError(isCompanyZipFilled, isCompanyZipValidCharacters, isCompanyZipFiveDigits);

		// If the USPS or client.geocode sends an error that the location does not exist clear out all other errors and only show that error.
		if (isCompanyAddressValid === false || isZipCodeRealAndInUsa === false) {
			companyStreetTwoError = undefined;
			companyCityError = undefined;
			companyStateError = undefined;
			companyZipError = undefined;
		}

		req.session.transfer = {};
		req.session.transfer.cleanedForm = cleanedForm;
		req.session.transfer.companyStreetError = companyStreetError;
		req.session.transfer.companyStreetTwoError = companyStreetTwoError;
		req.session.transfer.companyCityError = companyCityError;
		req.session.transfer.companyStateError = companyStateError;
		req.session.transfer.companyZipError = companyZipError;

		return res.redirect('/add-change-company-address');
	}
});

exports.postAddChangeCompanyDescription = wrapAsync(async function (req, res) {
	// Sanitize and process input.
	let cleanedForm = submissionProcessing.cleanForm(formFields.addChangeCompanyDescription, req.body);
	let { companyDescription, deleteProperty } = cleanedForm;
	let { email } = req.session.userValues;

	let changeProperty = 'description';
	let changeVerb;

	if (deleteProperty === 'true') {
		await User.updateOne({ email }, { companyDescription: '' });

		req.session.userValues.companyDescription = '';

		changeVerb = defaultMessage.companyPropertyChangeVerb.delete;
		req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

		return res.redirect('/my-account');
	}

	// In this route the tests are done a little out of normal order.
	let isCompanyDescriptionFilled = companyDescription === '' ? false : true;

	let isCompanyDescriptionFamilyFriendly = !filter.isProfane(companyDescription);

	let regExpCompanyDescription = new RegExp(regExpValue.companyDescription, 'i');
	let isCompanyDescriptionValidCharacters = regExpCompanyDescription.test(companyDescription);

	// Don't bother processing it if it has an early error.
	if (isCompanyDescriptionFilled === true && isCompanyDescriptionValidCharacters === true && isCompanyDescriptionFamilyFriendly === true) var processedCompanyDescription = logicUserAccounts.formatCompanyDescription(companyDescription);

	// If there are errors processedCompanyDescription will be undefined so don't do this.
	if (processedCompanyDescription) {
		cleanedForm.companyDescription = processedCompanyDescription;
		companyDescription = processedCompanyDescription;
	}

	// If nothing changed redirect to my-account.
	let isCompanyDescriptionUnchanged = companyDescription === req.session.userValues.companyDescription ? true : false;
	if (isCompanyDescriptionFilled === true && isCompanyDescriptionUnchanged === true) {
		req.session.userValues.noChangeMessage = defaultMessage.noChange(changeProperty);
		return res.redirect('/my-account');
	}

	let isCompanyDescriptionInsideMinLength = companyDescription.length >= renderValue.companyDescriptionField.minLength ? true : false;
	let isCompanyDescriptionInsideMaxLength = companyDescription.length <= renderValue.companyDescriptionField.maxLength ? true : false;

	// If company description is profane the value is cleared out.  This can't be done until all checks are done on value.
	if (isCompanyDescriptionFamilyFriendly === false) {
		cleanedForm.companyDescription = '';
		companyDescription = '';
	}

	if (isCompanyDescriptionFilled === true && isCompanyDescriptionFamilyFriendly === true && isCompanyDescriptionValidCharacters === true && isCompanyDescriptionInsideMinLength === true && isCompanyDescriptionInsideMaxLength === true) {
		// True / False boolean.  If every account property has a value the account is live.
		let areAllAccountPropertiesFilled = checks.checkAreAllAccountPropertiesFilled(req.session.userValues, 'companyDescription');

		await User.updateOne({ email }, { companyDescription, live: areAllAccountPropertiesFilled });

		let wasCompanyDescriptionAdded = req.session.userValues.companyDescription === '' ? true : false;
		changeVerb = wasCompanyDescriptionAdded === true ? defaultMessage.companyPropertyChangeVerb.add : defaultMessage.companyPropertyChangeVerb.update;
		req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

		req.session.userValues.companyDescription = companyDescription;

		return res.redirect('/my-account');
	} else {
		// Create and redirect the errors to changeCompanyDescription where they will be rendered and deleted.
		let companyDescriptionError = errorMessage.getCompanyDescriptionError(isCompanyDescriptionFilled, isCompanyDescriptionFamilyFriendly, isCompanyDescriptionValidCharacters, isCompanyDescriptionInsideMinLength, isCompanyDescriptionInsideMaxLength);

		req.session.transfer = {};
		req.session.transfer.cleanedForm = cleanedForm;
		req.session.transfer.companyDescriptionError = companyDescriptionError;

		return res.redirect('/add-change-company-description');
	}
});

exports.postAddChangeCompanyLogo = wrapAsync(async function (req, res) {
	// If the submission went through properly this should exist.
	if (req.file) {
		var { filename, mimetype, originalname, size } = req.file;
	}

	let { email } = req.session.userValues;
	let { deleteProperty } = req.body;
	let { maxVendorLogoUploadFileSize, vendorLogoValidMimeTypes, vendorLogoPasteToFolder, vendorLogoUploadFolder } = defaultValue;
	let { addChangeCompanyLogo } = formFields;

	// Process deletes first.
	let changeProperty = 'logo';
	let changeVerb;

	if (deleteProperty === 'true') {
		await User.updateOne(
			{ email },
			{
				'companyLogo.fileName': '',
				'companyLogo.width': '',
				'companyLogo.height': ''
			}
		);

		let deleteOldVendorLogoFilePath = path.join(vendorLogoPasteToFolder, req.session.userValues.companyLogo.fileName);
		fs.unlinkSync(deleteOldVendorLogoFilePath);

		req.session.userValues.companyLogo.fileName = '';
		req.session.userValues.companyLogo.width = '';
		req.session.userValues.companyLogo.height = '';

		changeVerb = defaultMessage.companyPropertyChangeVerb.delete;
		req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

		return res.redirect('/my-account');
	}

	let wereReqFieldsValid = checks.checkIfVendorLogoReqFieldsValid(req.body, req.file, addChangeCompanyLogo);
	let wasCompanyLogoSubmitted = req.file ? true : false;
	let isFileAnImage = checks.checkIfVendorLogoFileIsImage(filename, vendorLogoUploadFolder);
	let isFileTypeValid = checks.checkIfVendorLogoMimeTypeValid(mimetype, vendorLogoValidMimeTypes);
	let isFileSizeUnderLimit = checks.checkIfVendorLogoFileSizeUnderLimit(size, maxVendorLogoUploadFileSize);

	let currentFilePath = path.join(vendorLogoUploadFolder, filename);

	// Typically this is used at the end of route but in this case it is needed to help build the mongoose save object.
	let wasCompanyLogoAdded = req.session.userValues.companyLogo.fileName === '' ? true : false;

	if (wereReqFieldsValid === true && wasCompanyLogoSubmitted === true && isFileAnImage === true && isFileTypeValid === true && isFileSizeUnderLimit === true) {
		let successFilePath = path.join(vendorLogoPasteToFolder, filename);

		let imageDimensions = sizeOf(currentFilePath);
		let { width, height } = imageDimensions;
		let displayDimensions = logicUserAccounts.getDisplayDimensions(width, height);

		// Modify the file and copy it to the view folder.
		await sharp(currentFilePath).resize(displayDimensions.width, displayDimensions.height).toFile(successFilePath);

		// If there is an existing image push the name into the DB and then delete it from the folder.  The reason the old file name is saved is because just in case something throws an error you've got the old file name if you have to go in by hand and find it.

		let mongooseSaveVendorImageObject = mongooseLogic.createMongooseSaveVendorImageObject(filename, displayDimensions.width, displayDimensions.height, req.session.userValues.companyLogo, wasCompanyLogoAdded);
		await User.updateOne({ email }, mongooseSaveVendorImageObject);

		if (wasCompanyLogoAdded === false) {
			let deleteOldVendorLogoFilePath = path.join(vendorLogoPasteToFolder, req.session.userValues.companyLogo.fileName);
			fs.unlinkSync(deleteOldVendorLogoFilePath);
		}

		// Delete the original upload file.
		fs.unlinkSync(currentFilePath);

		changeVerb = wasCompanyLogoAdded === true ? defaultMessage.companyPropertyChangeVerb.add : defaultMessage.companyPropertyChangeVerb.update;
		req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

		req.session.userValues.companyLogo.fileName = filename;
		req.session.userValues.companyLogo.width = displayDimensions.width;
		req.session.userValues.companyLogo.height = displayDimensions.height;

		return res.redirect('/my-account');
	} else {
		// Delete the original upload file.
		fs.unlinkSync(currentFilePath);

		// Create and redirect the errors to changeCompanyName where they will be rendered and deleted from the session.
		let companyLogoError = errorMessage.getCompanyLogoError(wereReqFieldsValid, wasCompanyLogoSubmitted, isFileAnImage, isFileTypeValid, isFileSizeUnderLimit, originalname, size, maxVendorLogoUploadFileSize);

		req.session.transfer = {};
		req.session.transfer.companyLogoError = companyLogoError;

		return res.redirect('/add-change-company-logo');
	}
});

exports.postAddChangeCompanyName = wrapAsync(async function (req, res) {
	// Sanitize and process input.
	let cleanedForm = submissionProcessing.cleanForm(formFields.addChangeCompanyName, req.body);
	let { companyName, deleteProperty } = cleanedForm;
	let { email } = req.session.userValues;

	// Process deletes first.
	let changeProperty = 'name';
	let changeVerb;

	if (deleteProperty === 'true') {
		await User.updateOne({ email }, { companyName: '', live: false });

		req.session.userValues.companyName = '';
		req.session.userValues.live = false;

		changeVerb = defaultMessage.companyPropertyChangeVerb.delete;
		req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

		return res.redirect('/my-account');
	}

	let isCompanyNameFilled = companyName === '' ? false : true;

	// No need to process the input if it wasn't filled in.
	if (isCompanyNameFilled === true) {
		// capitalize the first letter in every word.
		let capitalizeEveryWordPattern = new RegExp(regExpValue.capitalizeEveryWord, 'g');
		companyName = companyName.replace(capitalizeEveryWordPattern, function (match) {
			return match.toUpperCase();
		});
		cleanedForm.companyName = companyName;
	}

	// If nothing changed redirect to my-account.
	let isCompanyNameUnchanged = companyName === req.session.userValues.companyName ? true : false;
	if (isCompanyNameFilled === true && isCompanyNameUnchanged === true) {
		req.session.userValues.noChangeMessage = defaultMessage.noChange(changeProperty);
		return res.redirect('/my-account');
	}

	let isCompanyNameFamilyFriendly = !filter.isProfane(companyName);

	let regExpCompanyName = new RegExp(regExpValue.companyName, 'i');
	let isCompanyNameValidCharacters = regExpCompanyName.test(companyName);

	let regexCharacters = new RegExp(regExpValue.characters, 'i');
	let doesCompanyNameContainAtLeastOneCharacter = regexCharacters.test(companyName);

	let isCompanyNameInsideMinLength = companyName.length >= renderValue.companyNameField.minLength ? true : false;
	let isCompanyNameInsideMaxLength = companyName.length <= renderValue.companyNameField.maxLength ? true : false;

	// If company Name is profane the value is cleared out.  This can't be done until all checks are done.
	if (isCompanyNameFamilyFriendly === false) {
		cleanedForm.companyName = '';
		companyName = '';
	}

	if (isCompanyNameFilled === true && isCompanyNameFamilyFriendly === true && isCompanyNameValidCharacters === true && doesCompanyNameContainAtLeastOneCharacter === true && isCompanyNameInsideMaxLength === true && isCompanyNameInsideMinLength === true) {
		// True / False boolean.  If every account property has a value the account is live.
		let areAllAccountPropertiesFilled = checks.checkAreAllAccountPropertiesFilled(req.session.userValues, 'companyName');

		await User.updateOne({ email }, { companyName, live: areAllAccountPropertiesFilled });

		let wasCompanyNameAdded = req.session.userValues.companyName === '' ? true : false;
		changeVerb = wasCompanyNameAdded === true ? defaultMessage.companyPropertyChangeVerb.add : defaultMessage.companyPropertyChangeVerb.update;
		req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

		req.session.userValues.companyName = companyName;

		return res.redirect('/my-account');
	} else {
		// Create and redirect the errors to changeCompanyName where they will be rendered and deleted from the session.
		let companyNameError = errorMessage.getCompanyNameError(isCompanyNameFilled, isCompanyNameFamilyFriendly, isCompanyNameValidCharacters, doesCompanyNameContainAtLeastOneCharacter, isCompanyNameInsideMinLength, isCompanyNameInsideMaxLength);

		req.session.transfer = {};
		req.session.transfer.cleanedForm = cleanedForm;
		req.session.transfer.companyNameError = companyNameError;

		return res.redirect('/add-change-company-name');
	}
});

exports.postAddChangeCompanyPhone = wrapAsync(async function (req, res) {
	// Sanitize and process input.
	let cleanedForm = submissionProcessing.cleanForm(formFields.addChangeCompanyPhone, req.body);
	let { companyPhone, deleteProperty } = cleanedForm;
	let { email } = req.session.userValues;

	// Process deletes first.
	let changeProperty = 'phone number';
	let changeVerb;

	if (deleteProperty === 'true') {
		await User.updateOne(
			{ email },
			{
				companyPhone: '',
				live: false
			}
		);

		req.session.userValues.companyPhone = '';
		req.session.userValues.live = false;

		changeVerb = defaultMessage.companyPropertyChangeVerb.delete;
		req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

		return res.redirect('/my-account');
	}

	// Dismantle and rebuild companyPhone.  formatPhone strips out all characters that aren't numbers and returns companyPhone in E.164 format.
	// Send this formatted version back on cleanedForm if there is an error.
	let companyPhoneFormatted = logicUserAccounts.formatCompanyPhone(companyPhone);
	cleanedForm.companyPhone = companyPhoneFormatted;

	// If nothing changed redirect to my-account.
	let isCompanyPhoneFilled = companyPhone === '' ? false : true;
	let isCompanyPhoneUnchanged = companyPhoneFormatted === req.session.userValues.companyPhone ? true : false;
	if (isCompanyPhoneFilled === true && isCompanyPhoneUnchanged === true) {
		req.session.userValues.noChangeMessage = defaultMessage.noChange(changeProperty);
		return res.redirect('/my-account');
	}

	// Although bad characters are processed out in formatCompanyPhone this check lets the user know they entered a bad character.
	// This stops the user from entering 6%0%2%5%5%5%5%5%5%5%, the % get processed out and removed and it comes back as a valid phone number.
	// The test must be done on companyPhone not companyPhoneFormatted like the other tests.
	let regExpCompanyPhone = new RegExp(regExpValue.companyPhone, 'i');
	let isCompanyPhoneValidCharacters = regExpCompanyPhone.test(companyPhone);

	// If invalid characters are submitted clear out the phone number.
	if (isCompanyPhoneValidCharacters === false) cleanedForm.companyPhone = '';

	// Checks the format as well.  Most of the time this spots incomplete numbers.
	let isCompanyPhoneValid = checks.checkIfCompanyPhoneValid(companyPhoneFormatted);

	if (isCompanyPhoneFilled === true && isCompanyPhoneValidCharacters === true && isCompanyPhoneValid === true) {
		// True / False boolean.  If every account property has a value the account is live.
		let areAllAccountPropertiesFilled = checks.checkAreAllAccountPropertiesFilled(req.session.userValues, 'companyPhone');

		await User.updateOne(
			{ email },
			{
				companyPhone: companyPhoneFormatted,
				live: areAllAccountPropertiesFilled
			}
		);

		let wasCompanyPhoneAdded = req.session.userValues.companyPhone === '' ? true : false;
		changeVerb = wasCompanyPhoneAdded === true ? defaultMessage.companyPropertyChangeVerb.add : defaultMessage.companyPropertyChangeVerb.update;
		req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

		req.session.userValues.companyPhone = companyPhoneFormatted;

		return res.redirect('/my-account');
	} else {
		// Create and redirect the errors to changeCompanyPhone where they will be rendered and deleted.
		let companyPhoneError = errorMessage.getCompanyPhoneError(isCompanyPhoneFilled, isCompanyPhoneValidCharacters, isCompanyPhoneValid);

		req.session.transfer = {};
		req.session.transfer.cleanedForm = cleanedForm;
		req.session.transfer.companyPhoneError = companyPhoneError;

		return res.redirect('/add-change-company-phone');
	}
});

exports.postAddChangeCompanyServices = wrapAsync(async function (req, res) {
	let { email } = req.session.userValues;

	//  You have to add the missing keys before this can be cleaned in cleanForm.
	let reqBodyWithMissingServicesAdded = submissionProcessing.addMissingServicesToSubmission(req.body);

	// Sanitize and process input.
	let cleanedForm = submissionProcessing.cleanForm(formFields.addChangeCompanyServices, reqBodyWithMissingServicesAdded);

	// Checks submitted values in cleanedForm and saves Boolean version in new object.
	let cleanedFormWithBoolean = logicDefault.convertStringToBoolean(cleanedForm, defaultValue.listOfCompanyServices);

	let { boardingSecuring, debrisRemovalTrashout, evictionManagement, fieldInspection, handymanGeneralMaintenance, landscapeMaintenance, lockChanges, overseePropertyRehabilitation, poolMaintenance, propertyCleaning, winterizations, deleteProperty } = cleanedFormWithBoolean;

	let changeProperty = 'services';
	let changeVerb;

	if (deleteProperty === 'true') {
		await User.updateOne(
			{ email },
			{
				boardingSecuring: false,
				debrisRemovalTrashout: false,
				evictionManagement: false,
				fieldInspection: false,
				handymanGeneralMaintenance: false,
				landscapeMaintenance: false,
				lockChanges: false,
				overseePropertyRehabilitation: false,
				poolMaintenance: false,
				propertyCleaning: false,
				winterizations: false,
				live: false
			}
		);

		// Set all of the userValues with these property names to false.
		let setToFalseArray = formFields.addChangeCompanyServices
			.filter(function (element) {
				return element !== 'deleteProperty';
			})
			.concat(['live']);

		setToFalseArray.forEach(function (element) {
			req.session.userValues[element] = false;
		});

		changeVerb = defaultMessage.companyPropertyChangeVerb.delete;
		req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

		return res.redirect('/my-account');
	}

	// Check for a change.  If nothing changed redirect to my-account.
	let isAtLeastOneCompanyServiceFilled = checks.checkIfAtLeastOneCompanyServiceFilled(cleanedFormWithBoolean);
	let wereAllServiceValuesValid = checks.checkIfServiceValuesValid(cleanedFormWithBoolean);
	let areCompanyServicesUnchanged = checks.checkIfCompanyServicesUnchanged(req.session.userValues, {
		boardingSecuring,
		debrisRemovalTrashout,
		evictionManagement,
		fieldInspection,
		handymanGeneralMaintenance,
		landscapeMaintenance,
		lockChanges,
		overseePropertyRehabilitation,
		poolMaintenance,
		propertyCleaning,
		winterizations
	});

	if (isAtLeastOneCompanyServiceFilled === true && areCompanyServicesUnchanged === true) {
		req.session.userValues.noChangeMessage = defaultMessage.noChange(changeProperty);
		return res.redirect('/my-account');
	}

	if (isAtLeastOneCompanyServiceFilled === true && wereAllServiceValuesValid === true) {
		// True / False boolean.  If every account property has a value the account is live.
		let areAllAccountPropertiesFilled = checks.checkAreAllAccountPropertiesFilled(req.session.userValues, 'companyServices');

		await User.updateOne(
			{ email },
			{
				boardingSecuring,
				debrisRemovalTrashout,
				debrisRemovalTrashout,
				evictionManagement,
				fieldInspection,
				handymanGeneralMaintenance,
				landscapeMaintenance,
				lockChanges,
				overseePropertyRehabilitation,
				poolMaintenance,
				propertyCleaning,
				winterizations,
				live: areAllAccountPropertiesFilled
			}
		);

		let wereCompanyServicesAdded = checks.checkWereCompanyServicesAdded(formFields.addChangeCompanyServices, req.session.userValues);

		changeVerb = wereCompanyServicesAdded === true ? defaultMessage.companyPropertyChangeVerb.add : defaultMessage.companyPropertyChangeVerb.update;
		req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

		req.session.userValues = logicUserAccounts.setReqSessionUserValuesServices(req.session.userValues, {
			boardingSecuring,
			debrisRemovalTrashout,
			evictionManagement,
			fieldInspection,
			handymanGeneralMaintenance,
			landscapeMaintenance,
			lockChanges,
			overseePropertyRehabilitation,
			poolMaintenance,
			propertyCleaning,
			winterizations
		});

		return res.redirect('/my-account');
	} else {
		// Create and redirect the errors to changeCompanyPhone where they will be rendered and deleted.
		let companyServicesError = errorMessage.getCompanyServicesError(isAtLeastOneCompanyServiceFilled, wereAllServiceValuesValid);

		req.session.transfer = {};
		req.session.transfer.companyServicesError = companyServicesError;
		req.session.transfer.cleanedForm = cleanedForm;

		return res.redirect('/add-change-company-services');
	}
});

exports.postAddChangeCompanyWebsite = wrapAsync(async function (req, res) {
	// Sanitize and process input.
	let cleanedForm = submissionProcessing.cleanForm(formFields.addChangeCompanyWebsite, req.body);
	let { companyWebsite, deleteProperty } = cleanedForm;
	let { email } = req.session.userValues;

	let changeProperty = 'website';
	let changeVerb;

	if (deleteProperty === 'true') {
		await User.updateOne(
			{ email },
			{
				companyWebsite: '',
				urlNotActiveError: false,
				shouldBrowserFocusOnURLNotActiveError: false
			}
		);

		req.session.userValues.urlNotActiveError = false;
		req.session.userValues.shouldBrowserFocusOnURLNotActiveError = false;
		req.session.userValues.companyWebsite = '';

		changeVerb = defaultMessage.companyPropertyChangeVerb.delete;
		req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

		return res.redirect('/my-account');
	}

	// If nothing changed redirect to my-account.
	let isCompanyWebsiteFilled = companyWebsite === '' ? false : true;
	let isCompanyWebsiteUnchanged = companyWebsite === req.session.userValues.companyWebsite ? true : false;
	if (isCompanyWebsiteFilled === true && isCompanyWebsiteUnchanged === true) {
		req.session.userValues.noChangeMessage = defaultMessage.noChange(changeProperty);
		return res.redirect('/my-account');
	}

	let regExpCompanyWebsite = new RegExp(regExpValue.companyWebsite);
	let isCompanyWebsiteValidCharacters = regExpCompanyWebsite.test(companyWebsite);

	let isCompanyWebsiteValid = validator.isURL(companyWebsite);

	let isCompanyWebsiteInsideMinLength = companyWebsite.length >= renderValue.companyWebsiteField.minLength ? true : false;
	let isCompanyWebsiteInsideMaxLength = companyWebsite.length <= renderValue.companyWebsiteField.maxLength ? true : false;

	if (isCompanyWebsiteFilled === true && isCompanyWebsiteValidCharacters === true && isCompanyWebsiteValid === true && isCompanyWebsiteInsideMinLength === true && isCompanyWebsiteInsideMaxLength === true) {
		let formattedURL = logicUserAccounts.formatURL(companyWebsite);

		// A new or changed website save clears out any errors in the DB.  Any new errors will have to be created in testFormattedURLAndSave.
		await User.updateOne(
			{ email },
			{
				companyWebsite: formattedURL,
				urlNotActiveError: false,
				shouldBrowserFocusOnURLNotActiveError: false
			}
		);

		// This tests if the website is active.  If it doesn't work it stores an error in the DB and sends the client an email.
		// It runs asynchronously in the background so that it doesn't cause a delay for the client.
		logicUserAccounts.testFormattedURLAndSave(formattedURL, email);

		let wasCompanyWebsiteAdded = req.session.userValues.companyWebsite === '' ? true : false;
		changeVerb = wasCompanyWebsiteAdded === true ? defaultMessage.companyPropertyChangeVerb.add : defaultMessage.companyPropertyChangeVerb.update;
		req.session.userValues.successMessage = defaultMessage.successfulChange(changeProperty, changeVerb);

		req.session.userValues.urlNotActiveError = false;
		req.session.userValues.shouldBrowserFocusOnURLNotActiveError = false;
		req.session.userValues.companyWebsite = formattedURL;

		return res.redirect('/my-account');
	} else {
		// Create and redirect the errors to addChangeCompanyWebsite where they will be rendered and deleted.
		let companyWebsiteError = errorMessage.getCompanyWebsiteError(isCompanyWebsiteFilled, isCompanyWebsiteValidCharacters, isCompanyWebsiteValid, isCompanyWebsiteInsideMaxLength, isCompanyWebsiteInsideMinLength);

		req.session.transfer = {};
		req.session.transfer.cleanedForm = cleanedForm;
		req.session.transfer.companyWebsiteError = companyWebsiteError;

		return res.redirect('/add-change-company-website');
	}
});

exports.postDeleteYourAccount = wrapAsync(async function (req, res) {
	// Sanitize and process input.
	let cleanedForm = submissionProcessing.cleanForm(formFields.deleteYourAccount, req.body);
	let { currentPassword } = cleanedForm;

	let email = req.session.userValues.email || '';
	let dbPassword = req.session.userValues.password || '';

	let isCurrentPasswordFilled = currentPassword === '' ? false : true;
	let isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, dbPassword);

	// If currentPassword has any errors clear it out.
	if (isCurrentPasswordFilled === false || isCurrentPasswordCorrect === false) {
		cleanedForm.currentPassword = '';
	}

	if (isCurrentPasswordCorrect) {
		// Delete every single Document in the db.
		await Promise.all([LoginFailure.findOneAndDelete({ email }), PasswordResetRequest.findOneAndDelete({ email }), RecentDeletedAccount.findOneAndDelete({ email }), StripeCheckoutSession.findOneAndDelete({ email }), UnverifiedUser.findOneAndDelete({ email }), User.findOneAndDelete({ email })]);

		// Create a temporary key stored in the DB to be used to access the account-deleted route.
		let recentDeletedAccount = mongooseLogic.createRecentDeletedAccount(email);
		await recentDeletedAccount.save();

		return logoutSteps.logoutUser(req, res, `/account-deleted?email=${email}`);
	}

	// Create and redirect the error to deleteYourAccount where it will be rendered and deleted.
	let currentPasswordError = errorMessage.getCurrentPasswordError(isCurrentPasswordFilled, isCurrentPasswordCorrect);

	req.session.transfer = {};
	req.session.transfer.currentPasswordError = currentPasswordError;

	return res.redirect('/delete-your-account');
});

exports.postLogin = wrapAsync(async function (req, res) {
	// Sanitize and process input.
	let cleanedForm = submissionProcessing.cleanForm(formFields.login, req.body);
	let { currentEmail, currentPassword } = cleanedForm;

	// lowercase all email addresses
	let currentEmailLowercase = currentEmail.toLowerCase();

	let loginFailure = await LoginFailure.findOne({
		email: currentEmailLowercase
	})
		.select({ numberOfFailures: 1 })
		.lean();
	if (loginFailure) {
		let { numberOfFailures } = loginFailure;
		if (numberOfFailures > defaultValue.numberOfLoginFailuresAllowed) return res.redirect(`/login-failure-limit-reached?email=${currentEmailLowercase}`);
	}

	let isCurrentEmailFilled = currentEmailLowercase === '' ? false : true;
	let isCurrentEmailValid = emailValidator.validate(currentEmailLowercase);

	// Without stringify userValues comes out as a model which in at least one instance created weird behavior.
	// Because of expiration date and timeZone plugin using .lean() will require significant refactor.
	let unprocessedUserValues = await User.findOne({
		email: currentEmailLowercase
	});
	let userValues = JSON.parse(JSON.stringify(unprocessedUserValues));

	let doesUserExist = userValues === null ? false : true;

	// If the user is suspended kick them out here.
	if (userValues) {
		let { accountSuspended } = userValues;
		if (accountSuspended === true) return res.redirect(`/account-suspended?email=${currentEmailLowercase}`);
	}

	// If there are any email errors clear out the password.
	if (isCurrentEmailFilled === false || isCurrentEmailValid === false) {
		currentPassword = '';
		cleanedForm.currentPassword = '';
	}

	let isPasswordFilled = currentPassword === '' ? false : true;
	let dbPassword = doesUserExist === true ? userValues.password : '';
	let isPasswordCorrect = await bcrypt.compare(currentPassword, dbPassword);

	// Increment login failure if needed.  This occurs even if email/account doesn't exist to stop hackers from blasting server.
	if (isCurrentEmailFilled === true && isCurrentEmailValid === true && isPasswordFilled === true && isPasswordCorrect === false) {
		if (!loginFailure) {
			loginFailure = mongooseLogic.createLoginFailure(currentEmailLowercase);
			await loginFailure.save();
		} else {
			let { numberOfFailures } = loginFailure;
			numberOfFailures += 1;

			if (numberOfFailures > defaultValue.numberOfLoginFailuresAllowed) {
				// If locked out set numberOfFailures to max + 1
				await LoginFailure.updateOne(
					{ email: currentEmailLowercase },
					{
						numberOfFailures: defaultValue.numberOfLoginFailuresAllowed + 1
					}
				);
				return res.redirect(`/login-failure-limit-reached?email=${currentEmailLowercase}`);
			} else {
				await LoginFailure.updateOne({ email: currentEmailLowercase }, { numberOfFailures });
			}
		}
	}

	if (doesUserExist === true && isPasswordCorrect === true) {
		// Check for and remove any login failures in the db.
		await LoginFailure.findOneAndDelete({ email: currentEmailLowercase });

		req.session.userValues = userValues;

		return res.redirect('/my-account');
	} else {
		// Create and redirect the errors to login where they will be rendered and deleted.
		let currentEmailError = errorMessage.getCurrentEmailError(isCurrentEmailFilled, isCurrentEmailValid);
		let currentPasswordError = errorMessage.getLoginPasswordError(isPasswordFilled, doesUserExist, isPasswordCorrect);

		req.session.transfer = {};
		req.session.transfer.cleanedForm = cleanedForm;
		req.session.transfer.currentEmailError = currentEmailError;
		req.session.transfer.currentPasswordError = currentPasswordError;

		return res.redirect('/login');
	}
});

exports.postPasswordReset = wrapAsync(async function (req, res) {
	// Sanitize and process input.
	let cleanedForm = submissionProcessing.cleanForm(formFields.passwordReset, req.body);
	let { changedPassword, confirmationPassword } = cleanedForm;

	// Reject if an empty hash is posted.
	let hash = req.query.hash ? req.query.hash : '';
	if (hash === '') return res.status(404).redirect('/page-not-found');

	// Reject if a fake hash is posted.
	let passwordResetRequest = await PasswordResetRequest.findOne({
		confirmationHash: hash
	})
		.select({ email: 1, successHash: 1 })
		.lean();
	if (!passwordResetRequest) return res.status(404).redirect('/page-not-found');

	let isChangedPasswordFilled = changedPassword === '' ? false : true;
	let isChangedPasswordInsideMaxLength = changedPassword.length <= renderValue.passwordField.maxLength ? true : false;
	let regExpPassword = new RegExp(regExpValue.password, 'i');
	let isChangedPasswordValidCharacters = regExpPassword.test(changedPassword);
	let doesChangedPasswordMeetRequirements = checks.checkIfPasswordMeetsRequirements(changedPassword);

	let isConfirmationPasswordFilled = confirmationPassword === '' ? false : true;
	let doPasswordsMatch = changedPassword === confirmationPassword ? true : false;

	if (isChangedPasswordFilled === true && isChangedPasswordInsideMaxLength === true && isChangedPasswordValidCharacters === true && doesChangedPasswordMeetRequirements === true && isConfirmationPasswordFilled === true && doPasswordsMatch === true) {
		let { email, successHash } = passwordResetRequest;
		let passwordHashed = await logicUserAccounts.hashPassword(changedPassword);
		await User.updateOne({ email }, { password: passwordHashed });

		// Check for and remove any LoginFailure in the db.
		await LoginFailure.findOneAndDelete({ email });

		// The new hash makes it impossible for the client to return to the old passwordReset route.
		// Mongoose automatically deletes The PasswordResetRequest after a short period.
		let hideThisRouteFromClientHash = logicUserAccounts.createRandomHash(email);
		await PasswordResetRequest.updateOne({ confirmationHash: hash }, { confirmationHash: hideThisRouteFromClientHash });

		return res.redirect(`/password-reset-success?hash=${successHash}`);
	} else {
		// Create and send the error to passwordReset where it will be used and deleted.
		let changedPasswordError = errorMessage.getChangedPasswordError(isChangedPasswordFilled, isChangedPasswordInsideMaxLength, isChangedPasswordValidCharacters, doesChangedPasswordMeetRequirements);
		let confirmationPasswordError = errorMessage.getChangedConfirmationPasswordError(isConfirmationPasswordFilled, doPasswordsMatch);

		req.session.transfer = {};
		req.session.transfer.cleanedForm = cleanedForm;
		req.session.transfer.changedPasswordError = changedPasswordError;
		req.session.transfer.confirmationPasswordError = confirmationPasswordError;

		return res.redirect(`/password-reset?hash=${hash}`);
	}
});

exports.postPasswordResetRequest = wrapAsync(async function (req, res) {
	// Sanitize and process input.
	let cleanedForm = submissionProcessing.cleanForm(formFields.passwordResetRequest, req.body);
	let { currentEmail } = cleanedForm;

	// lower case all email addresses
	let currentEmailLowercase = currentEmail.toLowerCase();

	let isCurrentEmailFilled = currentEmailLowercase === '' ? false : true;
	let isCurrentEmailValid = emailValidator.validate(currentEmailLowercase);

	// These checks don't test to see if the email corresponds to an actual user.
	// If the email passes the checks and no user exists send the client to passwordResetRequestSent anyway.
	// This way hackers won't know if an email exists in the DB.
	if (isCurrentEmailFilled === false || isCurrentEmailValid === false) {
		// Create and send the error to passwordResetRequest where it will be used and deleted.
		let currentEmailError = errorMessage.getCurrentEmailError(isCurrentEmailFilled, isCurrentEmailValid);

		req.session.transfer = {};
		req.session.transfer.cleanedForm = cleanedForm;
		req.session.transfer.currentEmailError = currentEmailError;

		return res.redirect('/password-reset-request');
	}

	// If client attempts to reset password of an unverified account make him verify first.
	let unverifiedUser = await UnverifiedUser.findOne({
		email: currentEmailLowercase
	})
		.select({ numberOfConfirmations: 1 })
		.lean();
	if (unverifiedUser) {
		let { numberOfConfirmations } = unverifiedUser;
		if (numberOfConfirmations > defaultValue.numberOfEmailConfirmationsAllowed) {
			return res.redirect(`/confirmation-limit-reached?email=${currentEmailLowercase}&resetattempt=true`);
		} else {
			return res.redirect(`/confirmation-sent?email=${currentEmailLowercase}&resetattempt=true`);
		}
	}

	// Before a password reset request is created make sure the user isn't locked out of their account.
	let userValues = await User.findOne({ email: currentEmailLowercase }).select({ accountSuspended: 1 }).lean();
	if (userValues) {
		let { accountSuspended } = userValues;
		if (accountSuspended === true) return res.redirect(`/account-suspended?email=${currentEmailLowercase}`);
	}

	let passwordResetRequest = await PasswordResetRequest.findOne({
		email: currentEmailLowercase
	})
		.select({ confirmationHash: 1, numberOfRequests: 1 })
		.lean();

	let confirmationHash, numberOfRequests;
	if (passwordResetRequest) {
		confirmationHash = passwordResetRequest.confirmationHash;
		numberOfRequests = passwordResetRequest.numberOfRequests += 1;

		if (numberOfRequests > defaultValue.numberOfPasswordResetRequestsAllowed) {
			numberOfRequests = defaultValue.numberOfPasswordResetRequestsAllowed + 1;
			await PasswordResetRequest.updateOne({ email: currentEmailLowercase }, { numberOfRequests });
			return res.redirect(`/password-reset-limit-reached?email=${currentEmailLowercase}`);
		} else {
			await PasswordResetRequest.updateOne({ email: currentEmailLowercase }, { numberOfRequests });
		}
	} else {
		confirmationHash = logicUserAccounts.createRandomHash(currentEmailLowercase);
		let successHash = logicUserAccounts.createRandomHash(currentEmailLowercase);
		passwordResetRequest = await mongooseLogic.createPasswordResetRequest(currentEmailLowercase, confirmationHash, successHash);
		numberOfRequests = passwordResetRequest.numberOfRequests;
		await passwordResetRequest.save();
	}

	if (userValues) {
		let emailSubject = emailMessage.passwordResetRequestEmailSubject();
		let expirationTime = timeValue.getExpirationTime(timeValue.passwordResetRequestExpiration);
		let emailBody = emailMessage.passwordResetRequestEmailBody(confirmationHash, expirationTime);
		communication.sendEmail(siteValue.noReplyEmail, currentEmailLowercase, emailSubject, emailBody);
	}

	return res.redirect(`/password-reset-request-sent?email=${currentEmailLowercase}`);
});

exports.postRegister = wrapAsync(async function (req, res) {
	// Sanitize and process input.

	// Add the checkbox if it wasn't checked and then process it.
	if (!req.body.privacyTerms || req.body.privacyTerms !== 'isChecked') req.body.privacyTerms = 'notChecked';
	let privacyPolicyTermsOfService = submissionProcessing.convertCheckboxToBoolean(req.body.privacyTerms);

	let cleanedForm = submissionProcessing.cleanForm(formFields.register, req.body);
	let { newEmail, newPassword, confirmationPassword } = cleanedForm;

	// lower case all email addresses
	let newEmailLowercase = newEmail.toLowerCase();

	let isNewEmailFilled = newEmailLowercase ? true : false;
	let isNewEmailInsideMaxLength = newEmailLowercase.length <= renderValue.emailField.maxLength ? true : false;
	let regExpEmail = new RegExp(regExpValue.email);
	let isNewEmailValidCharacters = regExpEmail.test(newEmailLowercase);
	let isNewEmailValid = emailValidator.validate(newEmailLowercase);
	let isNewEmailAvailableInUnverifiedUsers = !(await UnverifiedUser.exists({
		email: newEmailLowercase
	}));
	let isNewEmailAvailableInUsers = !(await User.exists({
		email: newEmailLowercase
	}));

	let isNewPasswordFilled = newPassword === '' ? false : true;
	let isNewPasswordInsideMaxLength = newPassword.length <= renderValue.passwordField.maxLength ? true : false;
	let regExpPassword = new RegExp(regExpValue.password, 'i');
	let isNewPasswordValidCharacters = regExpPassword.test(newPassword);
	let doesNewPasswordMeetRequirements = checks.checkIfPasswordMeetsRequirements(newPassword);

	// If there is any newPassword error clear out newPassword and confirmationPassword.
	if (isNewPasswordFilled === false || isNewPasswordInsideMaxLength === false || isNewPasswordValidCharacters === false || doesNewPasswordMeetRequirements === false) {
		newPassword = '';
		cleanedForm.newPassword = '';
		confirmationPassword = '';
		cleanedForm.confirmationPassword = '';
	}

	let isConfirmationPasswordFilled = confirmationPassword === '' ? false : true;
	let doPasswordsMatch = newPassword === confirmationPassword ? true : false;

	// If there is any confirmationPassword error clear it out.
	if (isConfirmationPasswordFilled === false || doPasswordsMatch === false) {
		confirmationPassword = '';
		cleanedForm.confirmationPassword = '';
	}

	let isPrivacyPolicyTermsOfServiceChecked = privacyPolicyTermsOfService === true ? true : false;

	// If there are any errors uncheck privacyPolicyTermsOfService.  However the interface only displays an error message if the user forgot to check it.
	if (isNewEmailFilled === false || isNewEmailInsideMaxLength === false || isNewEmailValidCharacters === false || isNewEmailValid === false || isNewEmailAvailableInUsers === false || isNewPasswordFilled === false || isNewPasswordInsideMaxLength === false || isNewPasswordValidCharacters === false || doesNewPasswordMeetRequirements || isConfirmationPasswordFilled === false || doPasswordsMatch === false || isPrivacyPolicyTermsOfServiceChecked === false) {
		privacyPolicyTermsOfService = false;
		cleanedForm.privacyPolicyTermsOfService = undefined;
	}

	if (isNewEmailFilled === true && isNewEmailInsideMaxLength === true && isNewEmailValidCharacters === true && isNewEmailValid === true && isNewEmailAvailableInUsers === true && isNewPasswordFilled === true && isNewPasswordInsideMaxLength === true && isNewPasswordValidCharacters === true && doesNewPasswordMeetRequirements === true && isConfirmationPasswordFilled === true && doPasswordsMatch === true && isPrivacyPolicyTermsOfServiceChecked === true) {
		// The numberOfConfirmations counter is incremented in the registration-sent route.  This is used as a query to avoid doubling the increment if the client comes from this route.
		let newRegister = '';
		let unverifiedMultipleRegisters = '';

		// If an unverified user already exists save over it with new values but update the confirmation counter so that a hacker can't blast the server with same email an unlimited number of times.
		if (isNewEmailAvailableInUnverifiedUsers === false) {
			let unverifiedUser = await UnverifiedUser.findOne({
				email: newEmailLowercase
			})
				.select({ numberOfConfirmations: 1 })
				.lean();

			let { numberOfConfirmations } = unverifiedUser;
			if (numberOfConfirmations > defaultValue.numberOfEmailConfirmationsAllowed) {
				return res.redirect(`/confirmation-limit-reached?email=${newEmailLowercase}`);
			}

			let hashedPassword = await logicUserAccounts.hashPassword(newPassword);
			await UnverifiedUser.updateOne({ email: newEmailLowercase }, { password: hashedPassword });
			unverifiedMultipleRegisters = '&unverifiedmultipleregisters=true';
		} else {
			// If for some reason there is anything in the DB delete it.  It is no longer needed.
			await Promise.all([
				LoginFailure.findOneAndDelete({ email: newEmailLowercase }),
				PasswordResetRequest.findOneAndDelete({
					email: newEmailLowercase
				}),
				RecentDeletedAccount.findOneAndDelete({
					email: newEmailLowercase
				}),
				StripeCheckoutSession.findOneAndDelete({
					email: newEmailLowercase
				}),
				UnverifiedUser.findOneAndDelete({ email: newEmailLowercase }),
				User.findOneAndDelete({ email: newEmailLowercase })
			]);

			let unverifiedUser = mongooseLogic.createUnverifiedUser(newEmailLowercase);
			let salt = cryptoRandomString({ length: 10 });
			unverifiedUser.confirmationHash = objectHash(newEmailLowercase + salt);
			unverifiedUser.password = await logicUserAccounts.hashPassword(newPassword);
			await unverifiedUser.save();
			newRegister = '&newregister=true';
		}

		return res.redirect(`/confirmation-sent?email=${newEmailLowercase}${newRegister}${unverifiedMultipleRegisters}`);
	} else {
		// Create and send the errors to register where they will be used and deleted.
		let newEmailError = errorMessage.getNewEmailError(isNewEmailFilled, isNewEmailInsideMaxLength, isNewEmailValidCharacters, isNewEmailValid, isNewEmailAvailableInUnverifiedUsers, isNewEmailAvailableInUsers);
		let newPasswordError = errorMessage.getNewPasswordError(isNewPasswordFilled, isNewPasswordInsideMaxLength, isNewPasswordValidCharacters, doesNewPasswordMeetRequirements);
		let confirmationPasswordError = errorMessage.getNewConfirmationPasswordError(isConfirmationPasswordFilled, doPasswordsMatch);
		let privacyTermsError = errorMessage.getPrivacyTermsError(isPrivacyPolicyTermsOfServiceChecked);

		req.session.transfer = {};
		req.session.transfer.cleanedForm = cleanedForm;
		req.session.transfer.newEmailError = newEmailError;
		req.session.transfer.newPasswordError = newPasswordError;
		req.session.transfer.confirmationPasswordError = confirmationPasswordError;
		req.session.transfer.privacyTermsError = privacyTermsError;

		return res.redirect('/register');
	}
});

exports.redirectIfNoUpgrade = wrapAsync(async function (req, res, next) {
	if (req.session.userValues.companyProfileType === defaultValue.accountDefault) return res.redirect('/my-account');

	return next();
});

// If the user is logged in redirect to my-account.
exports.redirectMyAccount = wrapAsync(async function (req, res, next) {
	let doUserValuesExist = 'userValues' in req.session;

	if (doUserValuesExist === true) return res.redirect('/my-account');

	return next();
});

exports.redirectLogin = wrapAsync(async function (req, res, next) {
	let doUserValuesExist = 'userValues' in req.session;

	if (doUserValuesExist === false) return res.redirect('/login');

	return next();
});

exports.register = wrapAsync(async function (req, res) {
	// If there is data available from previous postRegister gather it from req.session and then delete it.
	if (req.session.transfer) {
		var { cleanedForm, newEmailError, newPasswordError, confirmationPasswordError, privacyTermsError } = req.session.transfer;

		// Set object to previous form input.
		var inputFields = cleanedForm;

		delete req.session.transfer;
	} else {
		// If req.session data isn't used set every property to an empty string.
		var inputFields = submissionProcessing.makeFieldsEmpty(formFields.register);
	}

	// For rendering.
	let activeLink = 'register';
	let contactEmail = siteValue.contactEmail.email;
	let loggedIn = req.session.userValues ? true : false;
	let { projectStatus } = siteValue;

	let emailAttributes = renderValue.emailField.attributes;
	let passwordAttributes = renderValue.passwordField.attributes;

	res.render('register', {
		userInput: inputFields,
		activeLink,
		contactEmail,
		loggedIn,
		projectStatus,
		emailAttributes,
		passwordAttributes,
		newEmailError,
		newPasswordError,
		confirmationPasswordError,
		privacyTermsError
	});
});

exports.verified = wrapAsync(async function (req, res) {
	// Initial checks.  If queries were absent or fake forward to page-not-found.
	let hash = req.query.hash ? req.query.hash : '';
	if (hash === '') return res.status(404).redirect('/page-not-found');

	let unverifiedUser = await UnverifiedUser.findOne({
		confirmationHash: hash
	}).lean();
	if (!unverifiedUser) return res.status(404).redirect('/page-not-found');

	// Create the verified user from the unverifiedUser.
	let newUser = mongooseLogic.createUser(unverifiedUser);

	let { email } = unverifiedUser;

	// Save the user.
	// Delete the unverifiedUser from the db.
	// If either of the next 2 are stored in the DB delete them.  They are no longer needed.
	await Promise.all([newUser.save(), UnverifiedUser.findOneAndDelete({ email }), LoginFailure.findOneAndDelete({ email }), PasswordResetRequest.findOneAndDelete({ email })]);

	// For rendering.
	let activeLink = 'verified';
	let contactEmail = siteValue.contactEmail.email;
	let loggedIn = req.session.userValues ? true : false;
	let { projectStatus } = siteValue;

	res.render('verified', {
		activeLink,
		contactEmail,
		loggedIn,
		projectStatus
	});
});
