const { PrismaClient } = require("@prisma/client");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const prisma = new PrismaClient();

const createVaccine = async (req, res) => {
  const { name, doses, info, email } = req.body;

  const manufacturer = await prisma.users.findFirst({
    where: {
      email: email,
    },
    select: {
      name: true,
    },
  });

  const vaccine = await prisma.vaccine.create({
    data: {
      name: name,
      doses: parseInt(doses),
      info: info,
      manufacturer_name: manufacturer.name,
    },
  });
  res.status(StatusCodes.OK).send({ data: vaccine });
};

const getVaccineById = async (req, res) => {
  const { id } = req.params;

  if (!parseInt(id)) {
    throw new CustomError.BadRequestError("invalid request");
  }

  const vaccine = await prisma.vaccine.findUnique({
    where: {
      id: parseInt(id),
    },
    select: {
      name: true,
      doses: true,
      info: true,
      status: true,
      manufacturer_name: true,
      id: true,
    },
  });

  if (!vaccine) {
    throw new CustomError.NotFoundError("invalid request");
  }

  res.status(StatusCodes.OK).send({ data: vaccine });
};

const getVaccines = async (req, res) => {
  const { manufacturer_name, status } = req.body;
  const { limit = 10, page = 1 } = req.query;

  let whereClause = {};
  if (manufacturer_name && status) {
    whereClause = {
      manufacturer_name: manufacturer_name,
      status: status,
    };
  } else if (manufacturer_name) {
    whereClause = {
      manufacturer_name: manufacturer_name,
    };
  } else if (status) {
    whereClause = {
      status: status,
    };
  }

  const vaccines = await prisma.vaccine.findMany({
    where: whereClause,
    select: {
      name: true,
      doses: true,
      info: true,
      status: true,
      manufacturer_name: true,
      id: true,
    },
    take: parseInt(limit),
    skip: (parseInt(page) - 1) * parseInt(limit),
  });
  const totalVaccines = await prisma.vaccine.count();
  res.status(StatusCodes.OK).send({ data: vaccines, count: totalVaccines });
};

const changeVaccineStatus = async (req, res) => {
  //have to add role based authentication
  const { status } = req.body;
  const { id } = req.params;
  if (!parseInt(id)) {
    throw new CustomError.BadRequestError("invalid request");
  }

  const singleVaccine = await prisma.vaccine.update({
    where: {
      id: parseInt(id),
    },
    data: {
      status: status,
    },
  });
  if (!singleVaccine) {
    throw new CustomError.NotFoundError("Failed to update vaccine status");
  }

  res.status(StatusCodes.OK).send({ data: singleVaccine });
};

module.exports = {
  createVaccine,
  getVaccineById,
  getVaccines,
  changeVaccineStatus,
};
