var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var Store = require('./store');
var uniqueValidator = require('mongoose-unique-validator');

var EventSchema = mongoose.Schema({
    eventNumber: {
        type: Number, 
        required: true,
        unique: true,
        min: 1
    },
    ticket_id: {
        type: ObjectId,
        ref: 'Ticket'
    },
    text: {
        type: String
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    city_id: {
        type: ObjectId,
        ref: "City",
        required: true
    },
    created_by: {
        type: ObjectId,
        ref: "User",
        required: true
    },
    modified_by: {
        type: ObjectId,
        ref: "User",
        required: true
    }      
});

EventSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Event', EventSchema);