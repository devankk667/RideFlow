const mysql = require('mysql2');

// Create a connection pool to the MySQL container
const pool = mysql.createPool({
  host: 'localhost', // or 'db' if connecting within Docker network
  user: 'user',
  password: 'userpassword',
  database: 'rideshare_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
