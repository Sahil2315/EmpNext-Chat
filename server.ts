let express = require("express");
let app = express();
const server = require("http").Server(app);
const socket = require("socket.io");
const cors = require("cors");
let db = require("./database.ts");

const io = socket(server);

app.use(
  cors({
    origin: "https://emp-next-five.vercel.app",
    credentials: true,
  })
);

io.attach(server, {
  cors: {
    origin: "https://emp-next-five.vercel.app",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("InitConnect", async (msg) => {
    socket.join(`roomPrefix${msg.team}`);
    let allChat = await db.allMessages();
    let teamChat = await db.teamMessages(msg.team);
    if (allChat.querySuccess && teamChat.querySuccess) {
      socket.emit("InitResp", {
        allChat: allChat.result,
        teamChat: teamChat.result,
      });
    }
  });
  socket.on("newMsg", async (details) => {
    let query = await db.newMessage(details);
    let newDate = new Date();
    if (query.querySuccess) {
      if (details.team == 0) {
        io.sockets.emit("AllChatReceived", {
          empid: details.empid,
          ename: details.ename,
          date: `${newDate.getFullYear()}-${
            newDate.getMonth() + 1
          }-${newDate.getDate()}`,
          time: `${newDate.getHours()}:${newDate.getMinutes()}`,
          msgcont: details.msgCont,
          team: details.team,
        });
      } else {
        io.to(`roomPrefix${details.team}`).emit("TeamChatReceived", {
          empid: details.empid,
          ename: details.ename,
          date: `${newDate.getFullYear()}-${
            newDate.getMonth() + 1
          }-${newDate.getDate()}`,
          time: `${newDate.getHours()}:${newDate.getMinutes()}`,
          msgcont: details.msgCont,
          team: details.team,
        });
      }
    }
  });
});

server.listen(5000, () => {
  console.log("Chat Server on Port 5000");
});
