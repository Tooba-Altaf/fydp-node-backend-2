const CustomError = require("../errors")
const { isTokenValid } = require("../utils/jwt")

const authenticateUser = async (req, res, next) => {
	let token
	// check header
	const authHeader = req.headers.authorization
	if (authHeader) {
		token = authHeader
	}
	// check cookies
	else if (req.cookies.token) {
		token = req.cookies.token
	}

	if (!token) {
		throw new CustomError.UnauthenticatedError("Authentication invalid")
	}
	try {
		const payload = isTokenValid(token)

		// Attach the user to the req object
		req.user = {
			email: payload.email
		}

		next()
	} catch (error) {
		throw new CustomError.UnauthenticatedError("Authentication invalid")
	}
}

const authorizeRoles = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			throw new CustomError.UnauthorizedError(
				"Unauthorized to access this route"
			)
		}
		next()
	}
}

module.exports = { authenticateUser, authorizeRoles }
