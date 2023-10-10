import asyncHandler from "express-async-handler";
import Book from "../models/BookModel.js";
import Author from "../models/AuthorModel.js";
import sharp from "sharp";

//    @desc   Fetch all books
//    @access Public
//    @route GET /api/books
// or @route GET /api/books?keyword=harry Poter   // for searching with title
// or @route GET /api/books?pageNumber=2    // for pagination

const getBooks = asyncHandler(async (req, res) => {
  // we can change the number of page size it if we want.
  const pageSize = 3;
  // the current page will be either 1 or the number that user
  // entered in the URL.
  const page = Number(req.query.pageNumber) || 1;

  // get the keyword to search if existed.
  const keyword = req.query.keyword
    ? {
        title: {
          // Special for Mongoose
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {};
  const count = await Book.countDocuments(keyword);
  const books = await Book.find(keyword)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .populate("authors"); // to pupulate all authors for that book

  // return the page and pages so the frontend developer can
  // handle the pagination in the UI.
  res.json({ books, page, pages: Math.ceil(count / pageSize) });
});

// @desc   Fetch single Book
// @route  GET /api/books/:id
// @access Public
const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id).populate("authors", "-books"); // Here pupulate all books of that Author without the authors field
  if (book) {
    res.json(book);
  } else {
    res.status(404);
    throw new Error("Book not found");
  }
});

// @desc   Delete a Book
// @route  DELETE /api/books/:id
// @access Private/Admin
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (book) {
    // Here we trust any admin in the site to delete an Author
    await Book.deleteOne({ _id: book._id });
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
  deleteBook,
  createBook,
  updateBook,
  assignAuthorToBook,
  deleteAuthorfromBook,
  uploadBookImage,
  deleteBookImage,
  getbookImage,
};
