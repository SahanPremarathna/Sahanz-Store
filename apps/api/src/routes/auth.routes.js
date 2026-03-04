const express = require("express");
const {
  deleteAccount,
  deleteListings,
  deleteStore,
  getProfile,
  login,
  register,
  updateProfile
} = require("../controllers/auth.controller");
const auth = require("../middleware/auth");
const roles = require("../middleware/roles");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/profile", auth, getProfile);
router.patch("/profile", auth, updateProfile);
router.delete("/account", auth, deleteAccount);
router.delete("/store", auth, roles("seller"), deleteStore);
router.delete("/listings", auth, roles("seller"), deleteListings);

module.exports = router;
