const { formatApiResponse } = require("@sahanz/shared");
const deliveryService = require("../services/delivery.service");

async function listDeliveries(req, res) {
  const deliveries = await deliveryService.getDeliveriesForUser(req.user.id);
  res.json(formatApiResponse(deliveries));
}

async function updateDeliveryStatus(req, res) {
  try {
    const delivery = await deliveryService.updateDeliveryStatus(
      req.params.deliveryId,
      req.body.status,
      req.user.id
    );
    res.json(formatApiResponse(delivery, "Delivery updated"));
  } catch (error) {
    res.status(400).json({
      message: "Failed to update delivery",
      error: error.message
    });
  }
}

module.exports = {
  listDeliveries,
  updateDeliveryStatus
};
