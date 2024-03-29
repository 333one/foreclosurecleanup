// Some of these were originally passed through ejs and became inline javascript variables and used to block unwanted character entry.
// However to avoid the potential of a cross site scripting attack inline js was blocked in the content-security-policy header.
// They are now included by hand in the external JS files where the variables are used.  If those external js variables need to be edited reference them here.

exports.anyNonNumberCharacter = /\D/;

exports.capitalizeEveryWord = /(^|\s)\S/;

exports.characters = /[A-Z]/;

exports.companyCity = /^[A-Z\-\' ]+$/;
exports.messageCompanyCity = 'letters A - Z or special characters - \'';

exports.companyDescription = /^[A-Z0-9\,\.\?\!\'\#\$\%\&\- ]+$/;
exports.messageCompanyDescription = 'letters A - Z, numbers 0 - 9 or special characters , . ? ! \' # $ % & -';

exports.companyName = /^[A-Z0-9\-\' ]+$/;
exports.messageCompanyName = 'letters A - Z, numbers 0 - 9 or special characters - \'';

exports.companyPhone = /^[0-9\-]+$/;
exports.messageCompanyPhone = 'numbers 0 - 9 or special character - ';

exports.companyStreet = /^[A-Z0-9 ]+$/;
exports.messageCompanyStreet = 'letters A - Z and numbers 0 - 9';

exports.companyStreetTwo = /^[A-Z0-9\-\# ]+$/;
exports.messageCompanyStreetTwo = 'letters A - Z, numbers 0 - 9 or special characters - #';

exports.companyWebsite = /^[a-z0-9\-\.\_\~\:\/]+$/;
exports.messageCompanyWebsite = 'lower case letters a - z, numbers 0 - 9 or special characters - . _ ~ : /';

exports.companyZip = /^[0-9]+$/;
exports.messageCompanyZip = 'numbers 0 - 9';

exports.directoryIndex = /^default\.[a-z]+$/;

exports.email = /^[a-z0-9\!\#\$\%\&\'\*\+\-\/\=\?\^\_\`\{\|\}\~\.\@]+$/;
exports.messageEmail = 'lower case letters a - z, numbers 0 - 9 or special characters ! # $ % & \' * + - / = ? ^ _ ` { | } ~';

exports.httpProtocol = /^http:\/\//;

exports.httpsProtocol = /^https:\/\//;

exports.password = /^[A-Z0-9\`\~\!\@\#\$\%\^\&\*\(\)\-\_\=\+\[\{\]\}\\\|\;\:\'\"\,\<\.\>\/\?\']+$/;
exports.messagePassword = 'letters A - Z, numbers 0 - 9 or special characters ` ~ ! @ # $ % ^ & * ( ) - _ = + [ { ] } \ | ; : \' " , < . > / ? \'';

exports.numbers = /[0-9]/;