import express from "express";
import upload from "../utils/fileUploading.js";

import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  ///
  uploadAvatar,
  deleteAvatar,
  getAvatar,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { errorHandler } from "../middleware/errorMiddleware.js";

// const { sendWelcomeEmail, sendcancellationEmail } = require('../emails/account')

const router = new express.Router();

// Create new user
router.post("/", registerUser);

// Auth User
router.post("/login", authUser);
export default router;

// Get user profile
router.get("/profile", protect, getUserProfile);

// Update user profile
router.patch("/profile", protect, updateUserProfile);

// Get all users
router.get("/", protect, admin, getUsers);

// Delete User (Admin only)
router.delete("/:id", protect, admin, deleteUser);

// Get user by id (Admin only)
router.get("/:id", protect, admin, getUserById);

// Update user by id (Admin only)
router.put("/:id", protect, admin, updateUser);

// #############################################################
// File Uploads

// Upload User Avatar
router.post(
  "/me/avatar",
  protect,
  upload.single("avatar"),
  uploadAvatar,
  errorHandler
);

// Delete User Avatar
router.delete(
  "/me/avatar",
  protect,
  upload.single("avatar"),
  deleteAvatar,
  errorHandler
);

// Get User Avatar
router.get("/:id/avatar", getAvatar, errorHandler);
