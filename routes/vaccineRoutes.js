const express = require("express")
const router = express.Router()

const {
	createVaccine,
	getVaccineById,
	getVaccines,
	changeVaccineStatus
} = require("../controllers/vaccineController")

router.post("/create", createVaccine)
router.get("/", getVaccines)
router.get("/:id", getVaccineById)
router.patch("/:id", changeVaccineStatus)

module.exports = router
