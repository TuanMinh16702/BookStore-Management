var {connectToDatabase} = require('../connect'); 
var bodyParser = require('body-parser');
const express = require('express');
const app = express();
const sql = require('mssql');

const GetAllPromotion = async (req, res) => {
    try{
        const pool = await connectToDatabase();
        const sqlString = 'SELECT  * FROM tblPromotion';
        const result = await pool.request().query(sqlString);
        return res.status(200).json(result.recordset);
      }catch(err){
        console.error('Error fetching data:', err);
        return res.status(500).json(err);
      }
      
}

const GetProductbyId = async (req, res) => {
    try{
        const { promotionID } = req.query;
        

        if (!promotionID) {
            return res.status(400).json({ message: 'orderID is required' });
        }
        const pool = await connectToDatabase();
        const sqlString = `
          SELECT 
            p.Id, 
            p.Name, 
            p.Quantity, 
            p.Description,
            promotion.Datestart, 
            promotion.Dateend, 
            Discount,
            PriceApply = p.Price - (
                            CASE 
                                WHEN GETDATE() BETWEEN promotion.Datestart AND promotion.Dateend
                                THEN promotion.Discount * p.Price 
                                ELSE 0 
                            END
                         ) 
          FROM 
            tblProduct AS p 
          LEFT JOIN 
            tblPrice AS price ON p.Id = price.ID 
          LEFT JOIN 
            tblPromotion AS promotion ON promotion.promotionID = price.promotionID
          WHERE promotion.promotionID = @promotionID
        `;
        const result = await pool.request()
            .input('promotionID', sql.Int, promotionID)
            .query(sqlString);

        return res.status(200).json(result.recordset);
      }catch(err){
        console.error('Error fetching data:', err);
        return res.status(500).json(err);
      }
      
}

const CreatePromotion = async (req, res) => {
  let transaction;
  try {
    const { NamePromotion, staffID, Datestart, Dateend, Discount, list_product,deletePromotion } = req.body;
    
    // Kết nối đến cơ sở dữ liệu
    const pool = await connectToDatabase();

    

    // Bắt đầu giao dịch
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    // Chèn khuyến mãi vào bảng tblPromotion
    const promotionInsertQuery = `
      INSERT INTO tblPromotion (NamePromotion, staffID, Datestart, Dateend, Discount,deletePromotion)
      VALUES (@NamePromotion, 1, @Datestart, @Dateend, @Discount,1);
      SELECT SCOPE_IDENTITY() AS promotionID;
    `;

    const promotionResult = await transaction.request()
      .input('NamePromotion', sql.NVarChar, NamePromotion)
      .input('staffID', sql.Int, staffID)
      .input('Datestart', sql.Date, Datestart)
      .input('Dateend', sql.Date, Dateend)
      .input('Discount', sql.Float, Discount)
      .query(promotionInsertQuery);

    const promotionID = promotionResult.recordset[0].promotionID;

    // Chèn các sản phẩm vào bảng tblProductPromotion (giả sử bạn có bảng này để lưu liên kết giữa sản phẩm và khuyến mãi)
    const productPromotionInsertQuery = `
      INSERT INTO tblPrice (promotionID, ID)
      VALUES (@promotionID, @ID)
    `;

    for (const ID of list_product) {
      await transaction.request()
        .input('promotionID', sql.Int, promotionID)
        .input('ID', sql.VarChar, ID)
        .query(productPromotionInsertQuery);
    }

    // Commit transaction
    await transaction.commit();

    res.status(201).json({ message: 'Promotion and products created successfully' });
  } catch (error) {
    console.error('Error creating promotion and products:', error);

    // Rollback transaction if any error occurs
    if (transaction) {
      await transaction.rollback();
    }

    res.status(500).json({ message: 'Server error', error });
  }
}

const UpdatePromotion = async (req, res) => {
  let transaction;
  try {
    const { promotionID, NamePromotion, Datestart, Dateend, Discount, list_product } = req.body;
    
    

    const pool = await connectToDatabase();
    transaction = new sql.Transaction();
    await transaction.begin();
    console.log("Received ID from frontend:", list_product); 
    console.log("Received promotionID from frontend:", promotionID); 
    // Cập nhật bảng tblPromotion
    const updatePromotionQuery = `
      UPDATE tblPromotion
      SET NamePromotion = @NamePromotion, Datestart = @Datestart, Dateend = @Dateend, Discount = @Discount
      WHERE promotionID = @promotionID
    `;
    await pool.request()
      .input('promotionID', sql.Int, promotionID)
      .input('NamePromotion', sql.NVarChar, NamePromotion)
      .input('Datestart', sql.Date, Datestart)
      .input('Dateend', sql.Date, Dateend)
      .input('Discount', sql.Float, Discount)
      .query(updatePromotionQuery);

    // Xóa các sản phẩm hiện tại liên kết với khuyến mãi
    const deleteProductsQuery = `
      DELETE FROM tblPrice
      WHERE promotionID = @promotionID 
    `;
      await pool.request()
      .input('promotionID', sql.Int, promotionID)
      .query(deleteProductsQuery);

   
    // Thêm lại các sản phẩm mới liên kết với khuyến mãi
    const insertProductQuery = `
      INSERT INTO tblPrice (promotionID, ID)
      VALUES (@promotionID, @ID)
    `;
    for (const ID of list_product) {
      await pool.request()
        .input('promotionID', sql.Int, promotionID)
        .input('ID', sql.VarChar, ID)
        .query(insertProductQuery);
    }
    await transaction.commit();
    res.status(200).json({ message: 'Promotion updated successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating promotion:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const updateStatusPromotion = async (req, res) => {
  const { promotionID} = req.body;

  try {
    const pool = await connectToDatabase();
    await pool
      .request()
      .input("promotionID", sql.Int, promotionID)
      .query(
        "UPDATE tblPromotion SET DeletePromotion = 0 WHERE promotionID = @promotionID"
      );

    return res.status(200).send("Promotion Status updated successfully");
  } catch (err) {
    console.error("Error updating account:", err);
    return res.status(500).send("Error updating account");
  }
};

module.exports = {
    GetAllPromotion,GetProductbyId,CreatePromotion, updateStatusPromotion,UpdatePromotion
} 