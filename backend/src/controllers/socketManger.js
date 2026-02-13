import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: false
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-call", (path) => {
      if (!connections[path]) {
        connections[path] = [];
      }
       

      if (!connections[path].includes(socket.id)) {
        connections[path].push(socket.id);
      }

      timeOnline[socket.id] = new Date();

      // notify all users in room
      connections[path].forEach((id) => {
        io.to(id).emit("user-joined", socket.id, connections[path]);
      });

      // send previous messages
      if (messages[path]) {
        messages[path].forEach((msg) => {
          io.to(socket.id).emit(
            "chat-message",
            msg.data,
            msg.sender,
            msg["socket-id-sender"]
          );
        });
      }
    });

    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", (data, sender) => {
      let matchingRoom = null;

      for (const [room, sockets] of Object.entries(connections)) {
        if (sockets.includes(socket.id)) {
          matchingRoom = room;
          break;
        }
      }

      if (!matchingRoom) return;

      if (!messages[matchingRoom]) {
        messages[matchingRoom] = [];
      }

      messages[matchingRoom].push({
        sender,
        data,
        "socket-id-sender": socket.id
      });

      connections[matchingRoom].forEach((id) => {
        io.to(id).emit("chat-message", data, sender, socket.id);
      });
    });

    socket.on("disconnect", () => {
      delete timeOnline[socket.id];

      for (const [room, sockets] of Object.entries(connections)) {
        const index = sockets.indexOf(socket.id);

        if (index !== -1) {
          sockets.splice(index, 1);

          sockets.forEach((id) => {
            io.to(id).emit("user-left", socket.id);
          });

          if (sockets.length === 0) {
            delete connections[room];
          }

          break;
        }
      }

      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};
