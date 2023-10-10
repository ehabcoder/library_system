import mongoose from "mongoose";

// const reviewSchema = mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: "User",
//   },
//   name: { type: String, required: true },
//   rating: { type: Number, required: true },
//   comment: { type: String, required: true },
// });

const bookSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    publicationDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    genre: {
      type: String,
      required: true,
    },
    image: {
      type: Buffer,
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    authors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Author",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.model("Book", bookSchema);

export default Book;
