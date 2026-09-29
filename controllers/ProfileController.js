
import User from "../models/UserModel.js";
import validator from "validator";
import cloudinary from '../config/cloudinary.js'

export const getuserinfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "email username image ",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateprofile = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await User.findById(req.user.userId);

    if (username) {
      const checkUserName = validator.isAlphanumeric(username);
      if (!checkUserName) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid username" });
      }
      user.username = username;
    }
    if (password) {
      const checkPassord = validator.isStrongPassword(password);
      if (!checkPassord) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid password" });
      }
      user.password = password;
    }
    await user.save();

    res.status(200).json({ success: true, message: "Profile Updated!!" });
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: "Internal server error" });
  }
};

export const updateprofilepicture = async (req, res, next) => { 
  try {
    const file = req.file;
    const {messageType}=req.body;
    if(!messageType==='file'){
      return res.status(400).json({ message: "messageType is not file" });
    }
    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    if (!file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        message: "Only image files are allowed",
      });
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({
        message: "File size must be less than 5MB",
      });
    }

    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
    );

    const imageUrl = result.secure_url;

    const user = await User.findById(req.user.userId);
    user.image = imageUrl;
    await user.save();

    res.json({
      success: true,
      message: "Profile picture updated",
      data: { image: imageUrl },
    });

  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: "Upload failed" });
  }
};
