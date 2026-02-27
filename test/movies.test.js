const expect = require("chai").expect;
const request = require("supertest");
const sinon = require("sinon");
const app = require("../src/server");
const pool = require("../src/db");

describe("Movie API Tests", () => {
  afterEach(() => {
    sinon.restore(); 
  });

  // ---------------- GET ALL ----------------
  describe("Movie GET API", () => {
    it("should get list of movies", async () => {
      const res = await request(app).get("/api/movies");
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
      if (res.body.length > 0) {
        expect(res.body[0]).to.include.keys(
          "movie_id",
          "title",
          "genre",
          "duration",
          "language",
          "cast",
          "trailer_url",
          "release_date"
        );
      }
    });

    it("should return 500 error when DB fails (negative case)", async () => {
      sinon.stub(pool, "query").rejects(new Error("DB connection failed"));

      const res = await request(app).get("/api/movies");
      expect(res.status).to.equal(500);
      expect(res.body).to.have.property("error", "DB connection failed");
    });
  });

  // ---------------- GET BY ID ----------------
  describe("Movie GET API by ID", () => {
    it("should return movie and showtimes (positive case)", async () => {
      const res = await request(app).get("/api/movies/1");
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("movie");
      expect(res.body.movie).to.include.keys("title", "genre", "duration");
      expect(res.body).to.have.property("showtimes");
      expect(res.body.showtimes).to.be.an("array");
    });

    it("should return 404 if movie not found", async () => {
      const res = await request(app).get("/api/movies/99999");
      expect(res.status).to.equal(404);
      expect(res.text).to.equal("Movie not found");
    });

    it("should return 500 if DB error occurs", async () => {
      sinon.stub(pool, "query").rejects(new Error("DB connection failed"));

      const res = await request(app).get("/api/movies/1");
      expect(res.status).to.equal(500);
      expect(res.body).to.have.property("error", "DB connection failed");
    });
  });

  // ---------------- POST ----------------
  describe("Movie POST API", () => {
    it("should insert a new movie", async () => {
      const newMovie = {
        title: "Test Movie",
        genre: "Drama",
        duration: 120,
        language: "English",
        cast: "Actor A, Actor B",
        trailer_url: "http://test.com/trailer",
        release_date: "2026-02-27",
      };

      const res = await request(app).post("/api/movies").send(newMovie);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("movie_id");
      expect(res.body.movie_id).to.be.a("number").and.to.be.greaterThan(0);
    });

    it("should return 500 if DB insert fails", async () => {
      sinon.stub(pool, "query").rejects(new Error("DB connection failed"));

      const res = await request(app).post("/api/movies").send({
        genre: "Drama",
      });
      expect(res.status).to.equal(500);
      expect(res.body).to.have.property("error", "DB connection failed");
    });
  });

  // ---------------- PUT & DELETE ----------------
  describe("Movie Update and Delete API", () => {
    let createdMovieId;

    before(async () => {
      const res = await request(app).post("/api/movies").send({
        title: "Temp Movie",
        genre: "Drama",
        duration: 100,
        language: "English",
        cast: "Actor X",
        trailer_url: "http://example.com",
        release_date: "2026-02-27",
      });
      createdMovieId = res.body.movie_id;
    });

    it("should update an existing movie", async () => {
      const res = await request(app).put(`/api/movies/${createdMovieId}`).send({
        title: "Updated Temp Movie",
        genre: "Thriller",
        duration: 110,
        language: "English",
        cast: "Actor Y",
        trailer_url: "http://example.com/trailer",
        release_date: "2026-02-28",
      });
      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal("Movie updated successfully");
    });

    it("should return 404 when updating non-existent movie", async () => {
      const res = await request(app).put("/api/movies/9999").send({
        title: "Ghost Movie",
        genre: "Fantasy",
        duration: 120,
        language: "English",
        cast: "Nobody",
        trailer_url: "http://example.com",
        release_date: "2026-02-28",
      });
      expect(res.status).to.equal(404);
      expect(res.text).to.equal("Movie not found");
    });

    it("should delete an existing movie", async () => {
      const res = await request(app).delete(`/api/movies/${createdMovieId}`);
      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal("Movie deleted successfully");
    });

    it("should return 404 when deleting non-existent movie", async () => {
      const res = await request(app).delete("/api/movies/9999");
      expect(res.status).to.equal(404);
      expect(res.text).to.equal("Movie not found");
    });
  });
});
