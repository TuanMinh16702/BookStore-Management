const express = require('express')
const router = express.Router()
var {connectToDatabase} = require('../connect'); 
const {GetAllPromotion,GetProductbyId, CreatePromotion,updateStatusPromotion,UpdatePromotion} = require('../controller/PromotionController')


router.get('/getallpromotion',  GetAllPromotion)
//router.get('/getallStatus',  GetAllStatus)
router.get('/getallpromotionid',  GetProductbyId)
router.post('/createpromotion',  CreatePromotion)
router.post('/deletepromotion', updateStatusPromotion)
router.put('/updatepromotion', UpdatePromotion)
//router.put("/updateproduct", UpdateProduct)
//router.delete('/deleteproduct', deleteProduct)


module.exports = router;