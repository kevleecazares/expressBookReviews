const { Book } = require("../schemas/Book.js");
const crypto = require("node:crypto");
const express = require("express");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", async (req, res) => {
  let { author, title, isbn, reviews } = req.body;
  const book = Book.findOne({ title });
  if (book) {
    return res.end("The book already exists");
  }
  reviews = reviews.map((r) => {
    const _idReview = crypto.randomUUID();
    return {
      _idReview,
      comment: r.comment,
    };
  });
  console.log(reviews);

  const id = crypto.randomUUID();
  Book.create({
    _id: id,
    author,
    title,
    isbn,
    reviews,
  }).save();

  return res.end("The book was created successfully");
});

// Get the book list available in the shop
public_users.get("/", function async(req, res) {
  const books = Book.find({});
  res.json(books);
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function async(req, res) {
  const { isbn } = req.params;
  const books = Book.find({ isbn });
  res.json(books);
});

// Get book details based on author
public_users.get("/author/:author", function async(req, res) {
  const { author } = req.params;
  const books = Book.find({ author });
  res.json(books);
});

// Get all books based on title
public_users.get("/title/:title", function async(req, res) {
  const { title } = req.params;
  const books = Book.find({ title });
  res.json(books);
});

//  Get book review
public_users.get("/review/:isbn", function async(req, res) {
  const { isbn } = req.params;
  const books = Book.find({ isbn });
  res.json(books[0].reviews);
});

module.exports.general = public_users;
