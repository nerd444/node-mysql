const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connection = require("../db/mysql-connection");

// @desc    좌석예약하기
// @route   POST /api/v1/reservation
exports.reservation = async (req, res, next) => {
  let movie_id = req.body.movie_id;
  let start_time = req.body.start_time;
  let seat_number = req.body.seat_number;
  let user_id = req.user.id;

  let query = `insert into reservation (movie_id, start_time, seat_number, user_id) 
    values (${movie_id}, "${start_time}", ${seat_number}, ${user_id})`;

  try {
    [result] = await connection.query(query);
    res.status(200).json({
      success: true,
      result: result,
      message: "좌석예약이 완료되었습니다",
    });
  } catch (e) {
    if (e.rrno == 1062) {
      res.status(500).json({ message: "이미 예약된 좌석입니다" });
    } else {
      res.status(500).json({ error: e });
    }
  }
};

// @desc    특정영화, 특정 날짜의 좌석 정보 불러오기
// @route   GET /api/v1/reservation
exports.getSeat = async (req, res, next) => {
  let movie_id = req.query.movie_id;
  let start_time = req.query.start_time;

  let query = `select * from reservation where movie_id = ${movie_id} and start_time = "${start_time}"`;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(500).json({ error: e });
  }
};

// @desc    에약취소하기 (시작시간 30분전에는 취소불가)
// @route   GET /api/v1/reservation
exports.cancel = async (req, res, next) => {
  let movie_id = req.body.movie_id;
  let seat_number = req.body.seat_number;
  let user_id = req.user.id;

  let query = `select start_time from reservation where user_id = ${user_id} and movie_id = ${movie_id} and seat_number = ${seat_number}`;

  const conn = await connection.getConnection();
  await conn.beginTransaction();

  try {
    [result] = await conn.query(query);
    start_time = result;
  } catch (e) {
    await conn.rollback();
    res.status(500).json();
    return;
  }

  query = `delete from reservation where user_id = ${user_id} and movie_id = ${movie_id} and seat_number = ${seat_number}`;
  if (start_time < now(30)) {
    res.status(401).json({
      success: false,
      message: "상영시간 30분전에는 취소가 불가능합니다",
    });
    return;
  }

  try {
    [result] = await conn.query(query);
  } catch (e) {
    await conn.rollback();
    res.status(500).json();
    return;
  }

  await conn.commit();
  await conn.release();

  res.status(200).json({ success: true, result: result });
};
