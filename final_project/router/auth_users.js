const { User } = require("../schemas/User.js");
const crypto = require("node:crypto");
const express = require("express");
const regd_users = express.Router();
const jwt = require("jsonwebtoken");
const { Book } = require("../schemas/Book.js");

const isValid = (username) => {
  return username && username.length > 3;
};

const authenticatedUser = (username, password) => {
  const user = User.find({ username, password });
  return user.length > 0;
};

// Register user
regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username!" });
  }

  const user = User.find({ username });
  if (user.length === 0) {
    const id = crypto.randomUUID();
    User.create({
      _id: id,
      username,
      password,
    }).save();
    return res.status(201).json({ message: "User registered successfully" });
  }
  return res.status(409).json({ message: "User already exists" });
});

// Only registered users can log in
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = User.find({ username, password });

  if (user.length === 0) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const token = jwt.sign({ username }, "SUPER.EXTRA-SAFE_PASSWORDk3y", {
    expiresIn: "1h",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 3600000,
  });

  return res.status(200).json({ message: "User logged in successfully" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { reviews } = req.body;

  const books = Book.find({ isbn });
  const book = books[0];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  reviews.forEach((newReview) => {
    if (newReview._idReview) {
      const existingReviewIndex = book.reviews.findIndex(
        (review) => review._idReview === newReview._idReview
      );

      if (existingReviewIndex !== -1) {
        book.reviews[existingReviewIndex].comment = newReview.comment;
      }
    } else {
      const _idReview = crypto.randomUUID();
      book.reviews.push({ _idReview, comment: newReview.comment });
    }
  });

  // Save the updated book record
  book.save(); // Make sure the save method is correct for your database

  return res
    .status(200)
    .json({ message: "Reviews updated successfully", reviews: book.reviews });
});

// Delete a book review by _idReview
regd_users.delete("/auth/review/:isbn/:_idReview", (req, res) => {
  const { isbn, _idReview } = req.params;

  // Find the book by ISBN
  const books = Book.find({ isbn });
  const book = books[0];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Find the review by _idReview
  const reviewIndex = book.reviews.findIndex(
    (review) => review._idReview === _idReview
  );

  if (reviewIndex === -1) {
    return res.status(404).json({ message: "Review not found" });
  }

  // Remove the review from the array
  book.reviews.splice(reviewIndex, 1);

  // Save the updated book record
  book.save(); // Adjust as needed for your database

  return res.status(200).json({ message: "Review deleted successfully" });
});

// Export the router and functions
module.exports = {
  authenticated: regd_users, // Exporting the router
  authenticatedUser, // Exporting the authentication function
  isValid, // Exporting the isValid function
};
