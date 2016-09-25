
var mongoose = require('mongoose');

var UserTypeSchema = mongoose.Schema({
    userTitle: {
        type: String, 
        required: true, 
        unique: true
    }
});

var UserType = module.exports = mongoose.model('UserType', UserTypeSchema);