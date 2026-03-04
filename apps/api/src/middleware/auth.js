const store = require("../data/store");
const dbStore = require("../data/db-store");
const { verifyAuthToken } = require("../lib/auth");

function getDataSource() {
  return dbStore.isSupabaseConfigured() ? dbStore : store;
}

async function auth(req, res, next) {
  try {
    const authorization = req.header("authorization") || "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : null;
    const payload = verifyAuthToken(token);

    if (!payload?.sub) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await getDataSource().getUserById(payload.sub);

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
