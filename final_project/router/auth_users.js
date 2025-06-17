const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    const userFound = users.some(user => user.username === username && user.password === password);
    if (userFound) {
        return "User validated successfully.";
    } else {
        return "Invalid username or password.";
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    const validationMessage = authenticatedUser(username, password);

    if (validationMessage === "User validated successfully.") {
        let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken,
            username
        }
        return res.status(200).send("User successfully logged in.");
    } else {
        return res.status(401).json({ message: validationMessage });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; 
    const review = req.query.review;
    const username = req.session.authorization.username;

    if (!review) {
        return res.status(400).json({ message: "Review content cannot be empty." });
    }

    if (books[isbn]) {
        if (!books[isbn].reviews) {
            books[isbn].reviews = {};
        }
        books[isbn].reviews[username] = review;
        return res.send(`Review for ISBN ${isbn} by user ${username} added/updated successfully.`);
    } else {
        return res.send(`Book with ISBN ${isbn} not found.`);
    }

});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    if (books[isbn]) {
        if (books[isbn].reviews && books[isbn].reviews[username]) {
            delete books[isbn].reviews[username];
            return res.send(`Review for ISBN ${isbn} by user ${username} deleted successfully.`);
        } else {
                return res.send(`No review found for ISBN ${isbn} by user ${username}.`);
        }
    } else {
    return res.send(`Book with ISBN ${isbn} not found.`);
}});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
