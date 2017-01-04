var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var Store = require('./store');
var uniqueValidator = require('mongoose-unique-validator');

var EventSchema = mongoose.Schema({
    eventNumber: {
        type: Number, 
        required: true,
        min: 1
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
    rec_type: String,
    rec_pattern: String,
    event_length: String,      
    ticket_id: {
        type: ObjectId,
        ref: 'Ticket',
        required: true
    },    
    created_by: {
        type: ObjectId,
        ref: "User",
        required: true
    },
    created_on: {
        type: Date,
        default: new Date(),
        required: true
    }        
});

EventSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Event', EventSchema);

module.exports.createEvent = (newEvent, callback) => {
    newEvent.save(callback);
}