const express = require("express");
const router = express.Router();

const {
  createVaccine,
  getVaccineById,
  getVaccines,
  changeVaccineStatus,
  getDispatchVaccines,
  createDispatchVaccine,
  getDispatchVaccines,
  changeDispatchStatus,
} = require("../controllers/vaccineController");

const { authorizeRoles } = require("../middleware/full-auth");
const { UserType } = require("@prisma/client");
router.get("/dispatch-records", getDispatchVaccines)

router.get("/dispatch-records", getDispatchVaccines);
router.patch("/dispatch-status", changeDispatchStatus);
router.post("/create", authorizeRoles(UserType.MANUFACTURER), createVaccine);
router.get("/", getVaccines);
router.get("/:id", getVaccineById);

router.patch("/:id", authorizeRoles(UserType.ADMIN), changeVaccineStatus);
router.post(
  "/create-dispatch",
  authorizeRoles(UserType.INSTITUTE),
  createDispatchVaccine
);

router.patch("/changeDispatchStatus",authorizeRoles(UserType.INSTITUTE|| UserType.MANUFACTURER),createDispatchVaccine)
module.exports = router;
