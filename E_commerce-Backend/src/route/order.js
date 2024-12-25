const express = require('express')
const router = express.Router()
var {connectToDatabase} = require('../connect'); 
const {GetAllOrder, GetAllStatus,GetAllOrderbyId,updateStatusOrder,CreateOrder} = require('../controller/OrderController')


router.get('/getallOrder',  GetAllOrder)
router.get('/getallStatus',  GetAllStatus)
router.get('/getallorderid',  GetAllOrderbyId)
router.post('/createorder',  CreateOrder)
//router.post('/register', CreateAccount)
router.put('/updatestatusorder', updateStatusOrder)
//router.put("/updateproduct", UpdateProduct)
//router.delete('/deleteproduct', deleteProduct)


module.exports = router;