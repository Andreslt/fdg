var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var uniqueValidator = require('mongoose-unique-validator');

var recordSchema = mongoose.Schema({
    recordNumber: {
        type: String, 
        unique: true,
        required: true
    },
    ticket_id: {
        type: ObjectId,
        ref: 'Ticket',
        required: true
    },
    customerReq: {
        type: String
    },   
    currentState: {
        type: String
    },  
    correctiveActions: {
        type: String
    },      
    suggestions: {
        type: String
    },
    adminRepresentative: {
        type: ObjectId,
        ref: "User",
        required: true
    },
    custRepresentative: {
        type: ObjectId,
        ref: "User",
        required: true
    },               
    createdOn: {
        type: Date,
        default: Date.now,
        required: true
    },
    notified: String,
    feedback: [{
        'Reliability': {
            type: Number,
            min: 0,
            max: 5
        },
        'Responsiveness': {
            type: Number,
            min: 0,
            max: 5
        },
        'Assurance': {
            type: Number,
            min: 0,
            max: 5
        },
        'Empathy': {
            type: Number,
            min: 0,
            max: 5
        }             
    }]
});
recordSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Record', recordSchema);