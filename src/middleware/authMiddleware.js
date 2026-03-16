require('dotenv').config({ path: './.env' });
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET; // same secret you used in auth.js

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log('authHeader->', authHeader);
  console.log('token->', token);
  console.log('verify->', jwt.verify(token, SECRET));
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = authMiddleware;
