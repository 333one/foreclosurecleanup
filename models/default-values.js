let path = require('path');

let bytesPerMB = 1048576;

exports.accountDefault = 'Free Profile';

exports.accountUpgrade ='Premium Profile';

exports.bytesPerMB = bytesPerMB;

exports.googleStaticMapsBaseURL = 'https://maps.googleapis.com/maps/api/staticmap?';

exports.listOfCompanyServices = [
    'boardingSecuring',
    'debrisRemovalTrashout',
    'evictionManagement',
    'fieldInspection',
    'handymanGeneralMaintenance',
    'landscapeMaintenance',
    'lockChanges',
    'overseePropertyRehabilitation',
    'poolMaintenance',
    'propertyCleaning',
    'winterizations'
];

exports.maxVendorLogoUploadFileSize = 5 * bytesPerMB;

// Over this amount and Multer won't allow the file to upload even for testing.
exports.maxVendorLogoUploadFileSizeCutoff = 10 * bytesPerMB;

// This is needed for mongoose to search.
exports.metersPerMile = 1609.34;

exports.numberOfEmailConfirmationsAllowed = 4;

exports.numberOfLoginFailuresAllowed = 4;

exports.numberOfPasswordResetRequestsAllowed = 4;

// Radius of earth at equator needed for searches because $centerSphere query uses radians. distanceInMiles / radiusOfEarthInMiles
exports.radiusOfEarthInMiles = 3963.2;

exports.searchRadius = [10, 25, 50];

exports.vendorLogoUploadFolder = path.join(__dirname, '../image-upload/');

exports.vendorLogoPasteToFolder = path.join(__dirname, '../views/public/images/vendor-images/');

exports.vendorLogoViewFolder = 'images/vendor-images/';

exports.vendorLogoValidMimeTypes = ['image/jpeg', 'image/png'];