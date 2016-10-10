'use strict';
/* >>> Modules <<< */
const express = require('express');
const router = express.Router();

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


/* >>> ROUTES <<< */
// Dashboard
router.get('/dashboard', validations.ensureAuthenticated, validations.systemAdmin, function(req, res){
	company.find({companyName: {$ne: "Default company"}}, (err, customers) => {
		res.render('1-admin/dashboard', {layout: 'adminLayout', userTypeAdmin: true, customers});
	});
});

// Account
router.get('/account', validations.ensureAuthenticated, (req, res)=>{
	let user = req.user, storeAdminSW;
	res.render('1-admin/account', {layout: 'adminLayout', storeAdminSW});
});

// New ticket
router.get('/newTicket', validations.ensureAuthenticated, (req, res)=>{
	let user = req.user, storeAdminSW;
	res.render('1-admin/new_ticket', {layout: 'adminLayout', storeAdminSW});
});

// Tickets
router.get('/tickets', validations.ensureAuthenticated, (req, res)=>{
	let user = req.user, storeAdminSW;
	res.render('1-admin/list_tickets', {layout: 'adminLayout', storeAdminSW});
});

// New store
router.get('/newStore', validations.ensureAuthenticated, (req, res)=>{
	let user = req.user, storeAdminSW;
	res.render('1-admin/new_store', {layout: 'adminLayout', storeAdminSW});
});

// Stores
router.get('/stores', validations.ensureAuthenticated, (req, res)=>{
	let user = req.user, storeAdminSW;
	res.render('1-admin/list_stores', {layout: 'adminLayout', storeAdminSW});
});

// New asset
router.get('/newAsset', validations.ensureAuthenticated, (req, res)=>{
	let user = req.user, storeAdminSW;
	res.render('1-admin/new_asset', {layout: 'adminLayout', storeAdminSW});
});

// Assets
router.get('/assets', validations.ensureAuthenticated, (req, res)=>{
	let user = req.user, storeAdminSW;
	res.render('1-admin/list_assets', {layout: 'adminLayout', storeAdminSW});
});

// New employee
router.get('/newEmployee', validations.ensureAuthenticated, (req, res)=>{
	let user = req.user, storeAdminSW;
	res.render('1-admin/new_employee', {layout: 'adminLayout', storeAdminSW});
});

// Employees
router.get('/employees', validations.ensureAuthenticated, (req, res)=>{
	let user = req.user, storeAdminSW;
	res.render('1-admin/list_employees', {layout: 'adminLayout', storeAdminSW});
});

// New report
router.get('/newReport', validations.ensureAuthenticated, (req, res)=>{
	let user = req.user, storeAdminSW;
	res.render('1-admin/new_report', {layout: 'adminLayout', storeAdminSW});
});

// Reports
router.get('/reports', validations.ensureAuthenticated, (req, res)=>{
	let user = req.user, storeAdminSW;
	res.render('1-admin/list_reports', {layout: 'adminLayout', storeAdminSW});
});
module.exports = router;