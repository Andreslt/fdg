'use strict';

const express = require('express');
const router = express.Router();
const User = require("../models/user").user;
const tickets = require("../models/ticket");
const stores = require('../models/store');
const cities = require('../models/city');
const company = require('../models/company');
const mailer = require('../../config/mailer');
const formidable = require('formidable');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

/* ---> GENERAL <--- */
// Go Home
router.get('/', ensureAuthenticated, (req, res)=>{
	    res.redirect('/dashboard');
});
router.get('/home', ensureAuthenticated, (req, res)=>{
	if (req.user.userType === 'systemAdmin'){
	    res.redirect('/admin/home');
	}else{
	    res.redirect('/users/home');
	}	
});

/* ---> INICIO <--- */
// 1. Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res)=>{
	if (req.user.userType === 'systemAdmin'){
	    res.redirect('/admin/dashboard');
	}else{
	    res.redirect('/users/dashboard');
	}
});
// 2. Cuenta
router.get('/account', ensureAuthenticated, (req, res)=>{	
	if (req.user.userType === 'systemAdmin'){
	    res.redirect('/admin/account');
	}else{
	    res.redirect('/users/account');
	}
});
router.get('/account/edit', ensureAuthenticated, (req, res)=>{
	req.flash('success_msg','El usuario se ha actualizado satisfactoriamente.')
	if (req.user.userType === 'systemAdmin'){
	    res.redirect('/admin/account');
	}else{
	    res.redirect('/users/account');
	}
});
router.post('/account/edit', (req, res)=>{
	if (req.user.userType === 'systemAdmin'){
	    res.redirect(307, '/admin/account/edit');
	}else{
	    res.redirect(307, '/users/account/edit');
	}		
});
/* ---> ORDENES <--- */
// 1. Crear Ticket
router.get('/newTicket', ensureAuthenticated, (req, res)=>{
	if (req.user.userType === 'systemAdmin'){
	    res.redirect('/admin/newTicket');
	}else{
	    res.redirect('/users/newTicket');
	}
});

router.get('/newTicket/failed', ensureAuthenticated, (req, res)=>{
	req.flash('error_msg','No se pudo crear el ticket. Todos los campos no opcionales son requeridos.')
	if (req.user.userType === 'systemAdmin'){
	    res.redirect('/admin/newTicket');
	}else{
	    res.redirect('/users/newTicket');
	}
});

router.get('/newTicket/success', ensureAuthenticated, (req, res)=>{
	req.flash('success_msg','Ticket creado con éxito.')
	if (req.user.userType === 'systemAdmin'){
	    res.redirect('/admin/tickets');
	}else{
	    res.redirect('/users/tickets');
	}
});

router.post('/newTicket', ensureAuthenticated, (req, res)=>{
	var user = req.user, storeAdminSW;
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		let body = fields, datenew= body.startdate.slice(-4)+"/"+body.startdate.substring(6,2)+"/"+body.startdate.substring(0,2);
		var params={
			ticketNumber: body.ticketNumber,
			title: body.title,
			startdate: new Date (datenew),
			store_id: body.store,
			priority: body.priority,
			description: body.description,
			categories: body.categories,
			status: "Pendiente",
			created_by: req.user.id	
		}

		var newTicket = new tickets(params);
		tickets.createTicket(newTicket, (err, ticket)=>{
			if (err) {
				req.flash('error_msg', 'Ha habido un problema al crear el ticket.');
				res.redirect('/newTicket/failed');
			}else{									
				(user.userType === "storeAdmin")? storeAdminSW = true : storeAdminSW=false;
				res.redirect('/newTicket/success');				
			}
		});
	})	
});
// 2. Ver Tickets
router.get('/tickets', ensureAuthenticated, (req, res)=>{
	if (req.user.userType === 'systemAdmin'){
	    res.redirect('/admin/tickets');
	}else{
	    res.redirect('/users/tickets?target='+req.query.target);
	}
});

router.get('/tickets/edit/success', ensureAuthenticated, (req, res)=>{
	if (req.user.userType === 'systemAdmin'){
	    res.redirect('/admin/tickets/edit/success');
	}else{
	    res.redirect('/users/tickets/edit/success');
	}
});

router.get('/tickets/edit/failed', ensureAuthenticated, (req, res)=>{
	if (req.user.userType === 'systemAdmin'){
	    res.redirect('/admin/tickets/edit/failed');
	}else{
	    res.redirect('/users/tickets/edit/failed');
	}
});

router.post('/tickets/edit', ensureAuthenticated, (req, res)=>{
	if (req.body.ticketDesc != ""){
		if (req.user.userType === 'systemAdmin'){
			res.redirect(307, '/admin/tickets/edit');
		}else{
			res.redirect(307, '/users/tickets/edit');
		}
	}else{
		res.redirect('/tickets/edit/failed');
	}
});

/* ---> TIENDAS <--- */
// 1. Crear Tienda
router.get('/newStore', ensureAuthenticated, (req, res)=>{
	if (req.user.userType === 'systemAdmin'){
	    res.redirect('/admin/newStore');
	}else{
	    res.redirect('/users/newStore');
	}
});
router.post('/newStore', ensureAuthenticated, (req, res)=>{
	if (req.user.userType === 'systemAdmin'){
	    res.redirect(307,'/admin/newStore');
		console.log("Creación de Tienda en Proceso para Administrador. Espere...");
	}else{
	    res.redirect(307,'/users/newStore');
		console.log("Creación de Tienda en Proceso para Usuario. Espere...");
	}
});
/*router.get('/store/edit', ensureAuthenticated, (req, res)=>{
	storeID = req.query.id;
	stores.findOne({_id: storeID}, (err, store)=>{
		if (err) throw err;
		res.render('')
	})
	if (req.user.userType === 'systemAdmin'){
	    res.redirect('');
	}else{
	    res.redirect('');
	}
});*/
router.post('/store/edit', ensureAuthenticated, (req, res)=>{
	if (req.user.userType === 'systemAdmin'){
	    res.redirect(307,'/admin/store/edit');
	}else{
	    res.redirect(307,'/users/store/edit');
	}
});

// 2. Ver Tiendas
router.get('/stores', ensureAuthenticated, (req, res)=>{
	if (req.user.userType === 'systemAdmin'){
	    res.redirect('/admin/stores');
	}else{
	    res.redirect('/users/stores');
	}
});

/* ---> ACTIVOS <--- */
// 1. Crear Activo
router.get('/newAsset', ensureAuthenticated, (req, res)=>{
	if (req.user.userType === 'systemAdmin'){
	    res.redirect('/admin/newAsset');
	}else{
	    res.redirect('/users/newAsset');
	}
});
// 2. Ver Activos
router.get('/assets', ensureAuthenticated, (req, res)=>{
	if (req.user.userType === 'systemAdmin'){
	    res.redirect('/admin/assets');
	}else{
	    res.redirect('/users/assets');
	}
});

/* ---> EMPLEADOS <--- */
// 1. Crear Empleado
router.get('/newEmployee', ensureAuthenticated, (req, res)=>{
	if (req.user.userType === 'systemAdmin'){
	    res.redirect('/admin/newEmployee');
	}else{
	    res.redirect('/users/newEmployee');
	}
});
// 2. Ver Empleados
router.get('/employees', ensureAuthenticated, (req, res)=>{
	if (req.user.userType === 'systemAdmin'){
	    res.redirect('/admin/employees');
	}else{
	    res.redirect('/users/employees');
	}
});

router.post('/employee/edit', ensureAuthenticated, (req, res)=>{
	console.log("llegó");
	if (req.user.userType === 'systemAdmin'){
	    res.redirect(307, '/admin/employee/edit');
	}else{
	    res.redirect(307, '/users/employee/edit');
	}
});

/* ---> REPORTES <--- */
// 1. Crear Reporte
router.get('/newReport', ensureAuthenticated, (req, res)=>{
	if (req.user.userType === 'systemAdmin'){
	    res.redirect('/admin/newReport');
	}else{
	    res.redirect('/users/newReport');
	}
});
// 2. Ver Reportes
router.get('/reports', ensureAuthenticated, (req, res)=>{
	if (req.user.userType === 'systemAdmin'){
	    res.redirect('/admin/reports');
	}else{
	    res.redirect('/users/reports');
	}
});


/* ---> OLD <--- */
/*	router.get('/admin/customers/:customer/tickets', ensureAuthenticated, AdminUserFunction, (req, res) => {
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
							res.render('admin_customers_tickets', {userTypeAdmin: true, customer, customers, tkts});
						});										
					});
				});
		});	
	});
	});

	// Admin Users
	router.get('/admin/listUsers', ensureAuthenticated, AdminUserFunction, (req,res)=>{
		company.find({companyName: {$ne: "Default company"}}, (err, customers) => {
			User.find({userType:{$ne: "systemAdmin"}},(err, users)=>{
				if (err) throw err;
				res.render('1-admin/users_list', {userTypeAdmin: true, users, customers});
			});	
		});
	});

	router.get('/admin/listUsers/editUser', ensureAuthenticated, AdminUserFunction, (req,res)=>{
		var user = req.user;
		company.find({companyName: {$ne: "Default company"}},(err, customers) => {
			cities.find({},(err, cits) => {
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
						const selectedUserType={
							storeAdmin: true,
							storeEmp: false
						};
						if(userEdit.userType==="storeEmployee"){
							selectedUserType.storeAdmin=false;
							selectedUserType.storeEmp=true;
						}
						res.render('admin_users_edit', {userTypeAdmin: true, userEdit, customers, cits, strs, userDates, selectedUserType});
					});
				});
			});
		});
	});

	router.get('/admin/usersAuth', ensureAuthenticated, AdminUserFunction, (req, res)=>{
		company.find({companyName: {$ne: "Default company"}}, (err, customers) => {
			User.find({userApproval: false}, (err, usrs) =>{
				res.render('admin_users_approval', {userTypeAdmin: true, customers, usrs});
			});		
		});
	});

	// Admin Edit tickets
	router.post('/admin/customers/ticket/edit', ensureAuthenticated, AdminUserFunction, (req, res)=>{
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

	router.post('/admin/approveUser/:username', ensureAuthenticated, AdminUserFunction, (req, res)=>{
	let user = req.params.username;
		User.findOneAndUpdate({username: user}, {$set: {userApproval: true}, $currentDate: { "approvedOn": true }}, (err, usr)=>{
				if (err) console.log(err);

				mailer.params.user="";
				mailer.params.pass="";
				mailer.service="hotmail";
				mailer.mailOptions.name = usr.name;
				mailer.mailOptions.lastname = usr.lastname;
				mailer.sendEmail(mailer.params, mailer.service, mailer.mailOptions);
				res.render('admin_users_approval', {userTypeAdmin: true, });
		});
	});

	router.post('/admin/edituser/:userId', ensureAuthenticated, AdminUserFunction, (req,res)=>{
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

	router.post('/admin/deleteUser/:username', ensureAuthenticated, AdminUserFunction, (req, res)=>{
	let user = req.params.username;
		User.find({ username:user }).remove().exec();
		res.render('admin_users_approval', {userTypeAdmin: true});
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
  	var userTypebody = req.body.userType;
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
			userType: userTypebody,
			localId: localId,
			companyId: companyId,
			phone:phone_number
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
});*/

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		res.render('login', {layout: 'auth', login: false});
	}
}

function AdminUserFunction (req, res,next){
	if(req.user.userType==='systemAdmin'){
		console.log("HELLO ADMIN!");
		return next();
	}else{
		res.render('adminAccess_only',{layout: 'accessDenied'});
		console.log("GO AWAY IMPOSTOR!");
	}
	return next();
}

module.exports = {
	router: router
};