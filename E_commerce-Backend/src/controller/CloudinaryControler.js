var {connectToDatabase} = require('../connect'); 
var bodyParser = require('body-parser');
const express = require('express');
const app = express();
const sql = require('mssql');
const loudinaryService = require('../service/cloudinary')



const UploadImage =  async (req, res) => {
  try {
    const files = req.files; // Array of uploaded files
    const result = await CloudinaryService.uploadImages(files);
    res.json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports =  UploadImage