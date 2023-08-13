const express = require("express");
const jwt = require("jsonwebtoken");
let booksDataFromJson = require("./books_db.js");
const registered_users = express.Router();

let users = [{ username: "dennis", password: "abc" }];

const isValid = (username) => {
  const userMatches = users.filter((user) => user.username === username);
  return userMatches.length > 0;
};

const authenticatedUser = (username, password) => {
  const matchingUsers = users.filter(
    (user) => user.username === username && user.password === password
  );
  return matchingUsers.length > 0;
};
//Task 6
registered_users.post("/login", (req, res) => {
  console.log("login: ", req.body);
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Task 8 Add a book review
registered_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;
  console.log("add review: ", req.params, req.body, req.session);
  if (booksDataFromJson[isbn]) {
    let book = booksDataFromJson[isbn];
    book.reviews[username] = review;
    return res.status(200).send("Review successfully posted");
  } else {
    return res.status(404).json({ message: `ISBN ${isbn} not found` });
  }
});
// Task 9 Delete a review
registered_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  if (booksDataFromJson[isbn]) {
    let book = booksDataFromJson[isbn];
    delete book.reviews[username];
    return res.status(200).send("Review successfully deleted");
  } else {
    return res.status(404).json({ message: `ISBN ${isbn} not found` });
  }
});

module.exports.authenticated = registered_users;
module.exports.isValid = isValid;
module.exports.users = users;
