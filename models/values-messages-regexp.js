exports.capitalizeEveryWord = '(^\\w{1})|(\\s{1}\\w{1})';

exports.characterOrNumber = '[A-Z0-9]';

exports.companyCity = "[A-Z\\-\\' ]";
exports.messageCompanyCity = 'letters A - Z or special characters - \'';

exports.companyDescription = "[A-Z0-9,.?!\\'#$%&\\-= ]";
exports.messageCompanyDescription = 'letters A - Z, numbers 0 - 9 or special characters , . ? ! \' # $ % & - =';

exports.companyName = "[A-Z0-9\\-\\' ]";
exports.messageCompanyName = 'letters A - Z, numbers 0 - 9 or special characters - \'';

exports.companyPhone = "[0-9\\-]";
exports.messageCompanyPhone = 'numbers 0 - 9 or special character - ';

exports.companyStreet = "[A-Z0-9 ]";
exports.messageCompanyStreet = 'letters A - Z and numbers 0 - 9';

exports.companyStreetTwo = "[A-Z0-9\\-\\ ]";
exports.messageCompanyStreetTwo = 'letters A - Z, numbers 0 - 9 or special character - ';

exports.companyWebsite = "[A-Z0-9\\-._~]";
exports.messageCompanyWebsite = 'letters A - Z, numbers 0 - 9 or special characters - . _ ~';

exports.companyZip = '[0-9]';
exports.messageCompanyZip = 'numbers 0 - 9';

exports.email = "[A-Z0-9.!#$%&\'*+-/=?^_`{|}~]";
exports.messageEmail = 'letters A - Z, numbers 0 - 9 or special characters . ! # $ % & \' * + - / = ? ^ _ ` { | } ~';

exports.password = "[A-Z0-9`~!@#$%^&*()_=+[{]}\|;:,<.>/?\\-\\'\"]";
exports.messagePassword = 'letters A - Z, numbers 0 - 9 or special characters `~ ! @ # $ % ^ & * ( ) _ = + [ { ] } \ | ; : , < . > / ? - \' "';