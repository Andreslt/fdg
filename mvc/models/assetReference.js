var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var AssetRefSchema = Schema({
    number: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    model: {
        type: Number,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    refrigerant: {
        type: String
    },
    planes: [{
        type: String
    }],
    power: Number,
    power_unit: String,
    height: Number,
    width: Number,
    large: Number,
    dimension_units: String,
    capacity: Number,
    capacity_units: String,
    weight: Number,
    weight_unit: String,
    factoryWarnings: String,
    created_on: {
        type: Date,
        required: true,
        default: new Date()
    }
});

//AssetRefSchema.plugin(uniqueValidator);
var AssetRef = module.exports = mongoose.model('assetReference', AssetRefSchema);