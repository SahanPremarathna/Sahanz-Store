const express = require("express");
const { listOrders } = require("../controllers/orders.controller");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, listOrders);

module.exports = router;
