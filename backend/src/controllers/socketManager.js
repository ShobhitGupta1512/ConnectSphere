
import { Server } from "socket.io";

const connections = new Map();
const messages = new Map();
const timeOnline = new Map();

const MAX_MESSAGE_LENGTH = 2000;
const MAX_CHAT_HISTORY = 100;
const MAX_ROOM_LENGTH = 128;
const MAX_SIGNAL_SIZE = 64 * 1024;

function isValidRoom(room) {
  return (
    typeof room === "string" &&
    room.trim().length > 0 &&
    room.length <= MAX_ROOM_LENGTH
  );
}

function isValidSignal(message) {
  if (
    !message ||
    typeof message !== "object" ||
    Array.isArray(message)
  ) {
    return false;
  }

  try {
    return Buffer.byteLength(JSON.stringify(message), "utf8") <= MAX_SIGNAL_SIZE;
  } catch {
    return false;
  }
}

export const connectToServer = (server) => {
  const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

  const io = new Server(server, {
    cors: {
      origin: allowedOrigin,
      methods: ["GET", "POST"],
    },
    maxHttpBufferSize: 1e6,
  });

  // Find the rooms a socket has joined through this meeting system.
  const getSocketRooms = (socketId) => {
    const rooms = [];

    for (const [room, participants] of connections.entries()) {
      if (participants.has(socketId)) {
        rooms.push(room);
      }
    }

    return rooms;
  };

  const removeFromRoom = (socket, room) => {
    const participants = connections.get(room);

    if (!participants || !participants.has(socket.id)) {
      return;
    }

    participants.delete(socket.id);
    socket.leave(room);

    if (participants.size === 0) {
      connections.delete(room);
      messages.delete(room);
    } else {
      io.to(room).emit("user-left", socket.id, [...participants]);
    }
  };

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-call", (roomValue) => {
      if (!isValidRoom(roomValue)) {
        socket.emit("meeting-error", {
          message: "Invalid meeting room.",
        });
        return;
      }

      const room = roomValue.trim();
      const currentRooms = getSocketRooms(socket.id);

      // Prevent duplicate joins and accidental cross-room state.
      if (currentRooms.includes(room)) {
        socket.emit(
          "existing-participants",
          [...connections.get(room)].filter((id) => id !== socket.id)
        );
        return;
      }

      // A socket belongs to one active meeting at a time.
      for (const previousRoom of currentRooms) {
        removeFromRoom(socket, previousRoom);
      }

      if (!connections.has(room)) {
        connections.set(room, new Set());
      }

      const participants = connections.get(room);
      const existingParticipants = [...participants];

      participants.add(socket.id);
      socket.join(room);
      timeOnline.set(socket.id, new Date());

      // Send existing peers to the joining client.
      socket.emit("existing-participants", existingParticipants);

      // Notify existing peers about the new participant.
      socket.to(room).emit("user-joined", socket.id);

      // Preserve compatibility with your current chat event signature.
      const history = messages.get(room) || [];

      history.forEach(({ date, sender, text }) => {
        socket.emit("chat-message", date, sender, text);
      });

      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    socket.on("signal", (toId, message) => {
      if (
        typeof toId !== "string" ||
        !toId ||
        toId === socket.id ||
        !isValidSignal(message)
      ) {
        return;
      }

      const senderRooms = getSocketRooms(socket.id);
      const recipientRooms = getSocketRooms(toId);

      // Only relay signals between participants in the same room.
      const sharedRoom = senderRooms.find((room) =>
        recipientRooms.includes(room)
      );

      if (!sharedRoom) {
        return;
      }

      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", (messageText) => {
      const room = getSocketRooms(socket.id)[0];

      if (
        !room ||
        typeof messageText !== "string" ||
        !messageText.trim() ||
        messageText.length > MAX_MESSAGE_LENGTH
      ) {
        return;
      }

      const participants = connections.get(room);

      if (!participants?.has(socket.id)) {
        return;
      }

      const payload = {
        date: new Date(),
        sender: socket.id,
        text: messageText.trim(),
      };

      if (!messages.has(room)) {
        messages.set(room, []);
      }

      const history = messages.get(room);
      history.push(payload);

      // Keep memory usage bounded.
      if (history.length > MAX_CHAT_HISTORY) {
        history.splice(0, history.length - MAX_CHAT_HISTORY);
      }

      io.to(room).emit(
        "chat-message",
        payload.date,
        payload.sender,
        payload.text
      );
    });

    socket.on("leave-call", () => {
      for (const room of getSocketRooms(socket.id)) {
        removeFromRoom(socket, room);
      }

      timeOnline.delete(socket.id);
    });

    socket.on("disconnect", () => {
      for (const room of getSocketRooms(socket.id)) {
        removeFromRoom(socket, room);
      }

      timeOnline.delete(socket.id);
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};
