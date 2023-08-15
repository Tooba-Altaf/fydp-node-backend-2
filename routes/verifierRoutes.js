const express = require("express");
const router = express.Router();

const {
  createhash,
  verifyhash
} = require("../controllers/verifiercontroller");


router.post("/create", createhash);
router.post("/verify", verifyhash);

module.exports = router;
