const CustomError = require("../errors");
const { isTokenValid } = require("../utils/jwt");

const { PrismaClient, UserStatus } = require("@prisma/client");
const prisma = new PrismaClient();

const authenticateUser = async (req, res, next) => {
  let token;
  // check header
  const authHeader = req.headers.authorization;
  if (authHeader) {
    token = authHeader;
  }
  // check cookies
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new CustomError.UnauthenticatedError("Authentication invalid");
  }
  try {
    const payload = isTokenValid(token);

    const user = await prisma.users.findUnique({
      where: {
        email: payload?.email,
      },
      select: {
        status: true,
        type: true,
      },
    });

    if (user?.status != UserStatus.ACTIVE) {
      if (user?.status == UserStatus.INACTIVE) {
        throw new CustomError.UnauthenticatedError(
          "Your Account is not yet approved by Admin"
        );
      } else {
        throw new CustomError.UnauthenticatedError(
          "Your Account is blocked, Contact Admin"
        );
      }
    }

    // Attach the user to the req object
    req.user = {
      email: payload.email,
      type: user.type,
    };

    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authentication invalid");
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.type)) {
      throw new CustomError.UnauthorizedError(
        "Unauthorized to access this route"
      );
    }
    next();
  };
};

module.exports = { authenticateUser, authorizeRoles };
