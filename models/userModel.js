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
        "https://cdn.pixabay.com/photo/2017/11/10/05/48/user-2935527_960_720.png",
    },
    coverPicture: {
      type: String,
      default: "https://images.unsplash.com/photo-1487088678257-3a541e6e3922?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
    },
  },
  { timestamps: true }
);

module.exports = model("users", userModel);
