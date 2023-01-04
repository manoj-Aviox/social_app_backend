const express = require("express");
const router = express.Router();
const users = require("../models/userModel");
const posts = require("../models/postModel");
const upload = require("../middlewares/upload");
var jwt = require("jsonwebtoken");

// GET ALL POSTS
router.get("/", async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const userCheck = await users.findOne({ email: decoded.email });
    if (userCheck) {
      const data = await posts.find();
      res.send({ data: data.reverse() });
    } else {
      res.send({ message: "Invalid Token" });
    }
  } catch (error) {
    res.send(error);
  }
});

// GET Posts by userID
router.get("/myPosts", async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const userCheck = await users.findOne({ email: decoded.email });
    if (userCheck) {
      const data = await posts.find({ userId: userCheck._id });
      res.send({ data: data });
    } else {
      res.send({ message: "Invalid Token" });
    }
  } catch (error) {
    res.send(error);
  }
});

// ADD POST
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const userCheck = await users.findOne({ email: decoded.email });
    if (userCheck) {
      const newPost = new posts({
        ...req.body,
        userId: userCheck._id,
        img: req.file.filename,
      });
      await posts.create(newPost);
      res.send({ message: "Created Post" });
    } else {
      res.send({ message: "Invalid Token" });
    }
  } catch (error) {
    res.send(error);
  }
});

// UPDATE POST
router.put("/update/:postId", upload.single("file"), async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const userCheck = await users.findOne({ email: decoded.email });
    if (userCheck) {
      const data = await posts.findById(req.params.postId);
      if (data) {
        if (data.userId == userCheck._id) {
          await posts.findByIdAndUpdate(req.params.postId, {
            ...req.body,
            img: req.file?.filename,
          });
          res.send({ message: "Updated Post" });
        } else {
          res.status(401).json({ message: "You can't delete this post" });
        }
      } else {
        res.status(400).send({ message: "Post not found" });
      }
    } else {
      res.send({ message: "Invalid Token" });
    }
  } catch (error) {
    res.send(error);
  }
});

// LIKE POST
router.put("/:id", async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const userCheck = await users.findOne({ email: decoded.email });
    if (userCheck) {
      const findPost = await posts.findById(req.params.id);

      if (findPost.likes.includes(userCheck._id)) {
        await posts.findByIdAndUpdate(req.params.id, {
          $pull: {
            likes: userCheck._id,
          },
        });
        res.send({ message: "DisLiked Post" });
      } else {
        await posts.findByIdAndUpdate(req.params.id, {
          $push: {
            likes: userCheck._id,
          },
        });
        res.send({ message: "Liked Post" });
      }
    } else {
      res.send({ message: "Invalid Token" });
    }
  } catch (error) {
    res.send(error);
  }
});

// DELETE POST
router.delete("/:postId", async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const userCheck = await users.findOne({ email: decoded.email });
    if (userCheck) {
      const data = await posts.findById(req.params.postId);
      console.log(data);
      if (data) {
        if (data.userId == userCheck._id) {
          await posts.deleteOne({ _id: req.params.postId });
          res.status(200).send({ message: "Deleted Post!" });
        } else {
          res.status(401).json({ message: "You can't delete this post" });
        }
      } else {
        res.status(400).send({ message: "Post not found" });
      }
    } else {
      res.send({ message: "Invalid Token" });
    }
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
