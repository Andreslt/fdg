'use strict';

if (process.env.NODE_ENV === 'production'){
    // Offer Production stage environment variables
    module.exports = {
        host: process.env.host || "",
        dbURI: process.env.dbURI,
        jsReportURI: process.env.jsReportURI,
        jsReportUser: process.env.jsReportUser,
        jsReportPassword: process.env.jsReportPassword,
    }
}else{
    // Offer Development stage settings and data
    module.exports = require('./devEnv.json');
}