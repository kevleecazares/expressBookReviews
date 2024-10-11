const express = require("express");
const session = require("express-session");
const {
  authenticated: customer_routes,
  authenticatedUser,
} = require("./router/auth_users.js"); // Importing the router and function
const genl_routes = require("./router/general.js").general;
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cookieParser());

app.use(express.json());

app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

const authenticateJWT = (req, res, next) => {
  console.log("here");

  const token = req.cookies.token; // Get the token from cookies

  if (!token) {
    return res.sendStatus(403); // Forbidden if no token
  }

  jwt.verify(token, "SUPER.EXTRA-SAFE_PASSWORDk3y", (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden if token is invalid
    }

    const { username, password } = req.body;
    const userAuthenticated = authenticatedUser(username, password);
    if (!userAuthenticated) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    next();
  });
};

app.use("/customer/auth/*", authenticateJWT);

const PORT = 5000;

// Use the customer and general routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Start the server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
