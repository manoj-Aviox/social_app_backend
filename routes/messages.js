const router = require("express").Router();
const message = require("../models/messageModel");
const VerifyToken = require("../middlewares/VerifyToken");

// create message
router.post("/", VerifyToken, async (req, res) => {
  try {
    const newMessage = new message(req.body);
    const response = await message.create(newMessage);
    res.status(201).send(response);
  } catch (error) {
    res.status(400).json("error");
  }
});

// get message by chat id
router.get("/:chatId", VerifyToken, async (req, res) => {
  try {
    const response = await message.find({
      chatId: req.params.chatId,
    });
    res.status(200).send({ data: response });
  } catch (error) {
    res.status(400).json("error");
  }
});

module.exports = router;
