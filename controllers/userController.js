const { PrismaClient, UserType, UserStatus } = require("@prisma/client")
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
			id: true,
			license: true,
      		location: true,
      		contact: true,
			gender:true,
			status:true,
			cnic:true,
			date_of_birth:true,
			createdAt:true,
			updatedAt:true,
			deletedAt:true

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
			id: true,
			license: true,
      		location: true,
      		contact: true,
			  gender:true,
			  status:true,
			  cnic:true,
			  date_of_birth:true,
			createdAt:true,
			updatedAt:true,
			deletedAt:true
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
			id: true,
			license: true,
      		location: true,
      		contact: true,
			  gender:true,
			  status:true,
			  cnic:true,
			  date_of_birth:true,
			createdAt:true,
			updatedAt:true,
			deletedAt:true
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

const createStaff= async (req,res)=>{
	//role based authentication to be added
	const{name,email,cnic,date_of_birth,contact,gender}=req.body;
	const user = await prisma.users.findFirst({
		where: {
		  email: email,
		},
		select: {
		  email: true,
		},
	  });
	
	  if (user?.email) {
		throw new CustomError.BadRequestError("Email already exists");
	  }
	  const newUser = await prisma.users.create({
		data: {
		  email: email,
		  name: name,
		  type: UserType.STAFF,
		  cnic:cnic,
		  date_of_birth:date_of_birth,
		  contact: contact,
		  gender:gender
		},
	  });
	  res.send({message:"Staff created successfully"}).status(StatusCodes.OK)
}
const changeStatus =async (req,res)=>{
	//role based authentication
	const {id}=req.body;
	const user = await prisma.users.update({
		where: {
		  id: id,
		},
		data:{
		status:UserStatus.ACTIVE //can add a check on cnic to see if its not valid, then block the user
	}
})
	if (!user){
		throw new CustomError.NotFoundError("user of this id is not found")
	}
	res.json({messgae:"User status changed to Active "}).status(StatusCodes.OK)	
	

}

const updateProfile=async(req, res)=>{
	//check whether the person who is logged in is updating their profile
const {id}=req.params;
const{password, contact,email,gender,name}=req.body;
let hashedPassword = await bcrypt.hash(password, 8);
const user=await prisma.users.update({
	where:{
		id:id
	},
	data:{
		password:hashedPassword,
		contact:contact,
		email:email,
		gender:gender,
		name:name
	}
})
if (!user){
	throw new CustomError.NotFoundError("user of this id is not found")
}
res.json({message:"User updated successfully"}).status(StatusCodes.OK)
}
module.exports = {
	getme,
	getUsers,
	getUserById,
	deleteUserById,
	createStaff,
	changeStatus,
	updateProfile
}
