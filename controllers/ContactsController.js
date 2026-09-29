import User from "../models/UserModel.js";
import mongoose from "mongoose";
import Message from "../models/MessagesModel.js";

export const searchcontacts = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user.userId;

    // VALIDATION
    if (!query || query.trim().length < 2) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // CLEAN SEARCH
    const safeQuery = query.trim();

    const users = await User.find({
      _id: { $ne: currentUserId }, 

      $or: [
        {
          username: {
            $regex: safeQuery,
            $options: "i",
          },
        },
        {
          email: {
            $regex: safeQuery,
            $options: "i",
          },
        },
      ],
    })
      .select("_id username email image")
      .limit(15);

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getContacts = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const messages = await Message.find({
      recipient: { $ne: null },

      $or: [
        { sender: userId },
        { recipient: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .populate(
        "sender",
        "email username image"
      )
      .populate(
        "recipient",
        "email username image"
      )
      .lean();

    const seen = new Set();

    const contacts = [];

    messages.forEach((msg) => {
      const isMe =
        msg.sender._id.toString() ===
        userId.toString();

      const otherUser = isMe
        ? msg.recipient
        : msg.sender;

      if (!otherUser) return;

      const otherUserId =
        otherUser._id.toString();

      if (!seen.has(otherUserId)) {
        seen.add(otherUserId);

        contacts.push({
          _id: otherUserId,

          lastMessageTime:
            msg.createdAt,

          email: otherUser.email,

          username:
            otherUser.username,

          image: otherUser.image,
        });
      }
    });

    return res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
