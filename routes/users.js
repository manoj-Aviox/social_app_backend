const router = require("express").Router();
const user = require("../models/userModel");
const upload = require("../middlewares/upload");
const jwt = require("jsonwebtoken");
const VerifyToken = require("../middlewares/VerifyToken");

// ALL USERS
router.get("/", async (req, res) => {
  try {
    const allUsers = await user.find();
    res.send({ all_users: allUsers });
  } catch (error) {
    res.send(error);
  }
});

// USER BY ID
// router.get("/:userId", async (req, res) => {
//   try {
//     const userExist = await user.findOne({ _id: req.params.userId });
//     if (userExist) {
//       res.send({ data: userExist });
//     } else {
//       res.status(401).json({ message: "User not found!" });
//     }
//   } catch (error) {
//     res.status(500).send(error);
//     console.log(error);
//   }
// });

// USER'S PROFILE
router.get("/me", VerifyToken, async (req, res) => {
  try {
    const userExists = await user.findOne({ email: req.user.email });
    console.log(userExists);
    res.send({ profile: userExists });
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
});

// UPDATE PROFILE_PICTURE
router.put(
  "/profile_picture",
  VerifyToken,
  upload.single("file"),
  async (req, res) => {
    try {
      await user.updateOne(
        { email: req.user.email },
        {
          $set: {
            profilePicture: `http://localhost:4000/uploads/${req?.file?.filename}`,
          },
        }
      );

      res.send({ message: "Profile Picture Updated!" });
    } catch (error) {
      res.status(500).send("internal server error");
      console.log(error);
    }
  }
);

// UPDATE COVER_PICTURE
router.put(
  "/cover_picture",
  VerifyToken,
  upload.single("file"),
  async (req, res) => {
    try {
      await user.updateOne(
        { email: req.user.email },
        {
          $set: {
            coverPicture: `http://localhost:4000/uploads/${req?.file?.filename}`,
          },
        }
      );

      res.send({ message: "Cover Picture Updated!" });
    } catch (error) {
      res.status(500).send("internal server error");
      console.log(error);
    }
  }
);

// SEND REQUEST
router.put("/send_request/:id", VerifyToken, async (req, res) => {
  try {
    const currentUser = await user.findOne({ email: req.user.email });
    if (currentUser._id != req.params.id) {
      const userFind = await user.findById(req.params.id);

      if (!userFind.friends.includes(currentUser._id)) {
        if (!userFind.friendsRequest.includes(currentUser._id)) {
          await user.findByIdAndUpdate(req.params.id, {
            $push: {
              friendsRequest: currentUser._id,
            },
          });
          await user.findByIdAndUpdate(currentUser._id, {
            $push: {
              sendfriendsRequest: req.params.id,
            },
          });
          res.send({ message: "Sent Request!" });
        } else {
          res.send({ message: "You have already sent request " });
        }
      } else {
        res.send({ message: "You are already friends " });
      }
    } else {
      res.send({ message: "Please enter valid userId" });
    }
  } catch (error) {
    res.status(500).send("internal server error");
    console.log(error);
  }
});

// ACCEPT REQUEST
router.put("/accept_request/:id", VerifyToken, async (req, res) => {
  try {
    const currentUser = await user.findOne({ email: req.user.email });

    if (currentUser._id !== req.params.id) {
      if (!currentUser.friends.includes(req.params.id)) {
        if (currentUser.friendsRequest.includes(req.params.id)) {
          const userAcceptRequest = await user.findById(req.params.id);
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
          await user.findByIdAndUpdate(currentUser._id, {
            $push: {
              friends: req.params.id,
            },
            $set: {
              friendsRequest: arr1,
            },
          });
          await user.findByIdAndUpdate(req.params.id, {
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
  } catch (error) {
    res.send(error);
  }
});

// REJECT REQUEST BY CURRENT USER
router.put("/reject_request/:id", VerifyToken, async (req, res) => {
  try {
    const currentUser = await user.findOne({ email: req.user.email });

    if (currentUser._id !== req.params.id) {
      if (currentUser.friendsRequest.includes(req.params.id)) {
        const userAcceptRequest = await user.findById(req.params.id);
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
        await user.findByIdAndUpdate(currentUser._id, {
          $set: {
            friendsRequest: arr1,
          },
        });
        await user.findByIdAndUpdate(req.params.id, {
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
  } catch (error) {
    res.send(error);
  }
});

// CANCLE REQUEST BY USER
router.put("/cancel_request/:id", VerifyToken, async (req, res) => {
  try {
    const currentUser = await user.findOne({ email: req.user.email });
    if (currentUser._id !== req.params.id) {
      if (currentUser.sendfriendsRequest.includes(req.params.id)) {
        await user.findByIdAndUpdate(req.params.id, {
          $pull: {
            friendsRequest: currentUser._id,
          },
        });
        await user.findByIdAndUpdate(currentUser._id, {
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
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
