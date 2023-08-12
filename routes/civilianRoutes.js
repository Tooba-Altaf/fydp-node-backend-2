const express = require("express");
const router = express.Router();

const { authorizeRoles, authenticateUser } = require("../middleware/full-auth");
const { UserType } = require("@prisma/client");

const {
  createCivilianVaccineRecord,
  getCivilian,
  getCivilians,
  verifyCivilianVaccination,
} = require("../controllers/civilianController");

router.post(
  "/enter-civilian-record",
  authenticateUser,
  authorizeRoles(UserType.STAFF),
  createCivilianVaccineRecord
);
router.get("/get-civilian", getCivilian);
router.get("/get-records", getCivilians);
router.get("/verify/:id", verifyCivilianVaccination);

module.exports = router;
