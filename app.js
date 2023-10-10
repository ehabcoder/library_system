import express from "express";
import { config } from "dotenv";
import colors from "colors";
import connectDB from "./config/db.js";
import morgan from "morgan";

import userRoutes from "./routes/userRoutes.js";
import authorRoutes from "./routes/authorRoutes.js";
// import authorRoutes from "./routes/authorRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

config();

connectDB();

const app = express();

// Morgan  is a Node. js and Express middleware
// to log HTTP requests and errors, and simplifies the process
// I used it in the development phase only
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Returns middleware that only parses json and only looks
// at requests where the Content-Type header matches the type option.
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/authors", authorRoutes);

// Error Handling middlewares
app.use(notFound, errorHandler);

export default app;
