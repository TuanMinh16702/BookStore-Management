var sql = require('mssql/msnodesqlv8');

var config = {
    server: "LAPTOP-E0FD0UKT\\MSSQLSERVER01",
    user: "sa",
    password: "123",
    database: "BookStoreManagement",
    options: {
        encrypt: false, // for Azure
        enableArithAbort: false,
      }
    
}

let pool;

async function connectToDatabase() {
  if (!pool) {
    try {
      pool = await sql.connect(config);
      console.log('Connected to the database');
    } catch (err) {
      console.error('Database connection failed:', err);
      throw err;
    }
  }
  return pool;
}

module.exports = {
  connectToDatabase
};