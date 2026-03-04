const store = require("../data/store");
const dbStore = require("../data/db-store");

function getDataSource() {
  return dbStore.isSupabaseConfigured() ? dbStore : store;
}

async function getDeliveriesForUser(userId) {
  return getDataSource().listDeliveryTasksForUser(userId);
}

module.exports = {
  getDeliveriesForUser,
  updateDeliveryStatus: (...args) => getDataSource().updateDeliveryTaskStatus(...args)
};
