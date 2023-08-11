const { PrismaClient, DispatchStatus } = require("@prisma/client");
const { StatusCodes } = require("http-status-codes");

const { verifier } = require("../blockchain/verificationInstance");
const CustomError = require("../errors");

const prisma = new PrismaClient();

const createCivilianVaccineRecord = async (req, res) => {
  const {
    cnic,
    name,
    gender,
    contact,
    date_of_birth,
    vaccine_id,
    institute_id,
  } = req.body;

  const { id: staff_id } = req.user;

  let civilian;
  let vaccination_date = new Date();
  let updateDispatch;

  civilian = await prisma.civilian.findUnique({
    where: {
      cnic: cnic,
    },
    select: {
      cnic: true,
      id: true,
    },
  });

  if (!civilian) {
    civilian = await prisma.civilian.create({
      data: {
        cnic: cnic,
        name: name,
        gender: gender,
        contact: contact,
        date_of_birth: date_of_birth,
      },
      select: {
        cnic: true,
        id: true,
      },
    });
  }

  if (civilian) {
    const record = await prisma.dispatch.findFirst({
      where: {
        civilian_id: null,
        status: DispatchStatus.RECEIVED,
        vaccine_id: vaccine_id,
        institute_id: institute_id,
      },
      select: {
        id: true,
        vaccine_id: true,
        batch_id: true,
        institute_id: true,
      },
    });

    try {
      const txHash = await verifier.uploadHash(
        Object.values({
          ...record,
          civilian_id: civilian.id,
          vaccination_date: vaccination_date,
          staff_id: staff_id,
        }),
        process.env.WALLET_ADDRESS
      );

      updateDispatch = await prisma.dispatch.update({
        where: {
          civilian_id: null,
          status: DispatchStatus.RECEIVED,
          vaccine_id: vaccine_id,
          institute_id: institute_id,
        },
        data: {
          civilian_id: civilian.id,
          vaccination_date: vaccination_date,
          staff_id: staff_id,
        },
        select: {
          id: true,
          vaccine_id: true,
          batch_id: true,
          civilian_id: true,
          institute_id: true,
          staff_id: true,
        },
      });
    } catch (error) {
      throw new CustomError.CustomAPIError("Something went wrong");
    }

    res.status(StatusCodes.OK).send({ data: updateDispatch });
  } else {
    throw new CustomError.CustomAPIError("Something went wrong");
  }
};

const getCivilian = async (req, res) => {
  const { cnic } = req.query;

  const civilianRecord = await prisma.civilian.findUnique({
    where: {
      cnic: cnic,
    },
    select: {
      id: true,
    },
  });

  if (!civilianRecord) {
    throw new CustomError.NotFoundError("invalid request");
  }

  const dispatchRecord = await prisma.dispatch.findMany({
    where: {
      civilian_id: civilianRecord.id,
    },
    select: {
      id: true,
      batch_id: true,
      vaccine_id: true,
      staff: {
        select: {
          name: true,
        },
      },
      vaccine: {
        select: {
          name: true,
          doses: true,
          manufacturer_id: true,
          manufacturer: { select: { name: true } },
        },
      },
      civilian: {
        select: {
          name: true,
        },
      },
      civilian_id: true,
      vaccination_date: true,
    },
  });
  res.status(StatusCodes.OK).send({ data: dispatchRecord });
};

const verifyCivilianVaccination = async (req, res) => {
  const { id: dispatch_record_id } = req.query;

  const record = await prisma.dispatch.findUnique({
    where: {
      id: dispatch_record_id,
    },
    select: {
      id: true,
      vaccine_id: true,
      batch_id: true,
      institute_id: true,
      civilian_id: true,
      vaccination_date: true,
      staff_id: true,
    },
  });
  if (record?.id) {
    try {
      await verifier.verifyHash(Object.values(record));
      res.status(StatusCodes.OK).send({ message: "Record is Verified" });
    } catch (error) {
      res.status(StatusCodes.OK).send({ message: "Record is not Verified" });
    }
  } else {
    throw new CustomError.NotFoundError("invalid request");
  }
};

const getCivilians = async (req, res) => {
  const {
    limit = 10,
    page = 1,
    direction = "DESC",
    column = "vaccination_date",
    staff_id,
    institute_id,
  } = req.query;

  let whereClause = {};
  if (parseInt(staff_id)) {
    whereClause.staff_id = parseInt(staff_id);
  }
  if (parseInt(institute_id)) {
    whereClause.institute_id = parseInt(institute_id);
  }

  const selectClause = {
    id: true,
    vaccine: (select = { name: true, id: true }),
    batch_id: true,
    civilian: (select = { name: true, id: true }),
    institute: (select = { name: true, id: true }),
    staff: (select = { name: true, id: true }),
    vaccination_date: true,
  };
  const records = await prisma.dispatch.findMany({
    where: whereClause,
    select: selectClause,
    take: parseInt(limit),
    skip: (parseInt(page) - 1) * parseInt(limit),
    orderBy: [
      {
        [column]: direction?.toUpperCase() === "DESC" ? "desc" : "asc",
      },
    ],
  });

  const totalRecords = await prisma.dispatch.count({
    where: whereClause,
  });

  res.status(StatusCodes.OK).send({ data: records, count: totalRecords });
};

module.exports = {
  createCivilianVaccineRecord,
  getCivilian,
  verifyCivilianVaccination,
  getCivilians,
};
