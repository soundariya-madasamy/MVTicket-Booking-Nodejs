const query = require('../utils/errorHandler');


const getAllMovies = async() => {
    return await query.executeQuery("SELECT * FROM movies");
}

const getMovieById = async (movieId) => {
  const movieRows = await query.executeQuery(
    "SELECT * FROM movies WHERE movie_id = ?",
    [movieId]
  );

  const showRows = await query.executeQuery(
    `SELECT s.show_id, s.start_time, s.price, sc.name AS screen_name, 
            t.name AS theater_name 
     FROM showtimes s 
     JOIN screens sc ON s.screen_id = sc.screen_id 
     JOIN theaters t ON sc.theater_id = t.theater_id 
     WHERE s.movie_id = ?`,
    [movieId]
  );

  return { movieRows, showRows };
};

const createNewMovie = async (movieDetail) => {
  const { title, genre, duration, language, cast, trailer_url } = movieDetail;

  return await query.executeQuery(
    `INSERT INTO movies (title, genre, duration, language, cast, trailer_url)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, genre, duration, language, cast, trailer_url]
  );
};

const updateMovieById = async (req) => {
    const { title, genre, duration, language, cast, trailer_url } = req.body;
    return await query.executeQuery(
    `UPDATE movies SET title = ?, genre = ?, duration = ?, language = ?, cast = ?, trailer_url = ?
    WHERE movie_id = ?`,
    [title, genre, duration, language, cast, trailer_url, req.params.id]
  );
}

const deleteMovieById = async (movieID) => {
  try {
    return await query.executeQuery("DELETE FROM movies WHERE movie_id = ?", [movieID]);
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      err.statusCode = 400;
      err.message = "Cannot delete movie with existing showtimes";
    }
    throw err;
  }
};


module.exports = { getAllMovies, getMovieById, createNewMovie, updateMovieById, deleteMovieById };