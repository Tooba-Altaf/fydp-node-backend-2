const {
  PrismaClient,
  UserType,
  DispatchStatus,
  VaccineStatus,
} = require("@prisma/client");
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
  //have to enter  condition that only approved vaccines can be dispatched
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
      res.status(StatusCodes.CREATED).send({ data: "Success" });
    } else {
      throw new CustomError.CustomAPIError("Something went wrong");
    }
  } catch (error) {
    throw new CustomError.CustomAPIError("Something went wrong");
  }
};

const changeDispatchStatus = async (req, res) => {
  const { status, batch_id } = req.body;

  if (!status || !batch_id) {
    throw new CustomError.BadRequestError("Please provide all required fields");
  }
  let data = {};

  if (status == DispatchStatus.DISPATCH) {
    data.dispatch_date = new Date();
    data.status = DispatchStatus.DISPATCH;
  } else if (status == DispatchStatus.RECEIVED) {
    data.receive_date = new Date();
    data.status = DispatchStatus.RECEIVED;
  }
  if (batch_id) {
    data.batch_id = batch_id;
  }

  const vaccine = await prisma.dispatch.updateMany({
    where: {
      batch_id: batch_id,
    },
    data: data,
  });
  if (!vaccine) {
    throw new CustomError.NotFoundError(
      "Failed to update dispatched vaccine status"
    );
  }

  res.status(StatusCodes.OK).send({ data: "Status updated successfully" });
};

const getDispatchVaccines = async (req, res) => {
  const {
    manufacturer_id,
    institute_id,
    status,
    limit = 10,
    page = 1,
    direction = "DESC",
  } = req.query;

  let whereClause = {};
  let column = "request_date";

  if (parseInt(manufacturer_id)) {
    whereClause.vaccine = {
      manufacturer_id: parseInt(manufacturer_id),
    };
  }
  if (parseInt(institute_id)) {
    whereClause.institute_id = parseInt(institute_id);
  }
  if (status) {
    whereClause.status = status;
    if (status == DispatchStatus.RECEIVED) {
      column = "receive_date";
    } else if (status == DispatchStatus.DISPATCH) {
      column = "dispatch_date";
    }
  }
  try {
    const totalCount = await prisma.dispatch.groupBy({
      by: [
        "batch_id",
        "vaccine_id",
        "institute_id",
        "request_date",
        "dispatch_date",
        "receive_date",
      ],
      where: whereClause,
    });

    const vaccines = await prisma.dispatch.groupBy({
      by: [
        "batch_id",
        "vaccine_id",
        "institute_id",
        "request_date",
        "dispatch_date",
        "receive_date",
      ],
      where: whereClause,
      _count: {
        vaccine_id: true,
      },
      orderBy: [
        {
          [column]: direction?.toUpperCase() === "DESC" ? "desc" : "asc",
        },
      ],
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
    });

    const result = await Promise.all(
      vaccines.map(async (v) => {
        const vaccineInfo = await prisma.vaccine.findUnique({
          where: { id: v.vaccine_id },
          select: {
            name: true,
            manufacturer: { select: { name: true, id: true } },
          },
        });

        const instituteInfo = await prisma.users.findUnique({
          where: { id: v.institute_id },
          select: { name: true },
        });

        return {
          batch_id: v.batch_id,
          vaccine_id: v.vaccine_id,
          institute_id: v.institute_id,
          vaccineInfo: vaccineInfo,
          instituteName: instituteInfo?.name || null,
          count: v._count.vaccine_id,
          request_date: v.request_date || null,
          dispatch_date: v.dispatch_date || null,
          receive_date: v.receive_date || null,
          status: v.status || null,
        };
      })
    );

    const formattedData = {};
    const formattedDataCount = {};

    totalCount?.forEach((item) => {
      const { batch_id } = item;
      if (!formattedDataCount[batch_id]) {
        formattedDataCount[batch_id] = {
          batch_id: batch_id,
        };
      }
    });

    result.forEach((item) => {
      const {
        batch_id,
        vaccine_id,
        institute_id,
        vaccineInfo,
        instituteName,
        count,
        request_date,
        dispatch_date,
        receive_date,
        status,
      } = item;

      if (!formattedData[batch_id]) {
        formattedData[batch_id] = {
          batch_id: batch_id,
          institute_id: institute_id,
          instituteName: instituteName,
          request_date,
          dispatch_date,
          receive_date,
          status,
          vaccines: [],
        };
      }

      formattedData[batch_id].vaccines.push({
        vaccine_id: vaccine_id,
        count: count,
        vaccineInfo: vaccineInfo,
      });
    });

    const finalData = Object.values(formattedData);
    const finalDataCount = Object.values(formattedDataCount);

    res
      .status(StatusCodes.OK)
      .send({ data: finalData, count: finalDataCount?.length });
  } catch (error) {
    throw new CustomError.CustomAPIError(error);
  }
};

const getAvailableVaccines = async (req, res) => {
  const { id: institute_id } = req.user;

  const vaccines = await prisma.dispatch.groupBy({
    by: ["vaccine_id"],
    where: {
      institute_id: institute_id,
      status: DispatchStatus.RECEIVED,
      civilian_id: null,
    },
    _count: {
      vaccine_id: true,
    },
  });

  const result = await Promise.all(
    vaccines.map(async (v) => {
      const vaccineInfo = await prisma.vaccine.findUnique({
        where: { id: v.vaccine_id },
        select: {
          name: true,
          manufacturer: { select: { name: true, id: true } },
        },
      });

      return {
        vaccine_id: v.vaccine_id,
        vaccineInfo: vaccineInfo,
        count: v._count.vaccine_id,
      };
    })
  );

  res.status(StatusCodes.OK).send({ data: result });
};
module.exports = {
  createVaccine,
  getVaccineById,
  getVaccines,
  changeVaccineStatus,
  createDispatchVaccine,
  changeDispatchStatus,
  getDispatchVaccines,
  getAvailableVaccines,
};
