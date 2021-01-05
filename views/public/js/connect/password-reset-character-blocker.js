'use strict';

let patternChangedPassword = /^[A-Z0-9\`\~\!\@\#\$\%\^\&\*\(\)\-\_\=\+\[\{\]\}\\\|\;\:\'\"\,\<\.\>\/\?\']+$/;

characterBlocker('changedPassword', patternChangedPassword);