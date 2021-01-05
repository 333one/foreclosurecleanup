'use strict';

let patternNewEmail = /^[A-Z0-9\!\#\$\%\&\'\*\+\-\/\=\?\^\_\`\{\|\}\~\.\@]+$/;
let patternNewPassword = /^[A-Z0-9\`\~\!\@\#\$\%\^\&\*\(\)\-\_\=\+\[\{\]\}\\\|\;\:\'\"\,\<\.\>\/\?\']+$/;

characterBlocker('newEmail', patternNewEmail);
characterBlocker('newPassword', patternNewPassword);