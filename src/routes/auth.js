const express = require("express");
const router = express.Router();
const authCntrl = require("../controllers/authControllers");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", authCntrl.register);
router.post("/login", authCntrl.login);
router.get("/profile/:id", authMiddleware, authCntrl.profile);
router.get("/allusers", authMiddleware, authCntrl.getAllUsers);

module.exports = router;