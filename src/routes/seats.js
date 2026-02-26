const express = require("express");
const router = express.Router();
const pool = require('../db');

// Mock seat data per movie
const seats = {};

// routes/seats.js
router.get("/:showId", async (req, res) => {
  try {
    const showId = req.params.showId;

    const [rows] = await pool.query(
      `SELECT seat_id, seat_number, status
       FROM seats
       WHERE screen_id = (SELECT screen_id FROM showtimes WHERE show_id = ?)`,
      [showId]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// router.get("/:movieId", (req, res) => {
//   const movieId = req.params.movieId;

//   // If seats not initialized, create them
//   if (!seats[movieId]) {
//     seats[movieId] = Array.from({ length: 30 }, (_, i) => ({ id: i + 1, booked: false }));
//   }

//   res.json(seats[movieId]);
// });


// Get seats for a movie
// router.get("/:movieId", (req, res) => {
//   const movieId = req.params.movieId;
//   if (!seats[movieId]) return res.status(404).json({ message: "No seats found" });
//   res.json(seats[movieId]);
// });

// Book seats
router.post("/:movieId/book", (req, res) => {
  const { selectedSeats } = req.body;
  const movieId = req.params.movieId;
  if (!seats[movieId]) return res.status(404).json({ message: "No seats found" });

  selectedSeats.forEach(seatId => {
    const seat = seats[movieId].find(s => s.id === seatId);
    if (seat) seat.booked = true;
  });

  res.json({ message: "Seats booked successfully", seats: seats[movieId] });
});

module.exports = router;
