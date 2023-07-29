const express = require("express");
const router = express.Router();

const {
  createVaccine,
  getVaccineById,
  getVaccines,
  changeVaccineStatus,
  createDispatchVaccine,
  getDispatchVaccines,
} = require("../controllers/vaccineController");

const { authorizeRoles } = require("../middleware/full-auth");
const { UserType } = require("@prisma/client");

router.get("/dispatch-records", getDispatchVaccines);
router.post("/create", authorizeRoles(UserType.MANUFACTURER), createVaccine);
router.get("/", getVaccines);
router.get("/:id", getVaccineById);
router.patch("/:id", authorizeRoles(UserType.ADMIN), changeVaccineStatus);
router.post(
  "/create-dispatch",
  authorizeRoles(UserType.INSTITUTE),
  createDispatchVaccine
);

module.exports = router;
