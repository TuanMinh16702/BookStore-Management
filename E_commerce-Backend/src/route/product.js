const express = require('express')
const router = express.Router()
var {connectToDatabase} = require('../connect'); 
const app = express();
const {GetAllProduct,CreateProduct, generateId, UpdateProduct, deleteProduct,GetProductbyId,statistic,GetTypeProduct,searchProduct} = require('../controller/ProductController')

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
router.get('/getall',  GetAllProduct)
router.post('/createproduct',  CreateProduct)
router.get('/getproductbyid', GetProductbyId)
router.get('/getproductbytype', GetTypeProduct)
router.get('/statistic', statistic)
router.get('/searchProduct', searchProduct)
router.put("/updateproduct", UpdateProduct)
router.put('/deleteproduct', deleteProduct)


module.exports = router;