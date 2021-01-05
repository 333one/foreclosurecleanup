'use strict';

let patternChangedEmail = /^[A-Z0-9\!\#\$\%\&\'\*\+\-\/\=\?\^\_\`\{\|\}\~\.\@]+$/;

characterBlocker('changedEmail', patternChangedEmail);