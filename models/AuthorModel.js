import mongoose from "mongoose";

const authorSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
    },
    avatar: {
      type: Buffer,
    },
    books: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Book",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Author = mongoose.model("Author", authorSchema);

export default Author;
