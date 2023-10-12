import asyncHandler from "express-async-handler";
import Book from "../models/BookModel.js";
import Author from "../models/AuthorModel.js";
import sharp from "sharp";

import myCache from "../caching/caching.js";
import {
  updatingCacheAfterEditing,
  updatingCacheAfterDeleting,
  updatingCacheAfterCreating,
} from "../caching/booksCashingHelpers.js";

//    @desc   Fetch all books
//    @access Public
//    @route GET /api/books
// or @route GET /api/books?keyword=harry Poter   // for searching with title
// or @route GET /api/books?pageNumber=2    // for pagination
// Note that we used node-cache here to cache the data.
const getBooks = asyncHandler(async (req, res) => {
  // we can change the number of page size it if we want.
  const pageSize = 3;

  // the current page will be either 1 or the number that user
  // entered in the URL.
  const page = Number(req.query.pageNumber) || 1;

  let books;
  // First we search for the data in our cache.
  if (myCache.get("books")) {
    console.log("We got the data from the Cache.");
    if (req.query.keyword) {
      //if we have query parameter
      let parsedBooks = JSON.parse(myCache.get("books"));
      books = parsedBooks.filter((book) =>
        book.title.includes(req.query.keyword)
      );
    } else {
      books = JSON.parse(myCache.get("books"));
    }
  } else {
    console.log("We got the data from the Database.");
    /* 
       First we get all books and save it to cache
       because we will not access this else statement
       except for the first time only. so we saved all 
       books to the cache in the first access.
    */
    books = await Book.find({}).populate("authors");
    // Save Books to cache
    myCache.set("books", JSON.stringify(books));
    // Search for Specific books using the keyword if we have a keyword in the request
    if (req.query.keyword) {
      books = books.filter((book) => book.title.includes(req.query.keyword));
    }
    //// This was the old approach before using caching.
    // // get the keyword to search if existed.
    // const keyword = req.query.keyword
    //   ? {
    //       title: {
    //         // Special for Mongoose
    //         $regex: req.query.keyword,
    //         $options: "i",
    //       },
    //     }
    //   : {};
    // // if the data not exists in our cache, we retrive it from the database.
    // count = await Book.countDocuments(keyword);
    // books = await Book.find(keyword)
    //   .limit(pageSize)
    //   .skip(pageSize * (page - 1))
    //   .populate("authors"); // to pupulate all authors for that book
  }
  // skip pages for pagination purpuses
  books = books.slice(pageSize * (page - 1));
  // limit the number of pages using pageSize variable
  books = books.slice(0, pageSize);
  // return the page and pages so the frontend developer can
  // handle the pagination in the UI.
  res.json({ books, page, pages: Math.ceil(books.length / pageSize) });
});

// @desc   Fetch single Book
// @route  GET /api/books/:id
// @access Public
const getBookById = asyncHandler(async (req, res) => {
  let book;
  if (myCache.get("books")) {
    // if we have books in the cache we search them for our book
    console.log("Got book from Cache.");
    const parsedBooks = JSON.parse(myCache(myCache.get("books")));
    book = parsedBooks.filter((book) => book._id === req.params.id);
  } else if (myCache.get("book")) {
    // if we have one single book we check to see if it's our desired book or not.
    console.log("Got book from Cache2.");
    const parsedBook = JSON.parse(myCache.get("book"));
    if (parsedBook._id === req.params.id) {
      book = parsedBook;
    }
  } else {
    // otherwise we get it from the database.
    console.log("Got book from Database.");
    book = await Book.findById(req.params.id).populate("authors", "-books"); // Here pupulate all authors of that Book without the books field
    myCache.set("book", JSON.stringify(book));
  }
  if (book) {
    res.json(book);
  } else {
    res.status(404);
    throw new Error("Book not found");
  }
});

// @desc   Create Book Review
// @route  POST /api/books/:id/reviews
// @access Private
const createBookReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const book = await Book.findById(req.params.id);
  if (book) {
    const alreadyReviewd = book.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewd) {
      res.status(400);
      throw new Error("Book already reviewed");
    }
    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };
    book.reviews.push(review);
    book.numReviews = book.reviews.length;
    book.rating =
      book.reviews.reduce((acc, item) => item.rating + acc, 0) /
      book.reviews.length; // sum of ratings / sum of reviews
    await book.save();
    updatingCacheAfterEditing(req, book);
    console.log(JSON.parse(myCache.get("books")));
    res.status(201).json({ message: "Review added." });
  } else {
    res.status(404);
    throw new Error("Book not found.");
  }
});

// @desc   Get top rated books
// @route  /api/books/top
// @access Private
const getTopBooks = asyncHandler(async (req, res) => {
  let books;
  if (myCache.get("books")) {
    console.log("Got top rated Books from the Cache.");
    books = JSON.parse(myCache.get("books"));
    books = books.sort((a, b) => b.rating - a.rating);
    books = books.slice(0, 3);
  } else if (myCache.get("topRatedBooks")) {
    // if we have Top rated books already.
    console.log("Got Top Rated books from Cache2.");
    books = JSON.parse(myCache.get("topRatedBooks"));
  } else {
    console.log("Got top rated Books from the database.");
    // -1 to be sorted in ascending order
    books = await Book.find({}).sort({ rating: -1 }).limit(3); // Get just the first 3 but you can chnage the limit of it.
    myCache.set("topRatedBooks", JSON.stringify(books));
  }
  res.json(books);
});

// @desc   Delete a Book
// @route  DELETE /api/books/:id
// @access Private/Admin
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (book) {
    // Here we trust any admin in the site to delete an Author
    await Book.deleteOne({ _id: book._id });
    updatingCacheAfterDeleting(req);
    res.json({ message: "Book removed" });
  } else {
    res.status(404);
    throw new Error("Book not found");
  }
});

// @desc   Create a Book
// @route  POST /api/authors/
// @access Private/Admin
const createBook = asyncHandler(async (req, res) => {
  const book = new Book({
    title: req.body.title,
    publicationDate: req.body.publicationDate,
    description: req.body.description,
    genre: req.body.genre,
    rating: req.body.rating,
    authors: [],
  });
  const createdBook = await book.save();
  updatingCacheAfterCreating(createdBook);
  // console.log(JSON.parse(myCache.get("books")));
  res.status(201).json(createdBook);
});

// @desc   Update a Book
// @route  put /api/books/:id
// @access Private/Admin
const updateBook = asyncHandler(async (req, res) => {
  const { title, publicationDate, description, genre, rating } = req.body;
  const book = await Book.findById(req.params.id);
  if (book) {
    book.title = title;
    book.publicationDate = publicationDate;
    book.description = description;
    book.genre = genre;
    book.rating = rating;
    const updatedBook = await book.save();
    updatingCacheAfterEditing(req, book);
    // console.log(JSON.parse(myCache.get("books")));
    res.json(updatedBook);
  } else {
    res.status(404);
    throw new Error("Book not found");
  }
});

// @desc   Assign a Author to Book
// @route  PUT /api/books/addAuthor
// @access Private/Admin
const assignAuthorToBook = asyncHandler(async (req, res) => {
  const { bookId, authorId } = req.body;
  const author = await Author.findById(authorId);
  const book = await Book.findById(bookId);
  if (book && author && !book["authors"].includes(authorId)) {
    book["authors"].push(authorId);
    const updatedBook = await book.save();
    updatingCacheAfterEditing(req, book);
    // console.log(JSON.parse(myCache.get("books")));
    res.json(updatedBook);
  } else {
    res.status(404);
    if (book["authors"].includes(authorId)) {
      throw new Error("author already exist!");
    } else {
      throw new Error("an Error happend! Please try again with a valid input.");
    }
  }
});

// @desc   Delete an Author from a Book
// @route  PUT /api/books/deleteAuthor
// @access Private/Admin
const deleteAuthorfromBook = asyncHandler(async (req, res) => {
  const { bookId, authorId } = req.body;
  const book = await Book.findById(bookId);
  const author = await Author.findById(authorId);
  if (book && author && book["authors"].includes(authorId)) {
    book["authors"] = book["authors"].filter(
      (id) => id.toString() !== authorId
    );
    const updatedBook = await book.save();
    updatingCacheAfterEditing(req, book);
    res.json(updateBook);
  } else {
    res.status(404);
    if (!book["authors"].includes(authorId)) {
      throw new Error("No Authors found!");
    } else {
      throw new Error("an Error happend! Please try again with a valid input.");
    }
  }
});

// @desc Upload book Image
// @route Post /api/books/:bookId/image
// @access Private/Admin
const uploadBookImage = asyncHandler(async (req, res) => {
  const buffer = await sharp(req.file.buffer)
    .resize({ width: 250, height: 250 })
    .png()
    .toBuffer();
  const book = await Book.findById(req.params.bookId);
  if (book) {
    book.image = buffer;
    await book.save();
    updatingCacheAfterEditing(req, book);
    res.send("image saved successfully!");
  } else {
    throw new Error("Book not found! Please enter a valid Id.");
  }
});

// @desc Delete Book Image
// @route Delete /api/books/:boodId/image
// @access Private/Admin
const deleteBookImage = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.bookId);
  book.image = undefined;
  await book.save();
  updatingCacheAfterEditing(req, book);
  res.send("Image delete successfully!");
});

// @desc Get Author Avatar
// @route GET /api/authors/:authorId/avatar
// @access Public
const getbookImage = asyncHandler(async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book || !book.image) {
      throw new Error();
    }
    res.set("Content-Type", "image/png");
    res.send(book.image);
  } catch (e) {
    res.status(404).send(`Can't find the book or the image attached to it.`);
  }
});

export {
  getBooks,
  getBookById,
  createBookReview,
  getTopBooks,
  deleteBook,
  createBook,
  updateBook,
  assignAuthorToBook,
  deleteAuthorfromBook,
  uploadBookImage,
  deleteBookImage,
  getbookImage,
};
