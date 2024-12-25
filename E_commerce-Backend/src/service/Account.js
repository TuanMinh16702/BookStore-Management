var {connectToDatabase, pools} = require('../connect'); 
var bodyParser = require('body-parser');
const express = require('express');
const app = express();
const sql = require('mssql');

async function updateAccount2(id, updates) {
    let setString = '';
    const params = [];
  
    Object.keys(updates).forEach((key) => {
      setString += `${key} = @${key}, `;
      params.push({ name: key, value: updates[key] });
    });
  
    setString = setString.slice(0, -2); // Remove the trailing comma and space
  
    const query = `UPDATE tblStaff SET ${setString} WHERE staffID = @staffID`;
  
    try {
      const pool = await connectToDatabase();
      const request = pool.request();

      request.input('staffID', sql.VarChar, id);
      params.forEach(param => {
        request.input(param.name, param.value);
      });
  
      await request.query(query);
      return { message: 'Account updated successfully' };
    } catch (err) {
      console.error('Error updating account:', err);
      throw new Error('Error updating account');
    }
  }
  
  async function getUserByCredentials(name, password) {
    try {
      const pool = await connectToDatabase();
      const query = `SELECT * FROM tblStaff WHERE Name = @Name COLLATE Latin1_General_BIN AND Password = @Password COLLATE Latin1_General_BIN`;
      const result = await pool.request()
        .input('Name', sql.VarChar, name)
        .input('Password', sql.VarChar, password)
        .query(query);
  
      return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }


  module.exports = {
    updateAccount2,getUserByCredentials
  } 