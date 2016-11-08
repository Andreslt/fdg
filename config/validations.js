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
	console.log('req.user.userRole: '+req.user.userRole);
	if (req.user.userRole!="systemAdmin"){
		if(req.user.userApproval){
			return next();
		}else{
			res.render('0-Auth/unauthorized',{layout: 'accessDenied'});
			console.log(req.user.username + " WAIT YOUR TURN!");
		}
	}else{
		next();
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

module.exports.numberGenerator = (useCase) => {
	let w;
	if(useCase === 'record'){
		w = 'AC'
	}

	return w+"-"+ new Date().getFullYear()+new Date().getMonth()+new Date().getDate()+ "-" +  makeid()
}

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

module.exports.updateEmployeesInStore = (store) => {
	UserModule.update({store_id: store.id}, {$set: {city_id: store.city_id}}, {new:true, multi: true}, (err, result)=>{
		console.log(result);
	});	
}