const movieService = require('../services/movieServices');

const getMoviesList = async (req, res, next)  => { 
  try { 
    const movieList = await movieService.getAllMovies(); 
    res.json(movieList); 
  } catch (err) { 
    next(err);
  } 
}

const getMovieById = async (req, res, next) => {

  try {
    const movieId = req.params.id;
    const { movieRows, showRows } = await movieService.getMovieById(movieId);

    if (movieRows.length === 0) {
      return res.status(404).send("Movie not found");
    }

    res.json({
      movie: movieRows[0],  
      showtimes: showRows    
    });
  } catch (err) {
    next(err);
  }
};

const createMovie = async (req, res, next) => {
  try {
    const result = await movieService.createNewMovie(req.body);
    res.json({ movie_id: result.insertId });
  } catch (err) {
    next(err);
  }
};

const updateMovie = async (req, res, next) => {
    try {
        const result = await movieService.updateMovieById(req);
        if (result.affectedRows > 0) {
        res.json({ message: "Movie updated successfully" });
        } else {
        res.status(404).send("Movie not found");
        }
    } catch(err) {
        next(err);
    }
}

const deleteMovie = async (req, res, next) => {
    try {
        const result = await movieService.deleteMovieById(req.params.id);
        if (result.affectedRows > 0) {
            res.json({ message: "Movie deleted successfully" });
        } else {
            res.status(404).send("Movie not found");
        }
    } catch(err) {
        next(err);
    }
}

module.exports = { getMoviesList, getMovieById, createMovie, updateMovie, deleteMovie };