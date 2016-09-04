//    Creating new MongoDBObjects
var db = require('./db/setdb');

/*var LocalStoreSchema = {
    storeName: "Default",
    companyId: "57a3c291f9ac294015f05aaa"
};
var localStore = require('./mvc/models/store');
var store = new localStore(LocalStoreSchema);

store.save();
console.log(store);*/


/*var userType = require('./mvc/models/userType');
var systemAdmin = new userType({userTitle: "systemAdmin"});
var storeAdmin = new userType({userTitle: "storeAdmin"});
var storeEmployee = new userType({userTitle: "storeEmployee"});
systemAdmin.save();
storeAdmin.save();
storeEmployee.save();
console.log(systemAdmin);
console.log(storeAdmin);
console.log(storeEmployee);*/


// Adding new elements to an object
/*
    var usrParams = {      
      username: "andreslt90",
			email:"a",
			password: "b",
      name: "c",
      lastname: "lastname",
      userType_id: "usrTId"
    };
    console.log(usrParams);
    usrParams.pin = 9999
    console.log(usrParams);
*/

// Handlebars RegisterHelper
/*hbhprs.registerHelper('if_eq', function(a, b, opts) {
    if(a === b)
        return opts.fn(this);
    else
        return opts.inverse(this);
}); */

/*var hbs = exphbs.registerHelper('if_userType', function(userType, options) {
  if(userType === "systemAdmin") {
    return true;
  } else {
    return false;
  }
});

Handlebars Helpers
var hbs = exphbs.create({
    // Specify helpers which are only registered on this instance.
    helpers: {
        userTypeAdmin: function (userType){ 
			if(userType === 'Admin'){
				return true; 
			}else{
				return false;
			}			
		}		
    }
});
*/

// Schedule
/*
  var dateExpiration = new Date(Date.now() + 10000);
      var j = schedule.scheduleJob(dateExpiration, function(){
        console.log('Cookie expired');
        // How can I redirect to login page after cookie session expires?
        //redirect('/login')
    });
*/

// Callback into Async functions.
/*
var cny = require("./mvc/models/company"); 
var usrParams = {s:1};
var usrtype = "storeAdmin";


function getParms (usrParams, usrtype, callback) {
  if (usrtype === "systemAdmin")
    usrParams.pin = 9999;
  else if (usrtype === "storeAdmin"){
    cny.findOne({companyName: "Test"}, function(err, c) {
      usrParams.company = c._id;
    });
    callback(null, null, usrParams);
  }
}

getParms(usrParams, usrtype, function(err, compa){
  if (err) console.log(err)
  console.log(compa);
});
var p = parameters(usrParams, usrtype);
*/

// Creating Cities
/*var cny = require("./mvc/models/city"); 
var mainCity = new cny({city: "Barranquilla", image: "https://s3-us-west-2.amazonaws.com/fdg-ingenieria/images/Ciudades/BA.jpg"});
mainCity.save();*/

// Creating Companies
/*var cny = require("./mvc/models/company"); 
var mainCity = new cny(
  {    nit: "123456789",
    companyName: "Default company",
    city: "57b5e0c54ab963680f8372ee"}
  );
mainCity.save();*/

// Creating Stores
/*var store= require("./mvc/models/store"); 
var st = new store(
  {
    storeName: "Default Store",
    companyId: "57b5e6118fc445a60fbdd8d4"
  }
  );
st.save();*/

// Creating Tickets
// var tkt = require("./mvc/models/ticket");
// var moment = require('moment');
// var date =  new Date('Thu Aug 18 2016 18:22:56 GMT-0600 (CST)')
// var newtkt = new tkt(
//   {
//     ticketNumber: "3",
//     title: "Default ticket",
//     description: "Test",
//     status: "Pendiente",
//     store_id: "57b5e98f0a940f3010662762",
//     storeEmployee_id: "57b5ea7d8a84be5110014276",
//     openningDate: Date.now()
//   }
// );
// newtkt.save(function(err, tk){
//   if (err) console.log(err)
//   else console.log(tk)
// }
//   );


// Populating query
// const tickets = require("./mvc/models/ticket");
// const store = require("./mvc/models/store");
// var mongoose = require('mongoose').Schema;
//var populateQuery = [{path:'storeEmployee_id', select:'username'}];
// tickets.find({}).populate('store_id').populate('storeEmployee_id').exec(function(err, tkt){
//     store.find({}).populate('city_id').populate('company_id').exec(function(err, stores){
//       console.log(store.models);
/*      var st = new mongoose(store.Schema);
      st = stores;
      st.populate(tkt, {path: 'store_id'}, function (err, tickets) {
        console.log(tickets);
      })*/
//     });
// });

/*const city = require("./mvc/models/city");
const company = require("./mvc/models/company");

store.find({}, function(err, stores) {
  company.find({}, function(err, companies){
    city.populate(companies, {path: 'city_id'}, function (err, cities){}).populate(stores, {path: 'company_id'}, function (err, newstores) {
        console.log(newstores);
      })
  });    
})*/
/*var stores = store.find({}).populate('city_id').populate('company_id').exec(function(err, stores){
    console.log(stores);
  })*/

/*tickets.find({}, function(err, tk){
  store.find({}).populate('city_id').populate('company_id').exec(function(err, stores){
    console.log(stores);
  })
});*/

/*.populate(tk, {path: 'store_id'}, function(err, ticket){
    console.log(ticket);
  });*/
  
  // using SendGrid's Node.js Library - https://github.com/sendgrid/sendgrid-nodejs
// var sendgrid = require("sendgrid")("YOUR_SENDGRID_API_KEY");
// var email = new sendgrid.Email();

// email.addTo("test@sendgrid.com");
// email.setFrom("you@youremail.com");
// email.setSubject("Sending with SendGrid is Fun");
// email.setHtml("and easy to do anywhere, even with Node.js");

// sendgrid.send(email);

// var nodemailer = require('nodemailer');
// var transporter;
// var text = 'Hello world from yourself';

// var mailOptions = {
//     to: 'andreslastrat@gmail.com', // sender address
//     from: 'andres_late1008@hotmail.com', // list of receivers
//     subject: 'TEST EMAIL', // Subject line
//     text: text //, // plaintext body
//     // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
// };

// handleSayHello();

// function handleSayHello() {
//     // Not the movie transporter!
//     transporter = nodemailer.createTransport({
//         service: 'hotmail',
//         auth: {
//             user: '', // Your email id
//             pass: '' // Your password
//         },
//         tls: { rejectUnauthorized: false }
//     });

//   transporter.sendMail(mailOptions, function(error, info){a
//       if(error){
//           console.log(error);
//           // res.json({yo: 'error'});
//       }else{
//           console.log('Message sent: ' + info.response);
//           // res.json({yo: info.response});
//       };
//   });      
// };

// const mailOptions = {
//     to: 'andreslastrat@gmail.com', // sender address
//     from: 'andres_late1008@hotmail.com', // list of receivers
//     subject: 'TEST EMAIL', // Subject line
//     text: "Esta es una gran prueba" //, // plaintext body
//     // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
// };
// const auth= {
//   user: "",
//   pass: ""
// }
// const service = "hotmail";
// const mailer = require('./config/mailer')(service,auth,mailOptions);