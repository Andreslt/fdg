'use strict';
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const passport = require('passport');
const expressValidator = require('express-validator');
const exphbs = require('express-handlebars');
var moment = require('moment');
var fs = require('fs');
const formidable = require('express-formidable');

// Controllers
const index = require('./mvc/controllers/index')
const routes = index.router;

const users = require('./mvc/controllers/users');
const admin = require('./mvc/controllers/admin');
const oauth = require('./mvc/controllers/oauth');
const tickets = require('./mvc/controllers/tickets');
const stores = require('./mvc/controllers/stores');
const assets = require('./mvc/controllers/assets');

// Models
const User = require('./mvc/models/user');
require('./mvc/models/company');

// Database
const db = require('./db/setdb');

// Initializing App
const app = express();
const reportingApp = express();
app.use('/reporting', reportingApp);

// Session
// const session = require('./config/session');
const session = require('express-session');

// Handlebars Helpers
const viewsPath = path.join(__dirname, 'mvc', 'views');
var hbsEngine = exphbs.create({
    defaultLayout: 'layout',
    layoutsDir: path.join(viewsPath, 'layouts'),
    helpers: {
        formatDate: function (date, format) {
            return moment(date).format(format);
        },
        ticketESP: function(ticketType) {
          if(ticketType==='corrective')
            return 'Correctivo'
          else return 'Preventivo'
        },
        currentDate: function (){
            return moment(new Date()).format("DD.MM.YYYY");
        },
        statusTag: (status) =>{
          if (status==="pending"){
            return "info"
          }else if (status ==="asigned"){
            return "warning"
          }else if (status ==="finished"){
            return "success"
          }else return "danger"
        },
        statusESP: (status) =>{
          if (status==="pending"){
            return "Pendiente"
          }else if (status ==="asigned"){
            return "Asignado"
          }else if (status ==="finished"){
            return "Finalizado"
          }else return "Cancelado"          
        },
        times: () =>{
          var day=new Array();
          for (var i=1;i<=30;i++)
          {
            day.push(i);                                              
          }
          console.log(day);
          return day; 
        },
        select: (value, options) =>{
        return options.fn(this)
          .split('\n')
          .map(function(v) {
            var t = 'value="' + value + '"'
            return ! RegExp(t).test(v) ? v : v.replace(t, t + ' selected="selected"')
          })
          .join('\n')
        },
        approbDateNull: (userEdit)=>{
					try {
								let s= userEdit.approvedOn.getFullYear();
								return ""
							} catch (error) {
								return "disabled"
							}
        },
        substring: (phone_number, start, end)=>{
          return phone_number.substring(start,end);
        },
        formatPhone: (phone)=>{
          if(phone !== null){
          let phone_number = phone.toString();
          return "(" + phone_number.substring(0,3) + ")" + phone_number.substring(3,6) + "-" + phone_number.substring(6,10);}
          else return "";
        },
        comparation: (string1, string2)=>{
          if(string1===string2)
            return true;
          else
            return false;
        },
        userImage: (imagePath, size)=>{
          let option;
          if (size === "small") option="c_fill,h_35,w_35/";
          else if (size === "medium") option="c_fill,h_100,w_100/";
          else option="c_fill,h_150,w_150/";

          return 'http://res.cloudinary.com/pluriza/image/upload/'
                  + option
                  + imagePath
        },
        mayusc: (word) =>{
          if (word!=null)
          return word.toUpperCase()
          else return ""
        }
    }
});

// View Engine
app.set('views', viewsPath);
app.engine('handlebars', hbsEngine.engine);
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
// app.use(session);
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    duration: 1 * 60 * 1000,
    activeDuration: 1 * 60 * 1000,
    cookie:{
      maxAge: 60*60*1000
    },
    ephemeral: true,
    resave: true
}));


// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      let namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));


let sessionMidleware = (req, res, next) => {
  if (req.session && req.session.passport) {
    User.user.findOne({ _id: req.session.passport.user }, function(err, user) {
      if (user) {
        req.user = user;
        delete req.user.password; // delete the password from the session
        req.session.user = user;  //refresh the session value
        res.locals.user = user;
      }
      // finishing processing the middleware and run the route
      next();
    });
  } else {
    next();
  }
}

app.use(sessionMidleware);

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// app.use('/', routes());
app.use('/', routes);
app.use('/users', users);
app.use('/admin', admin);
app.use('/tickets', tickets);
app.use('/stores', stores);
app.use('/assets', assets);
app.use('/oauth', oauth);

//Not found pages
app.use(function(req, res, next){
    res.status(404);
    console.log('error','Not found URL: %s',req.url);
    res.send({ error: 'Not found' });
    return;
});

/*app.use(function(err, req, res, next){
    res.status(err.status || 500);
    console.log('error','Internal error(%d): %s',res.statusCode,err.message);
    res.send({ error: err.message });
    return;
});*/

// Morgan
app.use(require('morgan')('combined', {
  stream: {
    write: message =>{
      //Writing Logs
      console.log('info', message);
    }
  }
}));

// Set Port
app.set('port', (process.env.PORT || 3000));

// Multipart/form-ata
app.use(formidable({
  encoding: 'utf-8',
  uploadDir: __dirname+'/resources/tempFiles',
  keepExtensions: true
}));

app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});

/*
var server = app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});

var jsreport = require('jsreport')({
  express: { app :reportingApp, server: server },
  appPath: "/reporting"
});

jsreport.init().catch(function (e) {
  console.error(e);
});*/