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
// Go Home
router.get('/', ensureAuthenticated, (req, res)=>{
	    res.redirect('/home');
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
	    res.redirect('/users/tickets');
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
router.get('/admin/customers/:customer/tickets', ensureAuthenticated, AdminUserFunction, (req, res) => {
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
				User.findOne({_id: req.query.userId/*req.params.userId*/}).populate("company_id").populate("store_id").populate("city_id").exec((err, userEdit)=>{
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
/*					if(userEdit.userType==="storeEmployee"){
						selectedUserType.storeAdmin=false;
						selectedUserType.storeEmp=true;
					}*/
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

module.exports = router;