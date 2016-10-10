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

// Controllers
const routes = require('./mvc/controllers/index');
const users = require('./mvc/controllers/users');
const admin = require('./mvc/controllers/admin');
// const routes = require('./mvc/controllers/routes');

// Models
const User = require('./mvc/models/user');
require('./mvc/models/company');

// Database
const db = require('./db/setdb');

// Initializing App
const app = express();

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
        statusTag: (status) =>{
          if (status==="Pendiente"){
            return "btn-info"
          }else if (status ==="Asignado"){
            return "btn-warning"
          }else{
            return "btn-success"
          }
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
        cel1: (cellphone_Number)=>{
          let cellphone_String = cellphone_Number.toString();
          return cellphone_String.substring(0,3);
        },
        cel2: (cellphone_Number)=>{
          let cellphone_String = cellphone_Number.toString();          
          return cellphone_String.substring(3,6);
        },
        cel3: (cellphone_Number)=>{
          let cellphone_String = cellphone_Number.toString();            
          return cellphone_String.substring(6,10);
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

// Set Port
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});
