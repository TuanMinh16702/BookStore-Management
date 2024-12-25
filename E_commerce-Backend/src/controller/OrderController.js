var {connectToDatabase} = require('../connect'); 
var bodyParser = require('body-parser');
const express = require('express');
const app = express();
const sql = require('mssql');


const GetAllOrder = async (req, res) => {
    try{
        const pool = await connectToDatabase();
        const sqlString = 'SELECT o.orderID, email, address, phone , total, o.IDstatus, o.IDpayment, NameStatus, NamePayment, o.datestart as datestart FROM tblOrder as o join tblStatus as s on o.IDstatus = s.IDstatus join tblPayment as p on p.IDpayment = o.IDpayment';
        const result = await pool.request().query(sqlString);
        res.status(200).json(result.recordset);
      }catch(err){
        console.error('Error fetching data:', err);
        res.status(500).json(err);
      }
      
}

const GetAllOrderbyId = async (req, res) => {
  try {
    const { orderID } = req.query;
    console.log("Received orderID from frontend:", orderID); 

    if (!orderID) {
      return res.status(400).json({ message: 'orderID is required' });
    }

    const pool = await connectToDatabase();
    const sqlString = `
      SELECT 
        p.Id as Id, 
        p.Name as Name, 
        od.Quantity as Quantity,  
        od.Total  as Total
      FROM 
        tblOrderDetail AS od 
      JOIN 
        tblProduct AS p ON od.productID = p.Id 
      WHERE 
        od.orderID = @orderID
    `;

    const result = await pool.request()
      .input('orderID', sql.Int, orderID)
      .query(sqlString);

    return res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching data:', err);
    return res.status(500).json(err);
  }
    
};

const GetAllStatus = async (req, res) => {
  try{
      const pool = await connectToDatabase();
      const sqlString = 'select * from tblStatus';
      const result = await pool.request().query(sqlString);
      res.status(200).json(result.recordset);
    }catch(err){
      console.error('Error fetching data:', err);
      res.status(500).json(err);
    }
    
}

const updateStatusOrder = async (req, res) => {
  const { orderID, IDstatus} = req.body;

  try {
    const pool = await connectToDatabase();
    await pool
      .request()
      .input("orderID", sql.Int, orderID)
      .input("IDstatus", sql.Int, IDstatus)
      .query(
        "UPDATE tblOrder SET IDstatus = @IDstatus WHERE orderID = @orderID"
      );

    res.status(200).send("Account updated successfully");
  } catch (err) {
    console.error("Error updating account:", err);
    res.status(500).send("Error updating account");
  }
};

const CreateOrder = async (req, res) => {
  const { email, address, phone, total ,IDpayment, IDstatus, procs } = req.body;
  let transaction;

  try {
    if (!Array.isArray(procs)) {
      return res.status(400).json({ message: 'procs must be an array' });
    }
    // Kết nối đến cơ sở dữ liệu
    pool = await connectToDatabase();
    transaction = new sql.Transaction(pool);

    await transaction.begin();

    // Chèn thông tin đơn hàng vào bảng tblOrder
    const orderRequest = new sql.Request(transaction);
      orderRequest.input('email', sql.NVarChar, email)
      .input('address', sql.NVarChar, address)
      .input('phone', sql.NVarChar, phone)
      .input('total', sql.Float, total)
      .input('IDstatus', sql.Int, IDstatus)
      .input('IDpayment', sql.Int, IDpayment);
    
    

    const orderInsertResult = await orderRequest.query(`
      INSERT INTO tblOrder (email, address, phone, total ,IDstatus, IDpayment, datestart)
      VALUES (@email, @address, @phone, @total ,@IDstatus, @IDpayment, GETDATE());
      SELECT SCOPE_IDENTITY() AS orderID;
    `);

    const orderID = orderInsertResult.recordset[0].orderID;

    const OrderDetalInsertQuery = `
      INSERT INTO tblOrderDetail (orderID, productID, Quantity, Total)
        VALUES (@orderID, @productID, @Quantity, @Total);
    `;

    // Chèn chi tiết đơn hàng vào bảng tblOrderDetail
    const detailRequest = new sql.Request(transaction);
    for (const rem of procs) {
      await transaction.request()
        .input('orderID', sql.Int, orderID)
        .input('productID', sql.VarChar, rem.Id)
        .input('Quantity', sql.Int, rem.Quantity)
        .input('Total', sql.Float, rem.PriceApply * rem.Quantity)
        .query(OrderDetalInsertQuery);;

        const productUpdateQuery = `
        UPDATE tblProduct
        SET Quantity = Quantity - @Quantity
        WHERE Id = @productID;
      `;

      const productUpdateRequest = new sql.Request(transaction);
      await productUpdateRequest.input('productID', sql.VarChar, rem.Id)
        .input('Quantity', sql.Int, rem.Quantity)
        .query(productUpdateQuery);
    }

    await transaction.commit();
    res.status(201).json({ message: 'Order created successfully', orderID });
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};


module.exports = {
  GetAllOrder,GetAllStatus,GetAllOrderbyId,updateStatusOrder,CreateOrder
} 
