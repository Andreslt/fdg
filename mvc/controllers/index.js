'use strict';

const express = require('express');
const router = express.Router();
const User = require("../models/user").user;
const tickets = require("../models/ticket");
const stores = require('../models/store');
const company = require('../models/company');
const mailer = require('../../config/mailer');

// Get Homepage
router.get('/', ensureAuthenticated, function(req, res){
	res.redirect('/dashboard');	
});

// General Dashboard
router.get('/dashboard', ensureAuthenticated, function(req, res){
	if (req.user.userType === 'systemAdmin'){
	    res.redirect('/admin/dashboard');
	}else{
	    res.redirect('/users/dashboard');
	}
});

// Admin Dashboard
router.get('/admin/dashboard', ensureAuthenticated, function(req, res){
	company.find({companyName: {$ne: "Default company"}}, (err, customers) => {
		res.render('admin_dashboard', {userTypeAdmin: true, customers});
	});
});

router.get('/admin/customers/:customer/tickets', (req, res) => {
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
		// tickets.find({}, (err, tkts) => {
		// 	stores.findOne({'company_id': '57b5e6118fc445a60fbdd8d5'})
		// 	.populate({path: "store_id"}, (err, salida) =>{
		// 		console.log(salida);
		// 	});
		// });	
		// tickets.find({}).populate('store_id').exec((err, tkt)=>{
		// 	console.log(tkt);			
		// });
	// store.find({}, (err, stores) => {
	// 	store.populate(companies, {path :""})			
	// });			
});
});

// Admin Users
router.get('/admin/listUsers', (req,res)=>{
	company.find({companyName: {$ne: "Default company"}}, (err, customers) => {
		User.find({userType:{$ne: "systemAdmin"}},(err, users)=>{
			if (err) throw err;
			res.render('admin_users_list', {users, customers});
		});	
	});
});

router.get('/admin/edituser/:userId', (req,res)=>{
	company.find({companyName: {$ne: "Default company"}},(err, customers) => {
		User.findOne({_id: req.params.userId},(err, usr)=>{
			if (err) throw err;
			console.log(usr);
			res.render('admin_users_edit', {usr, customers});
		});
	});
});

router.get('/admin/usersAuth', (req, res)=>{
	company.find({companyName: {$ne: "Default company"}}, (err, customers) => {
		User.find({userApproval: false}, (err, usrs) =>{
			res.render('admin_users_approval', {customers, usrs});
		});		
	});
});

/*// Admin Manage Users
router.get('/admin/manage_users', function(req, res){
	if (!req.user)
		res.redirect('/');
	else
		res.render('admin_users', {layout: 'layout', userTypeAdmin: true});
});

// Admin Appointments
router.get('/admin/appointments', function(req, res){
	if (!req.user)
		res.redirect('/');
	else	
		res.render('appointments', {layout: 'layout', userTypeAdmin: true});
});

// Customers->Cities
router.get('/admin/customers/cities', ensureAuthenticated,function(req, res){
	res.render('admin_customers_cities', {layout: 'layout', userTypeAdmin: true});
});

// Customers->Companies
router.get('/admin/customers/companies', ensureAuthenticated,function(req, res){
	company.find({companyName: {$ne: "Default company"}}, (err, companies)=>{
		res.render('admin_customers_companies', {layout: 'layout', userTypeAdmin: true, companies});		
	});	
});

// Customers->Companies specific
router.get('/admin/customers/companies/:company', ensureAuthenticated,function(req, res){
	let lacompany = req.params.company;
	company.find({companyName: lacompany}, (err, companies)=>{
		res.render('admin_tickets', {layout: 'layout', userTypeAdmin: true, companies});		
	});
});*/

// Admin Edit tickets
router.post('/admin/customers/ticket/edit', function(req, res){
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

router.post('/admin/approveUser/:username', (req, res)=>{
let user = req.params.username;
	User.update({username: user}, {$set: {userApproval: true}, $currentDate: { "approvedOn": true }}, (err, result)=>{
		User.findOne({username: user},(err, usr)=>{
			if (err) console.log(err);

			mailer.params.user="andres_late1008@hotmail.com";
			mailer.params.pass="Andresito900810";
			mailer.service="hotmail";
			mailer.mailOptions.name = usr.name;
			mailer.mailOptions.lastname = usr.lastname;
			mailer.sendEmail(mailer.params, mailer.service, mailer.mailOptions);
			console.log(usr);
			res.render('admin_users_approval');
		});
	});
});

router.post('/admin/deleteUser/:username', (req, res)=>{
let user = req.params.username;
	User.find({ username:user }).remove().exec();
	res.render('admin_users_approval');
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		res.render('login', {layout: 'auth', login: false});
	}
}

module.exports = router;
