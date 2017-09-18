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
const Event = require('../models/event');

//Config
const Mailer = require('../../config/mailer');
const Validations = require('../../config/validations');

// Crear Ticket
router.get('/:ticketType/new', Validations.ensureAuthenticated, (req, res) => {
	let user = req.user, storeAdminSW, ticketType = req.params.ticketType, params = {}, route, layout;
	var cities = getTicket_Params('city', user), stores = getTicket_Params('store', user), assets = getTicket_Params('asset', user);
	City.find(cities, (err, cities) => {
		if (err) console.log(err)
		Store.find(stores, (err, stores) => {
			if (err) console.log(err)
			Asset.find(assets, (err, assets) => {
				if (err) console.log(err)
				else if (user.userRole === "systemAdmin") {
					route = '1-admin/new_ticket';
					layout = 'adminLayout'
				} else {
					route = '2-users/new_ticket';
					layout = 'userLayout'
				}
				res.render(route, { layout: layout, storeAdminSW, stores, cities, ticketType, ticketNumber: Validations.numberGenerator(ticketType), assets });
			});
		});
	});
});

router.get('/new/failed', Validations.ensureAuthenticated, (req, res) => {
	let ticketType = req.query.ticketType;
	req.flash('error_msg', 'No se pudo crear el ticket. Todos los campos no opcionales son requeridos.');
	res.redirect('/tickets/' + ticketType + '/new');
});

router.get('/new/success', Validations.ensureAuthenticated, (req, res) => {
	let ticketType = req.query.ticketType;
	// console.log('redirected well.'+ticketType)
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
			deadline: new Date(body.deadline.split('.')[2], body.deadline.split('.')[1], body.deadline.split('.')[0]),
			priority: body.priority,
			contacts: contacts,
			description: body.description,
			categories: categories,
			status: "pending",
			created_by: req.user.id,
			modified_by: req.user.id
		}
		console.log('-req.user.store_id->, ', JSON.stringify(req.user,null,2));
		if (req.user.userRole != 'storeEmployee') {
			params.store_id = body.store;
		} else {
			params.store_id = req.user.store_id;
		}

		// console.log('params: '+JSON.stringify(params));

		var newTicket = new Ticket(params);
		var ticket_promise = new Promise((resolve, reject) => {
			Ticket.createTicket(newTicket, (err, ticket) => {
				if (err)
					reject(err)
				else
					resolve(ticket)
			});
		});
		ticket_promise.then(ticket => {
			new Event({
				eventNumber: Math.floor(Math.random() * (99999 - 1 + 1)) + 1,
				text:
				ticket.ticketNumber + ";" +
				ticket.title + ";" +
				Validations.getLabelESP(ticket.status) + ";" +
				Validations.getPriorityESP(ticket.priority) + ";" +
				ticket.advance,
				start_date: new Date(),
				end_date: new Date(),
				ticket_id: ticket.id,
				created_by: req.user
			}).save((err, event) => {
				if (err) console.log(err);
				else {
					// console.log('event saved: '+JSON.stringify(event));
					(user.userRole === "storeAdmin") ? storeAdminSW = true : storeAdminSW = false;
					res.redirect('/tickets/new/success?ticketType=' + req.query.ticketType);
				}
			});
		});

		ticket_promise.catch(err => {
			console.log('error: ' + err);
			req.flash('error_msg', 'Ha habido un problema al crear el ticket.');
			res.redirect('/tickets/new/failed?ticketType=' + req.query.ticketType);
		})
	})
});

router.post('/save', Validations.ensureAuthenticated, (req, res) => {
	var form = new formidable.IncomingForm(), user = req.user;
	var categories = new Array(), contacts = new Array();

	form.on('field', function (name, value) {
		if (name === 'categories') {
			categories.push(value);
		}

		if (name.indexOf('contacts_') !== -1) {
			contacts.push(name.split('_')[1])
		}
	});
	form.parse(req, function (err, fields, files) {
		let body = fields, ticketID = body.ticket_id,

			params = {
				priority: body.setpriority,
				asset_id: body.getasset,
				title: body.title,
				description: body.description,
				categories: categories,
				lastupdate: new Date(),
				start_date: new Date(body.start_date.split('.')[2], body.start_date.split('.')[1], body.start_date.split('.')[0]),
				end_date: new Date(body.end_date.split('.')[2], body.end_date.split('.')[1], body.end_date.split('.')[0]),
				contacts: contacts,
				modified_by: req.user.id,
				track: body.trackTkt,
				deadline: Validations.setDates(body.setdeadline),
			};
		// console.log('start_date: '+params.start_date);
		// console.log('end_date: '+params.end_date);
		Ticket.findOneAndUpdate({ _id: ticketID }, { $set: params }, { new: true }, (err, ticket) => {
			Event.update({ ticket_id: ticket.id }, { $set: { start_date: ticket.start_date, end_date: ticket.end_date } }, (err, event) => {
				if (err) {
					// console.log('tickets/save (post): '+err);
				} else {
					if (ticket.track === 'checked') {
						User.find({ _id: { $in: ticket.contacts } }, (err, users) => {
							Mailer.mailOptions.to = Validations.recipents(users);
							Mailer.mailOptions.subject = "Notificaciones FDG - Actualización de Ticket No." + ticket.ticketNumber;
							Mailer.mailOptions.template = "ticket";
							Mailer.mailOptions.context = {
								ticketID: ticket.id,
								ticketNumber: ticket.ticketNumber
							};
							Mailer.sendEmail();
						})
					}
					req.flash("success_msg", "El ticket No. " + ticket.ticketNumber + " fue actualizado exitosamente.");
					res.redirect('/tickets/' + ticket.ticketType + '/list');
				}
			})
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
	let user = req.user, storeAdminSW, ticketType = req.params.ticketType, params = {};

	var setparams = new Promise((resolve, reject) => {
		var swError = false;
		params.ticketType = ticketType;
		if (user.userRole === 'systemAdmin') resolve(params); //CASE SYSTEM ADMIN - SEVERAL STORES
		else if (user.userRole === 'storeAdmin') { //CASE STORE ADMIN - SEVERAL STORES
			var company = user.company_id;
			Store.find({ company_id: company }, { _id: 1 }, (err, stores) => {
				if (err) {
					reject(err, params);
				} else {
					params.store_id = { $in: stores }
					resolve(params);
				}
			});
		} else if (user.userRole === 'storeEmployee') {
			params.store_id = req.user.store_id //CASE STORE EMPLOYEE  - UNIQUE STORE
			resolve(params);
		}
	})

	setparams.then(params => {
		var obj = { data: [] }, userImage;
		Ticket.find(params).populate('store_id').populate('contacts').exec((err, tkts) => {
			if (err) console.log(err);
			for (let t = 0; t < tkts.length; t++) {
				let t2 = t + 1;
				obj.data.push(
					{
						title: tkts[t].store_id.storeName + " - " + tkts[t].title + "<br><small class='text-muted'><i>#Ticket: " + tkts[t].ticketNumber + "<i></small>",
						advance: "<td><div class='progress progress-xs' data-progressbar-value=" + tkts[t].advance + "><div class='progress-bar'></div></div></td>",
						contacts: Validations.getContactInfo(tkts[t].contacts),
						status: "<span style='text-align: center;' class='label label-" + Validations.getLabel(tkts[t].status) + "'>" + Validations.getLabelESP(tkts[t].status) + "</span>",
						'target-actual': "<span style='margin-top:5px' class='sparkline display-inline' data-sparkline-type='compositebar' data-sparkline-height='18px' data-sparkline-barcolor='#aafaaf' data-sparkline-line-width='2.5' data-sparkline-line-val='[47,9,9,8,3,2,2,5,6,7,4,1,5,7,6]' data-sparkline-bar-val='[47,9,9,8,3,2,2,5,6,7,9,9,5,7,6]'></span>",
						actual: "<span class='sparkline text-align-center' data-sparkline-type='line' data-sparkline-width='100%' data-sparkline-height='25px'>20,-35,70</span>",
						tracker: "<span class='onoffswitch'><input type='checkbox' name='start_interval' class='onoffswitch-checkbox'" + tkts[t].track + " disabled id='st" + t2 + "'><label class='onoffswitch-label' for='st" + t2 + "'><span class='onoffswitch-inner' data-swchon-text='ON' data-swchoff-text='OFF'></span><span class='onoffswitch-switch'></span></label></span>",
						start_date: dateFormat(tkts[t].start_date, "dd/mm/yyyy"),
						end_date: dateFormat(tkts[t].end_date, "dd/mm/yyyy"),
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
	});
});

// Ticket Details
router.get('/ticket_details', Validations.ensureAuthenticated, (req, res) => {
	let ticketID = req.query.ID;
	Ticket.findOne({ _id: ticketID }).populate('store_id').populate('asset_id').exec((err, ticket) => {
		if (err || ticket == null) {
			req.flash('error_msg', 'Error cargando el ticket. Inténtelo de nuevo más tarde.')
			res.redirect('/');
		} else
			City.findOne({ _id: ticket.store_id.city_id }, (err, city) => {
				if (err || city == null) {
					req.flash('error_msg', 'Error cargando el ticket. Inténtelo de nuevo más tarde.')
					res.redirect('/');
				} else
					User.find({ userRole: 'systemAdmin' }, (err, admins) => {
						User.find({ company_id: ticket.store_id.company_id }, null, { sort: { userRole: 1 } }, (err, employees) => {
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
									if (req.user.userRole === 'systemAdmin') {
										res.render('1-admin/view_ticket', { layout: 'adminLayout', admins, employees, representative, recordNumber, ticket, records, city, assets, checkclass, checktext, checksymbol });
									} else {
										res.render('2-users/view_ticket', { layout: 'adminLayout', admins, employees, representative, recordNumber, ticket, records, city, assets, checkclass, checktext, checksymbol });
									}
								})
							});
						});
					});
			})
	});
});

/*function getTicket_Params(type, user) {
	var params = {};

	if (user.userRole === "systemAdmin") {
		if (type === 'city')
			return params = { city: { $ne: "Default city" } }
		else if (type === 'store')
			return params = { storeName: { $ne: "Default store" } }
		else if (type === 'asset')
			return params = { assets: {} }
	} else if (user.userRole === "storeAdmin") {
		Company.findById(user.company_id, (err, company) => {
			if (err) console.log(err)
			else {
				if (type === 'city') {
					Store.find({ company_id: company.id }, { city_id: 1 }, (err, cities) => {
						params = { _id: { $in: cities } }						
						return params;
					});
				} else if (type === 'store') {
					Store.find({ company_id: company.id }, { _id: 1 }, (err, stores) => {						
						params = { _id: { $in: stores } }
						return params;
					});
				} else if (type === 'asset') {
					Store.find({ company_id: company.id }, { _id: 1 }, (err, stores) => {
						Asset.find({ store_id: stores.id }, (err, assets) => {
							params = { _id: { $in: assets } }
							return params;
						});
					});
				}
			}
		})
	} else if (user.userRole === "storeEmployee") {
		Store.findOne({ _id: user.store_id }, (err, store) => {
			if (err) console.log(err)
			else {
				if (type === 'city')
					City.findById(store.city_id, { _id: 1 }, (err, city) => {
						if (err) console.log(err)
						return params.city_id = city
					});
				else if (type === 'store')
					Store.findById(store.id, { _id: 1 }, (err, store) => {
						if (err) console.log(err)
						return params.id = store
					});
				else if (type === 'asset')
					Store.findById(store.id, (err, store) => {
						Asset.find({ store_id: store.id }, { _id: 1 }, (err, assets) => {
							if (err) console.log(err)
							return params.id = assets
						})
					});
			}
		});
	}
};*/

function getTicket_Params(type, user) {
	var params = {}, role = user.userRole;
	return params;		//FUNCION MODIFICADA PORQUE LOS STORE ADMINS NO DEBERIAN PODER HACER tickets
	// Y LOS STORE EMPLOYEES SOLO LO HACEN EN LA TIENDA EN QUE SE ENCUENTRAN REGISTRADOS.
}

module.exports = router;