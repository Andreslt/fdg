'use strict';
const dbconfig = require('../config/config.js');
const Mongoose = require('mongoose').connect(dbconfig.dbURI);

Mongoose.connection.on('error', error =>{
    console.log("MongoDB Error: ", error);
});

module.exports = Mongoose