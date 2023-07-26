const express = require("express");
const router = express.Router();

const {
  getme,
  getUsers,
  getUserById,
  createStaff,
  changeStatus,
  deleteUserById,
  updateProfile,
} = require("../controllers/userController");

router.get("/me", getme);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.delete("/:id", deleteUserById);
router.post("/createStaff",createStaff);
router.patch("/changeStatus",changeStatus)
router.patch("/updateProfile/:id",updateProfile)
module.exports = router;
