const express = require("express");
const router = express.Router();

const { authorizeRoles } = require("../middleware/full-auth");
const { UserType } = require("@prisma/client");
const {
  createCivilianVaccineRecord,
  getCivilian,
} = require("../controllers/civilianController");

router.post("/enter-civilian-record", createCivilianVaccineRecord);
router.get("/get-civilian", getCivilian);

module.exports = router;
