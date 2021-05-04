require('dotenv').config()
// Add required packages
const { Pool } = require('pg');
const express = require("express");
const path = require("path");
const app = express();


const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

// Set up EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false })); 

// Start listener
app.listen(process.env.PORT || 3000, () => {
    console.log("Server started (http://localhost:3000/) !");
});

// Setup routes
app.get("/", (req, res) => {
    //res.send ("Hello world...");
    res.render("index.ejs");
});

//"about"
app.get("/about", (req, res) => {
    res.render("about");
});

//data
app.get("/data", (req, res) => {
    const test = {
        title: "Test",
        items: ["one", "two", "three"]
    };
    res.render("data", { model: test });
});
//books
app.get("/books", (req, res) => {
  const sql = `SELECT * FROM Books ORDER BY Title`;
  pool.query(sql, [], (err, result) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("books", { model: result.rows });
  });
});


app.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Books WHERE Book_ID = $1";
  pool.query(sql, [id], (err, result) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("edit", { model: result.rows[0] });
  });
});


app.post("/edit/:id", (req, res) => {
  const id = req.params.id;
  const book = [req.body.Title, req.body.Author, req.body.Comments, id];
  console.log(req.body);
  const sql = "UPDATE Books SET Title = $1, Author = $2, Comments = $3 WHERE (Book_ID = $4)";
  pool.query(sql, book, (err, result) => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/books");
  });
});

// GET create
app.get("/create", (req, res) => {
  res.render("create", { model: {} });
});

// POST create
app.post("/create", (req, res) => {
  const sql = "INSERT INTO Books (Title, Author, Comments) VALUES ($1, $2, $3)";
  const book = [req.body.Title, req.body.Author, req.body.Comments];
  pool.query(sql, book, (err, result) => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/books");
  });
});

// GET delete
app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Books WHERE Book_ID = $1";
  pool.query(sql, [id], (err, result) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("delete", { model: result.rows[0] });
  });
});

// POST delete
app.post("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM Books WHERE Book_ID = $1";
  pool.query(sql, [id], (err, result) => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/books");
  });
});