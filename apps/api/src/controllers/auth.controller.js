function login(req, res) {
  const { email } = req.body;

  res.json({
    token: "demo-token",
    user: {
      id: "user-1",
      email,
      role: "seller"
    }
  });
}

module.exports = {
  login
};
