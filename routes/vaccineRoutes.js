const express = require("express");
const router = express.Router();

const {
  createVaccine,
  getVaccineById,
  getVaccines,
  changeVaccineStatus,
} = require("../controllers/vaccineController");

const { authorizeRoles } = require("../middleware/full-auth");
const { UserType } = require("@prisma/client");

router.post("/create", authorizeRoles([UserType.MANUFACTURER]), createVaccine);
router.get("/", getVaccines);
router.get("/:id", getVaccineById);
router.patch("/:id", authorizeRoles([UserType.ADMIN]), changeVaccineStatus);

module.exports = router;
