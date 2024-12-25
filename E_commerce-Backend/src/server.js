const express = require('express')
const dotenv = require('dotenv')
dotenv.config()
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const axios = require('axios').default; // npm install axios
const CryptoJS = require('crypto-js'); // npm install crypto-js
const moment = require('moment'); // npm install moment

const port = process.env.PORT || 8888
const hostname = process.env.HOSTNAME
//const {conn,sql} = require('/TTTN/E_commerce-Backend/src/connect'); 
app.use(cors());
app.use(express.json());


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const webRoute = require('./route/staff')
const webRouteProduct = require('./route/product')
const webRouteOrder = require('./route/order')
const webRoutePromotion = require('./route/promotion')
const webRouteCloudianry = require('./route/cloudianry')
const webRoutePayment = require('./route/payment')
cloudinary.config({
  cloud_name: 'dsaqn38ky',
  api_key: '837182636239378',
  api_secret: '5jvB0Hkf-PEexwwGHIx2iANJE2M'
});


app.use('/staff',webRoute);
app.use('/product', webRouteProduct);
app.use('/order', webRouteOrder);
app.use('/promotion', webRoutePromotion);
app.use('/cloudinary', webRouteCloudianry);
app.use('/payment', webRoutePayment);



app.listen(port, hostname,  () => {
  console.log(`Example app listening on port ${port}`)
})