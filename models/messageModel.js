const { Schema, model } = require("mongoose");

const messageModel = new Schema(
  {
    chatId: { type: String, require: true },
    senderId: { type: String, require: true },
    textMessage: { type: String, require: true },
  },
  {
    timestamps: true,
  }
);

module.exports = model("messages", messageModel);
