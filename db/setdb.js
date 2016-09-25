'use strict';
const dbconfig = require('../config/config.js');
const Mongoose = require('mongoose')
Mongoose.Promise = global.Promise; //Changing to the current Promise version
Mongoose.connect(dbconfig.dbURI);

Mongoose.connection.on('error', error =>{
    console.log("MongoDB Error: ", error);
});

module.exports = Mongoose