var cloudinary = require('cloudinary');
var multerCloudinary = require('multer-cloudinary');

module.exports.cloudConfig = cloudinary.config({ 
  cloud_name: 'pluriza', 
  api_key: '194971666456459', 
  api_secret: 'CQq5NuANVAJDCu1LvcYMCWHKCss' 
});

module.exports.uploadFile = function (originPath, destinationPath) {
    cloudinary.uploader.upload(originPath, result => { 
    }, {
        public_id: destinationPath
    });
}