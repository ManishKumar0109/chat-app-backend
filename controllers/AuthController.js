import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import validator from "validator";
import bcrypt from "bcrypt";

export const signup = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    const usernameError = !validator.isAlphanumeric(username);
    const emailError = !validator.isEmail(email);
    const passwordError = !validator.isStrongPassword(password);

    if (usernameError || passwordError || emailError) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({ email, password, username });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // 🔴 keep false in dev
      sameSite: "none", // 🔴 use lax for dev
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    user.password = undefined;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const emailError = !validator.isEmail(email);
    const passwordError = !validator.isStrongPassword(password);

    if (emailError || passwordError) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Not existing user. pls signup first !!",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(404).json({
        success: false,
        message: "Incorrect Password",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax", // ✅ FIX
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    user.password = undefined;
    console.log(token);
    res.status(201).json({
      success: true,
      message: "User login successfully",
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};
