const express = require('express')
const router = express.Router()
var {connectToDatabase} = require('../connect'); 
const app = express();
const {CreatePayment,CallBack} = require('../controller/paymentController')
const axios = require('axios').default; // npm install axios
const CryptoJS = require('crypto-js'); // npm install crypto-js
const moment = require('moment'); // npm install moment

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

router.post('/createpayment',  CreatePayment)
router.post('/callback',  CallBack)
//router.get('/getproductbytype', GetTypeProduct)
//router.get('/statistic', statistic)
//router.get('/searchProduct', searchProduct)
//router.put("/updateproduct", UpdateProduct)
//router.put('/deleteproduct', deleteProduct)


module.exports = router;