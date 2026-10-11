
import { Server } from "socket.io";

const connections = {};
const messages = {};
const timeOnline = {};

export const connectToServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Restrict this to your frontend URL in production
    },
  });

  io.on("connection", (socket) => {
    socket.on("join-call", (path) => {
      if (typeof path !== "string" || !path.trim()) return;

      socket.join(path);

      if (!connections[path]) {
        connections[path] = [];
      }

      if (!connections[path].includes(socket.id)) {
        connections[path].push(socket.id);
      }

      timeOnline[socket.id] = new Date();

      socket.to(path).emit("user-joined", socket.id, connections[path]);

      if (messages[path]) {
        messages[path].forEach(({ date, sender, text }) => {
          socket.emit("chat-message", date, sender, text);
        });
      }
    });

    socket.on("signal", (toId, message) => {
      if (typeof toId !== "string" || !message) return;

      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", (messageText) => {
      const room = Object.keys(connections).find((path) =>
        connections[path].includes(socket.id)
      );

      if (!room || typeof messageText !== "string" || !messageText.trim()) {
        return;
      }

      const payload = {
        date: new Date(),
        sender: socket.id,
        text: messageText.trim(),
      };

      if (!messages[room]) {
        messages[room] = [];
      }

      messages[room].push(payload);

      io.to(room).emit(
        "chat-message",
        payload.date,
        payload.sender,
        payload.text
      );
    });

    socket.on("disconnect", () => {
      for (const path of Object.keys(connections)) {
        const index = connections[path].indexOf(socket.id);

        if (index === -1) continue;

        connections[path].splice(index, 1);

        if (connections[path].length === 0) {
          delete connections[path];
          delete messages[path];
        } else {
          io.to(path).emit("user-left", socket.id, connections[path]);
        }
      }

      delete timeOnline[socket.id];
    });
  });

  return io;
};
