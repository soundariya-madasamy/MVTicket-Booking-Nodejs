const pool = require('../db');

const executeQuery = async (sql, params = []) =>{
    try {
        const [rows] = await pool.query(sql, params); 
        return rows;
    } catch(err) {
        throw err;
    }
}

module.exports = { executeQuery };