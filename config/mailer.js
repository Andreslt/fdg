'use strict';
const nodemailer = require('nodemailer');

var mailer = {
//var service; // gmail-hotmail-yahoo
//var auth; //auth.user= email - auth.pass=password
// var mailOptions;
params: {
	user : "",
	pass : ""
},
service: "",
mailOptions: {
	to: 'andreslastrat@gmail.com', // sender address
	from: 'andres_late1008@hotmail.com', // list of receivers
	subject: 'TEST EMAIL', // Subject line
	text: "Esta es una gran prueba" //, // plaintext body
},
 sendEmail : function (params,service,mailOptions){
        var transporter,
        transporter = nodemailer.createTransport({
        service: service,
        auth: {
            user: params.user, // Your email id
            pass: params.pass// Your password
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
}
module.exports = mailer;