const { formatApiResponse } = require("@sahanz/shared");
const productService = require("../services/product.service");

async function listProducts(_req, res) {
  const products = await productService.getProducts();
  res.json(formatApiResponse(products));
}

module.exports = {
  listProducts
};
