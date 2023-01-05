const mongoose = require("mongoose");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const users = require("./routes/users");
const auth = require("./routes/auth");
const posts = require("./routes/posts");
const messages = require("./routes/messages");
const chats = require("./routes/chats");
require("dotenv/config");
const app = express();
const PORT = process.env.PORT;

// connection to mongodb
mongoose.set("strictQuery", false);
mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to server");
  }
);

// ----------- Socket Io --------------- //
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let activeUsers = [];

io.on("connection", (socket) => {
  // add new User
  socket.on("new-user-add", (newUserId) => {
    // if user is not added previously
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({ userId: newUserId, socketId: socket.id });
    }
    // send all active users to new user
    io.emit("get-users", activeUsers);
  });

  socket.on("disconnect", () => {
    // remove user from active users
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    // send all active users to all users
    io.emit("get-users", activeUsers);
  });

  // send message to a specific user
  socket.on("send-message", (data) => {
    const { receiverId } = data;
    const user = activeUsers.find((user) => user.userId === receiverId);

    if (user) {
      io.to(user.socketId).emit("recieve-message", data);
    }
  });
});

// middlewares
app.use(express.static(__dirname));
app.use(morgan("common"));
app.use(express.json());
app.use(helmet());
app.use(cors());

// routes
app.use("/api/users", users);
app.use("/api/auth", auth);
app.use("/api/posts", posts);
app.use("/api/messages", messages);
app.use("/api/chats", chats);

app.get('/', (req, res) => {
  res.send('Hey this is my API running 🥳')
})

// server starting
server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
