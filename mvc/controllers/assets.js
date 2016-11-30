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
const AssetRef = require('../models/assetReference');

//Config
const Mailer = require('../../config/mailer');
const Validations = require('../../config/validations');

router.get('/', Validations.ensureAuthenticated, (req, res) => {
    let target = {};
    if (req.user.userRole !== 'systemAdmin') target.store_id = req.user.store_id
    Asset.find(target).populate('reference_id').populate('store_id').exec((err, assets) => {
        (req.user.userRole === 'systemAdmin') ? res.render('1-admin/list_assets', { layout: 'adminLayout', assets }) :
            res.render('2-users/list_assets', { layout: 'userLayout', assets });
    });
});

router.get('/asset_details', Validations.ensureAuthenticated, (req, res) => {
    Asset.findOne({ _id: req.query.ID }, (err, asset) => {
        (req.user.userRole === 'systemAdmin') ? res.render('1-admin/view_asset', { layout: 'adminLayout', asset }) :
            res.render('2-users/view_asset', { layout: 'userLayout', asset });
    });
});

router.get('/new', Validations.ensureAuthenticated, (req, res) => {
    let assetNum = Validations.numberGenerator('Asset'),
        refNum = Validations.numberGenerator('ref_Asset'),
        LRef = Validations.numberGenerator('local_Asset'),
        f = { storeName: { $ne: 'Default store' } };

    if (req.user.userRole !== 'systemAdmin') f.id = req.user.store_id;

    AssetRef.find({}, (err, assetRefs) => {
        Store.find(f, (err, stores) => {
            if (err) console.log(err);
            else
            (req.user.userRole === 'systemAdmin') ? res.render('1-admin/new_asset', { layout: 'adminLayout', assetRefs, assetNum, stores, LRef, refNum }) :
                    res.render('2-users/new_asset', { layout: 'userLayout', assetRefs, assetNum, stores, LRef, refNum });
        });
    })
});

router.post('/asset/new', Validations.ensureAuthenticated, (req, res) => {
    var form = new formidable.IncomingForm(), localAssetNum;
    form.parse(req, function (err, fields, files) {
        console.log('asset_number: ' + fields.asset_number);
        console.log('asset_localcode: ' + fields.asset_localcode);
        /*        let promise = new Promise((resolve, reject) => {
                    Asset.find({ store_id: fields.store_id }, (err, assets) => {
                        resolve(assets.length);
                    });
                });
        
                promise.then(assets => {*/
        new Asset({
            number: fields.asset_number,
            localRef: fields.asset_localcode,
            name: fields.asset_name,
            status: fields.asset_status,
            reference_id: fields.asset_reference,
            store_id: fields.store_id
        }).save((err, result) => {
            if (err) {
                //                    console.log('err: ' + err);
                req.flash('error_msg', 'El activo no pudo ser creado. Inténtelo de nuevo más tarde.');
                res.redirect('/assets');
            } else {
                //                    console.log('result: ' + result);
                req.flash('success_msg', 'Activo No. ' + fields.asset_number + ' creado exitosamente.');
                res.redirect('/assets');
            }
        });
        //        });
    });
});

router.post('/ref/new', Validations.ensureAuthenticated, (req, res) => {
    var body = req.body;
    console.log('body.ref_number: ' + body.ref_number);
    new AssetRef({
        number: body.ref_number,
        description: body.ref_description,
        model: body.ref_model,
        brand: body.ref_brand,
        type: body.ref_type,
        power: body.ref_power,
        power_unit: body.ref_powerunits,
        height: body.ref_height,
        width: body.ref_width,
        large: body.ref_large,
        dimension_units: body.ref_dimensionunits,
        capacity: body.ref_capacity,
        capacity_unit: body.ref_capacityunits,
        weight: body.ref_weight,
        weight_unit: body.ref_weightunits,
        factoryWarnings: body.ref_factorywarnings
    }).save((err, result) => {
        if (err) req.flash('error_msg', 'La referencia no pudo ser creada. Inténtelo de nuevo más tarde.')
        else
            req.flash('success_msg', 'Referencia No. ' + AssetRef.number + ' creada exitosamente.')
    })
    res.redirect('/assets/new');
});

router.post('/upload', (req, res) => {
    console.log('llegó al upload');
});

router.post('/getlocalnum/:store', (req, res) => {
    Asset.find({ store_id: req.params.store }, (err, assets) => {
        console.log('no. Assets: ' + assets.length);
        res.json(assets.length);
    });
});

module.exports = router;
