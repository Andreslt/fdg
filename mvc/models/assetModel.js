var mongoose = require('mongoose');

var AssetModelSchema = mongoose.Schema({
    name: {
        type: String, 
        required: true
    },
    year: String
});

var AssetModel  = module.exports = mongoose.model('AssetModel ', AssetModelSchema);