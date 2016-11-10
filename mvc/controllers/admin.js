'use strict';
/* >>> Modules <<< */
var express = require('express');
var router = express.Router();
var fs = require("fs");
var dateFormat = require('dateformat');
var formidable = require('formidable');
//Models
var User = require('../models/user').user;
var User2 = require('../models/user').user;
var Company = require("../models/company");
var Store = require("../models/store");
var Ticket = require("../models/ticket");
var City = require('../models/city');
var Record = require('../models/record');

//Config
var validations = require('../../config/validations');
var config = require('../../config/config');

/* >>> ROUTES <<< */
// Dashboard
router.get('/dashboard', validations.ensureAuthenticated, validations.systemAdmin, function (req, res) {
	Company.find({ companyName: { $ne: "Default company" } }, (err, customers) => {
		res.render('1-admin/dashboard', { layout: 'adminLayout', userTypeAdmin: true, customers });
	});
});

// Account
router.get('/account', validations.ensureAuthenticated, validations.systemAdmin, (req, res) => {
	let user = req.user, storeAdminSW;
	res.render('1-admin/account', { layout: 'adminLayout', storeAdminSW });
});

// Edit account
router.get('/account/edit', validations.ensureAuthenticated, validations.systemAdmin, (req, res) => {
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
					res.render('1-admin/account_edit', { layout: 'userLayout', user, userDates, companies, cities, stores });
				});
			});
		});
	});
});

// New ticket
router.get('/newTicket', validations.ensureAuthenticated, validations.systemAdmin, (req, res) => {
	let user = req.user, storeAdminSW;
	res.render('1-admin/new_ticket', { layout: 'adminLayout', storeAdminSW });
});

// Tickets
router.get('/tickets', validations.ensureAuthenticated, validations.systemAdmin, (req, res) => {
	let user = req.user, storeAdminSW;
	var obj = { data: [] }, userImage;
	Ticket.find({}).populate('contacts').exec((err, tkts) => {
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

// Ticket Details
router.get('/ticket/details', validations.ensureAuthenticated, validations.systemAdmin, (req, res) => {
	let ticketID = req.query.ID;
	Ticket.findOne({ _id: ticketID }).populate('store_id').exec((err, ticket) => {
		if (err) console.log(err);
		City.findOne({ _id: ticket.store_id.city_id }, (err, city) => {
			User.find({ company_id: ticket.store_id.company_id, userRole: "storeEmployee" }, (err, costumers) => {
				Record.find({ ticket_id: ticketID }).populate('adminRepresentative').populate('custRepresentative').exec((err, records) => {
					if (err) console.log(err);
					let recordNumber = validations.numberGenerator("record"), representative = req.user;
					res.render('1-admin/view_ticket', { layout: 'adminLayout', costumers, representative, recordNumber, ticket, records, city });
				});
			});
		})
	});
});

router.post('/ticket/save', validations.ensureAuthenticated, validations.systemAdmin, (req, res) => {
	var form = new formidable.IncomingForm(), user = req.user;
	form.parse(req, function (err, fields, files) {
		let body = fields, ticketID = body.ticket_id,

			params = {
				priority: body.setpriority,
				advance: body.setadvance,
				status: body.setstatus,
				title: body.title,
				description: body.description,
				categories: body.categories,
				lastupdate: new Date(),
				deadline: setDates(body.setdeadline),
				modified_by: req.user.id,
			}

		console.log(params);
		Ticket.findOneAndUpdate({ _id: ticketID }, { $set: params }, { new: true }, (err, ticket) => {
			if (err) {
				console.log(err);
			} else {
				req.flash("success_msg", "El ticket fue actualizado.");
				res.redirect('/tickets');
			}
		});
	});
});

// New record
router.post('/newRecord', validations.ensureAuthenticated, validations.systemAdmin, (req, res) => {
	let body = req.body;
	User.findOne({ _id: body.custRepresentative }, (err, custRepresentative) => {
		let params = {
			recordNumber: validations.numberGenerator("record"),
			ticket_id: body.ticket_id,
			customerReq: body.customerReq,
			currentState: body.currentState,
			correctiveActions: body.correctiveActions,
			suggestions: body.suggestions,
			adminRepresentative: req.user,
			custRepresentative: custRepresentative,
		},
			record = new Record(params);
		console.log(record);
		record.save((err) => {
			if (err) req.flash('error', 'El acta no pudo ser guardada. Inténtelo nuevamente.');
			else req.flash('success_msg', 'Acta No: ' + params.recordNumber + ' guardada con éxito.');

			res.redirect('/admin/ticket/details?ID=' + params.ticket_id);
		});
	});
});

// New store
router.get('/newStore', validations.ensureAuthenticated, (req, res) => {
	let user = req.user, storeAdminSW;
	res.render('1-admin/new_store', { layout: 'adminLayout', storeAdminSW });
});

// Stores
router.get('/stores', validations.ensureAuthenticated, (req, res) => {
	let user = req.user, storeAdminSW;
	res.render('1-admin/list_stores', { layout: 'adminLayout', storeAdminSW });
});

// New asset
router.get('/newAsset', validations.ensureAuthenticated, (req, res) => {
	let user = req.user, storeAdminSW;
	res.render('1-admin/new_asset', { layout: 'adminLayout', storeAdminSW });
});

// Assets
router.get('/assets', validations.ensureAuthenticated, (req, res) => {
	let user = req.user, storeAdminSW;
	res.render('1-admin/list_assets', { layout: 'adminLayout', storeAdminSW });
});

// New employee
router.get('/newEmployee', validations.ensureAuthenticated, (req, res) => {
	let user = req.user, storeAdminSW;
	res.render('1-admin/new_employee', { layout: 'adminLayout', storeAdminSW });
});

// Employees
router.get('/employees', validations.ensureAuthenticated, (req, res) => {
	let user = req.user, storeAdminSW;
	res.render('1-admin/list_employees', { layout: 'adminLayout', storeAdminSW });
});

// New report
router.get('/newReport', validations.ensureAuthenticated, (req, res) => {
	let user = req.user, storeAdminSW;
	res.render('1-admin/new_report', { layout: 'adminLayout', storeAdminSW });
});

// Reports
router.get('/reports', validations.ensureAuthenticated, (req, res) => {
	let user = req.user, storeAdminSW;
	res.render('1-admin/list_reports', { layout: 'adminLayout', storeAdminSW });
});

router.get('/reports/view', validations.ensureAuthenticated, validations.systemAdmin, (req, res) => {
	let recordNumber = req.query.recordNumber,
		request = require('request');

	Record.findOne({ recordNumber: recordNumber }).populate('ticket_id').exec((err, record) => {
		if (err) res.sendStatus(404);
		Ticket.findOne({ _id: record.ticket_id }).populate('store_id').exec((err, ticket) => {
			if (err) res.sendStatus(404);
			City.findOne({ _id: ticket.store_id.city_id }, (err, city) => {
				if (err) res.sendStatus(404);
				Company.findOne({ _id: ticket.store_id.company_id }, (err, company) => {
					if (err) res.sendStatus(404);
					User.findOne({ _id: record.custRepresentative }, (err, custRepresentative) => {
						if (err) res.sendStatus(404);
						User.findOne({ _id: record.adminRepresentative }, (err, adminRepresentative) => {
							if (err) res.sendStatus(404);
							else {
								console.log('record: '+record);
								console.log('ticket: '+ticket);
								console.log('city: '+city);
								console.log('company: '+company);
								console.log('custRepresentative: '+custRepresentative);
								console.log('adminRepresentative: '+adminRepresentative);
								var data = {
									template: {
										shortid: "BJbxYsgbe",
									},
									data: {
										city: city.city,
										day: record.createdOn.getDate(),
										month: getSpanishMonth(record.createdOn.getMonth()),
										year: record.createdOn.getFullYear(),
										company: company.companyName,
										custRepresentativeName: custRepresentative.name + " " + custRepresentative.lastname,
										adminadminRepresentative: adminRepresentative.name + " " + adminRepresentative.lastname,
										asset: record.ticket_id.asset_id,
										reference: "referencia",
										capacity: 123,
										brand: "MacDonalds",
										type: "tipo1",
										refrigerant: "abcd",
										assetLocation: "Bucaramanga",
										time: formatAMPM(record.createdOn),
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

function getLabel(status) {
	if (status === "Pendiente") {
		return "info";
	} else if (status === "Asignado") {
		return "warning";
	} else if (status === "Finalizado") {
		return "success"
	} else return "danger";
}

function getContactInfo(contacts) {
	let contactInfo = "<div class='project-members'>", status;
	for (let i = 0; i < contacts.length; i++) {
		(contacts[i].userRole === "storeAdmin") ? status = "online" : status = "busy";
		contactInfo = contactInfo + "<a href='javascript:void(0)'>" +
			"<img src='http://res.cloudinary.com/pluriza/image/upload/c_fill,h_25,w_22/"
			+ contacts[i].image + "'class='" + status + "' alt=" + contacts[i].username + " title='" + contacts[i].username + "'></a>";
	}
	contactInfo = contactInfo + "</div>";
	return contactInfo;
}

function getCategories(categories) {
	if (categories != null) {
		let categoryList = '<td>';

		for (let i = 0; i < categories.length; i++) {
			categoryList = categoryList + '<span class="label label-default">' + categories[i] + '</span>';
		}
		categoryList = categoryList + '</td>';
		return categoryList;
	} else return ""
}

function setDates(date) {
	if (date != null)
		return date.slice(-4) + "/" + date.slice(-7, -5) + "/" + date.slice(-10, -8);
	else
		return "";
}

function getSpanishMonth(date) {
	let dateArray = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
	return dateArray[date - 1]
}

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

module.exports = router;	