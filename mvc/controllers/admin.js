'use strict';
/* >>> Modules <<< */
const express = require('express');
const router = express.Router();
var fs = require("fs");
var dateFormat = require('dateformat');

//Models
var User = require('../models/user');
var UserModule = require('../models/user').user;
var company = require("../models/company");
var store = require("../models/store");
var userType = require("../models/userType");
const tickets = require("../models/ticket");
const city = require('../models/city');
const formidable = require('formidable');

//Config
const validations = require('../../config/validations');


/* >>> ROUTES <<< */
// Dashboard
router.get('/dashboard', validations.ensureAuthenticated, validations.systemAdmin, function(req, res){
	company.find({companyName: {$ne: "Default company"}}, (err, customers) => {
		res.render('1-admin/dashboard', {layout: 'adminLayout', userTypeAdmin: true, customers});
	});
});

// Account
router.get('/account', validations.ensureAuthenticated, validations.systemAdmin, (req, res)=>{
	let user = req.user, storeAdminSW;
	res.render('1-admin/account', {layout: 'adminLayout', storeAdminSW});
});

// Edit account
router.get('/account/edit', validations.ensureAuthenticated, validations.systemAdmin, (req, res)=>{
	let user = req.user, storeAdminSW, userDates;
	UserModule.findOne({username: user.username}, (err, user) => {
		company.find({companyName: {$ne: "Default company"}},(err, companies) => {
			city.find({city: {$ne: "Default city"}},(err, cities) => {
				store.find({storeName: {$ne: "Default store"}},(err, stores) => {
				userDates = {
							creatYear: user.createdOn.getFullYear(),
							creatMonth: user.createdOn.getMonth(),
							creatDay: user.createdOn.getDate(),
							}						
					if(user.approvedOn!=null) {
						userDates.aprobYear = user.approvedOn.getFullYear();
						userDates.aprobMonth = user.approvedOn.getMonth();
						userDates.aprobDay= user.approvedOn.getDate();					
					}else{
						userDates.aprobYear = 99;
						userDates.aprobMonth = 99;
						userDates.aprobDay= 99;								
					}
					res.render('1-admin/account_edit', {layout: 'userLayout', user, userDates, companies, cities, stores});
				});
			});
		});		
	});
});

// New ticket
router.get('/newTicket', validations.ensureAuthenticated, validations.systemAdmin, (req, res)=>{
	let user = req.user, storeAdminSW;
	res.render('1-admin/new_ticket', {layout: 'adminLayout', storeAdminSW});
});

// Tickets
router.get('/tickets', validations.ensureAuthenticated, validations.systemAdmin, (req, res)=>{
	let user = req.user, storeAdminSW;
	var obj = {data: []}, userImage;
	tickets.find({}).populate('contacts').exec((err, tkts) =>{
		if (err) console.log(err);
		for(let t=0; t<tkts.length;t++){
			obj.data.push(
				{
					title: tkts[t].title+"<br><small class='text-muted'><i>#Ticket: "+tkts[t].ticketNumber+"<i></small>",
					advance: "<td><div class='progress progress-xs' data-progressbar-value="+tkts[t].advance+"><div class='progress-bar'></div></div></td>",
					contacts: getContactInfo(tkts[t].contacts),
					status: "<span style='text-align: center;' class='label label-"+getLabel(tkts[t].status)+"'>"+tkts[t].status+"</span>",
					'target-actual': "<span style='margin-top:5px' class='sparkline display-inline' data-sparkline-type='compositebar' data-sparkline-height='18px' data-sparkline-barcolor='#aafaaf' data-sparkline-line-width='2.5' data-sparkline-line-val='[47,9,9,8,3,2,2,5,6,7,4,1,5,7,6]' data-sparkline-bar-val='[47,9,9,8,3,2,2,5,6,7,9,9,5,7,6]'></span>",
					actual: "<span class='sparkline text-align-center' data-sparkline-type='line' data-sparkline-width='100%' data-sparkline-height='25px'>20,-35,70</span>",
					tracker: "<span class='onoffswitch'><input type='checkbox' name='start_interval' class='onoffswitch-checkbox' id='st1' checked='checked'><label class='onoffswitch-label' for='st1'><span class='onoffswitch-inner' data-swchon-text='ON' data-swchoff-text='OFF'></span><span class='onoffswitch-switch'></span></label></span>",
					startdate: dateFormat(tkts[t].startdate, "dd/mm/yyyy"),
					lastupdate: dateFormat(tkts[t].lastupdate, "dd/mm/yyyy HH:MM"),
					expendingDate: dateFormat(tkts[t].expendingDate, "dd/mm/yyyy"),
					description: tkts[t].description,
					categories: getCategories(tkts[t].categories),
					action: "<a href='/admin/ticket/details?ID="+tkts[t].id+"' style='color: #FFFFFF;'><button class='btn btn-xs'>Ver Ticket</button></a> <a href=''><button class='btn btn-xs btn-danger pull-right' style='margin-left:5px'>Eliminar</button></a>"			
				}
			);
		}
	var json = JSON.stringify(obj);
		fs.writeFile('public/data/dataList2.json', json, 'utf8', (err, data)=>{
			if (err) console.log(err);
			else
				res.render('1-admin/list_tickets', {layout: 'adminLayout'});			
		});
	});	 	
});

// Ticket Details
router.get('/ticket/details', validations.ensureAuthenticated, validations.systemAdmin, (req, res)=>{
	let ticketID = req.query.ID;
	tickets.findOne({_id: ticketID}).populate('store_id').exec((err, ticket)=>{	
		if(err) console.log(err);
		city.findOne({_id: ticket.store_id.city_id}, (err, city)=>{
			if(err) console.log(err);
			res.render('1-admin/view_ticket', {layout: 'adminLayout', ticket, city});
		})
	});
});

router.post('/ticket/save', validations.ensureAuthenticated, validations.systemAdmin, (req, res)=>{
	var form = new formidable.IncomingForm(), user = req.user;
	form.parse(req, function(err, fields, files) {
	let body = fields, ticketID = body.ticket_id, 	

	params={
			priority: body.setpriority,
			advance: body.setadvance,
			status: body.setstatus,			
			title: body.title,			
			description: body.description,
			categories: body.categories,
			lastupdate: new Date(),
			modified_by: req.user.id	
		}

/*	if(params.priority==null)
		params.priority = body.getpriority
	if(params.advance==null)
		params.advance = body.getadvance
	if(params.status==null)
		params.status = body.getstatus	*/		

		console.log(params);
		tickets.findOneAndUpdate({_id: ticketID}, {$set: params}, {new: true}, (err, ticket)=>{
			if (err) {
				console.log(err);
			}else{				
				req.flash("success_msg", "El ticket fue actualizado.");
				res.redirect('/tickets');
			}
		});			
	});	
});

// New store
router.get('/newStore', validations.ensureAuthenticated, (req, res)=>{
	let user = req.user, storeAdminSW;
	res.render('1-admin/new_store', {layout: 'adminLayout', storeAdminSW});
});

// Stores
router.get('/stores', validations.ensureAuthenticated, (req, res)=>{
	let user = req.user, storeAdminSW;
	res.render('1-admin/list_stores', {layout: 'adminLayout', storeAdminSW});
});

// New asset
router.get('/newAsset', validations.ensureAuthenticated, (req, res)=>{
	let user = req.user, storeAdminSW;
	res.render('1-admin/new_asset', {layout: 'adminLayout', storeAdminSW});
});

// Assets
router.get('/assets', validations.ensureAuthenticated, (req, res)=>{
	let user = req.user, storeAdminSW;
	res.render('1-admin/list_assets', {layout: 'adminLayout', storeAdminSW});
});

// New employee
router.get('/newEmployee', validations.ensureAuthenticated, (req, res)=>{
	let user = req.user, storeAdminSW;
	res.render('1-admin/new_employee', {layout: 'adminLayout', storeAdminSW});
});

// Employees
router.get('/employees', validations.ensureAuthenticated, (req, res)=>{
	let user = req.user, storeAdminSW;
	res.render('1-admin/list_employees', {layout: 'adminLayout', storeAdminSW});
});

// New report
router.get('/newReport', validations.ensureAuthenticated, (req, res)=>{
	let user = req.user, storeAdminSW;
	res.render('1-admin/new_report', {layout: 'adminLayout', storeAdminSW});
});

// Reports
router.get('/reports', validations.ensureAuthenticated, (req, res)=>{
	let user = req.user, storeAdminSW;
	res.render('1-admin/list_reports', {layout: 'adminLayout', storeAdminSW});
});

function getLabel(status) {
    if (status==="Pendiente"){
        return "info";
    }else if (status ==="Asignado"){
       return "warning";
	}else if (status ==="Finalizado"){
       return "success"
    }else return "danger";
}

function getContactInfo(contacts){
	let contactInfo="<div class='project-members'>", status;
	for (let i=0; i<contacts.length; i++){
		(contacts[i].userRole==="storeAdmin") ? status = "online" : status = "busy";
		contactInfo = contactInfo + "<a href='javascript:void(0)'>"+
			"<img src='http://res.cloudinary.com/pluriza/image/upload/c_fill,h_25,w_22/"
			+contacts[i].image+"'class='"+status+"' alt="+contacts[i].username+" title='"+ contacts[i].username+"'></a>";
	}
	contactInfo=contactInfo+"</div>";	
	return contactInfo;
}

function getCategories(categories){
	if (categories!=null){
		let categoryList ='<td>';
		
		for(let i=0;i<categories.length;i++){
			categoryList = categoryList+'<span class="label label-default">'+categories[i]+'</span>';
		}
		categoryList = categoryList+'</td>';	
		return categoryList;
	}else return ""
}

module.exports = router;