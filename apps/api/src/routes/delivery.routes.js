const express = require("express");
const { listDeliveries } = require("../controllers/delivery.controller");
const auth = require("../middleware/auth");
const roles = require("../middleware/roles");

const router = express.Router();

router.get("/", auth, roles("delivery"), listDeliveries);

module.exports = router;
