'use strict';

let patternCurrentEmail = /^[A-Z0-9\!\#\$\%\&\'\*\+\-\/\=\?\^\_\`\{\|\}\~\.\@]+$/;

characterBlocker('currentEmail', patternCurrentEmail);