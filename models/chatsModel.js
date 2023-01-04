const { Schema, model } = require("mongoose");

const chatsModel = new Schema(
  {
    members: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("chats", chatsModel);
