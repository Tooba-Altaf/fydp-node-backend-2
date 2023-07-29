const express = require("express");
const router = express.Router();
const { UserType } = require("@prisma/client");

const {
  getme,
  getUsers,
  getUserById,
  createStaff,
  changeStatus,
  deleteUserById,
  updateProfile,
  
} = require("../controllers/userController");

const { authorizeRoles } = require("../middleware/full-auth");

router.get("/me", getme);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.delete("/:id", deleteUserById);
router.post("/create-staff", authorizeRoles(UserType.INSTITUTE), createStaff);
router.patch(
  "/change-status",
  authorizeRoles(UserType.ADMIN, UserType.INSTITUTE),
  changeStatus
);
router.patch("/update-profile", updateProfile);
module.exports = router;
