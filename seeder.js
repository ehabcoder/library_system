import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";
import { faker } from "@faker-js/faker";
import sharp from "sharp";
import bcrypt from "bcryptjs";

import connectDB from "./config/db.js";

import User from "./models/UserModel.js";
import Author from "./models/AuthorModel.js";
import Book from "./models/BookModel.js";

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await Author.deleteMany();
    await Book.deleteMany();
    await User.deleteMany();

    let users = [];
    let books = [];
    let authors = [];

    for (let i = 0; i < 10; i++) {
      users.push({
        name: `${faker.person.firstName()} ${faker.person.lastName()}`,
        email: faker.internet.email(),
        age: faker.number.int(),
        password:
          "$2a$08$fedBb8bOXhCbH5H0YkmWBuE2lF7utCvRaO3tF5JDovv3VSsn/WSaW",
      });
      authors.push({
        id: new mongoose.Types.ObjectId(i),
        name: `${faker.person.firstName()} ${faker.person.lastName()}`,
        bio: faker.person.bio(),
        books: [],
      });
      books.push({
        id: new mongoose.Types.ObjectId(i),
        title: faker.company.name(),
        publicationDate: faker.date.anytime(),
        description: faker.company.catchPhraseDescriptor(),
        genre: faker.music.genre(),
        rating: faker.number.float(0.2),
        authors: [],
      });
    }
    console.log(books[0]);
    // Assign some books to authors
    authors[0]["books"].push(books[0].id);
    authors[0]["books"].push(books[1].id);
    authors[0]["books"].push(books[2].id);
    authors[1]["books"].push(books[3].id);
    authors[1]["books"].push(books[4].id);
    authors[1]["books"].push(books[5].id);
    authors[2]["books"].push(books[6].id);
    authors[2]["books"].push(books[7].id);
    authors[2]["books"].push(books[8].id);
    // Assign some authors to books
    books[0]["authors"].push(authors[0].id);
    books[1]["authors"].push(authors[0].id);
    books[2]["authors"].push(authors[0].id);
    books[0]["authors"].push(authors[1].id);
    books[1]["authors"].push(authors[1].id);
    books[2]["authors"].push(authors[1].id);

    const createdUsers = await User.insertMany(users);
    const createdBooks = await Book.insertMany(books);
    const createdAuthors = await Author.insertMany(authors);

    console.log("Data Imported!".green.inverse);

    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit();
  }
};

const destroyData = async () => {
  try {
    await Book.deleteMany();
    await Author.deleteMany();
    await User.deleteMany();

    console.log("Data Destroyed!".red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit();
  }
};

if (process.argv[2] == "-d") {
  destroyData();
} else {
  importData();
}
