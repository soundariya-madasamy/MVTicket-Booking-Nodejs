// db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Aspire@123',
  database: 'movie_booking'
});

module.exports = pool;
