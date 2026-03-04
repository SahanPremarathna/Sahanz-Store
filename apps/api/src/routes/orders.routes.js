const express = require("express");
const {
  cancelOrder,
  createOrder,
  listOrders,
  updateSellerProgress
} = require("../controllers/orders.controller");
const auth = require("../middleware/auth");
const roles = require("../middleware/roles");

const router = express.Router();

router.get("/", auth, listOrders);
router.post("/", auth, createOrder);
router.patch("/:orderId/cancel", auth, roles("customer", "seller"), cancelOrder);
router.patch("/:orderId/seller-progress", auth, roles("seller"), updateSellerProgress);

module.exports = router;
