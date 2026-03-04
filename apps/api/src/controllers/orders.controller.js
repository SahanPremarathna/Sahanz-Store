const { formatApiResponse } = require("@sahanz/shared");
const orderService = require("../services/order.service");

async function listOrders(req, res) {
  const orders = await orderService.getOrdersForUser(req.user);
  res.json(formatApiResponse(orders));
}

async function createOrder(req, res) {
  try {
    const order = await orderService.createOrder({
      customerId: req.user.id,
      items: req.body.items || [],
      recipientName: req.body.recipientName || req.user.name,
      deliveryAddress: req.body.deliveryAddress,
      deliveryAddressLine1: req.body.deliveryAddressLine1 || "",
      deliveryAddressLine2: req.body.deliveryAddressLine2 || "",
      deliveryCity: req.body.deliveryCity || "",
      deliveryPostalCode: req.body.deliveryPostalCode || "",
      deliveryCoordinates: req.body.deliveryCoordinates || null,
      notes: req.body.notes || ""
    });
    res.status(201).json(formatApiResponse(order, "Order placed"));
  } catch (error) {
    res.status(400).json({
      message: "Failed to create order",
      error: error.message
    });
  }
}

async function updateSellerProgress(req, res) {
  try {
    const order = await orderService.updateSellerOrderProgress(
      req.params.orderId,
      req.body.step,
      req.user.id
    );
    res.json(formatApiResponse(order, "Order progress updated"));
  } catch (error) {
    res.status(400).json({
      message: "Failed to update seller order progress",
      error: error.message
    });
  }
}

async function cancelOrder(req, res) {
  try {
    const order = await orderService.cancelOrder(
      req.params.orderId,
      req.user,
      req.body.reason,
      req.body.note || ""
    );
    res.json(formatApiResponse(order, "Order cancelled"));
  } catch (error) {
    res.status(400).json({
      message: "Failed to cancel order",
      error: error.message
    });
  }
}

module.exports = {
  cancelOrder,
  createOrder,
  listOrders,
  updateSellerProgress
};
