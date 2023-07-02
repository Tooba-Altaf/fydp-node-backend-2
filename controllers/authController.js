const { PrismaClient } = require("@prisma/client")
const { StatusCodes } = require("http-status-codes")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")

const {
	sendVerificationEmail,
	sendResetPasswordEmail,
	createHash
} = require("../utils")
const { createJWT } = require("../utils")
const CustomError = require("../errors")

const prisma = new PrismaClient()

const register = async (req, res) => {
	const { email, password, name, type } = req.body

	const user = await prisma.users.findFirst({
		where: {
			email: email
		},
		select: {
			email: true
		}
	})

	if (user?.email) {
		throw new CustomError.BadRequestError("Email already exists")
	}
	let hashedPassword = await bcrypt.hash(password, 8)

	await prisma.users.create({
		data: {
			email: email,
			password: hashedPassword,
			name: name,
			type: type
		}
	})

	const accessToken = createJWT({ email })
	res.status(StatusCodes.OK).send({ token: accessToken })
}

const login = async (req, res) => {
	const { email, password } = req.body

	if (!email || !password) {
		throw new CustomError.BadRequestError("Please provide email and password")
	}

	const user = await prisma.users.findFirst({
		where: {
			email: email
		},
		select: {
			email: true,
			password: true
		}
	})

	if (!user?.email) {
		throw new CustomError.UnauthenticatedError("Invalid Credentials")
	}
	const isPasswordCorrect = await bcrypt.compare(password, user?.password)

	if (!isPasswordCorrect) {
		throw new CustomError.UnauthenticatedError("Invalid Credentials")
	}
	// if (!user.isVerified) {
	// 	throw new CustomError.UnauthenticatedError("Please verify your email")
	// }
	const accessToken = createJWT({ email })
	res.status(StatusCodes.OK).send({ token: accessToken })
}

const forgotPassword = async (req, res) => {
	const { email } = req.body
	if (!email) {
		throw new CustomError.BadRequestError("Please provide valid email")
	}

	const user = await prisma.users.findFirst({
		where: {
			email: email
		},
		select: {
			email: true,
			name: true
		}
	})

	if (user?.email) {
		const passwordToken = crypto.randomBytes(70).toString("hex")
		// send email
		const origin = "http://localhost:3000"
		const a = await sendResetPasswordEmail({
			name: user?.name,
			email: user?.email,
			token: passwordToken,
			origin
		})

		const tenMinutes = 1000 * 60 * 10
		const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes)

		// user.passwordToken = createHash(passwordToken)
		// user.passwordTokenExpirationDate = passwordTokenExpirationDate
		// await user.save()
	}

	res
		.status(StatusCodes.OK)
		.json({ msg: "Please check your email for reset password link" })
}
const resetPassword = async (req, res) => {
	const { token, email, password } = req.body
	if (!token || !email || !password) {
		throw new CustomError.BadRequestError("Please provide all values")
	}
	const user = await prisma.users.findFirst({
		where: {
			email: email
		},
		select: {
			email: true
		}
	})

	if (user) {
		const currentDate = new Date()

		if (
			user.passwordToken === createHash(token) &&
			user.passwordTokenExpirationDate > currentDate
		) {
			user.password = password
			user.passwordToken = null
			user.passwordTokenExpirationDate = null
			await user.save()
		}
	}
	res.status(StatusCodes.OK).send("reset password")
}

module.exports = {
	register,
	login,
	forgotPassword,
	resetPassword
}
