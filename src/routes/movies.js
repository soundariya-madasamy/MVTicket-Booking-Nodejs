const express = require("express");
const router = express.Router();
const movieCntl = require('../controllers/movieControllers');

router.get('/', movieCntl.getMoviesList);
router.get('/:id', movieCntl.getMovieById);
router.post('/', movieCntl.createMovie);
router.put('/:id', movieCntl.updateMovie);
router.delete('/:id', movieCntl.deleteMovie);

module.exports = router;
