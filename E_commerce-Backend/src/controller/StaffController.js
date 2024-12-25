var {connectToDatabase, pools} = require('../connect'); 
var bodyParser = require('body-parser');
const express = require('express');
const app = express();
const sql = require('mssql');
const backHome = (req, res) => {
    return res.render('../views/homepage.ejs')
}
var {updateAccount2, getUserByCredentials} = require('../service/Account');
//staff
const GetAllStaff = async (req, res) => {
    try{
        const pool = await connectToDatabase();
        const sqlString = 'SELECT staffID, Name as Username, Password, Role, PhoneNumber, Dateofbirth, Status FROM tblStaff';
        const result = await pool.request().query(sqlString);
        res.status(200).json(result.recordset);
      }catch(err){
        console.error('Error fetching data:', err);
        res.status(500).json(err);
      }
      
}

const CreateAccount = async (req, res) => {
  try {
    
    const { staffID,  Name, Password, Role, PhoneNumber, Dateofbirth, Status } = req.body;

   
    // Connect to SQL Server
    
    const pool = await connectToDatabase();

    const result = await pool.request().query('SELECT MAX(CAST(staffID AS INT)) AS maxId FROM tblStaff') ;
    const maxId = result.recordset[0].maxId || 0;
    const newId = parseInt(maxId, 10) + 1;
    
    //const sqlString = 'INSERT INTO tblStaff (staffID, Name, Password, Role, PhoneNumber, Dateofbirth, Status) VALUES (?,?,?,?,?,?,?)';
    //await pool.query(sqlString, [staffID, Name, Password, Role, Phone, birthDate, Status],function (err,data){
        //res.status(201).json({ message: 'User created successfully'});
    //});
    // Get current max ID and increment by 1
    
    const sqlString = 'INSERT INTO tblStaff (staffID, Name, Password, Role, PhoneNumber, Dateofbirth, Status) VALUES (@staffID, @Name, @Password, @Role, @PhoneNumber, @Dateofbirth, @Status)';
    await pool.request()
      .input('staffID', sql.VarChar, newId.toString())
      .input('Name', sql.VarChar, Name)
      .input('Password', sql.VarChar, Password)
      .input('Role', sql.VarChar, Role)
      .input('PhoneNumber', sql.VarChar, PhoneNumber)
      .input('Dateofbirth', sql.VarChar, Dateofbirth)
      .input('Status', sql.Bit, Status)
      .query(sqlString);
    // Insert new user
    //await sql.query`INSERT INTO tblStaff (staffID, Name, Password, Role, Phone, Date-of-birth, Status) VALUES (${newId}, ${Name}, ${Password}, ${role}, ${phone}, ${birthDate}, ${Status})`;
    res.status(201).json({ message: 'User created successfully', userId: newId});
    // Close SQL Server connection
    //await sql.close();

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error', error });
  }
}

const updateAccount = async (req, res) => {
  const { staffID, Name, Password, Role, PhoneNumber, Dateofbirth, Status } = req.body;

  try {
    const pool = await connectToDatabase();
    await pool
      .request()
      .input("staffID", sql.VarChar, staffID)
      .input("Name", sql.VarChar, Name)
      .input("Password", sql.VarChar, Password)
      .input("Role", sql.VarChar, Role)
      .input("PhoneNumber", sql.VarChar, PhoneNumber)
      .input("Dateofbirth", sql.VarChar, Dateofbirth)
      .input("Status", sql.Bit, Status)
      .query(
        "UPDATE tblStaff SET Name = @Name, Password = @Password, Role = @Role, PhoneNumber = @PhoneNumber, Dateofbirth = @Dateofbirth, Status = @Status WHERE staffID = @staffID"
      );

    res.status(200).send("Account updated successfully");
  } catch (err) {
    console.error("Error updating account:", err);
    res.status(500).send("Error updating account");
  }
};

async function updateAccountController(req, res) {
  const {id} = req.body;
  const updates = req.body;
  delete updates.id;

  if (!id) {
    return res.status(400).json({ message: 'ID is required' });
  }

  try {
    const result = await updateAccount2(id, updates);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function GetUserPassword(req, res) {
  try {
    const { Name, Password } = req.query;
    const user = await getUserByCredentials(Name, Password);

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(401).json({ message: 'Tài khoản hoặc mật khẩu sai' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

const UpdateAccount = async (req, res) => {
  try {
    const { staffID, Name, Password, Role, PhoneNumber, Dateofbirth, Status } = req.body;

    if (!staffID) {
      return res.status(400).json({ message: 'ID is required' });
    }

    // Connect to SQL Server
    const pool = await connectToDatabase();

    // Prepare the fields and values for update
    const updates = [];

    if (Name) {
      updates.push(`Name = '${Name}'`);
    }
    if (Password) {
      updates.push(`Password = '${Password}'`);
    }
    if (Role) {
      updates.push(`Role = '${Role}'`);
    }
    if (PhoneNumber) {
      updates.push(`PhoneNumber = '${PhoneNumber}'`);
    }
    if (Dateofbirth) {
      updates.push(`Dateofbirth = '${Dateofbirth}'`);
    }
    if (Status) {
      updates.push(`Status = '${Status}'`);
    }



    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    // Generate SQL query dynamically
    const sqlString = `UPDATE tblStaff SET ${updates.join(', ')} WHERE staffID = @staffID`;

    // Execute SQL query
    await pool.request()
      .input('staffID', sql.VarChar, staffID)
      .query(sqlString);

    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = {
    GetAllStaff, backHome, CreateAccount,updateAccountController, UpdateAccount, GetUserPassword, updateAccount
} 