const express = require("express")
const router = express.Router()

const { authenticateUser } = require("../middleware/full-auth")

const {
	register,
	login,
	getme,
	forgotPassword
} = require("../controllers/authController")

router.post("/register", register)
router.post("/login", login)
router.get("/getme", authenticateUser, getme)
router.post("/forget-pasword", forgotPassword)

module.exports = router
