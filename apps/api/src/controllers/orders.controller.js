const { formatApiResponse } = require("@sahanz/shared");
const orderService = require("../services/order.service");

async function listOrders(req, res) {
  const orders = await orderService.getOrdersForUser(req.user.id);
  res.json(formatApiResponse(orders));
}

module.exports = {
  listOrders
};
