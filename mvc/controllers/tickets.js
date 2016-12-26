'use strict';
//Modules
const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const dateFormat = require('dateformat');
const fs = require("fs");
const Promise = require('promise');
const _ = require('underscore');

//Models
const User = require("../models/user").user;
const Ticket = require("../models/ticket");
const Store = require('../models/store');
const City = require('../models/city');
const Company = require('../models/company');
const Record = require('../models/record');
const Asset = require('../models/asset');

//Config
const Mailer = require('../../config/mailer');
const Validations = require('../../config/validations');

// Crear Ticket
router.get('/:ticketType/new', Validations.ensureAuthenticated, (req, res) => {
	let user = req.user, storeAdminSW, ticketType = req.params.ticketType;
	if (req.user.userRole === 'systemAdmin') {
		City.find({ city: { $ne: "Default city" } }, (err, cities) => {
			if (err) console.log(err)
			Store.find({ storeName: { $ne: "Default store" } }, (err, stores) => {
				Asset.find({}, (err, assets) => {
					if (err) console.log(err)
					res.render('1-admin/new_ticket', { layout: 'adminLayout', storeAdminSW, stores, cities, ticketType, ticketNumber: Validations.numberGenerator(ticketType), assets });
				});
			});
		});
	} else {
		res.redirect('/users/newTicket');
	}
});

router.get('/new/failed', Validations.ensureAuthenticated, (req, res) => {
	let ticketType = req.query.ticketType;
	req.flash('error_msg', 'No se pudo crear el ticket. Todos los campos no opcionales son requeridos.');
	res.redirect('/tickets/' + ticketType + '/new');
});

router.get('/new/success', Validations.ensureAuthenticated, (req, res) => {
	let ticketType = req.query.ticketType;
	req.flash('success_msg', 'Ticket creado con éxito.');
	res.redirect('/tickets/' + ticketType + '/list');
});

router.post('/new', Validations.ensureAuthenticated, (req, res) => {
	var user = req.user, storeAdminSW;
	var form = new formidable.IncomingForm();
	var categories = new Array();

	form.on('field', function (name, value) {
		if (name === 'categories') {
			categories.push(value);
		}
	});

	form.parse(req, function (err, fields, files) {
		let body = fields, contacts;

		contacts = new Array();
		contacts.push(req.user); //Adding the creator user as contact

		User.find({ company_id: req.company_id }, (err, users) => {
			for (let i = 0; i < users.length; i++) {
				if (!_.contains(users[i]))
					contacts.push(users[i]);
			}
		});
		var params = {
			ticketNumber: req.query.ticketNumber,
			title: body.title,
			ticketType: req.query.ticketType,
			startdate: new Date(),
			lastupdate: new Date(),
			store_id: body.store,
			priority: body.priority,
			contacts: contacts,
			description: body.description,
			categories: categories,
			status: "pending",
			created_by: req.user.id,
			modified_by: req.user.id
		}

		var newTicket = new Ticket(params);
		Ticket.createTicket(newTicket, (err, ticket) => {
			if (err) {
				console.log(err);
				req.flash('error_msg', 'Ha habido un problema al crear el ticket.');
				res.redirect('/tickets/new/failed?ticketType=' + req.query.ticketType);
			} else {
				(user.userRole === "storeAdmin") ? storeAdminSW = true : storeAdminSW = false;
				res.redirect('/tickets/new/success?ticketType=' + req.query.ticketType);
			}
		});
	})
});

router.post('/save', Validations.ensureAuthenticated, (req, res) => {
	var form = new formidable.IncomingForm(), user = req.user;
	var categories = new Array(), contacts = new Array();

	form.on('field', function (name, value) {
		if (name === 'categories') {
			categories.push(value);
		}

		if (name.indexOf('contacts_')!==-1) {
			//let contact = new User{}
			contacts.push(name.split('_')[1])			
		}
		console.log('contacts: '+contacts);
	});
	form.parse(req, function (err, fields, files) {
		let body = fields, ticketID = body.ticket_id,

			params = {
				priority: body.setpriority,
				advance: body.setadvance,
				status: body.setstatus,
				asset_id: body.getasset,
				title: body.title,
				description: body.description,
				categories: categories,
				lastupdate: new Date(),
				deadline: Validations.setDates(body.setdeadline),
				contacts: contacts,
				modified_by: req.user.id,
				track: body.trackTkt
			};

		Ticket.findOneAndUpdate({ _id: ticketID }, { $set: params }, { new: true }, (err, ticket) => {
			if (err) {
				console.log(err);
			} else {
				req.flash("success_msg", "El ticket fue actualizado.");
				res.redirect('/tickets/' + ticket.ticketType + '/list');
			}
		});
	});
});


router.post('/ticket_delete', Validations.ensureAuthenticated, (req, res) => {
	let ticketID = req.body.delete_ticket_id;
	let deleteTicket = new Promise((resolve, reject) => {

		Ticket.findOneAndRemove({ _id: ticketID }, (err, ticket) => {
			if (err) {
				reject(err, ticket);
			} else {
				resolve(ticket);
			}
		});
	});

	deleteTicket.then(ticket => {
		Record.remove({ ticket_id: ticket.id }, (err, result) => {
			console.log(result);
			req.flash('success_msg', 'El ticket No. ' + ticket.ticketNumber + ' ha sido eliminado exitosamente');
			res.redirect('/tickets/' + ticket.ticketType + '/list');
		});
	});

	deleteTicket.catch((err, ticket) => {
		req.flash('error_msg', 'No se pudo eliminar el ticket. Inténtelo de nuevo más tarde.');
		res.redirect('/tickets/' + ticket.ticketType + '/list');
	});
});

// Ver tickets
router.get('/:ticketType/list', Validations.ensureAuthenticated, (req, res) => {
	let user = req.user, storeAdminSW, ticketType = req.params.ticketType;
	if (user.userRole === 'systemAdmin') {
		var obj = { data: [] }, userImage;
		Ticket.find({ ticketType: ticketType }).populate('contacts').exec((err, tkts) => {
			if (err) console.log(err);
			for (let t = 0; t < tkts.length; t++) {
				let t2 = t + 1;
				obj.data.push(
					{
						title: tkts[t].title + "<br><small class='text-muted'><i>#Ticket: " + tkts[t].ticketNumber + "<i></small>",
						advance: "<td><div class='progress progress-xs' data-progressbar-value=" + tkts[t].advance + "><div class='progress-bar'></div></div></td>",
						contacts: Validations.getContactInfo(tkts[t].contacts),
						status: "<span style='text-align: center;' class='label label-" + Validations.getLabel(tkts[t].status) + "'>" + Validations.getLabelESP(tkts[t].status) + "</span>",
						'target-actual': "<span style='margin-top:5px' class='sparkline display-inline' data-sparkline-type='compositebar' data-sparkline-height='18px' data-sparkline-barcolor='#aafaaf' data-sparkline-line-width='2.5' data-sparkline-line-val='[47,9,9,8,3,2,2,5,6,7,4,1,5,7,6]' data-sparkline-bar-val='[47,9,9,8,3,2,2,5,6,7,9,9,5,7,6]'></span>",
						actual: "<span class='sparkline text-align-center' data-sparkline-type='line' data-sparkline-width='100%' data-sparkline-height='25px'>20,-35,70</span>",
						tracker: "<span class='onoffswitch'><input type='checkbox' name='start_interval' class='onoffswitch-checkbox'" + tkts[t].track + " disabled id='st" + t2 + "'><label class='onoffswitch-label' for='st" + t2 + "'><span class='onoffswitch-inner' data-swchon-text='ON' data-swchoff-text='OFF'></span><span class='onoffswitch-switch'></span></label></span>",
						startdate: dateFormat(tkts[t].startdate, "dd/mm/yyyy"),
						lastupdate: dateFormat(tkts[t].lastupdate, "dd/mm/yyyy HH:MM"),
						deadline: dateFormat(tkts[t].deadline, "dd/mm/yyyy"),
						description: tkts[t].description,
						categories: Validations.getCategories(tkts[t].categories),
						action: "<a href='/tickets/ticket_details?ID=" + tkts[t].id + "' style='color: #FFFFFF;'><button class='btn btn-xs'>Ver Ticket</button></a>"
					}
				);
			}
			var json = JSON.stringify(obj);
			fs.writeFile('public/data/dataList2.json', json, 'utf8', (err, data) => {
				if (err) console.log(err);
				else {
					if (req.user.userRole === 'systemAdmin')
						res.render('1-admin/list_tickets', { layout: 'adminLayout', ticketType: ticketType });
					else
						res.render('2-users/list_tickets', { layout: 'userLayout', ticketType: ticketType });
				}
			});
		});
	} else {
		var gteYear, gteMonth, ltYear, ltMonth;
		if (req.query.target) {
			gteYear = new Date().getFullYear();
			gteMonth = new Date().getMonth();
		} else {
			gteYear = new Date(1990, 8, 10).getFullYear();
			gteMonth = new Date(1990, 8, 10).getMonth();
		}
		ltYear = new Date().getFullYear();
		ltMonth = new Date().getMonth() + 1;
		Ticket.find({ ticketType: ticketType, $or: [{ startdate: { "$gte": new Date(gteYear, gteMonth, 1), "$lt": new Date(ltYear, ltMonth, 0) } }, { lastupdate: { "$gte": new Date(gteYear, gteMonth, 1), "$lt": new Date(ltYear, ltMonth, 0) } }] })
			.then(tks1 => Store.populate(tks1, { path: "store_id" }))
			.then(tks2 => Company.populate(tks2, { path: "store_id.company_id" }))
			.then(tks3 => City.populate(tks3, { path: "store_id.city_id" }))
			.then(result => {
				console.log('ticket: ' + result);
				var tkts = new Array();
				for (let item in result) {
					let validation = result[item].store_id;
					console.log(validation);
					if (validation.company_id._id.toString() === user.company_id.toString())
						tkts.push(result[item]);
				}
				(user.userRole === "storeAdmin") ? storeAdminSW = true : storeAdminSW = false;
				res.render('2-users/list_tickets', { layout: 'userLayout', storeAdminSW, tkts });
			});
	}
});

// Ticket Details
router.get('/ticket_details', Validations.ensureAuthenticated, (req, res) => {
	let ticketID = req.query.ID;
	Ticket.findOne({ _id: ticketID }).populate('store_id').populate('asset_id').exec((err, ticket) => {
		City.findOne({ _id: ticket.store_id.city_id }, (err, city) => {
			User.find({ userRole: 'systemAdmin' }, (err, admins) => {
				User.find({ company_id: ticket.store_id.company_id }, null, {sort:{userRole:1}}, (err, employees) => {
					Record.find({ ticket_id: ticketID }).populate('adminRepresentative').populate('custRepresentative').exec((err, records) => {
						Asset.find({ store_id: ticket.store_id.id }, (err, assets) => {
							if (err) console.log(err);
							let checkclass = 'default', checktext = 'Seguir', checksymbol = "", checks = new Array();

							if (ticket.track === 'checked') {
								checkclass = 'warning';
								checktext = 'Siguiendo';
								checksymbol = "Check mark symbol "
							}
							let recordNumber = Validations.numberGenerator("record"), representative = req.user;
							res.render('1-admin/view_ticket', { layout: 'adminLayout', admins, employees, representative, recordNumber, ticket, records, city, assets, checkclass, checktext, checksymbol });
						})
					});
				});
			});
		})
	});
});



module.exports = router;