const express = require("express");
const router = express.Router();
const pool = require('../db');

const { movies } = require("../routes/movies");
const { users } = require("./auth");
const authMiddleware = require("../middleware/authMiddleware");

// routes/movies.js
router.post("/movies", async (req, res) => {
  const { title, genre, duration, language, cast, trailer_url, release_date } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO movies (title, genre, duration, language, cast, trailer_url, release_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, genre, duration, language, cast, trailer_url, release_date]
    );
    res.json({ movie_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// routes/movies.js
router.put("/movies/:id", async (req, res) => {
  const { title, genre, duration, language, cast, trailer_url, release_date } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE movies 
       SET title = ?, genre = ?, duration = ?, language = ?, cast = ?, trailer_url = ?, release_date = ?
       WHERE movie_id = ?`,
      [title, genre, duration, language, cast, trailer_url, release_date, req.params.id]
    );
    if (result.affectedRows > 0) {
      res.json({ message: "Movie updated successfully" });
    } else {
      res.status(404).send("Movie not found");
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete("/movies/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM movies WHERE movie_id = ?",
      [req.params.id]
    );
    if (result.affectedRows > 0) {
      res.json({ message: "Movie deleted successfully" });
    } else {
      res.status(404).send("Movie not found");
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// using Mock Data
// ✅ Get list of users (admin only)
// router.get("/users", (req, res) => {
//   res.json(users);
// });

// // ✅ Get all movies
// router.get("/movies", (req, res) => {
//   res.json(movies);
// });

// // ✅ Add a new movie
// router.post("/movies", (req, res) => {
//   const newMovie = { id: movies.length + 1, ...req.body };
//   movies.push(newMovie);
//   res.json(newMovie);
// });

// // ✅ Update movie
// router.put("/movies/:id", (req, res) => {
//   const movie = movies.find(m => m.id == req.params.id);
//   if (!movie) return res.status(404).json({ message: "Movie not found" });
//   Object.assign(movie, req.body);
//   res.json(movie);
// });

// // ✅ Delete movie
// router.delete("/movies/:id", (req, res) => {
//   const index = movies.findIndex(m => m.id == req.params.id);
//   if (index === -1) return res.status(404).json({ message: "Movie not found" });
//   movies.splice(index, 1);
//   res.json({ message: "Movie deleted" });
// });

module.exports = router;
