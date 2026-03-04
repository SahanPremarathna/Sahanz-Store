const { formatApiResponse } = require("@sahanz/shared");
const productService = require("../services/product.service");

async function listCategories(_req, res) {
  const categories = await productService.getCategories();
  res.json(formatApiResponse(categories));
}

async function listProducts(_req, res) {
  try {
    const products = await productService.getCatalog();
    res.json(formatApiResponse(products));
  } catch (error) {
    res.status(500).json({
      message: "Failed to load products",
      error: error.message
    });
  }
}

async function listMyProducts(req, res) {
  try {
    const products = await productService.getSellerProducts(req.user.id);
    res.json(formatApiResponse(products));
  } catch (error) {
    res.status(500).json({
      message: "Failed to load seller products",
      error: error.message
    });
  }
}

async function createProduct(req, res) {
  try {
    const product = await productService.createSellerProduct({
      sellerId: req.user.id,
      ...req.body
    });
    res.status(201).json(formatApiResponse(product, "Product created"));
  } catch (error) {
    res.status(400).json({
      message: "Failed to create product",
      error: error.message
    });
  }
}

async function updateProduct(req, res) {
  try {
    const product = await productService.updateSellerProduct(
      req.user.id,
      req.params.productId,
      req.body || {}
    );
    res.json(formatApiResponse(product, "Product updated"));
  } catch (error) {
    res.status(400).json({
      message: "Failed to update product",
      error: error.message
    });
  }
}

async function deleteProduct(req, res) {
  try {
    const product = await productService.deleteSellerProduct(
      req.user.id,
      req.params.productId
    );
    res.json(formatApiResponse(product, "Product deleted"));
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete product",
      error: error.message
    });
  }
}

module.exports = {
  createProduct,
  deleteProduct,
  listCategories,
  listMyProducts,
  listProducts,
  updateProduct
};
