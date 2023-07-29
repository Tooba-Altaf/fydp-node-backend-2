const { PrismaClient, UserType } = require("@prisma/client");
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
      manufacturer: { select: { name: true } },
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
  if (manufacturer_id) {
    whereClause.manufacturer_id = parseInt(manufacturer_id);
  }
  if (status) {
    whereClause.status = status;
  }

  const vaccines = await prisma.vaccine.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      doses: true,
      info: true,
      status: true,
      manufacturer_id: true,
      manufacturer: { select: { name: true } }, // Include the related manufacturer's name
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

  res.status(StatusCodes.OK).send({ data: vaccine });
};

const getDispatchVaccines = async (req, res) => {
  const { id ,type} = req.user;
  const { institute_id } = req.params;

  let whereClause = {};
  if (type === UserType.INSTITUTE) {
    whereClause.institute_id = parseInt(id);
  }
  if (institute_id) {
    whereClause.institute_id = parseInt(institute_id);
  }

  try {
    const vaccines = await prisma.dispatch.groupBy({
      by: ["batch_id", "vaccine_id", "institute_id"],
      where: whereClause,
      _count: {
        institute_id: true,
        vaccine_id: true,
      },
    });

    const result = await Promise.all(
      vaccines.map(async (v) => {
        const vaccineInfo = await prisma.vaccine.findUnique({
          where: { id: v.vaccine_id },
          select: { name: true },
        });

        const instituteInfo = await prisma.users.findUnique({
          where: { id: v.institute_id },
          select: { name: true },
        });

        return {
          batch_id: v.batch_id,
          vaccine_id: v.vaccine_id,
          institute_id: v.institute_id,
          vaccineName: vaccineInfo?.name || null,
          instituteName: instituteInfo?.name || null,
          count: v._count.vaccine_id, // The count for each vaccine_id
        };
      })
    );

    const formattedData = {};

    result.forEach((item) => {
      const {
        batch_id,
        vaccine_id,
        institute_id,
        vaccineName,
        instituteName,
        count,
      } = item;

      if (!formattedData[batch_id]) {
        formattedData[batch_id] = {
          batch_id: batch_id,
          institute_id: institute_id,
          instituteName: instituteName,
          vaccines: [],
        };
      }

      formattedData[batch_id].vaccines.push({
        vaccine_id: vaccine_id,
        vaccineName: vaccineName,
        count: count,
      });
    });

    const finalData = Object.values(formattedData);

    res.status(StatusCodes.OK).send({ data: finalData });
  } catch (error) {
    throw new CustomError.CustomAPIError(error);
  }
};

module.exports = {
  createVaccine,
  getVaccineById,
  getVaccines,
  changeVaccineStatus,
  createDispatchVaccine,
  changeDispatchStatus,
  getDispatchVaccines,
};
