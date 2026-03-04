const express = require("express");
const {
  createProduct,
  listCategories,
  listMyProducts,
  listProducts
} = require("../controllers/products.controller");
const auth = require("../middleware/auth");
const roles = require("../middleware/roles");

const router = express.Router();

router.get("/categories", listCategories);
router.get("/mine", auth, roles("seller"), listMyProducts);
router.get("/", listProducts);
router.post("/", auth, roles("seller"), createProduct);

module.exports = router;
