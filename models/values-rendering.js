exports.companyCityField = {
    minLength: 3,
    maxLength: 35,
    get attributes() {
        return `type=text maxLength=${this.maxLength}`;
    }
}

exports.companyDescriptionField = {
    minLength: 10,
    maxLength: 200,
    rows: 5,
    get attributes() {
        return `rows=${this.rows} minLength=${ this.minLength } maxLength=${this.maxLength}`;
    }
}

exports.companyNameField = {
    minLength: 2,
    maxLength: 35,
    get attributes() {
        return `type=text maxLength=${this.maxLength}`;
    }
}

exports.companyPhoneField = {
    minLength: 10,
    maxLength: 20,
    get attributes() {
        return `type=tel maxLength=${this.maxLength}`;
    }
}

exports.companyStreetField = {
    minLength: 5,
    maxLength: 60,
    get attributes() {
        return `type=text maxLength=${this.maxLength}`;
    }
}

exports.companyWebsiteField = {
    maxLength: 50,
    get attributes() {
        return `type=text maxLength=${this.maxLength}`;
    }
}

exports.companyZipField = {
    minLength: 5,
    maxLength: 5,
    get attributes() {
        return `type=text maxLength=${this.maxLength}`;
    }
}

exports.emailField = {
    minLength: 5,
    maxLength: 50,
    get attributes() {
        return `type=email maxLength=${this.maxLength}`;
    }
}

exports.passwordField = {
    size: 1,
    maxLength: 25,
    attributes(errorType = null) {
        return `type=password size=${this.size} maxLength=${this.maxLength} data-errortype=${ errorType }`;
    }
}

exports.serviceBoardingSecuring = 'Boarding&nbsp;&amp;&nbsp;Securing';

exports.serviceDebrisRemovalTrashout = 'Debris&nbsp;Removal&nbsp;&amp;&nbsp;Trashout';

exports.serviceEvictionManagement = 'Eviction&nbsp;Management';

exports.serviceFieldInspection = 'Field&nbsp;Inspection';

exports.serviceHandymanGeneralMaintenance = 'Handyman&nbsp;&amp;&nbsp;General&nbsp;Maintenance';

exports.serviceLandscapeMaintenance = 'Landscape&nbsp;Maintenance';

exports.serviceLockChanges = 'Lock&nbsp;Changes';

exports.serviceOverseePropertyRehabilitation = 'Oversee&nbsp;Property&nbsp;Rehabilitation';

exports.servicePoolMaintenance = 'Pool&nbsp;Maintenance';

exports.servicePropertyCleaning = 'Property&nbsp;Cleaning';

exports.serviceWinterizations = 'Winterizations';