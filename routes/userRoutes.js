const express = require("express");
const router = express.Router();

const {
  getme,
  getUsers,
  getUserById,
  createStaff,
  deleteUserById,
} = require("../controllers/userController");

router.get("/me", getme);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.delete("/:id", deleteUserById);
router.post("/createStaff",createStaff);
module.exports = router;
