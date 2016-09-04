'use strict';

const express = require('express');
const router = express.Router();
const User = require("../models/user").user;
const tickets = require("../models/ticket");
const stores = require('../models/store');
const company = require('../models/company');

// Get Homepage
router.get('/', ensureAuthenticated, function(req, res){
	res.redirect('/dashboard');	
});

// General Dashboard
router.get('/dashboard', ensureAuthenticated, function(req, res){
	if (req.user.userType === "systemAdmin")
	    res.redirect('/admin/dashboard');
	else
	    res.redirect('/users/dashboard');
});

// Admin Dashboard
router.get('/admin/dashboard', ensureAuthenticated, function(req, res){
	 stores.find({}, function(err, store){
			if (req.user.userType === "systemAdmin"){
				tickets.find({}).populate('store_id').populate('storeEmployee_id').exec(function(err, tkts){
					console.log(store);
					res.render('admin_tickets', {userTypeAdmin: true, tkts, store});
				});
			}else
				res.render('custom_dashboard', {userTypeAdmin: false});
			});
});

// Admin Manage Users
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
});

// Admin Edit tickets
router.post('/admin/tickets/edit', function(req, res){

});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		res.render('login', {layout: 'auth', login: false});
	}
}

module.exports = router;
