const MapboxClient = require('mapbox');
const client = new MapboxClient(process.env.MAPBOX_DEFAULT_PUBLIC_TOKEN);

const checks = require('./checks');
const defaultValue = require('../models/default-values');
const errorMessage = require('../models/error-messages');
const formFields = require('../models/forms-default-fields');
const submissionProcessing = require('./submission-processing');
const logicDefault = require('./logic-default');
const mongooseLogic = require('./mongoose-logic');
const regExpValue = require('../models/regexp-values');
const renderValue = require('../models/rendering-values');
const siteValue = require('../models/site-values');
const { wrapAsync } = require('./error-handling');

const { User } = require('../models/mongoose-schema');

exports.foreclosureCleanupVendorList = wrapAsync(async function(req, res) {

    // For rendering.
    // Normally this goes at the bottom but in this case because these values are used on both sides of an if statement they go up here.
    let activeLink = 'foreclosure-cleanup-vendor-list';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;

    let searchZipAttributes = renderValue.searchZipField.attributes;

    // These are set differently on either side of the if block.
    let searchRadiusAttributesAndValue, servicesAttributesAndValues;   

    let { searchType } = req.query;
    if (searchType === 'new' || searchType === 'multiple') {

        let cleanedQuery = submissionProcessing.cleanQuery(formFields.foreclosureCleanupVendorList, req.query);
        let cleanedQueryWithBoolean = logicDefault.convertStringToBoolean(cleanedQuery, defaultValue.listOfCompanyServices);

        let {
            searchRadius,
            searchZipCode,
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
        } = cleanedQueryWithBoolean;

        searchRadiusNumerical = parseInt(searchRadius);
        searchRadiusAttributesAndValue = logicDefault.createSearchRadiusAttributesAndValue(defaultValue.searchRadius, searchRadiusNumerical);
        servicesAttributesAndValues = logicDefault.createServicesAttributesAndValues(defaultValue.listOfCompanyServices, cleanedQueryWithBoolean);

        let isSearchZipCodeFilled = searchZipCode === '' ? false : true;
        let regSearchZipCode = new RegExp(regExpValue.companyZip);
        let isSearchZipCodeValidCharacters = regSearchZipCode.test(searchZipCode);
        let isSearchZipCodeFiveDigits = searchZipCode.length === 5 ? true : false;

        // Don't search for zip code lat and long if there is an error.
        if (isSearchZipCodeFilled === true && isSearchZipCodeValidCharacters === true && isSearchZipCodeFiveDigits === true) {

            let geoLocationOfZip = await client.geocodeForward(searchZipCode, { autocomplete: false, limit: 3, types: 'postcode' });

            if (geoLocationOfZip.entity.features.length > 0) {

                let geoLocationAnswerLatLong = logicDefault.getGeoLocationAnswerLatLong(searchZipCode, geoLocationOfZip);
                var { isZipCodeRealAndInUsa, zipCodeLongAndLat } = geoLocationAnswerLatLong;

            }

        }

        let isSearchRadiusFilled = searchRadius === '' ? false : true;
        let isSearchRadiusValid = defaultValue.searchRadius.includes(searchRadiusNumerical);

        let searchServicesForChecking = logicDefault.createSearchServicesForChecking(cleanedQueryWithBoolean, defaultValue.listOfCompanyServices);
        let isAtLeastOneServiceChecked = checks.checkIfAtLeastOneCompanyServiceFilled(searchServicesForChecking);
        let wereAllServiceValuesValid = checks.checkIfServiceValuesValid(searchServicesForChecking);

        let privacyTerms;
        if (req.session.transfer) {
            privacyTerms = req.session.transfer.privacyTerms;
            delete req.session.transfer;
        } else {
            privacyTerms = 'notChecked';
        }
        let privacyTermsBoolean = submissionProcessing.convertCheckboxToBoolean(privacyTerms);
        let isPrivacyTermsChecked = privacyTermsBoolean === true ? true : false;

        // Don't search the DB if there are any errors.
        if (
            isSearchZipCodeFilled === true &&
            isSearchZipCodeValidCharacters === true &&
            isZipCodeRealAndInUsa === true &&
            isSearchRadiusFilled === true &&
            isSearchRadiusValid === true &&
            isAtLeastOneServiceChecked === true &&
            wereAllServiceValuesValid === true &&
            isPrivacyTermsChecked === true
        ) {

            let mongooseSearchObject = mongooseLogic.createMongooseSearchObject(
                searchRadiusNumerical,
                zipCodeLongAndLat,
                {
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
                }
            );

            let mongooseSelectObject = mongooseLogic.createMongooseSelectObject();

            let searchResults = await User.find(mongooseSearchObject).select(mongooseSelectObject).lean();

            let freeAccounts = logicDefault.separateAccountTypes(searchResults, defaultValue.accountDefault);
            let premiumAccounts = logicDefault.separateAccountTypes(searchResults, defaultValue.accountUpgrade);

            let freeAccountsProcessed = logicDefault.processCompanyServices(freeAccounts);
            let premiumAccountsProcessed = logicDefault.processCompanyServices(premiumAccounts);

            let searchAgainNamesValues = logicDefault.getSearchAgainNamesValues(cleanedQueryWithBoolean);

            // This tells EJS to render the search result or an empty result if nothing was found.
            let searchOutput = {};
            searchOutput.free = Array.isArray(freeAccountsProcessed) === true ? true : false;
            searchOutput.premium = Array.isArray(premiumAccountsProcessed) === true ? true : false;

            return res.render('foreclosure-cleanup-vendor-list', {
                activeLink,
                contactEmail,
                loggedIn,
                searchRadiusAttributesAndValue,
                searchZipAttributes,
                searchZipCode,
                servicesAttributesAndValues,
                freeAccountsProcessed,
                premiumAccountsProcessed,
                searchOutput,
                searchRadius,
                searchAgainNamesValues
            });

        } else {

            let searchZipCodeError = errorMessage.getSearchZipCodeError(isSearchZipCodeFilled, isSearchZipCodeValidCharacters, isSearchZipCodeFiveDigits, isZipCodeRealAndInUsa);
            let searchRadiusError = errorMessage.getSearchRadiusError(isSearchRadiusFilled, isSearchRadiusValid);
            let searchServicesError = errorMessage.getSearchServicesError(isAtLeastOneServiceChecked, wereAllServiceValuesValid);

            // Only grab this error on new searches, not a "search again".
            if (searchType !== 'multiple') {
                var privacyTermsError = errorMessage.getPrivacyTermsError(isPrivacyTermsChecked);
            }
            
            return res.render('foreclosure-cleanup-vendor-list', {
                activeLink,
                contactEmail,
                loggedIn,
                searchRadiusAttributesAndValue,
                searchZipAttributes,
                searchZipCode,
                servicesAttributesAndValues,
                searchRadiusError,
                searchZipCodeError,
                searchServicesError,
                privacyTermsError
            });

        }

    } else {

        // For rendering.
        searchRadiusAttributesAndValue = logicDefault.createSearchRadiusAttributesAndValue(defaultValue.searchRadius);
        servicesAttributesAndValues = logicDefault.createServicesAttributesAndValues(defaultValue.listOfCompanyServices);

        res.render('foreclosure-cleanup-vendor-list', {
            activeLink,
            contactEmail,
            loggedIn,
            searchRadiusAttributesAndValue,
            searchZipAttributes,
            searchZipCode: '',
            servicesAttributesAndValues
        });

    }

});

exports.homePage = wrapAsync(async function(req, res) {
    
    // For rendering.
    let activeLink = 'index';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;

    res.render('index', { activeLink, contactEmail, loggedIn });
});

exports.pageNotFound = wrapAsync(async function(req, res) {

    // For rendering.
    let activeLink = 'page-not-found';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;
    
    res.status(404).render('page-not-found', { activeLink, contactEmail, loggedIn });
});

exports.postForeclosureCleanupVendorList = wrapAsync(async function(req, res) { 

    // A checkbox has to be selected to return a value.  This sets the value to false or empty for all unreturned properties.
    let {
        searchRadius = '',
        searchZipCode = '',
        boardingSecuring = 'false',
        debrisRemovalTrashout = 'false',
        evictionManagement = 'false',
        fieldInspection = 'false',
        handymanGeneralMaintenance = 'false',
        landscapeMaintenance = 'false',
        lockChanges = 'false',
        overseePropertyRehabilitation = 'false',
        poolMaintenance = 'false',
        propertyCleaning = 'false',
        winterizations = 'false',
        privacyTerms = 'notChecked',
        searchType = ''
    } = req.body;

    req.session.transfer = {};
    req.session.transfer.privacyTerms = privacyTerms;

    return res.redirect(`/foreclosure-cleanup-vendor-list?searchRadius=${ searchRadius }&searchZipCode=${ searchZipCode }&boardingSecuring=${ boardingSecuring }&debrisRemovalTrashout=${ debrisRemovalTrashout }&evictionManagement=${ evictionManagement }&fieldInspection=${ fieldInspection }&handymanGeneralMaintenance=${ handymanGeneralMaintenance }&landscapeMaintenance=${ landscapeMaintenance }&lockChanges=${ lockChanges }&overseePropertyRehabilitation=${ overseePropertyRehabilitation }&poolMaintenance=${ poolMaintenance }&propertyCleaning=${ propertyCleaning }&winterizations=${ winterizations }&searchType=${ searchType }`);

});

exports.privacyPolicy = wrapAsync(async function(req, res) {
    
    // For rendering.
    let activeLink = 'privacy-policy';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;

    res.render('privacy-policy', { activeLink, contactEmail, loggedIn });
});

exports.termsOfService = wrapAsync(async function(req, res) {
    
    // For rendering.
    let activeLink = 'terms-of-service';
    let contactEmail = siteValue.contactEmail;
    let loggedIn = req.session.userValues ? true : false;

    res.render('terms-of-service', { activeLink, contactEmail, loggedIn });
});