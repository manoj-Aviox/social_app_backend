const { Schema, model } = require("mongoose");

const userModel = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, min: 4 },
    friends: { type: Array, default: [] },
    friendsRequest: { type: Array, default: [] },
    sendfriendsRequest: { type: Array, default: [] },
    profilePicture: {
      type: String,
      default:
        "https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG.png",
    },
    coverPicture: {
      type: String,
      default: "https://eppeok.guru/wp-content/uploads/2019/12/main-bg.jpg",
    },
  },
  { timestamps: true }
);

module.exports = model("users", userModel);
