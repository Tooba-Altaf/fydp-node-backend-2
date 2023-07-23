const express = require("express")
const router = express.Router()
const{registerManufacturerandInstituteValidation,loginValidation}=require("../middleware/validation")

const { authenticateUser } = require("../middleware/full-auth")

const {
	register,
	login,
	forgotPassword
} = require("../controllers/authController")

router.post("/register",registerManufacturerandInstituteValidation, register)
router.post("/login",loginValidation, login)
router.post("/forget-password", forgotPassword)

module.exports = router
