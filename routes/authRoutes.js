const express = require("express");
const router = express.Router();
const { registerManufacturerValidation } = require("../middleware/validation");

const { authenticateUser } = require("../middleware/full-auth");

const {
  register,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

router.post("/register", registerManufacturerValidation, register);
router.post("/login", login);
router.post("/forget-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
