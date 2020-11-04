exports.companyCityField = {
    minLength: 3,
    maxLength: 35,
    get attributes() {
        return `type=text maxLength=${ this.maxLength }`;
    }
}

exports.companyDescriptionField = {
    minLength: 10,
    maxLength: 300,
    rows: 8,
    get attributes() {
        return `rows=${ this.rows } maxLength=${ this.maxLength }`;
    }
}

exports.companyNameField = {
    minLength: 2,
    maxLength: 35,
    get attributes() {
        return `type=text maxLength=${ this.maxLength }`;
    }
}

exports.companyPhoneField = {
    minLength: 10,
    maxLength: 20,
    get attributes() {
        return `type=tel maxLength=${ this.maxLength }`;
    }
}

exports.companyStreetField = {
    minLength: 5,
    maxLength: 60,
    get attributes() {
        return `type=text maxLength=${ this.maxLength }`;
    }
}

exports.companyStreetTwoField = {
    minLength: 2,
    maxLength: 40,
    get attributes() {
        return `type=text maxLength=${ this.maxLength }`;
    }
}

exports.companyWebsiteField = {
    minLength: 5,
    maxLength: 50,
    get attributes() {
        return `type=text maxLength=${ this.maxLength }`;
    }
}

exports.companyZipField = {
    minLength: 5,
    maxLength: 5,
    get attributes() {
        return `type=text maxLength=${ this.maxLength }`;
    }
}

exports.emailField = {
    minLength: 5,
    maxLength: 40,
    get attributes() {
        return `type=text maxLength=${ this.maxLength }`;
    }
}

exports.passwordField = {
    size: 1,
    minLength: 5,
    maxLength: 25,
    get attributes() {
        return `type=password size=${ this.size } maxLength=${ this.maxLength }`;
    }
}

exports.boardingSecuring = 'Boarding&nbsp;&amp;&nbsp;Securing';

exports.debrisRemovalTrashout = 'Debris&nbsp;Removal&nbsp;&amp;&nbsp;Trashout';

exports.evictionManagement = 'Eviction&nbsp;Management';

exports.fieldInspection = 'Field&nbsp;Inspection';

exports.handymanGeneralMaintenance = 'Handyman&nbsp;&amp;&nbsp;General&nbsp;Maintenance';

exports.landscapeMaintenance = 'Landscape&nbsp;Maintenance';

exports.lockChanges = 'Lock&nbsp;Changes';

exports.overseePropertyRehabilitation = 'Oversee&nbsp;Property&nbsp;Rehabilitation';

exports.poolMaintenance = 'Pool&nbsp;Maintenance';

exports.propertyCleaning = 'Property&nbsp;Cleaning';

exports.winterizations = 'Winterizations';