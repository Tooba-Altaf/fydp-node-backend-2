const { PrismaClient } = require("@prisma/client")
const { StatusCodes } = require("http-status-codes")
const CustomError = require("../errors")

const prisma = new PrismaClient()

const getme = async (req, res) => {
	const { email } = req.user

	const user = await prisma.users.findFirst({
		where: {
			email: email
		},
		select: {
			email: true,
			name: true,
			type: true,
			id: true
		}
	})

	if (!user?.email) {
		throw new CustomError.CustomAPIError("There was a problem finding the user")
	} else {
		res.status(StatusCodes.OK).send({ data: user })
	}
}

const getUsers = async (req, res) => {
	const { type = "INSTITUTE" } = req.body
	const { limit = 10, page = 1 } = req.query

	const user = await prisma.users.findMany({
		where: {
			type: type
		},
		select: {
			email: true,
			name: true,
			type: true,
			id: true
		},
		take: parseInt(limit),
		skip: (parseInt(page) - 1) * parseInt(limit)
	})

	const totalUsers = await prisma.users.count({
		where: {
			type: type
		}
	})

	res.status(StatusCodes.OK).send({ data: user, count: totalUsers })
}
const getUserById = async (req, res) => {
	const { id } = req.params

	if (!parseInt(id)) {
		throw new CustomError.NotFoundError("invalid request")
	}

	const user = await prisma.users.findUnique({
		where: {
			id: parseInt(id)
		},
		select: {
			email: true,
			name: true,
			type: true,
			id: true
		}
	})

	if (!user) {
		throw new CustomError.NotFoundError("invalid request")
	}

	res.status(StatusCodes.OK).send({ data: user })
}

const deleteUserById = async (req, res) => {
	const { id } = req.params
	if (!parseInt(id)) {
		return res
			.status(StatusCodes.BAD_REQUEST)
			.send({ error: "invalid values for id" })
	}
	

	try {
		const user = await prisma.users.delete({
			where: {
				id: parseInt(id)
			}
		})

		res.status(StatusCodes.OK).send({ message: "User deleted successfully" })
	} catch (error) {
		res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.send({ error: "Failed to delete user" })
	}
}

module.exports = {
	getme,
	getUsers,
	getUserById,
	deleteUserById
}
