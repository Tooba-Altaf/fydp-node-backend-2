const { PrismaClient, UserStatus } = require("@prisma/client");
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");

const { createJWT, createTempJWT, isTokenValid } = require("../utils");
const CustomError = require("../errors");

const prisma = new PrismaClient();

const register = async (req, res) => {
  const { email, password, name, type, license, location, contact } = req.body;

  if (
    !email ||
    !password ||
    !name ||
    !type ||
    !license ||
    !location ||
    !contact
  ) {
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
    throw new CustomError.BadRequestError("Email already exists");
  }
  let hashedPassword = await bcrypt.hash(password, 8);

  const newUser = await prisma.users.create({
    data: {
      email: email,
      password: hashedPassword,
      name: name,
      type: type,
      license: license,
      location: location,
      contact: contact,
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

  const accessToken = createJWT({ email, type, id: newUser?.id });
  res.status(StatusCodes.CREATED).send({ token: accessToken, user: newUser });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }

  const user = await prisma.users.findUnique({
    where: {
      email: email,
    },
    select: {
      email: true,
      password: true,
      status: true,
      type: true,
      id: true,
    },
  });

  if (!user?.email) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }
  const isPasswordCorrect = await bcrypt.compare(password, user?.password);

  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }
  if (user?.status != UserStatus.ACTIVE) {
    if (user?.status == UserStatus.INACTIVE) {
      throw new CustomError.UnauthenticatedError(
        "Your Account is not yet approved by Admin"
      );
    } else {
      throw new CustomError.UnauthenticatedError("Your Account is blocked");
    }
  }
  const accessToken = createJWT({ email, type: user?.type, id: user?.id });
  res.status(StatusCodes.OK).send({ token: accessToken });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new CustomError.BadRequestError("Please provide valid email");
  }

  const user = await prisma.users.findUnique({
    where: {
      email: email,
    },
    select: {
      email: true,
      name: true,
    },
  });

  let passwordToken;
  if (user?.email) {
    passwordToken = createTempJWT({ email });
  } else {
    throw new CustomError.NotFoundError("User not found");
  }

  res.status(StatusCodes.OK).json({ token: passwordToken });
};

const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;

  if (!token || !email || !password) {
    throw new CustomError.BadRequestError("Please provide all required fields");
  }

  const payload = isTokenValid(token);

  const user = await prisma.users.findUnique({
    where: {
      email: email,
    },
    select: {
      email: true,
      id: true,
    },
  });

  if (user) {
    let hashedPassword = await bcrypt.hash(password, 8);
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });
  } else {
    throw new CustomError.NotFoundError("User not found");
  }
  res.status(StatusCodes.OK).send({ message: "Password updated successfully" });
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
