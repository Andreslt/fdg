'use strict';
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const db = require('../db/setdb');
const config = require('./config');

var ses = {
    secret: config.sessionSecret,
    resave: false,
    cookie:{
      maxAge: 60*60*1000 //60 minutes x 60 sec x 1000 milisec
    }
};

if(process.env.NODE_ENV === 'production'){
    ses = {
		saveUninitialized: false,
		store: new MongoStore({
			mongooseConnection: db.Mongoose.connection
		})        
    }
}else{
    ses = {
        saveUninitialized: true
    }
}

module.exports = session(ses);