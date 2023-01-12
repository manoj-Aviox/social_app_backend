const router = require("express").Router();
const chats = require("../models/chatsModel");
const VerifyToken = require("../middlewares/VerifyToken");

// create chat
router.post("/", VerifyToken, async (req, res) => {
  try {
    const newMember = new chats({
      members: [req.body.senderId, req.body.receiverId],
    });
    const response = await chats.create(newMember);
    res.status(201).send(response);
  } catch (error) {
    res.status(400).json("error");
  }
});

// get chats by user
router.get("/:userId", VerifyToken, async (req, res) => {
  try {
    const response = await chats.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).send({ data: response });
  } catch (error) {
    res.status(400).json("error");
  }
});

module.exports = router;
