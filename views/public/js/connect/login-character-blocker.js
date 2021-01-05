'use strict';

let patternCurrentEmail = /^[A-Z0-9\!\#\$\%\&\'\*\+\-\/\=\?\^\_\`\{\|\}\~\.\@]+$/;
let patternCurrentPassword = /^[A-Z0-9\`\~\!\@\#\$\%\^\&\*\(\)\-\_\=\+\[\{\]\}\\\|\;\:\'\"\,\<\.\>\/\?\']+$/;

characterBlocker('currentEmail', patternCurrentEmail);
characterBlocker('currentPassword', patternCurrentPassword);