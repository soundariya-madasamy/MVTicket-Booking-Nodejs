const authService = require("../services/authServices");
const register = async (req, res, next) =>{
    try {
        const result = await authService.createUser(req.body);
        res.json({ user_id: result.insertId, message: "Registered Successfully" })
    } catch (err){
        next(err);
    }
}

const login = async (req, res, next) =>{
    const userDetail = req.body;
    try {
        const rows = await authService.loginUser(req.body);
         if(rows.length === 0) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        const matchedUser = rows.find(user => user.password === userDetail.password);
        
        if (!matchedUser) {
            const error = new Error("Invalid credentials");
            error.statusCode = 401;
            throw error;
        }

        res.json({ userDetail: { id: matchedUser.id, name: matchedUser.name, email: matchedUser.email}, 
            message: "Login Successfully" })
    } catch (err){
        next(err);
    }
}

const profile = async (req, res, next) =>{
    try {
        const userID = req.params.id;
        const userDetail = await authService.getUserDetailById(userID);
        if (userDetail.length === 0) {
            return res.status(404).json({ message : "User not found"});
        }
        res.json(userDetail[0])
    } catch(err) {
        next(err);
    } 
}

const getAllUsers = async (req, res, next) =>{
    try {
        const usersList = await authService.getAllUserDetail();
        res.json(usersList)
    } catch(err) {
        next(err);
    }
}

module.exports = { register, login, profile, getAllUsers }