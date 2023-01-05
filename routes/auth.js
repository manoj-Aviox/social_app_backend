const express = require("express");
const router = express.Router();
const user = require("../models/userModel");
const CryptoJS = require("crypto-js");
var jwt = require("jsonwebtoken");

// user create
router.post("/signup", async (req, res) => {
  try {
    const newUser = new user({
      ...req.body,
      // name: req.body.name,
      // username: req.body.username,
      // email: req.body.email,
      password: CryptoJS.AES.encrypt(
        req.body.password,
        process.env.CRYPTO_SECRET
      ).toString(),
    });
    await user.create(newUser);
    res.status(201).send({ message: "User Created" });
  } catch (error) {
    const keys = error.keyValue && Object?.keys(error.keyValue);
    res
      .status(401)
      .send(
        error.keyValue
          ? { message: `Please enter valid ${keys[0]}`, error: true }
          : error
      );
  }
});

// user login
router.post("/login", async (req, res) => {
  try {
    const userFind = await user.findOne({ email: req.body.email });
    if (userFind !== null) {
      const originalPassword = CryptoJS.AES.decrypt(
        userFind.password,
        process.env.CRYPTO_SECRET
      ).toString(CryptoJS.enc.Utf8);
      if (originalPassword === req.body.password) {
        var token = jwt.sign(req.body, process.env.JWT_SECRET);
        res
          .status(200)
          .send({ message: "Log In Success", data: userFind, token: token });
      } else {
        res.status(401).send({ message: "Wrong Password" });
      }
    } else {
      res.status(401).send({ message: "User Not Found" });
    }
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
