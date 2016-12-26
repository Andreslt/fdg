'use strict';
const nodemailer = require('nodemailer');
const EmailTemplate = require('email-templates').EmailTemplate
require('../.env');
var mailParams = module.exports.mailParams = {
    service: process.env.EMAIL_SERVICE,
	user : process.env.EMAIL_USER,
	pass : process.env.EMAIL_PASSWORD   
};

var mailOptions = module.exports.mailOptions = {
    from: 'andres_late1008@hotmail.com', //Company Email.
    to: '',
	subject: "",
	template: "",
    context: {}  
};

 module.exports.sendEmail = function (){
    const hbs = require('nodemailer-express-handlebars'),
    layoutsDir = process.cwd()+'/mvc/views/emails/',
    options = {
            viewEngine: {
                extname: '.handlebars',
                layoutsDir: layoutsDir,
                defaultLayout : mailOptions.template
            },
            viewPath: layoutsDir,
            extName: '.handlebars'
        }; var transporter;
        transporter = nodemailer.createTransport({
        service: mailParams.service,
        auth: {
            user: mailParams.user,
            pass: mailParams.pass
        },
            tls: { rejectUnauthorized: false }
        });

        transporter.use('compile', hbs(options));
        transporter.sendMail({
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject,
            template: mailOptions.template,
            context: mailOptions.context/*{
                name: mailOptions.name,
                lastname: mailOptions.lastname
            }   */         
        }, (err, info)=>{
            if (err) console.log(err);
            console.log('Message sent: ' + info);
            transporter.close();
        });
    }