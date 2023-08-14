const express = require("express");
const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controllers/authController");

const { authenticateUser } = require("../middleware/full-auth");

router.post("/register", register);
router.post("/login", login);
router.post("/forget-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", authenticateUser, changePassword);

module.exports = router;
