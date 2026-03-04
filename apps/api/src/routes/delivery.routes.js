const express = require("express");
const {
  listDeliveries,
  updateDeliveryStatus
} = require("../controllers/delivery.controller");
const auth = require("../middleware/auth");
const roles = require("../middleware/roles");

const router = express.Router();

router.get("/", auth, roles("delivery"), listDeliveries);
router.patch("/:deliveryId/status", auth, roles("delivery"), updateDeliveryStatus);

module.exports = router;
