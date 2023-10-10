import express from "express";
import upload from "../utils/fileUploading.js";

import { protect, admin } from "../middleware/authMiddleware.js";
import { errorHandler } from "../middleware/errorMiddleware.js";

const router = new express.Router();

// @desc   Fetch all Authors
// @route  GET /api/authors
// @access Public
