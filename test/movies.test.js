const { expect } = require('chai');
const sinon = require('sinon');
const movieService = require('./../src/services/movieServices'); 
const { getMoviesList, getMovieById, createMovie, updateMovie, deleteMovie } = require('./../src/controllers/movieControllers'); 

describe('movieControllers', () => {
    let req, res, next;

    beforeEach(() => {
        req = { params: { id: 1 },
                body: { 
                    title: "New Movie", 
                    genre: "Action", 
                    duration: 120, 
                    language: "English", 
                    cast: "Actor A, Actor B", 
                    trailer_url: "http://example.com/trailer" 
                }
             }; 
        res = {
            status: sinon.stub().returnsThis(), 
            send: sinon.spy(), 
            json: sinon.spy()
        };
        next = sinon.spy(); 
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('getMoviesList', () => {
        it('should return all movies when the movieService.getAllMovies resolves successfully', async () => {
            const mockMovies = [
                { id: 1, title: 'Movie 1', genre: 'Action' },
                { id: 2, title: 'Movie 2', genre: 'Comedy' }
            ];

            sinon.stub(movieService, 'getAllMovies').resolves(mockMovies);

            await getMoviesList(req, res, next);

            expect(movieService.getAllMovies.calledOnce).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.calledWith(mockMovies)).to.be.true;
            expect(next.called).to.be.false;
        });

        it('should call next with an error when movieService.getAllMovies rejects', async () => {
            const errorMessage = 'Database query failed';
            const error = new Error(errorMessage);

            sinon.stub(movieService, 'getAllMovies').rejects(error);

            await getMoviesList(req, res, next);

            expect(movieService.getAllMovies.calledOnce).to.be.true;
            expect(res.json.called).to.be.false; // Ensure `res.json` is not called
            expect(next.calledOnce).to.be.true;
            expect(next.calledWith(error)).to.be.true; // Ensure `next` is called with the error
        });

        it('should return an empty array if no movies are found', async () => {
            const mockMovies = [];
            sinon.stub(movieService, 'getAllMovies').resolves(mockMovies);

            await getMoviesList(req, res, next);

            expect(movieService.getAllMovies.calledOnce).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.calledWith(mockMovies)).to.be.true;
            expect(next.called).to.be.false;
        });
    });

    describe('getMovieById', () => {
        it('should return movie details when the getMovieById resolves successfully', async () => {
            const mockMovieRows = [{ id: 1, title: 'Movie 1', genre: 'Action' }];
            const mockShowRows = [
                { id: 101, movieId: 1, time: '10:00 AM' },
                { id: 102, movieId: 1, time: '02:00 PM' }
            ];
    
            sinon.stub(movieService, 'getMovieById').resolves({ movieRows: mockMovieRows, showRows: mockShowRows });
    
            await getMovieById(req, res, next);
    
            expect(movieService.getMovieById.calledOnce).to.be.true;
            expect(movieService.getMovieById.firstCall.args[0]).to.equal(req.params.id);
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.calledWith({
                movie: mockMovieRows[0],
                showtimes: mockShowRows
            })).to.be.true;
            expect(next.called).to.be.false; 
        });
    
        it('should return 404 when the getMovieById resolves with empty movieRows', async () => {
            const mockMovieRows = [];
            const mockShowRows = [];
    
            sinon.stub(movieService, 'getMovieById').resolves({ movieRows: mockMovieRows, showRows: mockShowRows });
    
            await getMovieById(req, res, next);
    
            expect(movieService.getMovieById.calledOnce).to.be.true;
            expect(movieService.getMovieById.firstCall.args[0]).to.equal(req.params.id); 
            expect(res.status.calledWith(404)).to.be.true; 
            expect(res.send.calledWith('Movie not found')).to.be.true; 
            expect(res.json.called).to.be.false; 
            expect(next.called).to.be.false; 
        });
    
        it('should call next with an error when the getMovieById rejects', async () => {
            const errorMessage = 'Database query failed';
            const error = new Error(errorMessage);
    
            sinon.stub(movieService, 'getMovieById').rejects(error);
    
            await getMovieById(req, res, next);
    
            expect(movieService.getMovieById.calledOnce).to.be.true;
            expect(movieService.getMovieById.firstCall.args[0]).to.equal(req.params.id); 
            expect(res.status.called).to.be.false; 
            expect(next.calledOnce).to.be.true;
            expect(next.calledWith(error)).to.be.true; 
        });
    });

    describe('createMovie', () => {
        it('should return the new movie ID when movieService.createNewMovie resolves successfully', async () => {
            const mockResult = { insertId: 1 };
            sinon.stub(movieService, 'createNewMovie').resolves(mockResult);
            await createMovie(req, res, next);

            expect(movieService.createNewMovie.calledOnce).to.be.true;
            expect(movieService.createNewMovie.calledWith(req.body)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.calledWith({ movie_id: mockResult.insertId })).to.be.true;
            expect(next.called).to.be.false;
        });

        it('should call next with an error when movieService.createNewMovie rejects', async () => {
            const error = new Error('Database error');
            sinon.stub(movieService, 'createNewMovie').rejects(error);
            await createMovie(req, res, next);

            expect(movieService.createNewMovie.calledOnce).to.be.true;
            expect(res.json.called).to.be.false;
            expect(next.calledOnce).to.be.true;
            expect(next.calledWith(error)).to.be.true;
        });
    });

    describe('updateMovie', () => {
        it('should return success message when movieService.updateMovieById resolves with affectedRows > 0', async () => {
            const mockResult = { affectedRows: 1 };
            sinon.stub(movieService, 'updateMovieById').resolves(mockResult);
            await updateMovie(req, res, next);

            expect(movieService.updateMovieById.calledOnce).to.be.true;
            expect(movieService.updateMovieById.calledWith(req)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.calledWith({ message: 'Movie updated successfully' })).to.be.true;
            expect(next.called).to.be.false;
        });

        it('should return 404 when movieService.updateMovieById resolves with affectedRows = 0', async () => {
            const mockResult = { affectedRows: 0 };
            sinon.stub(movieService, 'updateMovieById').resolves(mockResult);
            await updateMovie(req, res, next);

            expect(movieService.updateMovieById.calledOnce).to.be.true;
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(404)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
            expect(res.send.calledWith('Movie not found')).to.be.true;
            expect(next.called).to.be.false;
        });

        it('should call next with an error when movieService.updateMovieById rejects', async () => {
            const error = new Error('Database error');
            sinon.stub(movieService, 'updateMovieById').rejects(error);
            await updateMovie(req, res, next);

            expect(movieService.updateMovieById.calledOnce).to.be.true;
            expect(next.calledOnce).to.be.true;
            expect(next.calledWith(error)).to.be.true;
        });
    });

    describe('deleteMovie', () => {
        it('should return success message when movieService.deleteMovieById resolves with affectedRows > 0', async () => {
            const mockResult = { affectedRows: 1 };
            sinon.stub(movieService, 'deleteMovieById').resolves(mockResult);

            req.params.id = '1';

            await deleteMovie(req, res, next);

            expect(movieService.deleteMovieById.calledOnce).to.be.true;
            expect(movieService.deleteMovieById.calledWith('1')).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.calledWith({ message: 'Movie deleted successfully' })).to.be.true;
            expect(next.called).to.be.false;
        });

        it('should return 404 when movieService.deleteMovieById resolves with affectedRows = 0', async () => {
            const mockResult = { affectedRows: 0 };
            sinon.stub(movieService, 'deleteMovieById').resolves(mockResult);

            req.params.id = '1';

            await deleteMovie(req, res, next);

            expect(movieService.deleteMovieById.calledOnce).to.be.true;
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(404)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
            expect(res.send.calledWith('Movie not found')).to.be.true;
            expect(next.called).to.be.false;
        });

        it('should call next with an error when movieService.deleteMovieById rejects', async () => {
            const error = new Error('Database error');
            sinon.stub(movieService, 'deleteMovieById').rejects(error);

            req.params.id = '1';

            await deleteMovie(req, res, next);

            expect(movieService.deleteMovieById.calledOnce).to.be.true;
            expect(next.calledOnce).to.be.true;
            expect(next.calledWith(error)).to.be.true;
        });
    });
});
