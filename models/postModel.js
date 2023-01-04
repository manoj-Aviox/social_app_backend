const { Schema, model } = require("mongoose");

const postModel = new Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    desc: { type: String, required: true },
    img: { type: String, required: true },
    likes: { type: Array, default: [] },
  },
  { timestamps: true } 
);

module.exports = model("posts", postModel);
