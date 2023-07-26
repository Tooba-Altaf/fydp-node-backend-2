const { PrismaClient, UserType, UserStatus } = require("@prisma/client");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const { createJWT } = require("../utils");
const { sendRegisterStaffEmail } = require("../utils");

const prisma = new PrismaClient();

const getme = async (req, res) => {
  const { email } = req.user;

  const user = await prisma.users.findUnique({
    where: {
      email: email,
    },
    select: {
      email: true,
      name: true,
      type: true,
      id: true,
      license: true,
      location: true,
      contact: true,
      gender: true,
      status: true,
      cnic: true,
      date_of_birth: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
  });

  if (!user?.email) {
    throw new CustomError.CustomAPIError(
      "There was a problem finding the user"
    );
  } else {
    res.status(StatusCodes.OK).send({ data: user });
  }
};

const getUsers = async (req, res) => {
  const { type = "INSTITUTE" } = req.body;
  const { limit = 10, page = 1 } = req.query;

  const user = await prisma.users.findMany({
    where: {
      type: type,
    },
    select: {
      email: true,
      name: true,
      type: true,
      id: true,
      license: true,
      location: true,
      contact: true,
      gender: true,
      status: true,
      cnic: true,
      date_of_birth: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
    take: parseInt(limit),
    skip: (parseInt(page) - 1) * parseInt(limit),
  });

  const totalUsers = await prisma.users.count({
    where: {
      type: type,
    },
  });

  res.status(StatusCodes.OK).send({ data: user, count: totalUsers });
};

const getUserById = async (req, res) => {
  const { id } = req.params;

  if (!parseInt(id)) {
    throw new CustomError.BadRequestError("invalid request");
  }

  const user = await prisma.users.findUnique({
    where: {
      id: parseInt(id),
    },
    select: {
      email: true,
      name: true,
      type: true,
      id: true,
      license: true,
      location: true,
      contact: true,
      gender: true,
      status: true,
      cnic: true,
      date_of_birth: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
  });

  if (!user) {
    throw new CustomError.NotFoundError("invalid request");
  }

  res.status(StatusCodes.OK).send({ data: user });
};

const deleteUserById = async (req, res) => {
  const { id } = req.params;

  if (!parseInt(id)) {
    throw new CustomError.BadRequestError("invalid request");
  }

  try {
    const user = await prisma.users.delete({
      where: {
        id: parseInt(id),
      },
    });

    res.status(StatusCodes.OK).send({ message: "User deleted successfully" });
  } catch (error) {
    throw new CustomError.NotFoundError("invalid request");
  }
};

const createStaff = async (req, res) => {
  const { name, email, cnic, date_of_birth, contact, gender } = req.body;
  if (!email || !name || !cnic || !date_of_birth || !contact || !gender) {
    throw new CustomError.BadRequestError("Please provide all required fields");
  }
  const user = await prisma.users.findUnique({
    where: {
      email: email,
    },
    select: {
      email: true,
    },
  });

  if (user?.email) {
    throw new CustomError.BadRequestError("Email already exists", user);
  }
  const newUser = await prisma.users.create({
    data: {
      email: email,
      name: name,
      type: UserType.STAFF,
      cnic: cnic,
      date_of_birth: new Date(date_of_birth),
      contact: contact,
      gender: gender,
    },
  });
  // send email
  const passwordToken = createJWT({ email });
  const origin = "http://localhost:3000";
  const a = await sendRegisterStaffEmail({
    name: name,
    email: email,
    token: passwordToken,
    origin,
  });

  res.status(StatusCodes.OK).send({ message: "Staff created successfully" });
};

const changeStatus = async (req, res) => {
  const { id, status } = req.body;

  if (!id || !status) {
    throw new CustomError.BadRequestError("Please provide all required fields");
  }

  if (!parseInt(id)) {
    throw new CustomError.BadRequestError("invalid request");
  }

  const userExists = await prisma.users.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!userExists) {
    throw new CustomError.NotFoundError("user of this id is not found");
  } else {
    const user = await prisma.users.update({
      where: {
        id: parseInt(id),
      },
      data: {
        status: status,
      },
    });
  }
  res.json({ messgae: "User status changed" }).status(StatusCodes.OK);
};

const updateProfile = async (req, res) => {
  const { email } = req.user;
  const { contact, gender, date_of_birth, location, license } = req.body;
  const updateData = {};
  if (contact) {
    updateData.contact = contact;
  }
  if (gender) {
    updateData.gender = gender;
  }
  if (date_of_birth) {
    updateData.date_of_birth = date_of_birth;
  }
  if (location) {
    updateData.location = location;
  }
  if (license) {
    updateData.license = license;
  }

  try {
    const user = await prisma.users.update({
      where: {
        email: email,
      },
      data: updateData,
    });

    res
      .json({ message: "User updated successfully", user })
      .status(StatusCodes.OK);
  } catch (error) {
    throw new CustomError.CustomAPIError("Failed to delete user");
  }
};

module.exports = {
  getme,
  getUsers,
  getUserById,
  deleteUserById,
  createStaff,
  changeStatus,
  updateProfile,
};
