import asyncHandler from "express-async-handler";
import sharp from "sharp";

import generateToken from "../utils/generateToken.js";
import User from "../models/UserModel.js";

// @desc   Auth user & get token
// @route  POST /api/users/login
// @access Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findByCredentials(email, password);
  res.json({ user, token: generateToken(user._id) });
});

// @desc   Register a new user
// @route  POST /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, age } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User Already exists");
  }
  const user = await User.create({
    name,
    email,
    password,
    age,
  });

  if (user) {
    res.status(201).json({ user, token: generateToken(user._id) });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc   Get user profile
// @route  GET /api/users/profile
// @access Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User Not Found.");
  }
});

// // @desc   Update user profile
// // @route  PATCH /api/users/profile
// // @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const updates = Object.keys(req.body);
  if (!req.user.isAdmin) {
    // Here because we don't want any user to change if he is
    // an Admin or not, we filtered the fields that he can be update.
    const allowedUpdates = ["name", "email", "password", "age"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      res.status(400);
      throw new Error("Invalid updates!");
    }
  }

  try {
    const user = req.user;
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    if (!user) {
      return res.status(404).send();
    }

    res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// // @desc   Get all users
// // @route  GET /api/users
// // @access Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc   Delete user
// @route  DELETE /api/users/:id
// @access Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await User.deleteOne({ _id: req.params.id });
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// // @desc   Get user by ID
// // @route  GET /api/users/:id
// // @access Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc   Update user
// @route  PUT /api/users/:id
// @access Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.age = req.body.age || user.age;
    user.isAdmin = req.body.isAdmin;
    await user.save();
    res.status(202).json(user);
  } else {
    res.status(404);
    throw new Error("User Not Found.");
  }
});

// @desc Upload user avatar
// @route Post /api/users/me/avatar
// @access Private
const uploadAvatar = asyncHandler(async (req, res) => {
  const buffer = await sharp(req.file.buffer)
    .resize({ width: 250, height: 250 })
    .png()
    .toBuffer();
  req.user.avatar = buffer;
  await req.user.save();
  res.send();
});

// @desc Delete user avatar
// @route Delete /api/users/me/avatar
// @access Private
const deleteAvatar = asyncHandler(async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

// @desc Get Avatar
// @route GET /api/users/:id/avatar
// @access Public
const getAvatar = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send(`Can't find user or an avatar for that user.`);
  }
});

export {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  //
  uploadAvatar,
  deleteAvatar,
  getAvatar,
};
