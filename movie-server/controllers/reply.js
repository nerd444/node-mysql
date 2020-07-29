const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connection = require("../db/mysql-connection");

// @desc    댓글달기
// @route   POST /api/v1/reply
// @request comment, rating, movie_id
exports.replyUser = async (req, res, next) => {
  let comment = req.body.comment;
  let rating = req.body.rating;
  let movie_id = req.body.movie_id;
  let user_id = req.user.id;

  let query = `insert into reply (comment, rating, movie_id, user_id) values ("${comment}", "${rating}", ${movie_id}, ${user_id})`;
  if (rating > 5) {
    res
      .status(401)
      .json({ succese: false, message: "별점은 5점이 최대입니다." });
    return;
  }

  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(500).json({ error: e });
  }
};

// @desc    댓글구경
// @route   GET /api/v1/reply
// @parameters(request)  offset, limit, movie_id
// @response    m.title, u.email, r.comment, r.rating, r.created_at
exports.getReply = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let movie_id = req.body.movie_id;

  let query = `select m.title, u.email, r.comment, r.rating, r.created_at
    from reply as r join movie as m
    on r.movie_id = m.id 
    join movie_user as u on r.user_id = u.id
    where m.id = ${movie_id} limit ${offset}, ${limit}`;

  try {
    [rows] = await connection.query(query);
    let cnt = rows.length;
    res.status(200).json({ success: true, items: rows, cnt: cnt });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc  댓글 수정
// @route  PUT/api/v1/reply/update
exports.updateReply = async (req, res, next) => {
  let user_id = req.user.id;
  let movie_id = req.body.movie_id;
  let comment = req.body.comment;
  let query = `update reply set comment = "${comment}" 
      where user_id = ${user_id} and movie_id = ${movie_id}`;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ succese: true, result: result });
  } catch (e) {
    res.status(500).json({ error: e });
  }
};

// @desc  댓글 삭제
// @route  delete/api/v1/reply
exports.deleteReply = async (req, res, next) => {
  let user_id = req.user.id;
  let movie_id = req.body.movie_id;
  let query = `delete from reply where user_id = ${user_id} and movie_id = ${movie_id} `;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ succese: true, result: result });
  } catch (e) {
    res.status(500).json({ error: e });
  }
};
