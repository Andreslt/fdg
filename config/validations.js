'use strict';
var UserModule = require('../mvc/models/user').user;
const Asset = require('../mvc/models/asset');
const Event = require('../mvc/models/event');

module.exports.ensureAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	} else {
		res.render('0-Auth/login', { layout: 'auth' });
	}
}

module.exports.approvedUser = (req, res, next) => {
	console.log('req.user.userRole: ' + req.user.userRole);
	if (req.user.userRole != "systemAdmin") {
		if (req.user.userApproval) {
			return next();
		} else {
			res.render('0-Auth/unauthorized', { layout: 'accessDenied' });
			console.log(req.user.username + " WAIT YOUR TURN!");
		}
	} else {
		next();
	}
}

module.exports.systemAdmin = (req, res, next) => {
	if (req.user.userType === 'systemAdmin') {
		console.log("HELLO ADMIN!");
		return next();
	} else {
		res.render('0-Auth/adminAccess_only', { layout: 'accessDenied' });
		console.log("GO AWAY IMPOSTOR!");
	}
}

module.exports.storeAdmin = (req, res, next) => {
	if (req.user.userType === 'systemAdmin') {
		console.log("HELLO ADMIN!");
		return next();
	} else {
		res.render('adminAccess_only', { layout: 'accessDenied' });
		console.log("GO AWAY IMPOSTOR!");
	}
}

module.exports.numberGenerator = (useCase) => {
	let w;
	if (useCase === 'record')
		w = 'ACTA'
	else if (useCase === 'corrective')
		w = 'MANCOR'
	else if (useCase === 'preventive')
		w = 'MANPRE'
	else if (useCase === 'Asset')
		w = 'EQ'
	else if (useCase === 'local_Asset')
		w = 'LRef'
	else if (useCase === 'ref_Asset')
		w = 'REq'
	return w + "-" + new Date().getFullYear() + new Date().getMonth() + new Date().getDate() + "-" + makeid()
}

module.exports.localAssetNum = (store) => {
	Asset.find({ store_id: store }, (err, assets) => {
		return assets.length;
	})
}

function makeid() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < 5; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports.updateEmployeesInStore = (store) => {
	UserModule.update({ store_id: store.id }, { $set: { city_id: store.city_id } }, { new: true, multi: true }, (err, result) => {
		console.log(result);
	});
}

module.exports.getLabel = (status) => {
	if (status === "pending") {
		return "info";
	} else if (status === "asigned") {
		return "warning";
	} else if (status === "finished") {
		return "success"
	} else return "danger";
}

module.exports.getLabelESP = (priority) => {
	if (priority === "pending") {
		return "Pendiente";
	} else if (priority === "asigned") {
		return "Asignado";
	} else if (priority === "finished") {
		return "Finalizado"
	} else return "Cancelado";
}

module.exports.getPriorityESP = (status) => {
	if (status === "low") {
		return "Baja";
	} else if (status === "medium") {
		return "Media";
	} else if (status === "high") {
		return "Alta"
	} else return "MUY ALTA";
}

module.exports.getContactInfo = (contacts) => {
	let contactInfo = "<div class='project-members'>", status;
	for (let i = 0; i < contacts.length; i++) {
		(contacts[i].userRole === "storeAdmin") ? status = "online" : status = "busy";
		contactInfo = contactInfo + "<a href='javascript:void(0)'>" +
			"<img src='http://res.cloudinary.com/pluriza/image/upload/c_fill,h_25,w_22/"
			+ contacts[i].image + "'class='" + status + "' alt=" + contacts[i].username + " title='" + contacts[i].username + "'></a>";
	}
	contactInfo = contactInfo + "</div>";
	return contactInfo;
}

module.exports.getCategories = (categories) => {
	if (categories != null) {
		let categoryList = '<td>';

		for (let i = 0; i < categories.length; i++) {
			categoryList = categoryList + '<span class="label label-default">' + categories[i] + '</span>';
		}
		categoryList = categoryList + '</td>';
		return categoryList;
	} else return ""
}

module.exports.setDates = (date) => {
	if (date != null)
		return date.slice(-4) + "/" + date.slice(-7, -5) + "/" + date.slice(-10, -8);
	else
		return "";
}

module.exports.getSpanishMonth = (date) => {
	let dateArray = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
	return dateArray[date - 1]
}

module.exports.phoneDecoded = (phone) => {
	return phone.substring(1, 4) + phone.substring(6, 9) + phone.substring(10, 14)
}

module.exports.formatAMPM = (date) => {
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? 'pm' : 'am';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0' + minutes : minutes;
	var strTime = hours + ':' + minutes + ' ' + ampm;
	return strTime;
}

module.exports.recipents = (users, target) => {
	let recipents = new Array();
	for (var u = 0; u < users.length; u++) {
		var sw = false;
		if (target) {
			if (target === "administradores") {
				if (users[u].userRole === "systemAdmin") {
					sw = true;
				}
			} else if (target === "usuarios") {
				if (users[u].userRole !== "systemAdmin") {
					sw = true;
				}
			} else if (target === "contactos") {
				sw = true;
			}
			if (sw) recipents.push(users[u].email);
		} else recipents.push(users[u].email);
	}
	return recipents
}

module.exports.getEventNumber = () => {
	console.log('llegó')
	let num = getRandomInt(10000, 99999)
	console.log('num: ' + num)
	return num;
}