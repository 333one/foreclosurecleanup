// This is the main variable that tells the rest of the app what environment it is operating in.
// Possible values are 'development', 'staging', 'production'
let projectStatus = 'development';

let domain = 'foreclosurecleanup.org';
let subDomainForStaging = 'testbed';
let projectPortNumber =
	projectStatus === 'development' || projectStatus === 'production'
		? 8080
		: 10001;
let organization = 'Foreclosure Cleanup.org';

function host(projectStatus) {
	if (projectStatus === 'development')
		return `http://localhost:${projectPortNumber}`;
	if (projectStatus === 'staging')
		return `https://${subDomainForStaging}.${domain}`;
	if (projectStatus === 'production') return `https://www.${domain}`;
}

exports.host = host(projectStatus);

exports.organization = organization;

exports.passwordResetRequestLink = `${host(
	projectStatus
)}/password-reset-request`;

exports.port = projectPortNumber;

exports.projectStatus = projectStatus;

// Email icons

exports.companyIcon = `https://www.${domain}/images/foreclosure-cleanup-email-icon.png`;

exports.proJournalIcon = `https://www.${domain}/images/pro-journal-email-icon.png`;

// Email Addresses

exports.contactEmail = {
	email: `contact@${domain}`,
	name: organization,
	password: process.env.CONTACT_EMAIL_PASSWORD
};

exports.errorEmail = {
	email: `error@${domain}`,
	name: `error@${organization}`,
	password: process.env.ERROR_EMAIL_PASSWORD
};

exports.noReplyEmail = {
	email: `noreply@${domain}`,
	name: 'noreply',
	password: process.env.NOREPLY_EMAIL_PASSWORD
};

// Email

exports.emailServer = `server.${domain}`;

exports.sendServerErrorsHere = 'thr333one@gmail.com';
