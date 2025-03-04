import Chat from "../models/chatModel.js";


const activeUsers = new Map();

export const chatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Store user in active users
    socket.on("join", (userId) => {
      if (userId) {
        activeUsers.set(userId, socket.id);
        console.log(`User ${userId} connected`);
      }
    });

    // Handle message sending
    socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
      const receiverSocketId = activeUsers.get(receiverId);

      // Save message to MongoDB
      const chatMessage = new Chat({ sender: senderId, receiver: receiverId, message });
      await chatMessage.save();

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", { senderId, message });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      activeUsers.forEach((socketId, userId) => {
        if (socketId === socket.id) {
          activeUsers.delete(userId);
        }
      });
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
