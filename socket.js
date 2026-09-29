import Message from "./models/MessagesModel.js";
import Channel from "./models/ChannelModel.js";

let serverIO;
export const userSocketMap = new Map();

export default function setupSocket(io) {
  serverIO = io;

  const users = {};
  
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId && userId !== "undefined") {
      userSocketMap.set(userId, socket.id);
    } else {
      return;
    }
    socket.on("sendMessage", async (data) => {
      const senderSocketId = userSocketMap.get(data.sender);
      const recipientSocketId = userSocketMap.get(data.recipient);

      const createdMessage = await Message.create(data);
      const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "id email username image")
        .populate("recipient", "id email username image");

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receiveMessage", messageData);
      }
      if (senderSocketId) {
        io.to(senderSocketId).emit("receiveMessage", messageData);
      }
    });

    socket.on("sendChannelMessage", async (data) => {
      const { sender, content, recipient, messageType, channelId } = data;

      const channel = await Channel.findById(channelId);

      if (!channel) return;

      const createdMessage = await Message.create({
        sender,
        content,
        recipient, // null
        messageType,
      });

      channel.messages.push(createdMessage._id);

      await channel.save();

      const messageData = await Message.findById(createdMessage._id).populate(
        "sender",
        "username email image",
      );

      const sendingData = {
        ...messageData.toObject(),
        channelId,
      };

      channel.members.forEach((memberId) => {
        const socketId = userSocketMap.get(memberId.toString());

        if (socketId) {
          io.to(socketId).emit("receiveChannelMessage", sendingData);
        }
      });
    });

    socket.on("disconnect", (socket) => {
      for (const [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          break;
        }
      }
    });
  });
}

export const getIO = () => {
  if (!serverIO) {
    throw new Error("Socket not initialized");
  }
  return serverIO;
};
