const router = require("express").Router();
const user = require("../models/userModel");
const post = require("../models/postModel");
const upload = require("../middlewares/upload");
const VerifyToken = require("../middlewares/VerifyToken");

// ALL POSTS
router.get("/", async (req, res) => {
  try {
    const data = await post.find();
    res.send({ posts: data.reverse() });
  } catch (error) {
    res.status(500).send("internal server error");
    console.log(error);
  }
});

// POSTS BY USER
router.get("/:userId", async (req, res) => {
  try {
    const userExist = await user.findOne({ _id: req.params.userId });
    if (userExist) {
      const data = await post.find({ user_id: req.params.userId });
      res.send({ posts: data });
    } else {
      res.status(401).json({ message: "Invalid User!" });
    }
  } catch (error) {
    res.status(500).send("internal server error");
    console.log(error);
  }
});

// ADD POST
router.post("/", VerifyToken, upload.single("file"), async (req, res) => {
  const { title, desc } = req.body;
  if (!title || !desc) {
    res.status(422).json({ message: "Please fill all fields!" });
  }
  try {
    const userExist = await user.findOne({ email: req.user.email });
    await post.create({
      title,
      desc,
      user_id: userExist._id,
      img: req.file.filename,
    });
    res.send({ message: "Post Created!" });
  } catch (error) {
    res.status(500).send("internal server error");
    console.log(error);
  }
});

// DELETE POST
router.delete("/:postId", VerifyToken, async (req, res) => {
  try {
    const userExist = await user.findOne({ email: req.user.email });
    const postData = await post.findById(req.params.postId);
    if (postData) {
      if (postData.user_id == userExist._id) {
        await post.deleteOne({ _id: req.params.postId });
        res.status(200).send({ message: "Deleted Post!" });
      } else {
        res.status(401).json({ message: "You can't delete this post" });
      }
    } else {
      res.status(422).send({ message: "Post not found" });
    }
  } catch (error) {
    res.status(500).send("internal server error");
    console.log(error);
  }
});

// UPDATE POST
router.put("/:postId", VerifyToken, upload.single("file"), async (req, res) => {
  try {
    const userExist = await user.findOne({ email: req.user.email });
    const postData = await post.findById(req.params.postId);
    if (postData) {
      if (postData.user_id == userExist._id) {
        await post.findByIdAndUpdate(req.params.postId, {
          ...req.body,
          img: req?.file?.filename,
        });
        res.status(201).send({ message: "Updated Post!" });
      } else {
        res.status(401).json({ message: "You can't update this post!" });
      }
    } else {
      res.status(422).send({ message: "Post not found" });
    }
  } catch (error) {
    res.status(500).send("internal server error");
    console.log(error);
  }
});

// LIKE & DISLIKE POST
router.put("/like_dislike/:postId", async (req, res) => {
  try {
    const postData = await post.findById(req.params.postId);
    if (postData) {
      if (postData.likes.includes(req.body.user_id)) {
        await post.findByIdAndUpdate(req.params.postId, {
          $pull: {
            likes: req.body.user_id,
          },
        });
        res.status(201).send({ message: "Disliked Post!" });
      } else {
        await post.findByIdAndUpdate(req.params.postId, {
          $push: {
            likes: req.body.user_id,
          },
        });
        res.status(201).send({ message: "Liked Post!" });
      }
    } else {
      res.status(422).send({ message: "Post not found" });
    }
  } catch (error) {
    res.status(500).send("internal server error");
    console.log(error);
  }
});

module.exports = router;
