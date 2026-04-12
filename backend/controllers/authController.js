import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in environment variables");
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password || password.length < 6) {
    return res.status(400).json({
      message: "Email y password (min. 6) son obligatorios",
    });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: "Usuario ya registrado" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    passwordHash: hashed,
  });

  return res.status(201).json({
    user: { id: user._id, email: user.email },
    token: generateToken(user._id),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email y password son obligatorios" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Credenciales invalidas" });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(400).json({ message: "Credenciales invalidas" });
  }

  return res.json({
    user: { id: user._id, email: user.email },
    token: generateToken(user._id),
  });
});

export const me = asyncHandler(async (req, res) => {
  return res.json({ user: req.user });
});
