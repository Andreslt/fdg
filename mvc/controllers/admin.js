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

//* Maintenances *//

/*router.post('/scheduleSave', Validations.ensureAuthenticated, Validations.systemAdmin, (req, res) => {
		let user = req.user, storeAdminSW;
		var data = req.body;
		var mode = data["!nativeeditor_status"];
		var sid = data.id;
		var tid = sid, dataJSON;

		data.eventNumber= sid;		
		data.modified_by = user.id;
		dataJSON = JSON.stringify(data);

		console.log('id: '+data.id);
		console.log('text: '+data.text);
		console.log('data: '+dataJSON);
		console.log('mode: '+mode);
		console.log('sid: '+sid);
		console.log('tid: '+tid);
		console.log('cityID: '+req.query.cityID);

		delete data.id;
		delete data.gr_id;
		delete data["!nativeeditor_status"];


		function update_response(err, result) {
			if (err)
				mode = "error";
			else if (mode == "inserted")
				tid = data._id;

			res.setHeader("Content-Type", "text/xml");
			res.send("<data><action type='" + mode + "' sid='" + sid + "' tid='" + tid + "'/></data>");
		}

		if (mode == "updated"){			
			Event.findOneAndUpdate({eventNumber: sid}, {$set: data}, update_response);
		}else if (mode == "inserted"){
			data.created_by = user.id;
			data.city_id =  req.query.cityID;
			console.log('data: '+data);
			var Evento =new Event(data, update_response)
			console.log('Evento: '+Evento);
			Evento.save((err, result)=>{
				if (err) console.log(err);
				console.log(result);
			});
		}else if (mode == "deleted")
			Event.removeById(sid, update_response);
		else
			res.send("Not supported operation");
});*/

/*router.get('/scheduled_cities', Validations.ensureAuthenticated, Validations.systemAdmin, (req, res) => {
	let user = req.user, storeAdminSW;
	res.render('1-admin/list_schedule_cities', { layout: 'adminLayout', storeAdminSW });
});*/

/*router.get('/scheduled_cities/selected', Validations.ensureAuthenticated, Validations.systemAdmin, (req, res) => {
	let user = req.user, storeAdminSW, city = req.query.city;
	Event.find({}).populate('city_id').exec((err, eventos)=>{
		let events = eventos.filter((elem)=>{
			return elem.city_id.city.toUpperCase() === city
		});
		if(err) console.log(err);
		res.render('1-admin/list_schedule_city', { layout: 'adminLayout', storeAdminSW,events});
	});
});*/

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

/*router.get('/reports/view', Validations.ensureAuthenticated, Validations.systemAdmin, (req, res) => {
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
												month: getSpanishMonth(record.createdOn.getMonth()),
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
												time: formatAMPM(record.createdOn),
												customerReq: record.customerReq,
												currentState: record.currentState,
												correctiveActions: record.correctiveActions,
												suggestions: record.suggestions,
												giverName: adminRepresentative.name + " " + adminRepresentative.lastname,
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
		res.sendStatus(404);
	});
});*/

router.post('/reports/notify', Validations.ensureAuthenticated, Validations.systemAdmin, (req, res) => {
	let reportID = req.query.reportID, target = req.query.target.split(',');
	target = target[target.length - 1];
	Record.findOneAndUpdate({ recordNumber: reportID }, { $set: { notified: target } }, { new: true }, (err, record) => {
		Ticket.findOne({ _id: record.ticket_id }, (err, ticket) => {
			User.find({ _id: { $in: ticket.contacts } }, (err, users) => {
				let recipents = new Array();
				for (var u = 0; u < users.length; u++) {
					var sw = false;
					//console.log('target: ' + target);
					if (target === "administradores") {
						if (users[u].userRole === "systemAdmin") {
							sw = true;
							//console.log('administradores: ' + users[u].username);
						}
					} else if (target === "usuarios") {
						if (users[u].userRole !== "systemAdmin") {
							sw = true;
							//console.log('usuarios: ' + users[u].username);
						}
					} else if (target === "contactos") {
						sw = true;
						//console.log('contactos: ' + users[u].username);
					}
					if (sw) recipents.push(users[u].email);
				}
				//console.log('recipents:' + recipents);
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

/*function getLabel(status) {
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
	minutes = minutes < 10 ? '0' + minutes : minutes;
	var strTime = hours + ':' + minutes + ' ' + ampm;
	return strTime;
}*/

module.exports = router;	