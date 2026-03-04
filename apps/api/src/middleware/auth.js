const store = require("../data/store");
const dbStore = require("../data/db-store");

function getDataSource() {
  return dbStore.isSupabaseConfigured() ? dbStore : store;
}

async function auth(req, res, next) {
  try {
    const userId = req.header("x-demo-user-id");
    const user = userId ? await getDataSource().getUserById(userId) : null;

    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Authentication lookup failed",
      error: error.message
    });
  }
}

module.exports = auth;
