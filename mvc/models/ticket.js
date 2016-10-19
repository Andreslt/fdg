var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var Store = require('./store');

var TicketSchema = mongoose.Schema({
    ticketNumber: {
        type: Number, 
        required: true,
        unique: true,
        min: 1
    },
    title: {
        type: String, 
        required: true
    },
    store_id: {
        type: ObjectId,
        ref: "Store",
        required: true
    },
    priority: {
        type: String,
        required: true
    },     
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },   
    created_by: {
        type: ObjectId,
        ref: "Users",
        required: true
    },    
    startdate: {
        type: Date,
        default: Date.now,
        required: true
    },
    finishdate: {
        type: Date
    },
    lastupdate: {
        type: Date
    },         
    feedback: {
        type: Number,
        min: 0,
        max: 5
    },
    categories: [{
        type: String
    }],
    attachements: String,
    tracking: [{
        employeeId: {
            type: String
        },
        employeeName:{
            type: String
        },
        status: {
            type: String
        },
        date: {
            type: Date
        },
        comments: {
            type: String
        }
    }]
});

var Ticket = module.exports = mongoose.model('Ticket', TicketSchema);

module.exports.createTicket = (newTicket, callback) => {
    newTicket.save(callback);
}