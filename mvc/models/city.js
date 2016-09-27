
var mongoose = require('mongoose');

var CitySchema = mongoose.Schema({
    city: {
        type: String, 
        required: true, 
        unique: true
    },
    image: String
});

var City = module.exports = mongoose.model('City', CitySchema);