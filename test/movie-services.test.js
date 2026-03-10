const { expect } = require("chai");
const sinon = require("sinon");
const query = require("../src/utils/errorHandler");
const pool = require("../src/db")
const { getAllMovies, getMovieById, createNewMovie, updateMovieById, deleteMovieById } = require('../src/services/movieServices'); 

describe('movieServices', () => {
    afterEach(() => {
        sinon.restore();
    });

    describe('executeQuery', () => {
        it("should resolve with rows when pool.query succeeds", async () => {
            const mockRows = [{ id: 1, title: "Movie 1" }];
            sinon.stub(pool, "query").resolves([mockRows, []]);

            const result = await query.executeQuery("SELECT * FROM movies");

            expect(pool.query.calledOnce).to.be.true;
            expect(pool.query.calledWith("SELECT * FROM movies")).to.be.true;
            expect(result).to.deep.equal(mockRows);
        });

        it("should propagate error when pool.query rejects", async () => {
            const error = new Error("Database error");
            sinon.stub(pool, "query").rejects(error);

            try {
                await query.executeQuery("SELECT * FROM movies");
                throw new Error("executeQuery did not throw");
            } catch (err) {
                expect(err).to.equal(error);
            }
        });

    });

    describe('getAllMovies', () => {
        it('should call executeQuery with the correct SQL and resolve with the result rows', async () => {
            const mockRows = [
                { movie_id: 1, title: 'Movie 1', genre: 'Action', cast: 'Actor Y', duration: 110, language: 'English', trailer_url: 'http://test.com/trailer' },
                { movie_id: 2, title: 'Movie 2', genre: 'Comedy', cast: 'Actor Y', duration: 110, language: 'English', trailer_url: 'http://test.com/trailer' }
            ];

            const executeQueryStub = sinon.stub(query, "executeQuery").resolves(mockRows);
            const result = await getAllMovies();

            expect(executeQueryStub.calledOnce).to.be.true;
            expect(executeQueryStub.calledWith("SELECT * FROM movies")).to.be.true;
            expect(result).to.deep.equal(mockRows);
        });

        it('should propagate an error when executeQuery rejects', async () => {
            const error = new Error('Database error');
            sinon.stub(query, 'executeQuery').rejects(error);

            try {
                await getAllMovies();
                throw new Error('getAllMovies did not throw');
            } catch (err) {
                expect(err).to.equal(error);
            }
        });
    });

    describe('getMovieById', () => {
        it("should call executeQuery and return movie & show rows", async () => {
            const movieId = 1;
            const mockMovieRows = [{ movie_id: 1, title: "Movie 1", genre: "Action" }];
            const mockShowRows = [
            { show_id: 101, start_time: "10:00 AM", price: 200, screen_name: "Screen 1", theater_name: "Theater A" },
            { show_id: 102, start_time: "02:00 PM", price: 250, screen_name: "Screen 2", theater_name: "Theater B" }
            ];

            const executeQueryStub = sinon.stub(query, "executeQuery");
            executeQueryStub.onFirstCall().resolves(mockMovieRows);
            executeQueryStub.onSecondCall().resolves(mockShowRows);

            const result = await getMovieById(movieId);

            expect(executeQueryStub.calledTwice).to.be.true;
            expect(executeQueryStub.firstCall.args[0]).to.include("SELECT * FROM movies");
            expect(executeQueryStub.firstCall.args[1]).to.deep.equal([movieId]);
            expect(executeQueryStub.secondCall.args[0]).to.include("FROM showtimes");
            expect(executeQueryStub.secondCall.args[1]).to.deep.equal([movieId]);

            expect(result).to.deep.equal({ movieRows: mockMovieRows, showRows: mockShowRows });
        });

        it("should propagate an error if executeQuery rejects", async () => {
            const movieId = 1;
            const error = new Error("Database error");
            sinon.stub(query, "executeQuery").rejects(error);
            try {
                await getMovieById(movieId);
                throw new Error("getMovieById did not throw");
            } catch (err) {
                expect(err).to.equal(error);
            }
        });
    });

    describe('createNewMovie', () => {
        it('should call executeQuery with correct SQL & parameters return insertId', async() => {
            const movieDetail = { title: "New Movie", genre: "Action", duration: 120, language: "English", cast: "Actor A, Actor B", trailer_url: "http://example.com/trailer" }
            const mockResult = { insertId : 1 }
            const executeQueryStub = sinon.stub(query, "executeQuery").resolves(mockResult);
            const result = await createNewMovie(movieDetail);

            expect(executeQueryStub.calledOnce).to.be.true;
            expect(executeQueryStub.firstCall.args[0]).to.include("INSERT INTO movies");
            expect(executeQueryStub.firstCall.args[1]).to.deep.equal([
                movieDetail.title,
                movieDetail.genre,
                movieDetail.duration,
                movieDetail.language,
                movieDetail.cast,
                movieDetail.trailer_url
            ]);
            expect(result).to.equal(mockResult);

        });
        it("should propagate error when executeQuery rejects", async () => {
            const movieDetail = { title: "Bad Movie" };
            const error = new Error("DB insert failed");
            sinon.stub(query, "executeQuery").rejects(error);

            try {
                await createNewMovie(movieDetail);
                throw new Error("createNewMovie did not throw");
            } catch (err) {
                expect(err).to.equal(error);
            }
        });
    });

    describe("updateMovieById", () => {
        it("should call executeQuery with correct SQL and parameters", async () => {
            const req = {
                params: { id: 1 },
                body: {
                title: "Updated Movie",
                genre: "Drama",
                duration: 110,
                language: "English",
                cast: "Actor A, Actor B",
                trailer_url: "http://example.com/trailer"
                }
            };

            const mockResult = { affectedRows: 1 };
            const executeQueryStub = sinon.stub(query, "executeQuery").resolves(mockResult);

            const result = await updateMovieById(req);

            expect(executeQueryStub.calledOnce).to.be.true;
            expect(executeQueryStub.firstCall.args[0]).to.include("UPDATE movies SET");
            expect(executeQueryStub.firstCall.args[1]).to.deep.equal([
                req.body.title,
                req.body.genre,
                req.body.duration,
                req.body.language,
                req.body.cast,
                req.body.trailer_url,
                req.params.id
            ]);
            expect(result).to.equal(mockResult);
        });

        it("should propagate error when executeQuery rejects", async () => {
            const req = { params: { id: 1 }, body: { title: "Bad Update" } };
            const error = new Error("DB update failed");
            sinon.stub(query, "executeQuery").rejects(error);

            try {
                await updateMovieById(req);
                throw new Error("updateMovieById did not throw");
            } catch (err) {
                expect(err).to.equal(error);
            }
        });
    });


    describe('deleteMovieById', () => {
        it('should call executeQuery and Delete the movie based on ID', async() => {
            const movieId = 2;
            const mockResult = { affectedRows: 1 };
            const executeQueryStub = sinon.stub(query, "executeQuery").resolves(mockResult);

            const result = await deleteMovieById(movieId);

            expect(executeQueryStub.calledOnce).to.be.true;
            expect(executeQueryStub.firstCall.args[0]).to.include("DELETE FROM movies");
            expect(executeQueryStub.firstCall.args[1]).to.deep.equal([movieId]);
            expect(result).to.equal(mockResult);
        });

        it('should map ER_ROW_IS_REFERENCED_2 error to 400 and custom message, then throw it', async () => {
            const movieId = 10;
            const error = new Error('Foreign key constraint');
            error.code = 'ER_ROW_IS_REFERENCED_2';

            sinon.stub(query, 'executeQuery').rejects(error);

            try {
            await deleteMovieById(movieId);
            throw new Error('deleteMovieById did not throw');
            } catch (err) {
            expect(err).to.equal(error);
            expect(err.statusCode).to.equal(400);
            expect(err.message).to.equal('Cannot delete movie with existing showtimes');
            }
        });

        it('should rethrow non ER_ROW_IS_REFERENCED_2 errors without modification', async () => {
            const movieId = 15;
            const error = new Error('Some other DB error');
            error.code = 'SOME_OTHER_ERROR';

            sinon.stub(query, 'executeQuery').rejects(error);

            try {
            await deleteMovieById(movieId);
            throw new Error('deleteMovieById did not throw');
            } catch (err) {
            expect(err).to.equal(error);
            expect(err.statusCode).to.be.undefined;
            expect(err.message).to.equal('Some other DB error');
            }
        });
    });
})

