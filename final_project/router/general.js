const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        res.send("Username and password are required for registration.");
    }

    if (isValid(username)) {
        return res.send("Username already exists. Please choose a different username.");
    } else {
        users.push({ username, password });
        return res.send("User successfully registered. You can now log in.")
    }
});

// just to make it look like there's some delay
const getBooksData = (data, delay = 50) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(data);
        }, delay);
    });
};

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
        const allBooks = await getBooksData(books);
        return res.send(JSON.stringify(books), null, 4);
  } catch (error) {
    console.error("Error fetching all books:", error);
    return res.status(500).send("An error occurred while retrieving books.");
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const bookDetails = await getBooksData(books[isbn]); 
    if (bookDetails) {
        return res.send(JSON.stringify(bookDetails, null, 4));
    } else {
        return res.send(`Book with ISBN ${isbn} not found.`);
    }
    } catch (error) {
        console.error(`Error fetching book with ISBN ${isbn}:`, error);
        return res.send(`An error occurred while retrieving book with ISBN ${isbn}.`);
    }
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const allBooks = await getBooksData(books);
        const booksByAuthor = Object.values(allBooks).filter(book => book.author === author);

        if (booksByAuthor.length > 0) {
            return res.send(JSON.stringify({ booksbyauthor: booksByAuthor }, null, 4));
        } else {
            return res.send(`No books found by author: ${author}.`);
        }
    } catch (error) {
        console.error(`Error fetching books by author ${author}:`, error);
        return res.status(500).send(JSON.stringify({ message: `An error occurred while retrieving books by author ${author}.` }, null, 4));
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const allBooks = await getBooksData(books);
        const booksByTitle = Object.values(allBooks).filter(book => book.title.includes(title));

        if (booksByTitle.length > 0) {
            return res.send(JSON.stringify({ booksbytitle: booksByTitle }, null, 4));
        } else {
            return res.send(`No books found with title: ${title}.`);
        }
    } catch (error) {
        console.error(`Error fetching books by title ${title}:`, error);
        return res.send(`An error occurred while retrieving books by title ${title}.`);
    };
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn] && books[isbn].reviews) {
        return res.send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
        return res.send(`Book with ISBN ${isbn} not found.`);
    }
});

module.exports.general = public_users;
