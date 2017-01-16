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
const imageUp = require('../../config/imagesUpload');

router.get('/', Validations.ensureAuthenticated, (req, res) => {
    let target = {}, route, layout;

    if (req.user.userRole !== 'systemAdmin') target.company_id = {company_id: req.user.company_id};

    Store.find(target.company_id , {_id:1}, (err, stores) => {
         if (err) console.log(err)
         target.store_id=stores;
         console.log('stores: '+ target.store_id);
        Asset.find({store_id: {$in: target.store_id} }).populate('reference_id').populate('store_id').exec((err, assets) => {
            if (err) console.log(err)
            else if (req.user.userRole === "systemAdmin") {
                route = '1-admin/list_assets';
                layout = 'adminLayout'
            } else {
                route = '2-users/list_assets';
                layout = 'userLayout'
            }
            res.render(route, { layout: layout, assets });
        });
    });
});

router.get('/asset_details', Validations.ensureAuthenticated, (req, res) => {
    let target = { storeName: { $ne: 'Default store' } }, route, layout;

    if (req.user.userRole !== 'systemAdmin') target.store_id = req.user.store_id
    Asset.findOne({ _id: req.query.ID }, (err, asset) => {
        Ticket.find({ store_id: asset.store_id }, (err, tkts) => {
            AssetRef.find({}, (err, assetRefs) => {
                Store.find(target, (err, stores) => {
                    if (err) console.log(err)
                    else if (req.user.userRole === "systemAdmin") {
                        route = '1-admin/view_asset';
                        layout = 'adminLayout'
                    } else {
                        route = '2-users/view_asset';
                        layout = 'userLayout'
                    }

                    res.render(route, { layout: layout, asset, assetRefs, stores, tkts });
                });
            });
        });
    }).limit(10).sort({ 'lastupdate': -1 });
});

router.get('/new', Validations.ensureAuthenticated, (req, res) => {
    let assetNum = Validations.numberGenerator('Asset'),
        refNum = Validations.numberGenerator('ref_Asset'),
        LRef = Validations.numberGenerator('local_Asset'),
        f = { storeName: { $ne: 'Default store' } }, route, layout;

    if (req.user.userRole !== 'systemAdmin') f.company_id = req.user.company_id;

    AssetRef.find({}, (err, assetRefs) => {
        Store.find(f, (err, stores) => {
            if (err) console.log(err)
            else if (req.user.userRole === "systemAdmin") {
                route = '1-admin/new_asset';
                layout = 'adminLayout'
            } else {
                route = '2-users/new_asset';
                layout = 'userLayout'
            }
            res.render(route, { layout: layout, assetRefs, assetNum, stores, LRef, refNum });
        });
    })
});

router.post('/asset/new', Validations.ensureAuthenticated, (req, res) => {
    var form = new formidable.IncomingForm(), localAssetNum;
    form.parse(req, function (err, fields, files) {
        let newAsset = {
            number: fields.asset_number,
            localRef: fields.asset_localcode,
            name: fields.asset_name,
            status: fields.asset_status,
            reference_id: fields.asset_reference,
            store_id: fields.store_id
        };
        if (files.file2.name != "") {
            newAsset.images = {
                title: files.file2.name,
                url: 'assets/' + fields.asset_number + '/imgs/' + files.file2.name.replace(/\.[^/.]+$/, "")
            }
        }
        new Asset(newAsset).save((err, result) => {
            if (err) {
                req.flash('error_msg', 'El activo no pudo ser creado. Inténtelo de nuevo más tarde.')
            } else {
                if (files.file2.name != "") imageUp.uploadFile(files.file2.path, newAsset.images.url);
                req.flash('success_msg', 'Activo No. ' + fields.asset_number + ' creado exitosamente.');
                res.redirect('/assets');

            }
        });
    });
});

router.post('/save', (req, res) => {
    var form = new formidable.IncomingForm(), localAssetNum;
    form.parse(req, function (err, fields, files) {
        let changes = {
            name: fields.asset_name,
            status: fields.asset_status,
            reference_id: fields.asset_reference,
            store_id: fields.store_id
        }, images = {}, method = { $set: changes }
        if (files.file2.name != "") {
            images = {
                title: files.file2.name,
                url: 'assets/' + fields.hidden_asset_number + '/imgs/' + files.file2.name.replace(/\.[^/.]+$/, "")
            };
            method.$push = {
                images: images
            }
        }

        Asset.update({ _id: fields.assetID }, method, (err, result) => {
            if (err) {
                req.flash('error_msg', 'El Activo no pudo ser actualizado. Inténtelo de nuevo más tarde.')
            } else {
                if (files.file2.name != "") imageUp.uploadFile(files.file2.path, images.url);
                req.flash('success_msg', 'Activo actualizado correctamente.')
            }

            res.redirect('/assets/asset_details?ID=' + fields.assetID);
        });
    });
});

router.get('/assetRefs', Validations.ensureAuthenticated, (req, res) => {
    var route, layout;
    AssetRef.find({}, (err, assetRefs) => {
        if (err) console.log(err)
        else if (req.user.userRole === "systemAdmin") {
            route = '1-admin/list_references';
            layout = 'adminLayout'
        } else {
            route = '2-users/list_references';
            layout = 'userLayout'
        }
        res.render(route, { layout: layout, assetRefs });
    });
});

router.get('/assetRefs/ref_details', Validations.ensureAuthenticated, (req, res) => {

});

router.post('/ref/new', Validations.ensureAuthenticated, (req, res) => {
    var body = req.body;
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

router.post('/deleteImage', (req, res) => {
    console.log('assetID:' + req.query.assetID);
});

router.post('/getlocalnum/:store', (req, res) => {
    Asset.find({ store_id: req.params.store }, (err, assets) => {
        res.json(assets.length);
    });
});

module.exports = router;
