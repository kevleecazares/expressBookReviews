const DBLocal = require("db-local");
const { Schema } = new DBLocal({ path: "./db" });

const Book = Schema("Book", {
  _id: { type: String, required: true },
  author: { type: String, required: true },
  title: { type: String, required: true },
  isbn: { type: String, required: false },
  reviews: { type: Array, required: false },
});

module.exports = { Book };
