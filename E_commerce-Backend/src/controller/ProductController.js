  var {connectToDatabase} = require('../connect'); 
  var bodyParser = require('body-parser');
  const express = require('express');
  const app = express();
  const sql = require('mssql');




const GetAllProduct = async (req, res) => {
    try{
        const pool = await connectToDatabase();
        const sqlString = '';
        const result = await pool.request().query(`
          SELECT 
            p.Id, 
            p.Name, 
            p.Quantity, 
            p.Description,
            p.Image,
            Price,
            PriceApply = p.Price - (
                            CASE 
                                WHEN (GETDATE() BETWEEN price.Datestart AND price.Dateend ) AND (deletePromotion = 1)
                                THEN price.Discount * p.Price 
                                ELSE 0 
								

                            END
                         ) 
          FROM 
            tblProduct AS p 
          LEFT JOIN 
            (select pr.Dateend, pr.Datestart, pr.Discount, pr.deletePromotion, p.ID, p.promotionID 
			from tblPrice as p join tblPromotion as pr 
			on pr.promotionID = p.promotionID
			where GETDATE() BETWEEN pr.Datestart AND pr.Dateend) AS price 
		ON p.Id = price.ID 
			where deleteProduct = 1 
        `);
        res.status(200).json(result.recordset);
      }catch(err){
        console.error('Error fetching data:', err);
        res.status(500).json(err);
      }
      
}

const searchProduct = async (req, res) => {
  const Name = req.query.Name; // Lấy từ khóa tìm kiếm từ query string
  console.log(Name);
  if (!Name) {
    return res.status(400).json({ message: 'name query parameter is required' });
  }

  let pool;

  try {
    // Kết nối đến cơ sở dữ liệu
    pool = await connectToDatabase();

    const sqlString = `
      SELECT 
            p.Id, 
            p.Name, 
            p.Quantity, 
            p.Description,
            Price,
            Image,
            PriceApply = p.Price - (
                            CASE 
                                WHEN (GETDATE() BETWEEN price.Datestart AND price.Dateend ) AND (deletePromotion = 1)
                                THEN price.Discount * p.Price 
                                ELSE 0 
								

                            END
                         ) 
          FROM 
            tblProduct AS p 
          LEFT JOIN 
            (select pr.Dateend, pr.Datestart, pr.Discount, pr.deletePromotion, p.ID, p.promotionID 
			from tblPrice as p join tblPromotion as pr 
			on pr.promotionID = p.promotionID
			where GETDATE() BETWEEN pr.Datestart AND pr.Dateend) AS price 
		ON p.Id = price.ID 
			where deleteProduct = 1 AND Name  LIKE '%' + @Name + '%'
    `;
    const result = await pool.request()
      .input('Name', sql.NVarChar, Name)
      .query(sqlString);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error searching for product:', error);
    res.status(500).json({ message: 'Server error', error });
  }
}

const GetTypeProduct = async (req, res) => {
  try{
      const {type_ID} = req.query
      const pool = await connectToDatabase();
      
      const sqlString =`
        SELECT 
          p.Id, 
          p.Name, 
          p.Quantity, 
          p.Description,
          Price,
          Image,
          PriceApply = p.Price - (
                          CASE 
                              WHEN (GETDATE() BETWEEN price.Datestart AND price.Dateend ) AND (deletePromotion = 1)
                              THEN price.Discount * p.Price 
                              ELSE 0 
              

                          END
                       ) 
        FROM 
          tblProduct AS p 
        LEFT JOIN 
          (select pr.Dateend, pr.Datestart, pr.Discount, pr.deletePromotion, p.ID, p.promotionID 
    from tblPrice as p join tblPromotion as pr 
    on pr.promotionID = p.promotionID
    where GETDATE() BETWEEN pr.Datestart AND pr.Dateend) AS price 
  ON p.Id = price.ID 
    where deleteProduct = 1 and type_ID = @type_ID
      `;
      const result = await pool.request()
      .input('type_ID', sql.VarChar, type_ID)
      .query(sqlString);
      res.status(200).json(result.recordset);
    }catch(err){
      console.error('Error fetching data:', err);
      res.status(500).json(err);
    }
    
}


const generateId = async (type_id) => {
  try {
    const request = new sql.Request();
    const result = await request
      .input('type_ID', sql.VarChar, type_id)
      .query(
        `SELECT concat(@type_ID, '_', COUNT(*) + 1) AS newId 
         FROM tblProduct 
         WHERE type_ID = @type_id 
         GROUP BY type_ID`
      );

    //const count = result.recordset[0].count;
    return result.recordset[0].newId;
  } catch (error) {
    console.error('Error generating Id:', error);
  }
};



const CreateProduct = async (req, res) => {
  try {
   
    
    const {  Name,  type_ID, reviewID, Description, Image,  Quantity, Price  } = req.body;
    //const Image = req.file ? `http://localhost:3000/public/image/${req.file.filename}` : null;
    //console.log(Image);
    // Connect to SQL Server
   
    const pool = await connectToDatabase();
    
    Id = await generateId(type_ID);
    const request = new sql.Request();
    
    //const sqlString = 'INSERT INTO tblStaff (staffID, Name, Password, Role, PhoneNumber, Dateofbirth, Status) VALUES (?,?,?,?,?,?,?)';
    //await pool.query(sqlString, [staffID, Name, Password, Role, Phone, birthDate, Status],function (err,data){
        //res.status(201).json({ message: 'User created successfully'});
    //});
    // Get current max ID and increment by 1
    
    const sqlString = 'INSERT INTO tblProduct (Id,  Name,  type_ID, reviewID, Description, Image, Quantity, Price, deleteProduct ) VALUES (@Id,  @Name,  @type_ID, @reviewID, @Description, @Image, @Quantity, @Price, 1 )';
    await pool.request()
      .input('Id', sql.VarChar, Id.toString())
      .input('Name', sql.NVarChar, Name)
      .input('type_ID', sql.VarChar, type_ID)
      .input('reviewID', sql.Int, reviewID)
      .input('Description', sql.NVarChar, Description)
      .input('Image', sql.VarChar, Image)
      .input('Quantity', sql.Int, Quantity)
      .input('Price', sql.Float, Price)
      .query(sqlString);
    // Insert new user
    //await sql.query`INSERT INTO tblStaff (staffID, Name, Password, Role, Phone, Date-of-birth, Status) VALUES (${newId}, ${Name}, ${Password}, ${role}, ${phone}, ${birthDate}, ${Status})`;
    res.status(201).json({ message: 'Product created successfully', ProdcutId: Id});
    // Close SQL Server connection
    //await sql.close();

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error', error });
  }
}

const UpdateProduct = async (req, res) => {
  try {
    const { Id, Name, type_ID, reviewID, Description, Image, Quantity, Price } = req.body;

    if (!Id) {
      return res.status(400).json({ message: 'ID is required' });
    }

    // Connect to SQL Server
    const pool = await connectToDatabase();

    // Prepare the fields and values for update
    const updates = [];

    if (Name) {
      updates.push(`Name = N'${Name}'`);
    }
    if (type_ID) {
      updates.push(`type_ID = '${type_ID}'`);
    }
    if (reviewID) {
      updates.push(`reviewID = '${reviewID}'`);
    }
    if (Description) {
      updates.push(`Description = '${Description}'`);
    }
    if (Image) {
      updates.push(`Image = '${Image}'`);
    }
    if (Quantity) {
      updates.push(`Quantity = '${Quantity}'`);
    }
    if (Price) {
      updates.push(`Price = '${Price}'`);
    }
   


    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    // Generate SQL query dynamically
    const sqlString = `UPDATE tblProduct SET ${updates.join(', ')} WHERE Id = @Id`;

    // Execute SQL query
    await pool.request()
      .input('Id', sql.VarChar, Id)
      .query(sqlString);

    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};


const deleteProduct = async (req, res) => {

  try {
    const {Id}  = req.query;

    if (!Id) {
      return res.status(400).json({ message: 'ID is required' });
    }

    // Connect to SQL Server
    const pool = await connectToDatabase();

    // Prepare the fields and values for update
   


    // Generate SQL query dynamically
    const sqlString = `UPDATE tblProduct SET deleteProduct = 0 WHERE Id = @Id`;

    // Execute SQL query
    await pool.request()
      .input('Id', sql.VarChar, Id)
      .query(sqlString);

    res.status(200).json({ message: 'Product delete successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const GetProductbyId = async (req, res) => {
  try{
      const {Id} = req.query
      if (!Id) {
        return res.status(400).json({ message: 'Id is required' });
      }
  
      const pool = await connectToDatabase();
      
      const sqlString = `
        SELECT 
            p.Id, 
            p.Name, 
            p.Quantity, 
            p.Description,
            Price,
            Image,
            PriceApply = p.Price - (
                            CASE 
                                WHEN (GETDATE() BETWEEN price.Datestart AND price.Dateend ) AND (deletePromotion = 1)
                                THEN price.Discount * p.Price 
                                ELSE 0 
								

                            END
                         ) 
          FROM 
            tblProduct AS p 
          LEFT JOIN 
            (select pr.Dateend, pr.Datestart, pr.Discount, pr.deletePromotion, p.ID, p.promotionID 
			from tblPrice as p join tblPromotion as pr 
			on pr.promotionID = p.promotionID
			where GETDATE() BETWEEN pr.Datestart AND pr.Dateend) AS price 
		ON p.Id = price.ID 
			where deleteProduct = 1 AND p.Id = @Id
      `;
      
      const result = await pool.request()
      .input('ID', sql.VarChar, Id)
      .query(sqlString);

      return res.status(200).json(result.recordset);
    }catch(err){
      console.error('Error fetching data:', err);
      return res.status(500).json(err);
    }
    
}

const statistic = async (req, res) => {
  try {
    const { yearselect, mode, date } = req.query;

    if (!mode || (mode !== 'month' && mode !== 'day')) {
      return res.status(400).json({ message: 'Valid mode query parameter is required (month or day)' });
    }

    //const year = parseInt(yearselect, 10);

    

    const pool = await connectToDatabase();


    let sqlString;
    let result;

    if (mode === 'month') {
      if (!yearselect || isNaN(yearselect)) {
        return res.status(400).json({ message: 'Valid year query parameter is required' });
      }

      sqlString = `
        ;WITH Months AS (
            SELECT 1 AS Month
            UNION ALL SELECT 2
            UNION ALL SELECT 3
            UNION ALL SELECT 4
            UNION ALL SELECT 5
            UNION ALL SELECT 6
            UNION ALL SELECT 7
            UNION ALL SELECT 8
            UNION ALL SELECT 9
            UNION ALL SELECT 10
            UNION ALL SELECT 11
            UNION ALL SELECT 12
        )
        SELECT 
            m.Month,
            ISNULL(SUM(o.total), 0) AS revenue
        FROM 
            Months m
        LEFT JOIN 
            tblOrder o
        ON 
            MONTH(o.datestart) = m.Month
            AND YEAR(o.datestart) = @yearselect
        GROUP BY 
            m.Month
        ORDER BY 
            m.Month
      `;

      result = await pool.request()
        .input('yearselect', sql.Int, yearselect)
        .query(sqlString);

    } else if (mode === 'day') {
      if (!date) {
        return res.status(400).json({ message: 'Valid date query parameter is required' });
      }

      sqlString = `
        SELECT 
            DAY(o.datestart) AS Day,
            ISNULL(SUM(o.total), 0) AS revenue
        FROM 
            tblOrder o
        WHERE 
            CONVERT(date, o.datestart) = @date
        GROUP BY 
            DAY(o.datestart)
        ORDER BY 
            DAY(o.datestart)
      `;

      result = await pool.request()
        .input('date', sql.Date, date)
        .query(sqlString);
    }

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching monthly revenue:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
    
}

module.exports = {
    GetAllProduct, CreateProduct, generateId, UpdateProduct, deleteProduct,GetProductbyId,statistic,GetTypeProduct, searchProduct
} 