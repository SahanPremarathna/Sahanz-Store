async function getOrdersForUser(userId) {
  return [
    { id: "ord-1", userId, status: "processing" },
    { id: "ord-2", userId, status: "delivered" }
  ];
}

module.exports = {
  getOrdersForUser
};
