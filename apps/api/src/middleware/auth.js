function auth(req, _res, next) {
  req.user = {
    id: "user-1",
    role: "delivery"
  };

  next();
}

module.exports = auth;
