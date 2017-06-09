//Top level object
var emailSender = {};

/*
nodemailer
*/
var nodemailer = require('nodemailer');
var wellknown = require('nodemailer-wellknown');
var transporter = nodemailer.createTransport({
    host: 'smtp.office365.com', 
    // host: "smtp-mail.outlook.com", // hostname
    port: '587',
    auth: { user: 'michhar@microsoft.com', pass: process.env.EMAIL_PASSWORD || "" },
    secureConnection: false,
    tls: { ciphers: 'SSLv3' }
});

bot.dialog('/sendEmail', [
    function(session){
        session.send("I can send an email to the event coordinators for more questions and help.  \
            It'll include your alias. \
            Type 'quit' to get out of this.");
        builder.Prompts.text(session, "Enter your alias so we can get back to the right person:  ");
    },
    function(session, results) {
        session.userData.email = results.response;
        // builder.Prompts.text(session, "Enter the your message to the humans here:  ");
        builder.Prompts.confirm(session, "Is " + results.response + " the correct alias?");
    },
    function(session, results, next) {
        if (results.response) {
            next();
        } else {
            session.send("Trying again.  Type 'quit' to exit.")
            session.replaceDialog('/sendEmail');
        }
    },
    function(session, results) {
        builder.Prompts.text(session, "Enter the your message to the humans here:  ");
        // builder.Prompts.confirm("Is " + results.response + " the correct alias?");
    },
    function(session, results)
    {
        var senderMessage = results.response;
        emailSender.sendEmail(session.userData.email, senderMessage, function(err){
            if(!err)
            {
                session.send("I've successfully sent an email to DSMLEVNT.");
                restart(session);
            }
            else
            {
                session.send("Error sending email.  Please try again later.");
                restart(session);
            }
        })
    }
]);

emailSender.sendEmail = function(senderEmail, senderMessage, callback)
{
    var senderEmail = "mailto:" + senderEmail + "@microsoft.com";
    var user_text = "From:  " + senderEmail;
    var mailOptions =
    {
        from: "michhar@microsoft.com",
        to: "michhar@microsoft.com",
        subject: "Message from an MLADSBot user",
        text: user_text + "\nMessage: " + senderMessage 
    }

    transporter.sendMail(mailOptions, function(err, info){
        if(!err)
        {
            console.log('Message successfully sent: ' + info.response);
            callback(null);
        }
        else
        {
            console.log(err);
            callback(err);
        }
    });
}

module.exports = emailSender;
