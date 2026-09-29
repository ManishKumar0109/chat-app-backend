import Message from "../models/MessagesModel.js";
import Channel from "../models/ChannelModel.js";
import cloudinary from "../config/cloudinary.js";
import { userSocketMap } from "../socket.js";
import { getIO } from "../socket.js";

export const getMessages = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const { recipientId, channelId } = req.body;

    // ---------------- PRIVATE CHAT ----------------
    if (recipientId) {
      const messages = await Message.find({
        $or: [
          { sender: currentUserId, recipient: recipientId },
          { sender: recipientId, recipient: currentUserId },
        ],
      })
        .populate("sender", "username email image")
        .populate("recipient", "username email image")
        .sort({ createdAt: 1 });
      

      return res.status(200).json({
        success: true,
        data: messages,
      });
    }

    // ---------------- CHANNEL CHAT ----------------
    if (channelId) {
      const channel = await Channel.findById(channelId).populate({
        path: "messages",
        populate: {
          path: "sender",
          select: "username email image",
        },
      });

      if (!channel) {
        return res.status(404).json({
          success: false,
          message: "Channel not found",
        });
      }
      return res.status(200).json({
        success: true,
        data: channel.messages,
      });
    }

    // ---------------- INVALID REQUEST ----------------
    return res.status(400).json({
      success: false,
      message: "recipientId or channelId required",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendFile = async (req, res) => {
  try {

    const file = req.file;
    const sender = req.user.userId;
    const { recipient, messageType, channelId, members } = req.body;

    if (!file) {
      return res.status(400).json({
        message: "No file provided",
      });
    }

    // ALLOWED TYPES
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",

      "application/pdf",

      "video/mp4",
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        message: "Unsupported file type",
      });
    }
    // 5MB LIMIT
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      return res.status(400).json({
        message: "File size exceeds 5MB",
      });
    }

    // DETECT RESOURCE TYPE
    let resourceType = "auto";

    // PDF
    if (file.mimetype === "application/pdf") {
      resourceType = "raw";
    }

    // VIDEO
    if (file.mimetype.startsWith("video/")) {
      resourceType = "video";
    }
    // CLOUDINARY UPLOAD
    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      {
        resource_type: resourceType,

        folder: "chat-app",
      },
    );

    const fileUrl = result.secure_url;
    // --- PRIVATE CHAT ---

    // CREATE MESSAGE
    if (recipient) {
      console.log("yopo8");
      const createdMessage = await Message.create({
        sender,
        recipient,
        messageType,
        fileUrl,
        fileName: file.originalname,
      });

      // POPULATE
      const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "username email image")
        .populate("recipient", "username email image");

      // SOCKET
      const serverIO = getIO();

      const senderSocketId = userSocketMap.get(sender.toString());

      const recipientSocketId = userSocketMap.get(recipient.toString());

      if (recipientSocketId) {
        serverIO.to(recipientSocketId).emit("receiveMessage", messageData);
      }
      if (senderSocketId) {
        serverIO.to(senderSocketId).emit("receiveMessage", messageData);
      }
    }

    // --- GROUP CHAT ---
    else if (channelId) {
      const channel = await Channel.findById(channelId);

      if (!channel) {
        return res.status(404).json({
          message: "Channel not found",
        });
      }

      const createdMessage = await Message.create({
        sender,
        recipient: null,
        messageType,
        fileUrl,
        fileName: file.originalname,
      });

      channel.messages.push(createdMessage._id);

      await channel.save();

      const populatedMessage = await Message.findById(
        createdMessage._id,
      ).populate("sender", "username email image");

      const serverIO = getIO();

      const sendingData = {
        ...populatedMessage.toObject(),
        channelId,
      };

      channel.members.forEach((memberId) => {
        const socketId = userSocketMap.get(memberId.toString());

        if (socketId) {
          serverIO.to(socketId).emit("receiveChannelMessage", sendingData);
        }
      });
    }
    return res.status(200).json({
      success: true,
      message: "File sent successfully",
    });
  } catch (err) {
    console.log("error", err.message);

    return res.status(500).json({
      message: "File send failed",
    });
  }
};
