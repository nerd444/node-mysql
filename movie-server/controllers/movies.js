const connection = require("../db/mysql-connection");

// @desc    영화데이터 불러오기
// @url     GET /api/v1/movies
// @request     *
// @response    {success:true, movies:rows, count:count}
exports.getMovies = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;
  try {
    const [rows] = await connection.query(
      `select * from movie limit ${offset},${limit}`
    );
    let count = rows.length;
    res.status(200).json({ success: true, movies: rows, count: count });
    return;
  } catch (e) {
    res.status(400).json({
      success: false,
      message: "영화데이터 전부 가져오는데 에러 발생",
    });
    return;
  }
};

// @desc    영화명 검색해서 가져오기
// @url     POST /api/v1/movies/search
// @request     *
// @response    title
exports.searchMovies = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let title = req.body.title;
  let query = `select * from movie where title like "%${title}%" limit ${offset},${limit}`;
  try {
    const [rows] = await connection.query(query);
    res.status(200).json({ success: true, movies: rows });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: "영화데이터 전부 가져오는데 에러 발생",
    });
  }
};

// @desc    연도 내림차순 정렬해서 가져오기
// @url     GET /api/v1/movies/year
// @request     *
// @response    title
exports.yearMovies = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let query = `select * from movie order by year desc limit ${offset},${limit}`;
  try {
    const [rows] = await connection.query(query);
    res.status(200).json({ success: true, movies: rows });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: "영화데이터 전부 가져오는데 에러 발생",
    });
  }
};

// @desc    관객수 내림차순 정렬해서 가져오기
// @url     GET /api/v1/movies/
// @request     *
// @response    title
exports.attendanceMovies = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let query = `select * from movie order by attendance desc limit ${offset},${limit}`;
  try {
    const [rows] = await connection.query(query);
    res.status(200).json({ success: true, movies: rows });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: "영화데이터 전부 가져오는데 에러 발생",
    });
  }
};
