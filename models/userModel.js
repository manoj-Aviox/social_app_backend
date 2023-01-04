const { Schema, model } = require("mongoose");

const userModel = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, min: 4 },
  friends: { type: Array, default: [] },
  friendsRequest: { type: Array, default: [] },
  sendfriendsRequest: { type: Array, default: [] },
  profilePicture: { type: String, default: "" },
  coverPicture: { type: String, default: "" },
},{timestamps:true});

module.exports = model("users", userModel);
