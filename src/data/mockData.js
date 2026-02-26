const movies = [
  { id: 1, title: "Inception", genre: "Sci-Fi", duration: "148 min", language: "English" },
  { id: 2, title: "KGF", genre: "Action", duration: "156 min", language: "Kannada" }
];

const shows = [
  { id: 1, movieId: 1, theater: "PVR Chennai", time: "7:00 PM" },
  { id: 2, movieId: 2, theater: "Sathyam Cinemas", time: "9:00 PM" }
];

module.exports = { movies, shows };
