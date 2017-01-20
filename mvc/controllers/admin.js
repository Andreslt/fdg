'use strict';
/* >>> Modules <<< */
var express = require('express');
var router = express.Router();
var fs = require("fs");
var dateFormat = require('dateformat');
var formidable = require('formidable');
var Promise = require('promise');
//Models
var User = require('../models/user').user;
var User2 = require('../models/user').user;
var Company = require("../models/company");
var Store = require("../models/store");
var Ticket = require("../models/ticket");
var City = require('../models/city');
var Record = require('../models/record');
var Asset = require('../models/asset');
var AssetRef = require('../models/assetReference');

//Config
var Validations = require('../../config/validations');
var config = require('../../config/config');
var mailer = require('../../config/mailer');

/* >>> ROUTES <<< */
// Dashboard
router.get('/dashboard', Validations.ensureAuthenticated, Validations.systemAdmin, function (req, res) {
	Company.find({ companyName: { $ne: "Default company" } }, (err, customers) => {
		res.render('1-admin/dashboard', { layout: 'adminLayout', userTypeAdmin: true, customers });
	});
});

// Account
router.get('/account', Validations.ensureAuthenticated, Validations.systemAdmin, (req, res) => {
	let user = req.user, storeAdminSW;
	res.render('1-admin/account', { layout: 'adminLayout', storeAdminSW });
});

// Edit account
router.get('/account/edit', Validations.ensureAuthenticated, Validations.systemAdmin, (req, res) => {
	let user = req.user, storeAdminSW, userDates;
	User.findOne({ username: user.username }, (err, user) => {
		Company.find({ companyName: { $ne: "Default company" } }, (err, companies) => {
			City.find({ city: { $ne: "Default city" } }, (err, cities) => {
				Store.find({ storeName: { $ne: "Default store" } }, (err, stores) => {
					userDates = {
						creatYear: user.createdOn.getFullYear(),
						creatMonth: user.createdOn.getMonth(),
						creatDay: user.createdOn.getDate(),
					}
					if (user.approvedOn != null) {
						userDates.aprobYear = user.approvedOn.getFullYear();
						userDates.aprobMonth = user.approvedOn.getMonth();
						userDates.aprobDay = user.approvedOn.getDate();
					} else {
						userDates.aprobYear = 99;
						userDates.aprobMonth = 99;
						userDates.aprobDay = 99;
					}
					res.render('1-admin/account_edit', { layout: 'adminLayout', user, userDates, companies, cities, stores });
				});
			});
		});
	});
});

// New ticket
router.get('/newTicket', Validations.ensureAuthenticated, Validations.systemAdmin, (req, res) => {
	let user = req.user, storeAdminSW;
	City.find({ city: { $ne: "Default city" } }, (err, cities) => {
		if (err) console.log(err)
		Store.find({ storeName: { $ne: "Default store" } }, (err, stores) => {
			if (err) console.log(err)
			res.render('1-admin/new_ticket', { layout: 'adminLayout', storeAdminSW, stores, cities, ticketNumber: Validations.numberGenerator('ticket') });
		});
	});
});

// Tickets
router.get('/list_tickets', Validations.ensureAuthenticated, Validations.systemAdmin, (req, res) => {
	let user = req.user, storeAdminSW;
	var obj = { data: [] }, userImage;
	Ticket.find({ ticketType: 'corrective' }).populate('contacts').exec((err, tkts) => {
		if (err) console.log(err);
		for (let t = 0; t < tkts.length; t++) {
			obj.data.push(
				{
					title: tkts[t].title + "<br><small class='text-muted'><i>#Ticket: " + tkts[t].ticketNumber + "<i></small>",
					advance: "<td><div class='progress progress-xs' data-progressbar-value=" + tkts[t].advance + "><div class='progress-bar'></div></div></td>",
					contacts: getContactInfo(tkts[t].contacts),
					status: "<span style='text-align: center;' class='label label-" + getLabel(tkts[t].status) + "'>" + tkts[t].status + "</span>",
					'target-actual': "<span style='margin-top:5px' class='sparkline display-inline' data-sparkline-type='compositebar' data-sparkline-height='18px' data-sparkline-barcolor='#aafaaf' data-sparkline-line-width='2.5' data-sparkline-line-val='[47,9,9,8,3,2,2,5,6,7,4,1,5,7,6]' data-sparkline-bar-val='[47,9,9,8,3,2,2,5,6,7,9,9,5,7,6]'></span>",
					actual: "<span class='sparkline text-align-center' data-sparkline-type='line' data-sparkline-width='100%' data-sparkline-height='25px'>20,-35,70</span>",
					tracker: "<span class='onoffswitch'><input type='checkbox' name='start_interval' class='onoffswitch-checkbox' id='st1' checked='checked'><label class='onoffswitch-label' for='st1'><span class='onoffswitch-inner' data-swchon-text='ON' data-swchoff-text='OFF'></span><span class='onoffswitch-switch'></span></label></span>",
					startdate: dateFormat(tkts[t].startdate, "dd/mm/yyyy"),
					lastupdate: dateFormat(tkts[t].lastupdate, "dd/mm/yyyy HH:MM"),
					deadline: dateFormat(tkts[t].deadline, "dd/mm/yyyy"),
					description: tkts[t].description,
					categories: getCategories(tkts[t].categories),
					action: "<a href='/admin/ticket/details?ID=" + tkts[t].id + "' style='color: #FFFFFF;'><button class='btn btn-xs'>Ver Ticket</button></a> <a href=''><button class='btn btn-xs btn-danger pull-right' style='margin-left:5px'>Eliminar</button></a>"
				}
			);
		}
		var json = JSON.stringify(obj);
		fs.writeFile('public/data/dataList2.json', json, 'utf8', (err, data) => {
			if (err) console.log(err);
			else
				res.render('1-admin/list_tickets', { layout: 'adminLayout' });
		});
	});
});

// New record
router.post('/newRecord', Validations.ensureAuthenticated, Validations.systemAdmin, (req, res) => {
	let body = req.body;
	Ticket.findOne({ _id: body.ticket_id }, (err, ticket) => {
		User.findOne({ _id: body.custRepresentative }, (err, custRepresentative) => {
			let params = {
				recordNumber: Validations.numberGenerator("record"),
				ticket_id: body.ticket_id,
				customerReq: body.customerReq,
				currentState: body.currentState,
				correctiveActions: body.correctiveActions,
				suggestions: body.suggestions,
				adminRepresentative: req.user,
				custRepresentative: custRepresentative,
			},
				record = new Record(params);
			record.save((err) => {
				if (err) {
					req.flash('error', 'El acta no pudo ser guardada. Inténtelo nuevamente.');
					res.redirect('/tickets/ticket_details?ID=' + ticket.id);
				} else {
					req.flash('success_msg', 'Acta No: ' + params.recordNumber + ' guardada con éxito.');
					res.redirect('/tickets/ticket_details?ID=' + ticket.id);
				}
			});
		});
	});
});

// New store
router.get('/newStore', Validations.ensureAuthenticated, (req, res) => {
	let user = req.user, storeAdminSW;
	res.render('1-admin/new_store', { layout: 'adminLayout', storeAdminSW });
});

// Stores
router.get('/stores', Validations.ensureAuthenticated, (req, res) => {
	let user = req.user, storeAdminSW;
	Store.find({ storeName: { $ne: 'Default store' } }).populate('company_id').populate('city_id').populate('representative').exec((err, stores) => {
		if (err) console.log(err);
		res.render('1-admin/list_stores', { layout: 'adminLayout', storeAdminSW, stores });
	});
});

// New asset
router.get('/newAsset', Validations.ensureAuthenticated, (req, res) => {
	let user = req.user, storeAdminSW;
	res.render('1-admin/new_asset', { layout: 'adminLayout', storeAdminSW });
});

// Assets
router.get('/assets', Validations.ensureAuthenticated, (req, res) => {
	let user = req.user, storeAdminSW;
	res.render('1-admin/list_assets', { layout: 'adminLayout', storeAdminSW });
});

// New employee
router.get('/newEmployee', Validations.ensureAuthenticated, (req, res) => {
	let user = req.user, storeAdminSW;
	res.render('1-admin/new_employee', { layout: 'adminLayout', storeAdminSW });
});

// Users to be Approved (or Deleted)
router.get('/usersApproval', Validations.ensureAuthenticated, Validations.systemAdmin, (req, res) => {
	let user = req.user, storeAdminSW;
	User.find({ userApproval: false }).populate('company_id').exec((err, users) => {
		if (err) console.log(err)
		res.render('1-admin/list_users_to_approve', { layout: 'adminLayout', storeAdminSW, users });
	});
});

router.post('/usersApproval/approveUser/:username', Validations.ensureAuthenticated, Validations.systemAdmin, (req, res) => {
	let user = req.user, storeAdminSW, username = req.params.username;
	User.findOneAndUpdate({ username: username }, { $set: { userApproval: true, approvedOn: new Date() } }, { new: true }, (err, user) => {
		if (err) console.log(err)
		res.redirect('/admin/list_users_to_approve');
	});
});

router.post('/usersApproval/deleteUser/:username', Validations.ensureAuthenticated, Validations.systemAdmin, (req, res) => {
	let user = req.user, storeAdminSW, username = req.params.username;
	User.remove({ username: username }, (err, user) => {
		if (err) console.log(err)
		res.redirect('/admin/list_users_to_approve');
	});
});

// Approved Users
router.get('/usersApproved', Validations.ensureAuthenticated, Validations.systemAdmin, (req, res) => {
	let user = req.user, storeAdminSW;
	User.find({ userApproval: true, userRole: { $ne: 'systemAdmin' } })
		.populate('company_id').populate('city_id').populate('store_id').exec((err, users) => {
			if (err) throw err
			Store.find({ storeName: { $ne: 'Default store' } }).populate('city_id').sort({ city_id: -1 }).exec((err, stores) => {
				res.render('1-admin/list_users_approved', { layout: 'adminLayout', storeAdminSW, users, stores });
			});
		});
});

// Edit User
router.post('/editUser', Validations.ensureAuthenticated, Validations.systemAdmin, (req, res) => {
	let user = req.body;
	Store.findOne({_id: user.store_id},(err, store)=>{
		user.city_id = store.city_id;
	User.findOneAndUpdate({ _id: user.userID }, { $set: user }, { new: true }, (err, result) => {
		if (err) {
			req.flash('error', 'El usuario no pudo ser actualizado. Por favor inténtelo de nuevo más tarde.');
			res.redirect('/admin/usersApproved');
		} else {
			req.flash('success_msg', 'El usuario ha sido actualizado exitosamente.');
			res.redirect('/admin/usersApproved');
		}
	});
	});
});

// New report
router.get('/newReport', Validations.ensureAuthenticated, (req, res) => {
	let user = req.user, storeAdminSW;
	res.render('1-admin/new_report', { layout: 'adminLayout', storeAdminSW });
});

// Reports
router.get('/reports', Validations.ensureAuthenticated, (req, res) => {
	let user = req.user, storeAdminSW;
	res.render('1-admin/list_reports', { layout: 'adminLayout', storeAdminSW });
});

router.post('/reports/notify', Validations.ensureAuthenticated, Validations.systemAdmin, (req, res) => {
	let reportID = req.query.reportID, target = req.query.target.split(',');
	target = target[target.length - 1];
	Record.findOneAndUpdate({ recordNumber: reportID }, { $set: { notified: target } }, { new: true }, (err, record) => {
		Ticket.findOne({ _id: record.ticket_id }, (err, ticket) => {
			User.find({ _id: { $in: ticket.contacts } }, (err, users) => {
				let recipents = new Array();
				for (var u = 0; u < users.length; u++) {
					var sw = false;
					if (target === "administradores") {
						if (users[u].userRole === "systemAdmin") {
							sw = true;
						}
					} else if (target === "usuarios") {
						if (users[u].userRole !== "systemAdmin") {
							sw = true;
							
						}
					} else if (target === "contactos") {
						sw = true;
						
					}
					if (sw) recipents.push(users[u].email);
				}
				
				mailer.mailOptions.to = recipents;
				mailer.mailOptions.subject = "Notificaciones FDG - Nueva Acta No." + record.recordNumber;
				mailer.mailOptions.template = "record";
				mailer.mailOptions.context = {
					recordNumber: record.recordNumber,
					ticketNumber: ticket.ticketNumber
				};
				mailer.sendEmail();
			});
		});
	});
});

module.exports = router;	