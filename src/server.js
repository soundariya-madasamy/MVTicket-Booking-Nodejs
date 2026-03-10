// const express = require('express');
// const cors = require('cors');

// const app = express();
// app.use(express.json());
// app.use(cors());

// // Mock data (in-memory array instead of DB)
// let users = [
//   { id: 1, name: 'Alice', email: 'alice@example.com' },
//   { id: 2, name: 'Bob', email: 'bob@example.com' }
// ];

// // Routes
// app.get('/api/users', (req, res) => {
//   res.json(users);
// });

// app.post('/api/users', (req, res) => {
//   const { name, email } = req.body;
//   const newUser = { id: users.length + 1, name, email };
//   users.push(newUser);
//   res.json(newUser);
// });

// app.listen(5000, () => console.log('Server running on http://localhost:5000'));

const express = require("express");
const cors = require("cors");
const app = express();
const authRoute = require("./routes/auth");
const adminRoute = require("./routes/admin");
const moviesRoute = require("./routes/movies");
const showsRoute = require("./routes/shows");
const seatsRoute = require("./routes/seats");

app.use(express.json()); //  parse incoming requests with a JSON body.

app.use(cors({ 
  origin: "http://localhost:3000",  
  methods: ["GET", "POST", "PUT", "DELETE"], 
  credentials: true 
}));

app.use("/api/movies", moviesRoute);
app.use("/api/shows", showsRoute);
app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoute);
app.use("/api/seats", seatsRoute);

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    error: err.message || "Internal server error"
  });
});


module.exports = app;