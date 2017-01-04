'use strict';

const express = require('express');
const router = express.Router();
const User = require("../models/user").user;
const Ticket = require("../models/ticket");
const Store = require('../models/store');
const City = require('../models/city');
const Company = require('../models/company');
const mailer = require('../../config/mailer');
const formidable = require('formidable');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
var _ = require('underscore');
var Validations = require('../../config/validations');
var Asset = require('../models/asset');
var AssetRef = require('../models/assetReference');
var Promise = require('promise');
var Record = require('../models/record');
var config = require('../../config/config');

/* ---> GENERAL <--- */
// Go Home
router.get('/', Validations.ensureAuthenticated, (req, res) => {
	res.redirect('/dashboard');
});
router.get('/home', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/home');
	} else {
		res.redirect('/users/home');
	}
});

/* ---> INICIO <--- */
// Dashboard
router.get('/dashboard', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/dashboard');
	} else {
		res.redirect('/users/dashboard');
	}
});

// Cuenta
router.get('/account', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/account');
	} else {
		res.redirect('/users/account');
	}
});
router.get('/account/edit', Validations.ensureAuthenticated, (req, res) => {
	req.flash('success_msg', 'El usuario se ha actualizado satisfactoriamente.')
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/account');
	} else {
		res.redirect('/users/account');
	}
});
router.post('/account/edit', (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect(307, '/admin/account/edit');
	} else {
		res.redirect(307, '/users/account/edit');
	}
});
/* ---> MANTENIMIENTOS <--- */

/*Preventivo*/

// 1. Programar Nuevo
router.get('/scheduleNew', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/scheduleNew');
	} else {
		res.redirect('/users/scheduleNew');
	}
});
// 2. Ver Programación
/*router.get('/scheduled_all', Validations.ensureAuthenticated, (req, res)=>{
	if (req.user.userRole === 'systemAdmin'){
	    res.redirect('/admin/scheduled_all');
	}else{
	    res.redirect('/users/scheduled_all');
	}
});*/
router.get('/scheduled_cities', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/scheduled_cities');
	} else {
		res.redirect('/users/scheduled_cities');
	}
});
router.get('/calendar/selected', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/calendar/selected?city=' + req.query.city);
	} else {
		res.redirect('/users/calendar/selected?city=' + req.query.city);
	}
});

// 2. Ver Tickets

//Preventive
router.get('/tickets_preventive', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/tickets_preventive');
	} else {
		res.redirect('/users/tickets_preventive?target=' + req.query.target);
	}
});
//Corrective
router.get('/list_tickets', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/list_tickets');
	} else {
		res.redirect('/users/list_tickets?target=' + req.query.target);
	}
});

router.get('/tickets/edit/success', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/tickets/edit/success');
	} else {
		res.redirect('/users/tickets/edit/success');
	}
});

router.get('/tickets/edit/failed', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/tickets/edit/failed');
	} else {
		res.redirect('/users/tickets/edit/failed');
	}
});

router.post('/tickets/edit', Validations.ensureAuthenticated, (req, res) => {
	if (req.body.ticketDesc != "") {
		if (req.user.userRole === 'systemAdmin') {
			res.redirect(307, '/admin/tickets/edit');
		} else {
			res.redirect(307, '/users/tickets/edit');
		}
	} else {
		res.redirect('/tickets/edit/failed');
	}
});

/* ---> TIENDAS <--- */
// 1. Crear Tienda
/*router.get('/newStore', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/newStore');
	} else {
		res.redirect('/users/newStore');
	}
});
router.post('/newStore', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect(307, '/admin/newStore');
		console.log("Creación de Tienda en Proceso para Administrador. Espere...");
	} else {
		res.redirect(307, '/users/newStore');
		console.log("Creación de Tienda en Proceso para Usuario. Espere...");
	}
});
router.get('/store/edit', Validations.ensureAuthenticated, (req, res)=>{
	storeID = req.query.id;
	stores.findOne({_id: storeID}, (err, store)=>{
		if (err) throw err;
		res.render('')
	})
	if (req.user.userRole === 'systemAdmin'){
	    res.redirect('');
	}else{
	    res.redirect('');
	}
});
router.post('/store/edit', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect(307, '/admin/store/edit');
	} else {
		res.redirect(307, '/users/store/edit');
	}
});

// 2. Ver Tiendas
router.get('/stores', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/stores');
	} else {
		res.redirect('/users/stores');
	}
});

router.get('/stores/store_details', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/stores');
	} else {
		res.redirect('/users/stores');
	}
});*/

/* ---> ACTIVOS <--- */
// 1. Crear Activo
/*router.get('/newAsset', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/newAsset');
	} else {
		res.redirect('/users/newAsset');
	}
});
// 2. Ver Activos
router.get('/assets', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/assets');
	} else {
		res.redirect('/users/assets');
	}
});*/

/* ---> EMPLEADOS <--- */
// 1. Crear Empleado
router.get('/newEmployee', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/newEmployee');
	} else {
		res.redirect('/users/newEmployee');
	}
});
// 2. Ver Empleados
router.get('/employees', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/employees');
	} else {
		res.redirect('/users/employees');
	}
});

router.post('/employee/edit', Validations.ensureAuthenticated, (req, res) => {
	console.log("llegó");
	if (req.user.userRole === 'systemAdmin') {
		res.redirect(307, '/admin/employee/edit');
	} else {
		res.redirect(307, '/users/employee/edit');
	}
});

/* ---> REPORTES <--- */
// 1. Crear Reporte
router.get('/newReport', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/newReport');
	} else {
		res.redirect('/users/newReport');
	}
});
// 2. Ver Reportes
router.get('/reports', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/reports');
	} else {
		res.redirect('/users/reports');
	}
});

router.get('/reports/view',  (req, res) => {
	let recordNumber = req.query.recordNumber,
		request = require('request');		
	var searchRecord = new Promise((resolve, reject) => {
		Record.findOne({ recordNumber: recordNumber })
			.populate('ticket_id').exec((err, record) => {
				if (err || record == null) { reject(err) }
				else resolve(record);
			});
	});
	searchRecord.then(record => {
		Ticket.findOne({ _id: record.ticket_id }).populate('store_id').exec((err, ticket) => {
			if (err) { res.sendStatus(404); console.log('Entró al error') }
			City.findOne({ _id: ticket.store_id.city_id }, (err, city) => {
				if (err) res.sendStatus(404);
				Company.findOne({ _id: ticket.store_id.company_id }, (err, company) => {
					if (err) res.sendStatus(404);
					User.findOne({ _id: record.custRepresentative }, (err, custRepresentative) => {
						if (err) res.sendStatus(404);
						User.findOne({ _id: record.adminRepresentative }, (err, adminRepresentative) => {
							Asset.findOne({_id: ticket.asset_id}, (err, asset)=>{
								AssetRef.findOne({_id: asset.reference_id}, (err, assetRef)=>{
									if (err) res.sendStatus(404);
									else {
										
										var data = {
											template: {
												shortid: "BJbxYsgbe",
											},
											data: {
												city: city.city,
												day: record.createdOn.getDate(),
												month: Validations.getSpanishMonth(record.createdOn.getMonth()),
												year: record.createdOn.getFullYear(),
												company: company.companyName,
												customerName: custRepresentative.name + " " + custRepresentative.lastname,
												adminRepresentative: adminRepresentative.name + " " + adminRepresentative.lastname,
												asset: asset.number,
												reference: assetRef.number,
												capacity: assetRef.capacity,
												units: assetRef.capacity_unit,
												brand: assetRef.brand,
												type: assetRef.type,
												refrigerant: assetRef.refrigerant,
												assetLocation: city.city,
												time: Validations.formatAMPM(record.createdOn),
												customerReq: record.customerReq/*"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla eu cursus nisl, at finibus ex. Sed quis ultrices nibh."*/,
												currentState: record.currentState/*"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla eu cursus nisl, at finibus ex. Sed quis ultrices nibh. Praesent quis efficitur ipsum, sed viverra quam. "*/,
												correctiveActions: record.correctiveActions/*"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla eu cursus nisl, at finibus ex. Sed quis ultrices nibh. Praesent quis efficitur ipsum, sed viverra quam. "*/,
												suggestions: record.suggestions/*"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla eu cursus nisl, at finibus ex. Sed quis ultrices nibh. Praesent quis efficitur ipsum, sed viverra quam. "*/,
												giverName: adminRepresentative.name + " " + adminRepresentative.lastname,/*"Felix Goenaga",*/
												giverID: adminRepresentative.localId,
												giverPosition: adminRepresentative.position,
												receiverName: custRepresentative.name + " " + custRepresentative.lastname,
												receiverID: custRepresentative.localId,
												receiverPosition: custRepresentative.position
											},
											options: {
												preview: true
											}
										};
										var options = {
											uri: "https://andreslt.jsreportonline.net/api/report",
											headers: {
												Authorization: "Basic " + new Buffer(config.jsReportUser + ":" + config.jsReportPassword).toString("base64")
											},
											method: 'POST',
											json: data
										};
										request(options).pipe(res);
									}
								});
							});
						});
					});
				});
			});
		});
	});
	searchRecord.catch(err => {
		console.log('err:'+err);
		res.sendStatus(404);
	});
});

/* ---> AJAX REQUESTS <--- */
router.post('/getContacts', (req,res)=>{
	var ticketID = req.query.url.split('?')[1].substring(3).toString();	
		Ticket.findOne({_id: ticketID}).populate('contacts').exec((err,ticket)=>{
			let contacts 
		res.send(ticket.contacts);
	});
})

/* ---> OLD <--- */
/*	router.get('/admin/customers/:customer/tickets', Validations.ensureAuthenticated, AdminUserFunction, (req, res) => {
		let customer = req.params.customer;
		company.find({companyName: {$ne: "Default company"}}, (err, customers) => {
			company.findOne({companyName: customer},(err, cny)=>{
				// tickets.find({}, (err, tkts) =>{
				// 	stores.populate(tkts, {path: 'store_id', where: {'company_id': cny.id}}, (err, st) => {
				// 		console.log(st);
				// 	});
				stores.find({company_id: cny.id}, (err, st) => {
					let n = st.length;
					let stres = new Array();
					for (let i=0; i<n; i++){
						stres.push(st[i].id);
					}
					tickets.find({store_id: {$in: stres}}, (err, tks) => {
						stores.populate(tks, {path: "store_id"}, (err, tkts)=>{
							res.render('admin_customers_tickets', {userRoleAdmin: true, customer, customers, tkts});
						});										
					});
				});
		});	
	});
	});

	// Admin Users
	router.get('/admin/listUsers', Validations.ensureAuthenticated, AdminUserFunction, (req,res)=>{
		company.find({companyName: {$ne: "Default company"}}, (err, customers) => {
			User.find({userRole:{$ne: "systemAdmin"}},(err, users)=>{
				if (err) throw err;
				res.render('1-admin/users_list', {userRoleAdmin: true, users, customers});
			});	
		});
	});

	router.get('/admin/listUsers/editUser', Validations.ensureAuthenticated, AdminUserFunction, (req,res)=>{
		var user = req.user;
		company.find({companyName: {$ne: "Default company"}},(err, customers) => {
			City.find({},(err, cits) => {
				stores.find({storeName: {$ne: "Default store"}},(err, strs) => {
					User.findOne({_id: req.query.userId}).populate("company_id").populate("store_id").populate("city_id").exec((err, userEdit)=>{
						if (err) throw err;
						var userDates ={
							//Creation Date
							creatYear: userEdit.createdOn.getFullYear(),
							creatMonth: userEdit.createdOn.getMonth()+1,
							creatDay: userEdit.createdOn.getDate(),

							//Aprobation Date
							aprobYear: "",
							aprobMonth: "",
							aprobDay: ""					
						}

						if (userEdit.approvedOn != null){
							userDates.aprobYear = userEdit.approvedOn.getFullYear();
							userDates.aprobMonth = userEdit.approvedOn.getMonth()+1
							userDates.aprobDay = userEdit.approvedOn.getDate()
						}
						const selecteduserRole={
							storeAdmin: true,
							storeEmp: false
						};
						if(userEdit.userRole==="storeEmployee"){
							selecteduserRole.storeAdmin=false;
							selecteduserRole.storeEmp=true;
						}
						res.render('admin_users_edit', {userRoleAdmin: true, userEdit, customers, cits, strs, userDates, selecteduserRole});
					});
				});
			});
		});
	});

	router.get('/admin/usersAuth', Validations.ensureAuthenticated, AdminUserFunction, (req, res)=>{
		company.find({companyName: {$ne: "Default company"}}, (err, customers) => {
			User.find({userApproval: false}, (err, usrs) =>{
				res.render('admin_users_approval', {userRoleAdmin: true, customers, usrs});
			});		
		});
	});

	// Admin Edit tickets
	router.post('/admin/customers/ticket/edit', Validations.ensureAuthenticated, AdminUserFunction, (req, res)=>{
		let str = req.rawHeaders[19];
		let st1 = str.search("/customers")+"/customers".length+1;
		let st2 = str.search("/tickets");
		let company = str.substring(st1,st2);
		tickets.update({_id: req.body.ticketId},{$set:{description: req.body.ticketDesc, 
			title: req.body.ticketTitle, lastUpdate: req.body.ticketLastUpdate, 
			status: req.body.ticketStatus}}, (err, result)=>{
			if (err)
			console.log("There was an error");
			res.redirect("/admin/customers/"+company+"/tickets");
		});
	});

	router.post('/admin/approveUser/:username', Validations.ensureAuthenticated, AdminUserFunction, (req, res)=>{
	let user = req.params.username;
		User.findOneAndUpdate({username: user}, {$set: {userApproval: true}, $currentDate: { "approvedOn": true }}, (err, usr)=>{
				if (err) console.log(err);

				mailer.params.user="";
				mailer.params.pass="";
				mailer.service="hotmail";
				mailer.mailOptions.name = usr.name;
				mailer.mailOptions.lastname = usr.lastname;
				mailer.sendEmail(mailer.params, mailer.service, mailer.mailOptions);
				res.render('admin_users_approval', {userRoleAdmin: true, });
		});
	});

	router.post('/admin/edituser/:userId', Validations.ensureAuthenticated, AdminUserFunction, (req,res)=>{
		let body = req.body
		delete body["style-0"];
		var approve;
		if(body.userApproval==="true") approve=true
		else approve=false
		console.log(approve);
		User.findOneAndUpdate({_id: req.params.userId}, {$set: {body, userApproval: approve}}, {new:true}, (err, usr)=>{
			if (err) throw error;
			req.flash('success_msg', 'El usuario '+usr.username+' ha sido actualizado exitosamente.');
			res.redirect('/admin/listUsers');
		});
	});

	router.post('/admin/deleteUser/:username', Validations.ensureAuthenticated, AdminUserFunction, (req, res)=>{
	let user = req.params.username;
		User.find({ username:user }).remove().exec();
		res.render('admin_users_approval', {userRoleAdmin: true});
	});
*/

/* ---------->>> USERS <<<---------- */
/*
// User Register
router.post('/register', function(req, res){
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;
	var name = req.body.name;
  	var lastname = req.body.lastname;
  	var userRolebody = req.body.userRole;
	var localId = req.body.localId;
  	var companyId = req.body.companyId;
	var phone_number = req.body.phone_number;

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
			userRole: userRolebody,
			localId: localId,
			companyId: companyId,
			phone:phone_number
    };
    
	if(errors){
		res.render('register',{layout: 'auth',
			errors:errors
		});
	} else {
		if(userRolebody === "systemAdmin"){
				usrParams.pin = 9999;
				newUser = new User.systemAdmin(usrParams);
		}else{
				if (userRolebody === "storeAdmin"){
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
});*/

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		res.render('login', { layout: 'auth', login: false });
	}
}

function AdminUserFunction(req, res, next) {
	if (req.user.userRole === 'systemAdmin') {
		console.log("HELLO ADMIN!");
		return next();
	} else {
		res.render('adminAccess_only', { layout: 'accessDenied' });
		console.log("GO AWAY IMPOSTOR!");
	}
	return next();
}

module.exports = {
	router: router
};