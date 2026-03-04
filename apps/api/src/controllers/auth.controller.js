const { formatApiResponse } = require("@sahanz/shared");
const store = require("../data/store");
const dbStore = require("../data/db-store");
const orderService = require("../services/order.service");
const { createAuthToken } = require("../lib/auth");

function getDataSource() {
  return dbStore.isSupabaseConfigured() ? dbStore : store;
}

async function appendOrders(user) {
  const orders = await orderService.getOrdersForUser(user);

  return {
    ...user,
    recentOrders: orders
  };
}

async function login(req, res) {
  try {
    const { identifier, password, role } = req.body || {};

    if (!identifier || !password || !role) {
      return res.status(400).json({
        message: "Identifier, password, and role are required"
      });
    }

    const user = await getDataSource().authenticateUser({
      identifier,
      password,
      role
    });

    res.json({
      token: createAuthToken(user),
      user: await appendOrders(user)
    });
  } catch (error) {
    res.status(401).json({
      message: "Login failed",
      error: error.message
    });
  }
}

async function register(req, res) {
  try {
    const user = await getDataSource().createUser(req.body || {});

    res.status(201).json({
      token: createAuthToken(user),
      user: await appendOrders(user)
    });
  } catch (error) {
    res.status(400).json({
      message: "Registration failed",
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

    res.json(formatApiResponse(await appendOrders(user)));
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

async function deleteAccount(req, res) {
  try {
    await getDataSource().deleteUserAccount(req.user.id);
    res.json(formatApiResponse(null, "Account deleted"));
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete account",
      error: error.message
    });
  }
}

async function deleteStore(req, res) {
  try {
    await getDataSource().deleteStoreByOwner(req.user.id);
    res.json(formatApiResponse(null, "Store deleted"));
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete store",
      error: error.message
    });
  }
}

async function deleteListings(req, res) {
  try {
    await getDataSource().deleteListingsForSeller(req.user.id);
    res.json(formatApiResponse(null, "Listings deleted"));
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete listings",
      error: error.message
    });
  }
}

module.exports = {
  deleteAccount,
  deleteListings,
  deleteStore,
  getProfile,
  login,
  register,
  updateProfile
};
