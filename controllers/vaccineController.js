const { PrismaClient } = require("@prisma/client");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const prisma = new PrismaClient();

const createVaccine = async (req, res) => {
  const { name, doses, info, manufacturer_id } = req.body;

  const vaccine = await prisma.vaccine.create({
    data: {
      name: name,
      doses: parseInt(doses),
      info: info,
      manufacturer_id: manufacturer_id,
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
  const { limit = 10, page = 1, manufacturer_id, status } = req.query;

  let whereClause = {};
  if (manufacturer_id && status) {
    whereClause = {
      manufacturer_id: manufacturer_id,
      status: status,
    };
  } else if (manufacturer_id) {
    whereClause = {
      manufacturer_id: manufacturer_id,
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
  });
  const totalVaccines = await prisma.vaccine.count();
  res.status(StatusCodes.OK).send({ data: vaccines, count: totalVaccines });
};

const changeVaccineStatus = async (req, res) => {
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


const createDispatchVaccine = async (req, res) => {
  const { vaccine_id,quantity,batch_id ,institute_id} = req.body;
  for (let i=0;i<quantity;i++){
  const vaccine = await prisma.dispatch.create({
    data: {
      vaccine_id:vaccine_id,
      batch_id:batch_id,
      institute_id:institute_id,
      civilian_id:null,
    },
  });
  res.status(StatusCodes.CREATED).send({ data: vaccine });
}};



module.exports = {
  createVaccine,
  getVaccineById,
  getVaccines,
  changeVaccineStatus,
  createDispatchVaccine
};
