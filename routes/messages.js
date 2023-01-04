const express = require("express");
const router = express.Router();
const message = require("../models/messageModel");
const jwt = require("jsonwebtoken");
const users = require("../models/userModel");

// create message
router.post("/", async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const userCheck = await users.findOne({ email: decoded.email });
    if (userCheck) {
      const newMessage = new message(req.body);
      const response = await message.create(newMessage);
      res.status(201).send(response);
    } else {
      res.send({ message: "Invalid Token" });
    }
  } catch (error) {
    res.status(400).json("error");
  }
});

// get message by chat id
router.get("/:chatId", async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const userCheck = await users.findOne({ email: decoded.email });
    if (userCheck) {
      const response = await message.find({
        chatId: req.params.chatId,
      });
      res.status(200).send({ data: response });
    } else {
      res.send({ message: "Invalid Token" });
    }
  } catch (error) {
    res.status(400).json("error");
  }
});

module.exports = router;
