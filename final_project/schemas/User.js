const DBLocal = require("db-local");
const { Schema } = new DBLocal({ path: "./db" });

const User = Schema("User", {
  _id: { type: String, require: true },
  username: { type: String, require: true },
  password: { type: String, require: true },
});

module.exports = { User };
