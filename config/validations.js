'use strict';
var UserModule = require('../mvc/models/user').user;

module.exports.ensureAuthenticated = (req, res, next)=>{
	if(req.isAuthenticated()){
		return next();
	} else {
		res.render('login', {layout: 'auth'});
	}
}

module.exports.approvedUser = (req, res,next)=>{
	if(req.user.userApproval){
		return next();
	}else{
		res.render('0-Auth/unauthorized',{layout: 'accessDenied'});
		console.log(req.user.username + " WAIT YOUR TURN!");
	}
}

module.exports.systemAdmin = (req, res,next)=>{
	if(req.user.userType==='systemAdmin'){
		console.log("HELLO ADMIN!");
		return next();
	}else{
		res.render('adminAccess_only',{layout: 'accessDenied'});
		console.log("GO AWAY IMPOSTOR!");
	}
}

module.exports.storeAdmin = (req, res,next) => {
	if(req.user.userType==='systemAdmin'){
		console.log("HELLO ADMIN!");
		return next();
	}else{
		res.render('adminAccess_only',{layout: 'accessDenied'});
		console.log("GO AWAY IMPOSTOR!");
	}
}

module.exports.updateEmployeesInStore = (store) => {
	UserModule.update({store_id: store.id}, {$set: {city_id: store.city_id}}, {new:true, multi: true}, (err, result)=>{
		console.log(result);
	});	
}