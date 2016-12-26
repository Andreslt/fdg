var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var uniqueValidator = require('mongoose-unique-validator');

var AssetSchema = mongoose.Schema({
    number: {
        type: String,
        required: true,
        unique: true
    },
    localRef: {
        type: Number,
        required: true     
    },
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    reference_id: {
        type: ObjectId,
        ref: 'assetReference',
        required: true
    },
    store_id: {
        type: ObjectId,
        ref: 'Store',
        required: true
    },
    images: [{
        title: String,
        url: String
    }],
    created_on: {
        type: Date,
        default: new Date
    }
});

AssetSchema.plugin(uniqueValidator);
var Asset = module.exports = mongoose.model('Asset', AssetSchema);