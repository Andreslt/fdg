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
    priority: {
        type: String,
        default: "baja",
        required: true
    },  
    status: {
        type: String,
        required: true
    }, 
    advance: {
        type: Number,
        required: true,
        default: 0
    }, 
    description: {
        type: String,
        required: true
    },     
    asset_id: {
        type: ObjectId,
        ref: "Asset"       
    },               
    store_id: {
        type: ObjectId,
        ref: "Store",
        required: true
    },
    contacts: [{
        type: ObjectId,
        ref: "User",
        required: true
    }],              
    feedback: {
        type: Number,
        min: 0,
        max: 5
    },
    categories: [{
        type: String
    }],
    image: String,
    viewed: {
        type: Boolean,
        default: false,
        required: true
    },        
    tracking: [{
        employeeId: {
            type: ObjectId,
            ref: "Users"
        },
        actionListID:{
            type: String
        },
        status: {
            type: String
        },
        date: {
            type: Date,
            default: Date.now
        },
        comments: {
            type: String
        }
    }],
    startdate: {
        type: Date,
        default: Date.now,
        required: true
    },
    finishdate: {
        type: Date
    },  
    lastupdate: {
        type: Date,
        default: Date.now,
        required: true        
    },  
    deadline: {
        type: Date
    },
    created_by: {
        type: ObjectId,
        ref: "Users",
        required: true
    },
    modified_by: {
        type: ObjectId,
        ref: "Users",
        required: true
    }      
});

var Ticket = module.exports = mongoose.model('Ticket', TicketSchema);

module.exports.createTicket = (newTicket, callback) => {
    newTicket.save(callback);
}