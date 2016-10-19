'use strict';
/* >>> Modules <<< */
var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var nodemailer = require('nodemailer');
var async = require('async');
var crypto = require('crypto');
var mongoose = require('mongoose');
var _ = require('underscore');
var formidable = require('formidable');
//var schedule = require('node-schedule');

//Models
var User = require('../models/user');
var UserModule = require('../models/user').user;
var company = require("../models/company");
var store = require("../models/store");
var userType = require("../models/userType");
const tickets = require("../models/ticket");
const city = require('../models/city');

//Config
const validations = require('../../config/validations');
const imageUp = require('../../config/imagesUpload');

/* ---------->>> ROUTES <<<---------- */

/* >>> GET <<< */
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

// Logout
router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'Ha cerrado sesión exitosamente.');

	res.redirect('/');
});

// Forgot Password
router.get('/forgotpassword', function(req, res){
	res.render('forgotpassword', {layout: 'auth', login: true});
});

// Forgot Password Token
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

// Home
router.get('/home', validations.ensureAuthenticated, validations.approvedUser, function(req, res){
	let user = req.user, storeAdminSW;
	(user.userType === "storeAdmin")? storeAdminSW=true:storeAdminSW=false;
		res.render('2-users/home', {layout: 'userLayout', storeAdminSW});
});

// Dashboard
router.get('/dashboard', validations.ensureAuthenticated, validations.approvedUser, (req, res)=>{
	let user = req.user, storeAdminSW;
	(user.userType === "storeAdmin")? storeAdminSW=true:storeAdminSW=false;
	res.render('2-users/dashboard', {layout: 'userLayout', storeAdminSW});
});

// Account
router.get('/account', validations.ensureAuthenticated, validations.approvedUser, (req, res)=>{
	let user = req.user, storeAdminSW;
	UserModule.find({company_id: user.company_id, _id: {$ne: user.id}}, (err, users) => {
		store.find({company_id: user.company_id}, (err, stores) => {
			let numero_empleados = users.length, numero_tiendas = stores.length;
			(user.userType === "storeAdmin")? storeAdminSW=true:storeAdminSW=false;
			res.render('2-users/account', {layout: 'userLayout', user, users, numero_empleados, numero_tiendas, storeAdminSW});
		})
	});
});

// Edit account
router.get('/account/edit', validations.ensureAuthenticated, validations.approvedUser, (req, res)=>{
	let user = req.user, storeAdminSW;
	(user.userType === "storeAdmin")? storeAdminSW=true:storeAdminSW=false;
	UserModule.findOne({username: user.username}, (err, user) => {
		company.find({companyName: {$ne: "Default company"}},(err, companies) => {
			city.find({city: {$ne: "Default city"}},(err, cities) => {
				store.find({storeName: {$ne: "Default store"}},(err, stores) => {
					res.render('2-users/account_edit', {layout: 'userLayout', user, storeAdminSW, companies, cities, stores});
				});
			});
		});		
	});
});

// Employee account
router.get('/account/employee', validations.ensureAuthenticated, validations.approvedUser, (req, res)=>{
	let userEmployeeID = req.query.id;
	let user = req.user, storeAdminSW;
	(user.userType === "storeAdmin")? storeAdminSW=true:storeAdminSW=false;
	UserModule.findOne({username: user.username}, (err, user) => {
		company.find({companyName: {$ne: "Default company"}},(err, companies) => {
			city.find({city: {$ne: "Default city"}},(err, cities) => {
				store.find({storeName: {$ne: "Default store"}},(err, stores) => {
					res.render('2-users/account_edit', {layout: 'userLayout', user, storeAdminSW, companies, cities, stores});
				});
			});
		});		
	});
});

// New ticket
router.get('/newTicket', validations.ensureAuthenticated, validations.approvedUser, (req, res)=>{
	var user = req.user, storeAdminSW;
	store.find({company_id: user.company_id})
	.exec((err, stores) => {				
		(user.userType === "storeAdmin")? storeAdminSW = true : storeAdminSW=false;
		res.render('2-users/new_ticket', {layout: 'userLayout', storeAdminSW, stores});
	})
});

// Tickets
router.get('/tickets', validations.ensureAuthenticated, validations.approvedUser, (req, res)=>{
	let user = req.user, storeAdminSW;
		tickets.find({})
		.then(tks1 => store.populate(tks1, {path: "store_id"}))
		.then(tks2 => company.populate(tks2, {path: "store_id.company_id"}))
		.then(tks3 => city.populate(tks3, {path: "store_id.city_id"}))
		.then(result=>{
		var tkts = new Array();
			for(let item in result){
				let validation = result[item].store_id;
				//if (validation.company_id.companyName === companyName && validation.city_id.city  === cityName)
					tkts.push(result[item]);
			}
			(user.userType === "storeAdmin")? storeAdminSW=true:storeAdminSW=false;
			res.render('2-users/list_tickets', {layout: 'userLayout', storeAdminSW, tkts});
		});			
});

router.get('/tickets/edit/success', validations.ensureAuthenticated, (req, res)=>{
	req.flash('success_msg','Ticket actualizado con éxito.');
	res.redirect('/users/tickets');
});
router.get('/tickets/edit/failed', validations.ensureAuthenticated, (req, res)=>{
	req.flash('error_msg','El ticket no pudo ser actualizado. Escriba una descripción válida.');
	res.redirect('/users/tickets');
});
// New store
router.get('/newStore', validations.ensureAuthenticated, validations.approvedUser, (req, res)=>{
	let user = req.user, storeAdminSW;
	(user.userType === "storeAdmin")? storeAdminSW=true:storeAdminSW=false;
	res.render('2-users/new_store', {layout: 'userLayout', storeAdminSW});
});

// Stores
router.get('/stores', validations.ensureAuthenticated, validations.approvedUser, (req, res)=>{
	let user = req.user, storeAdminSW;
	(user.userType === "storeAdmin")? storeAdminSW=true:storeAdminSW=false;
	res.render('2-users/list_stores', {layout: 'userLayout', storeAdminSW});
});

// New asset
router.get('/newAsset', validations.ensureAuthenticated, validations.approvedUser, (req, res)=>{
	let user = req.user, storeAdminSW;
	(user.userType === "storeAdmin")? storeAdminSW=true:storeAdminSW=false;
	res.render('2-users/new_asset', {layout: 'userLayout', storeAdminSW});
});

// Assets
router.get('/assets', validations.ensureAuthenticated, validations.approvedUser, (req, res)=>{
	let user = req.user, storeAdminSW;
	(user.userType === "storeAdmin")? storeAdminSW=true:storeAdminSW=false;
	res.render('2-users/list_assets', {layout: 'userLayout', storeAdminSW});
});

// New employee
router.get('/newEmployee', validations.ensureAuthenticated, validations.approvedUser, (req, res)=>{
	let user = req.user, storeAdminSW;
	(user.userType === "storeAdmin")? storeAdminSW=true:storeAdminSW=false;
	res.render('2-users/new_employee', {layout: 'userLayout', storeAdminSW});
});

// Employees
router.get('/employees', validations.ensureAuthenticated, validations.approvedUser, (req, res)=>{
	let user = req.user, storeAdminSW;
	(user.userType === "storeAdmin")? storeAdminSW=true:storeAdminSW=false;
	res.render('2-users/list_employees', {layout: 'userLayout', storeAdminSW});
});

// New report
router.get('/newReport', validations.ensureAuthenticated, validations.approvedUser, (req, res)=>{
	let user = req.user, storeAdminSW;
	(user.userType === "storeAdmin")? storeAdminSW=true:storeAdminSW=false;
	res.render('2-users/new_report', {layout: 'userLayout', storeAdminSW});
});

// Reports
router.get('/reports', validations.ensureAuthenticated, validations.approvedUser, (req, res)=>{
	let user = req.user, storeAdminSW;
	(user.userType === "storeAdmin")? storeAdminSW=true:storeAdminSW=false;
	res.render('2-users/list_reports', {layout: 'userLayout', storeAdminSW});
});
/*
// storeAdmin User
router.get('/storeAdmin/:company/tickets/cities', ensureAuthenticated, approvedUser, function(req, res){
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
		});*/
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
//});

/*router.get('/storeAdmin/:company/:city/tickets', ensureAuthenticated, ApprovedUserFunction, function(req, res){
	let storeAdminSW = true, companyName = req.params.company, cityName = req.params.city;
		console.log(cityName);
		tickets.find({})
		.then(tks1 => store.populate(tks1, {path: "store_id"}))
		.then(tks2 => company.populate(tks2, {path: "store_id.company_id"}))
		.then(tks3 => city.populate(tks3, {path: "store_id.city_id"}))
		.then(result=>{
		var tkts = new Array();
			for(let item in result){
				let validation = result[item].store_id;
				//let lacity = result[item].store_id.city_id.city;
				if (validation.company_id.companyName === companyName && validation.city_id.city  === cityName)
					tkts.push(result[item]);
			}
			console.log(tkts);
			res.render('2-storeAdmin/tickets_into_city', {storeAdminSW, companyName, cityName, tkts});
		});*/
/*		console.log(city);
	res.render('2-storeAdmin/tickets_into_city', {storeAdminSW, companyName, city});*/
//});

/*
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
 									>>> POST <<< 
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
*/

// User Register
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
// User Login
router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

// User Edit
router.post('/account/edit', (req, res)=>{
	var user = req.user;
 	var form = new formidable.IncomingForm();
   form.parse(req, function(err, fields, files) {
	   company.findOne({_id: user.company_id}, (err, cny)=>{
		   let fSImagePath_cloudinary;
		   if (files.file.path!=null) fSImagePath_cloudinary = cny.companyName+'/'+user.id;
			UserModule.findOneAndUpdate({_id: user.id}, {$set: {name:fields.name, lastname: fields.lastname,
				username: fields.username, localId: fields.localId,	position: fields.position,	email: fields.email,
				cellphone: fields.cellphone, image: fSImagePath_cloudinary}} , {new: true}, (err, usr)=>{
				if (err) req.flash('error','Ha ocurrido un error. Inténtelo de nuevo más tarde.') 
					if (files.file.name!="")
					{
						let originPath = files.file.path;
						let destinationPath = fSImagePath_cloudinary;
						imageUp.uploadFile(originPath, destinationPath);		
					}
					req.flash('success_msg','El usuario se ha actualizado satisfactoriamente.')				
					res.redirect('/account/edit');
			});
	   });
	});
});
router.post('/tickets/edit', (req, res)=>{
	let user = req.user, ticket = req.body.ticketId, description = req.body.ticketDesc;
	tickets.findOneAndUpdate({_id: ticket}, {$set: {description: description}}, (err, tkts)=>{
		if(err) res.redirect('/users/tickets/edit/failed');
		else
		res.redirect('/users/tickets/edit/success');
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



/*function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		res.render('login', {layout: 'auth'});
	}
}

function validapprovedUser (req, res,next){
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

function validStoreAdmin (req, res,next){
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
	let lacompany = company.findOne({_id: currentCompany});
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
}*/
module.exports = router;
