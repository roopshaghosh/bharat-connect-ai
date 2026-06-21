const { Server } = require('socket.io');

let io;
const connectedUsers = new Map(); // Maps userId string -> socketId string

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected to websocket:', socket.id);

    // Register user when they connect
    socket.on('register', (userId) => {
      if (userId) {
        connectedUsers.set(userId.toString(), socket.id);
        console.log(`User ${userId} registered to socket ${socket.id}`);
      }
    });

    socket.on('disconnect', () => {
      // Find and remove from map
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          console.log(`User ${userId} disconnected from socket`);
          break;
        }
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Helper to emit real-time event to specific user
const emitToUser = (userId, eventName, data) => {
  if (io && userId) {
    const socketId = connectedUsers.get(userId.toString());
    if (socketId) {
      io.to(socketId).emit(eventName, data);
      console.log(`Socket emit ${eventName} to user ${userId}`);
    } else {
      console.log(`User ${userId} is offline, skipping real-time socket emit`);
    }
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToUser,
};
