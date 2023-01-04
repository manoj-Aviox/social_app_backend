const express = require("express");
const router = express.Router();
const chats = require("../models/chatsModel");
const jwt = require("jsonwebtoken");
const users = require("../models/userModel");

// create chat
router.post("/", async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const userCheck = await users.findOne({ email: decoded.email });
    if (userCheck) {
      const newMember = new chats({
        members: [req.body.senderId, req.body.receiverId],
      });
      const response = await chats.create(newMember);
      res.status(201).send(response);
    } else {
      res.send({ message: "Invalid Token" });
    }
  } catch (error) {
    res.status(400).json("error");
  }
});

// get chats by user
router.get("/:userId", async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const userCheck = await users.findOne({ email: decoded.email });
    if (userCheck) {
      const response = await chats.find({
        members: { $in: [req.params.userId] },
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
