const express = require("express");
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => { 
  try { 
    const [rows] = await pool.query('SELECT * FROM movies'); 
    res.json(rows); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
});

router.get("/:id", async (req, res) => {
  try {
    const movieId = req.params.id;
    const [movieRows] = await pool.query(
      'SELECT * FROM movies WHERE movie_id = ?',
      [movieId]
    );
    if (movieRows.length === 0) {
      return res.status(404).send("Movie not found");
    }

    const [showRows] = await pool.query( 
      `SELECT s.show_id, s.start_time, s.price, sc.name AS screen_name, 
      t.name AS theater_name FROM showtimes s JOIN screens sc ON 
      s.screen_id = sc.screen_id JOIN theaters t ON sc.theater_id = t.theater_id 
      WHERE s.movie_id = ?`, [movieId] ); 

      res.json({ movie: movieRows[0], showtimes: showRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
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
router.put("/:id", async (req, res) => {
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


router.delete("/:id", async (req, res) => {
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

module.exports = router;
