'use strict';
var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var nodemailer = require('nodemailer');
var async = require('async');
var crypto = require('crypto');
var mongoose = require('mongoose');
var _ = require('underscore');
//var schedule = require('node-schedule');

//Models
var User = require('../models/user');
var UserModule = require('../models/user').user;
var company = require("../models/company");
var store = require("../models/store");
var userType = require("../models/userType");
const tickets = require("../models/ticket");
const city = require('../models/city');

// Register
router.get('/register', function(req, res){
	company.find({companyName: {$ne: 'Default company'}},(err, companies)=>{
		res.render('register', {layout: 'auth', login: true, companies});
	});
});

// Login
router.get('/login', function(req, res){
	res.render('login', {layout: 'auth', login: false, user: req.user});
});

// Forgot Password
router.get('/forgotpassword', function(req, res){
	res.render('forgotpassword', {layout: 'auth', login: true});
});

router.get('/resetpassword/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Ha expirado este enlace para restaurar su contraseña. Por favor solicite la restauración nuevamente.');
      return res.redirect('/users/forgotpassword');
    }
    res.render('reset', {
      user: req.user
    });
  });
});

// router.post('/forgotpassword', function(req, res, next) {
//   async.waterfall([
//     function(done) {
//       crypto.randomBytes(20, function(err, buf) {
//         var token = buf.toString('hex');
//         done(err, token);
//       });
//     },	
//     function(token, done) {
//       User.findOne({ email: req.body.email }, function(err, user) {
		  
//         if (!user) {
//           req.flash('error', 'No existe esta cuenta. Por favor verificar nuevamente.');
//           return res.redirect('/users/forgotpassword');
//         }
//         user.resetPasswordToken = token
//         user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
//         user.save(function(err) {
//           done(err, token, user);
//         });
//       });
//     },
//     function(token, user, done) {
//       var smtpTransport = nodemailer.createTransport('SMTP', {
//         service: 'SendGrid',
//         auth: {
//           user: 'andreslt90',
//           pass: 'fdgingenieria2016'
//         }
//       });
//       var mailOptions = {
//         to: user.email,
//         from: 'passwordreset@demo.com',
//         subject: 'Recuperar Contraseña - FDG Ingeniería Ltda.',
//         text: 'Esta recibiendo este correo porque usted, u otra persona, ha solicitado restaurar la contraseña de su cuenta en FDG Ingeniería.\n\n' +
//           'Por favor abra el siguiente enlance para completar el proceso:\n\n' +
//           'http://' + req.headers.host + '/resetpassword/' + token + '\n\n' +
//           'Si usted no ha solicitado esto, por favor ignore este correo. Su cuenta permanecerá sin cambios.\n'
//       };
//       smtpTransport.sendMail(mailOptions, function(err) {
//         req.flash('info', 'Se ha enviado un correo electrónico a ' + user.email + ' con las instrucciones a seguir.');
//         done(err, 'done');
//       });
//     }
//   ], function(err) {
//     if (err) return next(err);
//     res.redirect('/forgotpassword');
//   });
// });

// Dashboard
router.get('/dashboard', ensureAuthenticated, ApprovedUserFunction, function(req, res){
	let user = req.user, storeAdminSW;
	user.userType === "storeAdmin"? storeAdminSW = true : storeAdminSW = false;
	let companyName = "EPK";
    if (user.userApproval){
    	  res.render('2-storeAdmin/dashboard', {userTypeAdmin: false, storeAdminSW, companyName});
		}else
    	  res.render('unauthorized', {layout: 'accessDenied'});
});

// storeAdmin User
router.get('/storeAdmin/:company/tickets/cities', ensureAuthenticated, ApprovedUserFunction, function(req, res){
	var companyName = req.params.company;
	let storeAdminSW = true;
	let cityHash = {};
	gettingFullStores(companyName)
	.then(stores => {
		let item;
		stores.forEach(str => {
			item = str.city_id;
			item in cityHash ? false : (cityHash[item.city] = item);
		});
		res.render('2-storeAdmin/cities_by_tickets', {cityHash, storeAdminSW, companyName});
	});
});

router.get('/storeAdmin/:company/tickets/all', ensureAuthenticated, ApprovedUserFunction, function(req, res){
		let storeAdminSW = true, companyName=req.params.company;
		tickets.find({})
		.then(tks1 => store.populate(tks1, {path: "store_id"}))
		.then(tks2 => company.populate(tks2, {path: "store_id.company_id"}))
		.then(tks3 => city.populate(tks3, {path: "store_id.city_id"}))
		.then(result=>{
		var tkts = new Array();
			for(let item in result){
				let lacompany = result[item].store_id.company_id.companyName;
				
				if (lacompany === companyName)
					tkts.push(result[item]);
			}
			res.render('2-storeAdmin/tickets_all', {storeAdminSW, companyName, tkts});
		});
/*			var eltk = tkts.filter((tk)=>{
/*		var result =	_.where(tkts, {'store_id': ObjectId('57b5e98f0a940f3010662764')});
/*	tickets.find({}, (err, tks) => {
			store
			.populate(tks, {path: "store_id"}, (err, tks2)=>{
				company
				.populate(tks2, {path: "store_id.company_id"}, (err, tks3)=>{
					city
					.populate(tks3, {path: "store_id.city_id"}, (err, tks4)=>{
					});
				});
			});
	});*/
});

router.get('/storeAdmin/:company/:city/tickets', ensureAuthenticated, ApprovedUserFunction, function(req, res){
	let storeAdminSW = true, companyName = req.params.company, cityName = req.params.city;
		console.log(cityName);
		tickets.find({})
		.then(tks1 => store.populate(tks1, {path: "store_id"}))
		.then(tks2 => company.populate(tks2, {path: "store_id.company_id"}))
		.then(tks3 => city.populate(tks3, {path: "store_id.city_id"}))
		.then(result=>{
		var tkts = new Array();
			for(let item in result){
				let validations = result[item].store_id;
				//let lacity = result[item].store_id.city_id.city;
				if (validations.company_id.companyName === companyName && validations.city_id.city  === cityName)
					tkts.push(result[item]);
			}
			console.log(tkts);
			res.render('2-storeAdmin/tickets_into_city', {storeAdminSW, companyName, cityName, tkts});
		});
/*		console.log(city);
	res.render('2-storeAdmin/tickets_into_city', {storeAdminSW, companyName, city});*/
});

// Register User
router.post('/register', function(req, res){
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;
	var name = req.body.name;
  var lastname = req.body.lastname;
  var userTypebody = req.body.userType;
	var localId = req.body.localId;
  var companyId = req.body.companyId;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('lastname', 'Lastname is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
	req.checkBody('localId', 'Document is required').notEmpty();
	req.checkBody('companyId', 'Company is required').notEmpty();

	var errors = req.validationErrors();
	var newUser;
  var usrParams = {
      username: username,
			email:email,
			password: password,
      name: name,
      lastname: lastname,
			userType: userTypebody,
			localId: localId,
			companyId: companyId
    };
    
	if(errors){
		res.render('register',{layout: 'auth',
			errors:errors
		});
	} else {
		if(userTypebody === "systemAdmin"){
				usrParams.pin = 9999;
				newUser = new User.systemAdmin(usrParams);
		}else{
				usrParams.company_id = "57b5e6118fc445a60fbdd8d4";
				if (userTypebody === "storeAdmin"){
					newUser = new User.storeAdmin(usrParams);
				}else {
						newUser = new User.storeEmployee(usrParams);
				}
		}
		console.log(newUser);
		User.createUser(newUser, function(err, user){

			if(err) throw err;
						req.flash('success_msg', 'Has sido registrado satisfactoriamente. Te llegará un correo de confirmación una vez el administrador autorice tu cuenta');
						res.redirect('/');
			 });
	}
});

router.post('/storeAdmin/EditTicket', (req, res)=>{
	let user = req.user, ticket = req.body.ticketId, 
				title = req.body.ticketTitle, description = req.body.ticketDesc;
	tickets.findOneAndUpdate({_id: ticket}, {$set: {title: title, description: description}}, (err, tkts)=>{
		if(err) console.log(err);
		res.redirect('/users/dashboard');
	});
});

passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'El usuario ingresado no existe. Verifica nuevamente.'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Contraseña inválida. Verifica nuevamente.'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/dashboard', failureRedirect:'/',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'Ha cerrado sesión exitosamente.');

	res.redirect('/');
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		res.render('login', {layout: 'auth'});
	}
}

function ApprovedUserFunction (req, res,next){
	if(req.user.userApproval){
		return next();
	}else{
		res.render('unauthorized',{layout: 'accessDenied'});
		console.log("WAIT YOUR TURN!");
	}
	return next();
}

function validUserAdmin (req, res,next){
	if(req.user.userType==='systemAdmin'){
		console.log("HELLO ADMIN!");
		return next();
	}else{
		res.render('adminAccess_only',{layout: 'accessDenied'});
		console.log("GO AWAY IMPOSTOR!");
	}
	return next();
}

function gettingFullStores(currentCompany){
//	let currentCompany = req.params.company;
	let lacompany = company.findOne({companyName: currentCompany});
	let storeAdminSW = true;
	let cityHash = {};

	return new Promise((resolve, reject)=>{
		lacompany.then(cny => 
			store.find({company_id: cny.id}).populate('city_id').populate('company_id')
			//.select('city_id')
			.exec((err, stores)=>{
				if (err) return reject(err)
				resolve(stores);
			})
		)});
}
module.exports = router;
