const store = require("../data/store");
const dbStore = require("../data/db-store");

function getDataSource() {
  return dbStore.isSupabaseConfigured() ? dbStore : store;
}

async function getOrdersForUser(user) {
  return getDataSource().listOrdersForUser(user);
}

module.exports = {
  createOrder: (...args) => getDataSource().createOrder(...args),
  getOrdersForUser,
  updateSellerOrderProgress: (...args) => getDataSource().updateSellerOrderProgress(...args)
};
