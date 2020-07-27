const express = require("express");

const {
  getMovies,
  searchMovies,
  yearMovies,
  attendanceMovies,
} = require("../controllers/movies");

const router = express.Router();

router.route("/").get(getMovies);
router.route("/search").post(searchMovies);
router.route("/year").get(yearMovies);
router.route("/desc/getMovies").get(attendanceMovies);

module.exports = router;
