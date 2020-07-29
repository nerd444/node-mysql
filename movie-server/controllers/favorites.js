// 데이터베이스 처리 위한 라이브러리 필요
const connection = require("../db/mysql-connection");

// @desc    좋아하는 영화 추가
// @route   POST /api/v1/favorites
// @parameters  movie_id

exports.addFavorite = async (req, res, next) => {
  let movie_id = req.body.movie_id;
  let user_id = req.user.id;

  let query = "insert into favorite_movie (movie_id, user_id) values (?,?)";
  let data = [movie_id, user_id];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true });
  } catch (e) {
    if (e.rrno == 1062) {
      res.status(500).json({ message: "이미 즐겨찾기에 추가되었습니다." });
    } else {
      res.status(500).json({ error: e });
    }
  }
};

// @desc    즐겨찾기 저장된 영화 가져오는 api
// @route   GET /api/v1/favorites?offset=0&limit=25
// @parameters(request)  offset, limit
// @properties(response) success, cnt, items : [title, genre, attendance, year]
exports.getMyFavorites = async (req, res, next) => {
  let offset = req.query.offset; // query랑 data 따로 썼을때 => Number(req.query.offset)
  let limit = req.query.limit; // query랑 data 따로 썼을때 => Number(req.query.limit)
  let user_id = req.user.id;

  let query = `select m.id, m.title, m.genre, m.attendance, m.year, f.id as favorite_id
  from favorite_movie as f join movie as m
  on f.movie_id = m.id where f.user_id = ${user_id} limit ${offset}, ${limit}`;

  try {
    [rows] = await connection.query(query);
    let cnt = rows.length;
    res.status(200).json({ success: true, items: rows, cnt: cnt });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    즐겨찾기 삭제
// @route   DELETE /api/v1/favorites
// @request favorite_id
exports.deleteFavorite = async (req, res, next) => {
  let favorite_id = req.body.favorite_id;

  // favorite_id있는지 체크
  if (!favorite_id) {
    res.status(400).json({ message: "favorite_id가 없습니다." });
    return;
  }

  let query = `delete from favorite_movie where id = ${favorite_id}`;
  try {
    [result] = await connection.query(query);
    res
      .status(200)
      .json({ success: true, message: "즐겨찾기가 삭제되었습니다." });
  } catch (e) {
    res.status(500).json({ success: false });
  }
};
