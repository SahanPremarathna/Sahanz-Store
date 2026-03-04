const { formatApiResponse } = require("@sahanz/shared");
const deliveryService = require("../services/delivery.service");

async function listDeliveries(req, res) {
  const deliveries = await deliveryService.getDeliveriesForUser(req.user.id);
  res.json(formatApiResponse(deliveries));
}

module.exports = {
  listDeliveries
};
