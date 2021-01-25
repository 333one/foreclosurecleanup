const nodemailer = require('nodemailer');

const siteValue = require('../models/site-values');

exports.sendEmail = async function(emailSender, emailRecipient, emailSubject, htmlMessage) {

    let { email, name, password } = emailSender;

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: siteValue.emailServer,
        port: 587,
        secure: false, // true for 465, most likely false for other ports like 587 or 25
        auth: {
            user: email, 
            pass: password 
        }
    });

    // send mail with defined transport object
    await transporter.sendMail({
        from: `"${ name }" ${ email }`,
        to: emailRecipient, 
        subject: emailSubject, 
        text: ``, 
        html: htmlMessage
    });

}