const express = require("express");
const {
  createProduct,
  deleteProduct,
  listCategories,
  listMyProducts,
  listProducts,
  updateProduct
} = require("../controllers/products.controller");
const auth = require("../middleware/auth");
const roles = require("../middleware/roles");

const router = express.Router();

router.get("/categories", listCategories);
router.get("/mine", auth, roles("seller"), listMyProducts);
router.get("/", listProducts);
router.post("/", auth, roles("seller"), createProduct);
router.patch("/:productId", auth, roles("seller"), updateProduct);
router.delete("/:productId", auth, roles("seller"), deleteProduct);

module.exports = router;
