const express = require("express");
const router = express.Router();
const users = require("../models/userModel");
const upload = require("../middlewares/upload");
const jwt = require("jsonwebtoken");

// ALL USERS
router.get("/", async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const userCheck = await users.findOne({ email: decoded.email });
    if (userCheck) {
      const all = await users.find();
      res.send({ data: all });
    } else {
      res.send({ message: "Invalid Token" });
    }
  } catch (error) {
    res.send(error);
  }
});

// USER'S PROFILE
router.get("/me", async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const userCheck = await users.findOne({ email: decoded.email });
    if (userCheck) {
      res.send({ data: userCheck });
    } else {
      res.send({ message: "Invalid Token" });
    }
  } catch (error) {
    res.send(error);
  }
});

// UPDATE PROFILE_PICTURE
router.put("/profile_picture", upload.single("file"), async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const currentUser = await users.findOne({ email: decoded.email });
    if (currentUser) {
      await users.findByIdAndUpdate(currentUser._id, {
        $set: { profilePicture: req.file.filename },
      });
      res.send({ message: "Profile Picture Updated" });
    } else {
      res.send({ message: "Invalid Token" });
    }
  } catch (error) {
    res.send(error);
  }
});

// UPDATE COVER_PICTURE
router.put("/cover_picture", upload.single("file"), async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const currentUser = await users.findOne({ email: decoded.email });
    if (currentUser) {
      await users.findByIdAndUpdate(currentUser._id, {
        $set: { coverPicture: req.file.filename },
      });
      res.send({ message: "Cover Picture Updated" });
    } else {
      res.send({ message: "Invalid Token" });
    }
  } catch (error) {
    res.send(error);
  }
});

// SEND REQUEST
router.put("/send_request/:id", async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const currentUser = await users.findOne({ email: decoded.email });
    if (currentUser) {
      if (currentUser._id !== req.params.id) {
        const userFind = await users.findById(req.params.id);

        if (!userFind.friends.includes(currentUser._id)) {
          if (!userFind.friendsRequest.includes(currentUser._id)) {
            await users.findByIdAndUpdate(req.params.id, {
              $push: {
                friendsRequest: currentUser._id,
              },
            });
            await users.findByIdAndUpdate(currentUser._id, {
              $push: {
                sendfriendsRequest: req.params.id,
              },
            });
            res.send({ message: "Sent Request" });
          } else {
            res.send({ message: "You have already sent request " });
          }
        } else {
          res.send({ message: "You are already friends " });
        }
      } else {
        res.send({ message: "Please enter valid userId" });
      }
    } else {
      res.send({ message: "Invalid Token" });
    }
  } catch (error) {
    res.send(error);
  }
});

// ACCEPT REQUEST
router.put("/accept_request/:id", async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const currentUser = await users.findOne({ email: decoded.email });
    if (currentUser) {
      if (currentUser._id !== req.params.id) {
        if (!currentUser.friends.includes(req.params.id)) {
          if (currentUser.friendsRequest.includes(req.params.id)) {
            const userAcceptRequest = await users.findById(req.params.id);
            const arr1 = [...currentUser.friendsRequest];
            const arr2 = [...userAcceptRequest.sendfriendsRequest];

            const index1 = arr1.findIndex((item) => {
              return item === req.params.id;
            });
            const index2 = arr2.findIndex((item) => {
              return item === currentUser._id;
            });
            arr1.splice(index1, 1);
            arr2.splice(index2, 1);
            await users.findByIdAndUpdate(currentUser._id, {
              $push: {
                friends: req.params.id,
              },
              $set: {
                friendsRequest: arr1,
              },
            });
            await users.findByIdAndUpdate(req.params.id, {
              $push: {
                friends: currentUser._id,
              },
              $set: {
                sendfriendsRequest: arr2,
              },
            });
            res.send({ message: "Accepted Request" });
          } else {
            res.send({ message: "You are already friends  " });
          }
        } else {
          res.send({ message: "You are already friends " });
        }
      } else {
        res.send({ message: "Please enter valid userId" });
      }
    } else {
      res.send({ message: "Invalid Token" });
    }
  } catch (error) {
    res.send(error);
  }
});

// REJECT REQUEST BY CURRENT USER
router.put("/reject_request/:id", async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const currentUser = await users.findOne({ email: decoded.email });
    if (currentUser) {
      if (currentUser._id !== req.params.id) {
        if (currentUser.friendsRequest.includes(req.params.id)) {
          const userAcceptRequest = await users.findById(req.params.id);
          const arr1 = [...currentUser.friendsRequest];
          const arr2 = [...userAcceptRequest.sendfriendsRequest];

          const index1 = arr1.findIndex((item) => {
            return item === req.params.id;
          });
          const index2 = arr2.findIndex((item) => {
            return item === currentUser._id;
          });
          arr1.splice(index1, 1);
          arr2.splice(index2, 1);
          await users.findByIdAndUpdate(currentUser._id, {
            $set: {
              friendsRequest: arr1,
            },
          });
          await users.findByIdAndUpdate(req.params.id, {
            $set: {
              sendfriendsRequest: arr2,
            },
          });
          res.send({ message: "Rejected Request" });
        } else {
          res.send({ message: "you have already rejected " });
        }
      } else {
        res.send({ message: "Please enter valid userId" });
      }
    } else {
      res.send({ message: "Invalid Token" });
    }
  } catch (error) {
    res.send(error);
  }
});

// CANCLE REQUEST BY USER
router.put("/cancel_request/:id", async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const currentUser = await users.findOne({ email: decoded.email });
    if (currentUser) {
      if (currentUser._id !== req.params.id) {
        if (currentUser.sendfriendsRequest.includes(req.params.id)) {
          await users.findByIdAndUpdate(req.params.id, {
            $pull: {
              friendsRequest: currentUser._id,
            },
          });
          await users.findByIdAndUpdate(currentUser._id, {
            $pull: {
              sendfriendsRequest: req.params.id,
            },
          });
          res.send({ message: "Canclled Request" });
        } else {
          res.send({ message: "you have already cancelled " });
        }
      } else {
        res.send({ message: "Please enter valid userId" });
      }
    } else {
      res.send({ message: "Invalid Token" });
    }
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
