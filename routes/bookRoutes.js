import express from "express";
import upload from "../utils/fileUploading.js";

import {
  getBooks,
  getBookById,
  deleteBook,
  createBook,
  updateBook,
  assignAuthorToBook,
  deleteAuthorfromBook,
  uploadBookImage,
  deleteBookImage,
  getbookImage,
} from "../controllers/bookController.js";

import { protect, admin } from "../middleware/authMiddleware.js";
import { errorHandler } from "../middleware/errorMiddleware.js";

const router = new express.Router();

// GET ?keyword=AnyStringToSearch
// GET ?pageNumber=numberOfThePageTheYouWant
router.get("/", getBooks);

router.get("/:id", getBookById);

router.delete("/:id", protect, admin, deleteBook);

router.post("/", protect, admin, createBook);

router.put("/:id", protect, admin, updateBook);

// add Author to book
router.post("/addAuthor", protect, admin, assignAuthorToBook);

// remove author from book
router.post("/deleteAuthor", protect, admin, deleteAuthorfromBook);

// // Upload book image
router.post(
  "/:bookId/image",
  protect,
  admin,
  upload.single("image"),
  uploadBookImage,
  errorHandler
);

// Delete Book Image
router.delete(
  "/:bookId/image",
  protect,
  admin,
  upload.single("image"),
  deleteBookImage,
  errorHandler
);

// Get Book Image
router.get("/:bookId/image", getbookImage, errorHandler);

export default router;
