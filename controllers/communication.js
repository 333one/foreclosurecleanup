"use strict";

const nodemailer = require('nodemailer');

exports.sendEmail = async function(emailRecipient, emailSubject, htmlMessage) {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: process.env.ADMIN_EMAIL_SERVER,
        port: 587,
        secure: false, // true for 465, most likely false for other ports like 587 or 25
        auth: {
            user: process.env.ADMIN_EMAIL_SENDER, 
            pass: process.env.ADMIN_EMAIL_PASSWORD 
        }
    });

    // send mail with defined transport object
    await transporter.sendMail({
        from: `"${ process.env.ADMIN_EMAIL_SENDER_NAME }" ${ process.env.ADMIN_EMAIL_SENDER }`,
        // from: process.env.ADMIN_EMAIL_SENDER, 
        to: emailRecipient, 
        subject: emailSubject, 
        text: ``, 
        html: htmlMessage
    });
}