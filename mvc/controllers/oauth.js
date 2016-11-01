'use strict';
/* >>> Modules <<< */
const express = require('express');
const router = express.Router();

//oAuth2.0 Server
var oauth2orize = require('oauth2orize');
var server = oauth2orize.createServer();
var Application = require('../models/oauth').Application;
var GrantCode = require('../models/oauth').GrantCode;
var AccessToken = require('../models/oauth').AccessToken;

//Models
var User = require('../models/user');
var UserModule = require('../models/user').user;
var company = require("../models/company");
var store = require("../models/store");
var userType = require("../models/userType");
const tickets = require("../models/ticket");
const city = require('../models/city');

//Config
const validations = require('../../config/validations');

/* >>>	SETTING UP	<<< */
server.grant(oauth2orize.grant.code({
	scopeSeparator: [ ' ', ',' ]
}, function(application, redirectURI, user, ares, done) {
	var grant = new GrantCode({
		application: application,
		user: user,
		scope: ares.scope
	});
	grant.save(function(error) {
		done(error, error ? null : grant.code);
	});
}));
server.exchange(oauth2orize.exchange.code({
	userProperty: 'app'
}, function(application, code, redirectURI, done) {
	GrantCode.findOne({ code: code }, function(error, grant) {
		if (grant && grant.active && grant.application == application.id) {
			var token = new AccessToken({
				application: grant.application,
				user: grant.user,
				grant: grant,
				scope: grant.scope
			});
			token.save(function(error) {
				done(error, error ? null : token.token, null, error ? null : { token_type: 'standard' });
			});
		} else {
			done(error, false);
		}
	});
}));
server.serializeClient(function(application, done) {
	done(null, application.id);
});
server.deserializeClient(function(id, done) {
	Application.findById(id, function(error, application) {
		done(error, error ? null : application);
	});
});

/* >>> ROUTES <<< */
// Dashboard
router.post('/login', server.authorize(function(clientID, redirectURI, done) {

	Clients.findOne(clientID, function(err, client) {})
}), function(req, res){

});

module.exports = router;