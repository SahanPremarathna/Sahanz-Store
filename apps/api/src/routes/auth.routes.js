const express = require("express");
const {
  getProfile,
  listDemoUsers,
  login,
  updateProfile
} = require("../controllers/auth.controller");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/users", listDemoUsers);
router.post("/login", login);
router.get("/profile", auth, getProfile);
router.patch("/profile", auth, updateProfile);

module.exports = router;
