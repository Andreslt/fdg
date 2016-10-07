'use strict';

const express = require('express');
const router = express.Router();
const User = require("../models/user").user;
const tickets = require("../models/ticket");
const stores = require('../models/store');
const cities = require('../models/city');
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
router.get('/admin/dashboard', ensureAuthenticated, AdminUserFunction, function(req, res){
	company.find({companyName: {$ne: "Default company"}}, (err, customers) => {
		res.render('1-admin/dashboard', {userTypeAdmin: true, customers});
	});
});

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