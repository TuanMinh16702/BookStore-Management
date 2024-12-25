const express = require('express')
const router = express.Router()
var {connectToDatabase} = require('../connect'); 
const {GetAllStaff,backHome, CreateAccount, UpdateAccount, updateAccountController, GetUserPassword, updateAccount} = require('../controller/StaffController')


router.get('/getall',  GetAllStaff)
router.get('/getuserPass',  GetUserPassword)
router.post('/register', CreateAccount)
//router.put('/update', updateAccountController)
router.put("/updateaccount", UpdateAccount)
//router.get('/home', backHome)
module.exports = router;