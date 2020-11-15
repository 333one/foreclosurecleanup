"use strict";

const nodemailer = require('nodemailer');

const siteValue = require('../models/site-values');

exports.sendEmail = async function(emailRecipient, emailSubject, htmlMessage) {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: siteValue.adminEmailServer,
        port: 587,
        secure: false, // true for 465, most likely false for other ports like 587 or 25
        auth: {
            user: siteValue.adminEmailSender, 
            pass: process.env.ADMIN_EMAIL_PASSWORD 
        }
        
    });

    // send mail with defined transport object
    await transporter.sendMail({
        from: `"${ siteValue.adminEmailSenderName }" ${ siteValue.adminEmailSender }`,
        // from: siteValue.adminEmailSender, 
        to: emailRecipient, 
        subject: emailSubject, 
        text: ``, 
        html: htmlMessage
    });

}