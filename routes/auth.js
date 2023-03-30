const express = require("express");
const router = express.Router();
const user = require("../models/userModel");
const CryptoJS = require("crypto-js");
var jwt = require("jsonwebtoken");

// user create
router.post("/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) {
    res.status(422).json({ message: "Please fill all fields!" });
  }
  try {
    const userExist = await user.findOne({ email: email });
    if (userExist) {
      res.status(400).json({ message: "Email already exists!" });
    } else {
      await user.create({
        name,
        phone,
        email,
        password: CryptoJS.AES.encrypt(
          password,
          process.env.CRYPTO_SECRET
        ).toString(),
      });
      res.status(201).send({ message: "User Regitered!" });
    }
  } catch (error) {
    res.status(500).send("internal server error");
    console.log(error);
  }
});

// user login
router.post("/login", async (req, res) => {
  console.log(req)
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(422).json({ message: "Please fill all fields!" });
  }
  try {
    const userExist = await user.findOne({ email: email });
    if (userExist) {
      const originalPassword = CryptoJS.AES.decrypt(
        userExist.password,
        process.env.CRYPTO_SECRET
      ).toString(CryptoJS.enc.Utf8);
      if (originalPassword === password) {
        var token = jwt.sign({ email, password }, process.env.JWT_SECRET);
        res.status(200).send({ message: "Logged In!", data: userExist, token: token });
      } else {
        res.status(401).send({ message: "Wrong Password" });
      }
    } else {
      res.status(400).send({ message: "User Not Found" });
    }
  } catch (error) {
    res.status(500).send("internal server error");
    console.log(error);
  }
});

module.exports = router;
