const express = require('express')

const multer = require('multer');
const router = express.Router()
const upload = multer(); 
var {connectToDatabase} = require('../connect'); 
const UploadImage = require('../controller/Cloudinarycontroler');
//const UploadImage = require('../controller/CloudinaryControler')


router.post('/upload',upload.array('files'),UploadImage)

module.exports = router;