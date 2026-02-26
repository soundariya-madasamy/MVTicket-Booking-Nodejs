const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const users = []; // mock user store
const SECRET = "mysecretkey";

// Register
router.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: "User already exists" });
  }
  users.push({ username, password });
  res.json({ message: "Registered successfully" });
});

// Login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ username }, SECRET, { expiresIn: "1h" });
  
  res.json({ token,username });
});

// Profile (protected)
router.get("/profile", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    res.json({ user: decoded.username });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = { router, users };