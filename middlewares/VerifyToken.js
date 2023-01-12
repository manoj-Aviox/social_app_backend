const jwt = require("jsonwebtoken");

const VerifyToken = (req, res, next) => {
  const isAuth = req.headers.token;
  if (isAuth) {
    jwt.verify(isAuth, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        res.status(401).json({ message: "Invalid Token!" });
      } else {
        req.user = user;
        next();
      }
    });
  } else {
    res.status(400).json({ message: "You are not  authenticated!" });
  }
};

module.exports = VerifyToken;
