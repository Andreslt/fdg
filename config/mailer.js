'use strict';
const nodemailer = require('nodemailer');

const mailer = (service, auth, mailOptions)=> {
var transporter;
//var service; // gmail-hotmail-yahoo
//var auth; //auth.user= email - auth.pass=password
// var mailOptions;

    transporter = nodemailer.createTransport({
    service: service,
        auth: {
                user: auth.user, // Your email id
                pass: auth.pass// Your password
            },
            tls: { rejectUnauthorized: false }
        });

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
            // res.json({yo: 'error'});
        }else{
            console.log('Message sent: ' + info.response);
            // res.json({yo: info.response});
        };
    });
}
module.exports = mailer;