exports.accountDefault = 'Free Profile';

exports.accountUpgrade ='Premium Profile';

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

// This is needed for mongoose to search.
exports.metersPerMile = 1609.34;

exports.numberOfEmailConfirmationsAllowed = 4;

exports.numberOfLoginFailuresAllowed = 4;

exports.numberOfPasswordResetRequestsAllowed = 4;

// Radius of earth at equator needed for searches because $centerSphere query uses radians. distanceInMiles / radiusOfEarthInMiles
exports.radiusOfEarthInMiles = 3963.2;

exports.searchRadius = [10, 25, 50];