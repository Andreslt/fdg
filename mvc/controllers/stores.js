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
const storeEmployee = require("../models/user").storeEmployee;
const Ticket = require("../models/ticket");
const Store = require('../models/store');
const City = require('../models/city');
const Company = require('../models/company');
const Record = require('../models/record');
const Asset = require('../models/asset');

//Config
const Mailer = require('../../config/mailer');
const Validations = require('../../config/validations');

/* ---> TIENDAS <--- */

// Ver Tiendas
router.get('/', Validations.ensureAuthenticated, (req, res) => {
    var params = {};

    if (req.user.userRole === "systemAdmin") params = { storeName: { $ne: 'Default store' } }
    else params = { company_id: req.user.company_id }

    Store.find(params).populate('company_id').populate('city_id').populate('representative').exec((err, stores) => {
        if (err) console.log(err);
        else {
            (req.user.userRole === 'systemAdmin') ? res.render('1-admin/list_stores', { layout: 'adminLayout', stores }) :
                res.render('2-users/list_stores', { layout: 'userLayout', stores });
        }
    });
});
// Ver detalles de Tienda
router.get('/store_details', Validations.ensureAuthenticated, (req, res) => {
    let storeID = req.query.ID, route, layout;
    Store.findOne({ _id: storeID }).populate('company_id').populate('city_id').populate('representative').exec((err, store) => {
        City.find({}, (err, cities) => {
            User.find({ userRole: 'storeEmployee', store_id: store.id }).exec((err, employees) => {
                Ticket.find({ store_id: store.id }, (err, tickets) => {
                    Asset.find({ store_id: store.id }).populate('').exec((err, assets) => {
                        if (err) console.log(err)
                        else if (req.user.userRole === "systemAdmin") {
                            route = '1-admin/view_store';
                            layout = 'adminLayout'
                        } else {
                            route = '2-users/view_store';
                            layout = 'userLayout'
                        }
                        res.render(route, { layout: layout, store, cities, tickets, employees, assets, tickNum: tickets.length, empNum: employees.length, asstNum: assets.length });
                    });
                });
            });
        });
    });
});

// Actualizar Tienda
router.post('/save', Validations.ensureAuthenticated, (req, res) => {
    let body = req.body;
    body.phone = Validations.phoneDecoded(body.phone);
    Store.findOneAndUpdate({ _id: body.storeID }, { $set: body }, { new: true }, (err, store) => {
        User.update({ store_id: store.id }, { $set: { company_id: store.company_id, city_id: store.city_id } }, (err, result) => {
            if (err) req.flash('erro', 'La tienda ' + store.storeName + ' no pudo ser guardada. Verifique los datos ingresados e inténtelo nuevamente.');
            else req.flash('success_msg', 'La tienda ' + store.storeName + ' ha sido guardada exitosamente.');
            res.redirect('/stores');
        })
    })
});

// Crear Tienda
router.get('/new', Validations.ensureAuthenticated, (req, res) => {
    Company.find({ companyName: { $ne: 'Default company' } }, (err, companies) => {
        City.find({}, (err, cities) => {
            (req.user.userRole === 'systemAdmin') ? res.render('1-admin/new_store', { layout: 'adminLayout', companies, cities }) :
                res.render('2-users/new_store', { layout: 'userLayout', companies, cities });
        });
    });
});

router.post('/new', Validations.ensureAuthenticated, (req, res) => {
    let body = req.body;
    body.phone = Validations.phoneDecoded(body.phoneNew);
    body.representative = req.user.id;
    if(req.user.userRole!=='systemAdmin'){
        body.company_id=req.user.company_id;
    }
    new Store(body).save((err, result) => {
        if (err)
            req.flash('error_msg', 'La tienda no pudo ser creada. Verifique los datos ingresados e inténtelo nuevamente.')
        else req.flash('success_msg', 'La tienda ' + body.storeName + ' ha sido creada exitosamente.');
        res.redirect('/stores');
    });
});


// Eliminar Tienda
router.post('/delete', Validations.ensureAuthenticated, (req, res) => {
    let storeID = req.body.storeID;
    Store.findOneAndRemove({ _id: storeID }, (err, store) => {
        Ticket.remove({ store_id: store.id }, (err, result) => {
            storeEmployee.remove({ store_id: store.id }, (err, employees) => {
                if (err)
                    req.flash('error_msg', 'La tienda no pudo ser eliminada. Inténtelo más tarde.')
                else
                    req.flash('success_msg', 'La tienda ' + store.storeName + ' ha sido eliminada exitosamente.');
                res.redirect('/stores');
            });
        });
    });
});
router.post('/store/edit', Validations.ensureAuthenticated, (req, res) => {
    if (req.user.userRole === 'systemAdmin') {
        res.redirect(307, '/admin/store/edit');
    } else {
        res.redirect(307, '/users/store/edit');
    }
});





module.exports = router;