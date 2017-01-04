'use strict';

//Modules
const express = require('express');
const router = express.Router();

//Models
const Company = require("../models/company");
const Store = require("../models/store");
const Ticket = require("../models/ticket");
const City = require('../models/city');
const Event = require('../models/event');

//Config
const Validations = require('../../config/validations');

router.get('/', Validations.ensureAuthenticated, (req, res) => {
    let user = req.user, storeAdminSW;
    res.render('1-admin/list_calendar_cities', { layout: 'adminLayout', storeAdminSW });
});

router.get('/:city', Validations.ensureAuthenticated, (req, res) => {
    let city = req.params.city, storeAdminSW;
    City.findOne({ city: city }, (err, city_id) => {
        Store.find({ city_id: city_id.id }, (err, stores) => {
            let companiesArray = new Array();
            stores.forEach(function (elem) {
                companiesArray.push(elem.company_id);
            });
            Company.find({ _id: { $in: companiesArray } }, (err, companies) => {
                res.render('1-admin/list_calendar_companies', { layout: 'adminLayout', storeAdminSW, companies, city });
            });
        });
    });
});

router.get('/:city/:company', Validations.ensureAuthenticated, (req, res) => {
    let city_params = req.params.city, company_params = req.params.company, storeAdminSW/*, store_params={}*/;
    City.findOne({ city: city_params }, (err, city) => {
        Company.findOne({ companyName: company_params }, (err, company) => {
            Store.find({ city_id: city, company_id: company }, (err, stores) => {
                let storesArray = new Array();
                stores.forEach(function (elem) {
                    storesArray.push(elem.id);
                });
                Ticket.find({ store_id: { $in: storesArray } }, (err, tickets) => {
                    let ticketsArray = new Array();
                    tickets.forEach(function (elem) {
                        ticketsArray.push(elem.id);
                    });
                    Event.find({ ticket_id: { $in: ticketsArray } }).exec((err, events) => {
                        if (err) console.log(err);
                        res.render('1-admin/list_calendar_city', { layout: 'adminLayout', storeAdminSW, events });
                    });
                });
            });
        });
    });
});

router.get('/newEvent', Validations.ensureAuthenticated, (req, res) => {
    let user = req.user, storeAdminSW;
    Event.find({}).populate('ticket_id').populate('created_by').exec((err, events) => {
        res.render('1-admin/new_schedule', { layout: 'adminLayout', storeAdminSW, events });
    });
});

router.post('/save', Validations.ensureAuthenticated, (req, res) => {
    var user = req.user, storeAdminSW,
        data = req.body, mode = data["!nativeeditor_status"],
        sid = data.id, ticket_id = req.query.ticket_id;

    data.ticket_id = ticket_id;
    data.eventNumber = Math.floor(Math.random() * (99999 - 1 + 1)) + 1;
    data.created_by = req.user;
    console.log('url: ' + req.originalUrl);
    if (mode == "updated") {
        delete data.ticket_id;
        let datos = data.text.split("\n"), newdata = "", cont = 0;
        datos.forEach(function (elem) {
            if (cont == 0)
                newdata = elem.split(":")[1].slice(1);
            else
                newdata += ";" + elem.split(":")[1].slice(1);
            cont += 1;
        })
        data.text = newdata.slice(0, newdata.length - 1);
        Event.findOneAndUpdate({ eventNumber: sid }, { $set: data }, { new: true }, (err, event) => {
            if (err || event==null) {
                req.flash('err_msg', 'No se pudo modificar el evento. Recargue la página e inténtelo nuevamente.');
                res.redirect('/calendar');
            } else {
            console.log('event: '+event);
                Ticket.update({ _id: event.ticket_id }, { $set: { start_date: event.start_date, end_date: event.end_date } }, (err, ticket) => {
                    if (err || ticket==null) {
                        req.flash('err_msg', 'No se pudo modificar el evento. Recargue la página e inténtelo nuevamente.');
                        res.redirect('/calendar');
                    }
                    res.sendStatus(200)
                });
            }
        });
    } else if (mode == "inserted") {
        if (ticket_id != null && ticket_id !== "") {
            new Event(data).save((err, result) => {
                if (err) console.log(err);
                else
                    res.sendStatus(200);
            });
        }
    } else if (mode == "deleted") {
        Event.remove({ eventNumber: sid }, (err, result) => {
            if (err) console.log(err);
            else
                res.sendStatus(200);
        });
    }
});

module.exports = router;