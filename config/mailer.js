'use strict';
const nodemailer = require('nodemailer');
const EmailTemplate = require('email-templates').EmailTemplate

var mailer = {
//var service; // gmail-hotmail-yahoo
//var auth; //auth.user= email - auth.pass=password
// var mailOptions;
params: {
	user : "",
	pass : ""
},
service: "",
mailParams:{},
mailOptions: {
    from: 'andres_late1008@hotmail.com',
    to: 'andreslastrat@gmail.com', // sender address
    name: "",
    lastname: "",
	subject: 'Bienvenido a FDG', // Subject line
	template: "register" //, // plaintext body
},
 sendEmail : function (params,service,mailOptions){
    const hbs = require('nodemailer-express-handlebars'),
    layoutsDir = process.cwd()+'/mvc/views/emails/',
    options = {
            viewEngine: {
                extname: '.handlebars',
                layoutsDir: layoutsDir,
                defaultLayout : 'register'
            },
            viewPath: layoutsDir,
            extName: '.handlebars'
        };
        //var sgTransport = require('nodemailer-sendgrid-transport');
        var transporter,
        transporter = nodemailer.createTransport({
        service: service,
        auth: {
            user: params.user, // Your email id
            pass: params.pass// Your password
        },
            tls: { rejectUnauthorized: false }
        });

        transporter.use('compile', hbs(options));
        transporter.sendMail({
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject,
            template: mailOptions.template,
            context: {
                name: mailOptions.name,
                lastname: mailOptions.lastname
            }            
        }, (err, info)=>{
            if (err) console.log(err);
            console.log('Message sent: ' + info);
            transporter.close();
        });
/*            send({
            }, (err, res) =>{
                if (err) console.log(err)

                console.log('mail sent to ',res);
            });*/
/*        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
                // res.json({yo: 'error'});
            }else{
                console.log('Message sent: ' + info.response);
                // res.json({yo: info.response});
            };
        });*/
    }
}
module.exports = mailer;