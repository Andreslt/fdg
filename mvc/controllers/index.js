'use strict';

const express = require('express');
const router = express.Router();
const User = require("../models/user").user;
const Ticket = require("../models/ticket");
const Store = require('../models/store');
const City = require('../models/city');
const Company = require('../models/company');
const mailer = require('../../config/mailer');
const formidable = require('formidable');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
var _ = require('underscore');
var Validations = require('../../config/validations');
var Asset = require('../models/asset');
var AssetRef = require('../models/assetReference');
var Promise = require('promise');
var Record = require('../models/record');
var config = require('../../config/config');

/* ---> GENERAL <--- */
// Go Home
router.get('/', Validations.ensureAuthenticated, (req, res) => {
	res.redirect('/dashboard');
});
router.get('/home', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/home');
	} else {
		res.redirect('/users/home');
	}
});

/* ---> INICIO <--- */
// Dashboard
router.get('/dashboard', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/dashboard');
	} else {
		res.redirect('/users/dashboard');
	}
});

// Cuenta
router.get('/account', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/account');
	} else {
		res.redirect('/users/account');
	}
});
router.get('/account/edit', Validations.ensureAuthenticated, (req, res) => {
	req.flash('success_msg', 'El usuario se ha actualizado satisfactoriamente.')
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/account/edit');
	} else {
		res.redirect('/users/account/edit');
	}
});

router.post('/account/edit', (req, res) => {
	var user = req.user;
	var form = new formidable.IncomingForm();
	form.parse(req, function (err, fields, files) {
		Company.findOne({ _id: user.company_id }, (err, cny) => {
			var params = {
				name: fields.name,
				lastname: fields.lastname,
				username: fields.username,
				localId: fields.localId,
				position: fields.position,
				email: fields.email,
				cellphone: fields.cellphone
			}		
			if(files.file.name!==""){
				var fSImagePath_cloudinary=""
				if (user.userRole === 'systemAdmin') fSImagePath_cloudinary = 'FDG_Admin _' + user.username
				else fSImagePath_cloudinary = cny.companyName + '/' + user.id;

				params.image=fSImagePath_cloudinary;
			}

			User.findOneAndUpdate({ _id: user.id }, {$set: params}, { new: true }, (err, usr) => {
				if (err) req.flash('error', 'Ha ocurrido un error. Inténtelo de nuevo más tarde.')
				if (files.file.name != "") {
					let originPath = files.file.path;
					let destinationPath = fSImagePath_cloudinary;
					imageUp.uploadFile(originPath, destinationPath);
				}
				req.flash('success_msg', 'El usuario se ha actualizado satisfactoriamente.')
				res.redirect('/account/edit');
			});
		});
	});
});

/* ---> MANTENIMIENTOS <--- */

/*Preventivo*/

// 1. Programar Nuevo
router.get('/scheduleNew', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/scheduleNew');
	} else {
		res.redirect('/users/scheduleNew');
	}
});
router.get('/scheduled_cities', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/scheduled_cities');
	} else {
		res.redirect('/users/scheduled_cities');
	}
});
router.get('/calendar/selected', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/calendar/selected?city=' + req.query.city);
	} else {
		res.redirect('/users/calendar/selected?city=' + req.query.city);
	}
});

// 2. Ver Tickets

//Preventive
router.get('/tickets_preventive', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/tickets_preventive');
	} else {
		res.redirect('/users/tickets_preventive?target=' + req.query.target);
	}
});
//Corrective
router.get('/list_tickets', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/list_tickets');
	} else {
		res.redirect('/users/list_tickets?target=' + req.query.target);
	}
});

router.get('/tickets/edit/success', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/tickets/edit/success');
	} else {
		res.redirect('/users/tickets/edit/success');
	}
});

router.get('/tickets/edit/failed', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/tickets/edit/failed');
	} else {
		res.redirect('/users/tickets/edit/failed');
	}
});

router.post('/tickets/edit', Validations.ensureAuthenticated, (req, res) => {
	if (req.body.ticketDesc != "") {
		if (req.user.userRole === 'systemAdmin') {
			res.redirect(307, '/admin/tickets/edit');
		} else {
			res.redirect(307, '/users/tickets/edit');
		}
	} else {
		res.redirect('/tickets/edit/failed');
	}
});

/* ---> EMPLEADOS <--- */
// 1. Crear Empleado
router.get('/newEmployee', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/newEmployee');
	} else {
		res.redirect('/users/newEmployee');
	}
});
// 2. Ver Empleados
router.get('/employees', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/employees');
	} else {
		res.redirect('/users/employees');
	}
});

router.post('/employee/edit', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect(307, '/admin/employee/edit');
	} else {
		res.redirect(307, '/users/employee/edit');
	}
});

/* ---> REPORTES <--- */
// 1. Crear Reporte
router.get('/newReport', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/newReport');
	} else {
		res.redirect('/users/newReport');
	}
});
// 2. Ver Reportes
router.get('/reports', Validations.ensureAuthenticated, (req, res) => {
	if (req.user.userRole === 'systemAdmin') {
		res.redirect('/admin/reports');
	} else {
		res.redirect('/users/reports');
	}
});

router.get('/reports/view', (req, res) => {
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
							Asset.findOne({ _id: ticket.asset_id }, (err, asset) => {
								AssetRef.findOne({ _id: asset.reference_id }, (err, assetRef) => {
									if (err) res.sendStatus(404);
									else {

										var data = {
											template: {
												shortid: "BJbxYsgbe",
											},
											data: {
												city: city.city,
												day: record.createdOn.getDate(),
												month: Validations.getSpanishMonth(record.createdOn.getMonth()),
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
												time: Validations.formatAMPM(record.createdOn),
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
	});
	searchRecord.catch(err => {
		console.log('err:' + err);
		res.sendStatus(404);
	});
});

/* ---> AJAX REQUESTS <--- */
router.post('/getContacts', (req, res) => {
	var ticketID = req.query.url.split('?')[1].substring(3).toString();
	Ticket.findOne({ _id: ticketID }).populate('contacts').exec((err, ticket) => {
		let contacts
		res.send(ticket.contacts);
	});
})

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		res.render('0-Auth/login', { layout: 'auth', login: false });
	}
}

function AdminUserFunction(req, res, next) {
	if (req.user.userRole === 'systemAdmin') {
		return next();
	} else {
		res.render('adminAccess_only', { layout: 'accessDenied' });
	}
	return next();
}

module.exports = {
	router: router
};