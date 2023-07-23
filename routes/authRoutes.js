const express = require("express");
const router = express.Router();
const {
  registerManufacturerandInstituteValidation,
} = require("../middleware/validation");

const { authenticateUser } = require("../middleware/full-auth");

const {
  register,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

router.post("/register", registerManufacturerandInstituteValidation, register);
router.post("/login", login);
router.post("/forget-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
