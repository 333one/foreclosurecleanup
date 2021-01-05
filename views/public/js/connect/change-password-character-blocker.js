'use strict';

let patternPassword = /^[A-Z0-9\`\~\!\@\#\$\%\^\&\*\(\)\-\_\=\+\[\{\]\}\\\|\;\:\'\"\,\<\.\>\/\?\']+$/;

characterBlocker('currentPassword', patternPassword);
characterBlocker('changedPassword', patternPassword);
characterBlocker('confirmationPassword', patternPassword);