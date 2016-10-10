'use strict';

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
		res.render('unauthorized',{layout: 'accessDenied'});
		console.log("WAIT YOUR TURN!");
	}
	return next();
}

module.exports.systemAdmin = (req, res,next)=>{
	if(req.user.userType==='systemAdmin'){
		console.log("HELLO ADMIN!");
		return next();
	}else{
		res.render('adminAccess_only',{layout: 'accessDenied'});
		console.log("GO AWAY IMPOSTOR!");
	}
	return next();
}

module.exports.storeAdmin = (req, res,next) => {
	if(req.user.userType==='systemAdmin'){
		console.log("HELLO ADMIN!");
		return next();
	}else{
		res.render('adminAccess_only',{layout: 'accessDenied'});
		console.log("GO AWAY IMPOSTOR!");
	}
	return next();
}