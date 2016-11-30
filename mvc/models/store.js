var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var Company = require('./company');
var uniqueValidator = require('mongoose-unique-validator');

var LocalStoreSchema = mongoose.Schema({  
    storeName: {
        type: String, 
        required: true
    },
    company_id:{
        type: ObjectId,
        ref: 'Company',
        required: true
    },
    city_id:{
        type: ObjectId,
        ref: 'City',
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },          
    address:{
        type: String,
        required: true
    },
    phone:{
        type: Number,
        required: true
    },
    representative:{
        type: ObjectId,
        ref: 'User',
        required: true
    }, 
    created_on:{
        type: Date,
        default: new Date(),
        required: true
    },
});

LocalStoreSchema.plugin(uniqueValidator);
var LocalStore = module.exports = mongoose.model('Store', LocalStoreSchema);