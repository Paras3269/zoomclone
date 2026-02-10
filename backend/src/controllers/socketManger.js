import { Server } from "socket.io";
import cors from "cors";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // JOIN ROOM
    socket.on("join-call", (path) => {
      if (!connections[path]) {
        connections[path] = [];
      }

      connections[path].push(socket.id);
      timeOnline[socket.id] = new Date();

      // Notify users
      connections[path].forEach((id) => {
        io.to(id).emit("user-joined", socket.id, connections[path]);
      });

      // Send old messages
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

    // WEBRTC SIGNAL
    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    // CHAT MESSAGE
    socket.on("chat-message", (data, sender) => {
      let matchingRoom = null;

      for (const [room, users] of Object.entries(connections)) {
        if (users.includes(socket.id)) {
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

      console.log("Message:", matchingRoom, sender, data);

      connections[matchingRoom].forEach((id) => {
        io.to(id).emit("chat-message", data, sender, socket.id);
      });
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);

      delete timeOnline[socket.id];

      for (const [room, users] of Object.entries(connections)) {
        if (users.includes(socket.id)) {
          connections[room] = users.filter((id) => id !== socket.id);

          connections[room].forEach((id) => {
            io.to(id).emit("user-left", socket.id);
          });

          if (connections[room].length === 0) {
            delete connections[room];
          }

          break;
        }
      }
    });
  });

  return io;
};