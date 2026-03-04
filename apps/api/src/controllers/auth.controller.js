const { formatApiResponse } = require("@sahanz/shared");
const store = require("../data/store");
const dbStore = require("../data/db-store");
const orderService = require("../services/order.service");

function getDataSource() {
  return dbStore.isSupabaseConfigured() ? dbStore : store;
}

async function listDemoUsers(_req, res) {
  try {
    const users = await getDataSource().listUsers();
    res.json(formatApiResponse(users));
  } catch (error) {
    res.status(500).json({
      message: "Failed to load users",
      error: error.message
    });
  }
}

async function login(req, res) {
  try {
    const { userId } = req.body;
    const user = await getDataSource().getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const orders = await orderService.getOrdersForUser(user);
    res.json({
      token: "demo-token",
      user: {
        ...user,
        recentOrders: orders
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
}

async function getProfile(req, res) {
  try {
    const user = await getDataSource().getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const orders = await orderService.getOrdersForUser(user);
    res.json(formatApiResponse({
      ...user,
      recentOrders: orders
    }));
  } catch (error) {
    res.status(500).json({
      message: "Failed to load profile",
      error: error.message
    });
  }
}

async function updateProfile(req, res) {
  try {
    const user = await getDataSource().updateUserProfile(req.user.id, req.body || {});
    res.json(formatApiResponse(user, "Profile updated"));
  } catch (error) {
    res.status(400).json({
      message: "Failed to update profile",
      error: error.message
    });
  }
}

module.exports = {
  getProfile,
  listDemoUsers,
  login,
  updateProfile
};
