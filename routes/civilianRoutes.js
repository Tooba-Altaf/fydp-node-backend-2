const express = require("express");
const router = express.Router();

const { authorizeRoles } = require("../middleware/full-auth");
const { UserType } = require("@prisma/client");
const {
createCivilianVaccineRecord,
getCivilian
}=require("../controllers/civilianController");

router.post("/enterCivilianRecord", authorizeRoles(UserType.STAFF), createCivilianVaccineRecord)
router.get("/getCivilian", getCivilian)


module.exports = router;
