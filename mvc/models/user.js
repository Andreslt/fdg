var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

// Discriminator Key
var options = {discriminatorKey: 'userType'};

// User Schema
var UserSchema = new mongoose.Schema({
	username: {
		type: String,
		index:true,
		required: true,
		unique: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},	
	name: {
		type: String,
		required: true
	},
	lastname:{
		type: String,
		required: true
	},
	userType:{
		type: String,
		required: true
	},
	createdOn: {
		type: Date,
		default: Date.now
	},
	ApprovedOn: {
		type: Date,
		default: Date.now		
	},
	resetPasswordToken: String,
	resetPasswordExpires: Date
}, options);

var User = module.exports.user = mongoose.model('User', UserSchema);

//System Administrator
var UserSystemAdminSchema = mongoose.Schema({
    pin: {
        type: Number,
        min: 1000,
        max: 9999,
        required: true
    }
}, options);
var UserSystemAdmin = module.exports.systemAdmin = User.discriminator('systemAdmin', UserSystemAdminSchema);//{discriminatorKey: 'systemAdmin'});

//Store Administrator
var UserStoreAdminSchema = mongoose.Schema({
	company_id:{
		type: ObjectId,
		ref: 'company',
		required:true
	},
	userApproval:{
		type: Boolean,
		default: false,
		required:true
	}
}, options);
var UserStoreAdmin = module.exports.storeAdmin = User.discriminator('storeAdmin', UserStoreAdminSchema);//{discriminatorKey: 'storeAdmin'});

//Employee
var userStoreEmployeeSchema = mongoose.Schema({
	store_id:{
		type: ObjectId,
		ref: 'localStore',
		required:true
	},
	userApproval:{
		type: Boolean,
		default: false,
		required:true
	},
	ApprovedBy: String //UserName
}, options);
var userStoreEmployee = module.exports.storeEmployee = User.discriminator('storeEmployee', userStoreEmployeeSchema); //{discriminatorKey: 'storeEmployee'});

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}
