const express = require("express")
const router = express.Router()

const { authenticateUser } = require("../middleware/full-auth")

const {
	register,
	login,
	forgotPassword
} = require("../controllers/authController")

router.post("/register", register)
router.post("/login", login)
router.post("/forget-password", forgotPassword)

module.exports = router
