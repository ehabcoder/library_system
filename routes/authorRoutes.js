import express from "express";
import upload from "../utils/fileUploading.js";

import {
  getAuthors,
  getAuthorById,
  deleteAuthor,
  createAuthor,
  updateAuthor,
  assignBookToAuthor,
  deleteBookFromUser,
  uploadAuthorAvatar,
  deleteAuthorAvatar,
  getAuthorAvatar,
} from "../controllers/authorController.js";

import { protect, admin } from "../middleware/authMiddleware.js";
import { errorHandler } from "../middleware/errorMiddleware.js";

const router = new express.Router();

// GET ?keyword=AnyStringToSearch
// GET ?pageNumber=numberOfThePageTheYouWant
router.get("/", getAuthors);

router.get("/:id", getAuthorById);

router.delete("/:id", protect, admin, deleteAuthor);

router.post("/", protect, admin, createAuthor);

router.put("/:id", protect, admin, updateAuthor);

// add book to author
router.post("/addBook", protect, admin, assignBookToAuthor);

// remove book from author
router.post("/deleteBook", protect, admin, deleteBookFromUser);

// // Upload Author Avatar
router.post(
  "/:authorId/avatar",
  protect,
  admin,
  upload.single("avatar"),
  uploadAuthorAvatar,
  errorHandler
);

// Delete User Avatar
router.delete(
  "/:authorId/avatar",
  protect,
  admin,
  upload.single("avatar"),
  deleteAuthorAvatar,
  errorHandler
);

// Get Author Avatar
router.get("/:authorId/avatar", getAuthorAvatar, errorHandler);

export default router;
