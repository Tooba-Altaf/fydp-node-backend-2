const dotenv = require("dotenv")
dotenv.config({ path: "./.env" })

module.exports = {
	// host: "smtp.ethereal.email",
	service: "gmail",
	port: 587,
	secure: false,
	auth: {
		user: process.env.SMTP_MAIL,
		pass: process.env.SMTP_PASSWORD
	}
}
