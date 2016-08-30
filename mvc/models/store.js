var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var City = require('./city');
var Company = require('./company');

var LocalStoreSchema = mongoose.Schema({
    storeName: {
        type: String, 
        required: true, 
        unique: true
    },
    company_id:{
        type: ObjectId,
        ref: 'Company',
        required: true
    },
    city: {
        name: String,
        image: String
    },    
    address:{
        type: String
    },
    phone:{
        type: String
    },
    email: {
        type: String
    },
    representative: String
});

var LocalStore = module.exports = mongoose.model('Store', LocalStoreSchema);