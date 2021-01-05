'use strict';

setUpToggles('currentPassword', 'changedPassword', 'confirmationPassword');
setUpToggles('changedPassword', 'confirmationPassword', 'currentPassword');
setUpToggles('confirmationPassword', 'currentPassword', 'changedPassword');