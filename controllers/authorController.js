import asyncHandler from "express-async-handler";
import Author from "../models/AuthorModel.js";
import Book from "../models/BookModel.js";
import mongoose from "mongoose";
import sharp from "sharp";

/* 
   ######### NOTE:// I used pagination here ###################
   ######### NOTE:// I also used search here ##################
   It depends on if the user entered a specific query parameters
   in the URL (keyword) if he add it to the url the function
   will return the result after searching about this keyword
   also I implemented pagination here.
*/
//    @desc   Fetch all authors
//    @route  GET /api/authors
// or @route GET /api/authors?keyword=Harry // for searching with author name
// or @route GET /api/authors?pageNumber=2 // for Pagination
//    @access Public
const getAuthors = asyncHandler(async (req, res) => {
  // we can change the number of page size it if we want.
  const pageSize = 3;
  // the current page will be either 1 or the number that user
  // entered in the URL.
  const page = Number(req.query.pageNumber) || 1;

  // get the keyword to search if existed.
  const keyword = req.query.keyword
    ? {
        name: {
          // Special for Mongoose
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {};
  const count = await Author.countDocuments(keyword);
  const authors = await Author.find(keyword)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .populate("books"); // to pupulate all books for that author

  // return the page and pages so the frontend developer can
  // handle the pagination in the UI.
  res.json({ authors, page, pages: Math.ceil(count / pageSize) });
});

// @desc   Fetch single Author
// @route  GET /api/authors/:id
// @access Public
const getAuthorById = asyncHandler(async (req, res) => {
  const author = await Author.findById(req.params.id).populate(
    "books",
    "-authors"
  ); // Here pupulate all books of that Author without the authors field
  if (author) {
    res.json(author);
  } else {
    res.status(404);
    throw new Error("Author not found");
  }
});

// @desc   Create Author Review
// @route  POST /api/authors/:id/reviews
// @access Private
const createAuthorReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const author = await Author.findById(req.params.id);
  if (author) {
    const alreadyReviewd = author.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewd) {
      res.status(400);
      throw new Error("Author already reviewed");
    }
    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };
    author.reviews.push(review);
    author.numReviews = author.reviews.length;
    author.rating =
      author.reviews.reduce((acc, item) => item.rating + acc, 0) /
      author.reviews.length; // sum of ratings / sum of reviews
    await author.save();
    res.status(201).json({ message: "Review added." });
  } else {
    res.status(404);
    throw new Error("Author not found.");
  }
});

// @desc   Get top rated Author
// @route  /api/authors/top
// @access Private
const getTopAuthors = asyncHandler(async (req, res) => {
  // -1 to be sorted in ascending order
  const authors = await Author.find({}).sort({ rating: -1 }).limit(3); // Get just the first 3 but you can chnage the limit of it.
  res.json(authors);
});

// @desc   Delete an Author
// @route  DELETE /api/authors/:id
// @access Private/Admin
const deleteAuthor = asyncHandler(async (req, res) => {
  const author = await Author.findById(req.params.id);
  if (author) {
    // Here we trust any admin in the site to delete an Author
    await Author.deleteOne({ _id: author._id });
    res.json({ message: "Author removed" });
  } else {
    res.status(404);
    throw new Error("Author not found");
  }
});

// @desc   Create an Author
// @route  POST /api/authors/
// @access Private/Admin
const createAuthor = asyncHandler(async (req, res) => {
  const author = new Author({
    name: req.body.name,
    bio: req.body.bio,
    books: [],
  });
  const createdAuthor = await author.save();
  res.status(201).json(createdAuthor);
});

// @desc   Update an Author
// @route  PUT /api/authors/:id
// @access Private/Admin
const updateAuthor = asyncHandler(async (req, res) => {
  const { name, bio } = req.body;
  const author = await Author.findById(req.params.id);
  if (author) {
    author.name = name;
    author.bio = bio;
    const updatedAuthor = await author.save();
    res.json(updatedAuthor);
  } else {
    res.status(404);
    throw new Error("Author not found");
  }
});

// @desc   Assign a book to an Author
// @route  PUT /api/authors/addBook
// @access Private/Admin
const assignBookToAuthor = asyncHandler(async (req, res) => {
  const { bookId, authorId } = req.body;
  const book = await Book.findById(bookId);
  const author = await Author.findById(authorId);
  if (book && author && !author["books"].includes(bookId)) {
    author["books"].push(bookId);
    const updatedAuthor = await author.save();
    res.json(updatedAuthor);
  } else {
    res.status(404);
    if (author["books"].includes(bookId)) {
      throw new Error("Book already exist!");
    } else {
      throw new Error("an Error happend! Please try again with a valid input.");
    }
  }
});

// @desc   Delete a book from an Author
// @route  PUT /api/authors/deleteBook
// @access Private/Admin
const deleteBookFromAuthor = asyncHandler(async (req, res) => {
  const { bookId, authorId } = req.body;
  const book = await Book.findById(bookId);
  const author = await Author.findById(authorId);
  if (book && author && author["books"].includes(bookId)) {
    author["books"] = author["books"].filter((id) => id.toString() !== bookId);
    const updatedAuthor = await author.save();
    res.json(updatedAuthor);
  } else {
    res.status(404);
    if (!author["books"].includes(bookId)) {
      throw new Error("can't find the Book!");
    } else {
      throw new Error("an Error happend! Please try again with a valid input.");
    }
  }
});

// @desc Upload author avatar
// @route Post /api/authors/:authorId/avatar
// @access Private/Admin
const uploadAuthorAvatar = asyncHandler(async (req, res) => {
  const buffer = await sharp(req.file.buffer)
    .resize({ width: 250, height: 250 })
    .png()
    .toBuffer();
  const author = await Author.findById(req.params.authorId);
  if (author) {
    author.avatar = buffer;
    await author.save();
    res.send("avatar saved successfully!");
  } else {
    throw new Error("Author not found! Please enter a valid Id.");
  }
});

// @desc Delete author avatar
// @route Delete /api/authors/:authorId/avatar
// @access Private/Admin
const deleteAuthorAvatar = asyncHandler(async (req, res) => {
  const author = await Author.findById(req.params.authorId);
  author.avatar = undefined;
  await author.save();
  res.send("Avatar delete successfully!");
});

// @desc Get Author Avatar
// @route GET /api/authors/:authorId/avatar
// @access Public
const getAuthorAvatar = asyncHandler(async (req, res) => {
  try {
    const author = await Author.findById(req.params.authorId);
    if (!author || !author.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/png");
    res.send(author.avatar);
  } catch (e) {
    // res.status(404).send(`Can't find author or an avatar for that author.`);
    res.status(404).send(e.message);
  }
});

export {
  getAuthors,
  getAuthorById,
  createAuthorReview,
  getTopAuthors,
  deleteAuthor,
  createAuthor,
  updateAuthor,
  assignBookToAuthor,
  deleteBookFromAuthor,
  uploadAuthorAvatar,
  deleteAuthorAvatar,
  getAuthorAvatar,
};
