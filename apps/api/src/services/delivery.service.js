async function getDeliveriesForUser(userId) {
  return [
    { id: "del-1", riderId: userId, status: "assigned" },
    { id: "del-2", riderId: userId, status: "in_transit" }
  ];
}

module.exports = {
  getDeliveriesForUser
};
