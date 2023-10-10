import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error('Password can not contain "password"');
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be a postive number");
        }
      },
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

// TODO: Set the relationships if found.

// We can do this using some other approaches but this much better.
// this is done because when we retrieve users as JSON we dont need
// the avatar for it and also we don't need the hashed password
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.avatar;

  return user;
};

// this function is used in the Authentication process.
// check to find the user by email and if it is found we
// compare it with password and return the user.
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Unable to login.");
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Unable to login.");
  return user;
};

// Hash the plain text password before saving.
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

// TODO: Delete the books of that user on delete

const User = mongoose.model("User", userSchema);

export default User;
