const query = require('../utils/errorHandler');

const createUser = async(userDetail) =>{
    const { name, email, password } = userDetail;

    return await query.executeQuery("INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?)", 
        [name, email, password, "registered", new Date()]);
}

const loginUser = async (userDetail) =>{
    const { name } = userDetail;
    return await query.executeQuery("SELECT * FROM users WHERE name = ?", [name]);
}

const getUserDetailById = async (userId) =>{
    return await query.executeQuery("SELECT * FROM users WHERE user_id = ?", [userId]);
}

const getAllUserDetail = async () =>{
    return await query.executeQuery("SELECT * FROM users");
}

module.exports = { createUser, loginUser, getUserDetailById, getAllUserDetail }