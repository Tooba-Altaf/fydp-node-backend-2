const { PrismaClient } = require("@prisma/client");
const { StatusCodes } = require("http-status-codes");
const { v4: uuidv4 } = require("uuid");

const CustomError = require("../errors");

const prisma = new PrismaClient();

const createVaccine = async (req, res) => {
  const { name, doses, info, manufacturer_id } = req.body;

  if (!name || !doses || !info || !manufacturer_id) {
    throw new CustomError.BadRequestError("Please provide all required fields");
  }

  const vaccine = await prisma.vaccine.create({
    data: {
      name: name,
      doses: parseInt(doses),
      info: info,
      manufacturer_id: parseInt(manufacturer_id),
    },
  });
  res.status(StatusCodes.CREATED).send({ data: vaccine });
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
      manufacturer_id: true,
      id: true,
    },
  });

  if (!vaccine) {
    throw new CustomError.NotFoundError("invalid request");
  }

  res.status(StatusCodes.OK).send({ data: vaccine });
};

const getVaccines = async (req, res) => {
  const {
    limit = 10,
    page = 1,
    manufacturer_id,
    status,
    direction = "DESC",
    column = "createdAt",
  } = req.query;

  let whereClause = {};
  if (manufacturer_id && status) {
    whereClause = {
      manufacturer_id: parseInt(manufacturer_id),
      status: status,
    };
  } else if (manufacturer_id) {
    whereClause = {
      manufacturer_id: parseInt(manufacturer_id),
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
      manufacturer_id: true,
      id: true,
    },
    take: parseInt(limit),
    skip: (parseInt(page) - 1) * parseInt(limit),
    orderBy: [
      {
        [column]: direction?.toUpperCase() === "DESC" ? "desc" : "asc",
      },
    ],
  });
  const totalVaccines = await prisma.vaccine.count({ where: whereClause });
  res.status(StatusCodes.OK).send({ data: vaccines, count: totalVaccines });
};

const changeVaccineStatus = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  if (!parseInt(id)) {
    throw new CustomError.BadRequestError("invalid request");
  }

  if (!status) {
    throw new CustomError.BadRequestError("Please provide all required fields");
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

const createDispatchVaccine = async (req, res) => {
  const { vaccines = [] } = req.body;
  const { id: institute_id } = req.user;
  const batch_id = uuidv4();

  const vaccinesToInsert = [];

  vaccines.map((item) => {
    for (let i = 0; i < parseInt(item.quantity); i++) {
      vaccinesToInsert.push({
        vaccine_id: item.vaccine_id,
        batch_id: batch_id,
        institute_id: institute_id,
      });
    }
  });

  try {
    if (vaccinesToInsert.length > 0) {
      const vaccines = await prisma.dispatch.createMany({
        data: vaccinesToInsert,
      });
      res.status(StatusCodes.CREATED).send({ data: vaccines });
    } else {
      throw new CustomError.CustomAPIError("Something went wrong");
    }
  } catch (error) {
    throw new CustomError.CustomAPIError("Something went wrong");
  }
};

const changeDispatchStatus = async (req, res) => {
  const { status, batch_id } = req.body;
  const vaccine = await prisma.dispatch.update({
    where: {
      batch_id: batch_id,
    },
    data: {
      status: status,
    },
  });
  if (!vaccine) {
    throw new CustomError.NotFoundError(
      "Failed to update dispatched vaccine status"
    );
  }

  res.status(StatusCodes.OK).send({ data: singleVaccine });
};

module.exports = {
  createVaccine,
  getVaccineById,
  getVaccines,
  changeVaccineStatus,
  createDispatchVaccine,
  changeDispatchStatus,
};
