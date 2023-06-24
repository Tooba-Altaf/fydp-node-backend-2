const { sign, verify } = require("jsonwebtoken")
const dotenv = require("dotenv")

const createJWT = (payload) => {
	const token = sign(payload, process.env.JWT_SECRET)
	return token
}

const isTokenValid = (token) => verify(token, process.env.JWT_SECRET)

module.exports = {
	createJWT,
	isTokenValid
}
