const connection = require("../db/mysql-connection");
const moment = require("moment");

// @desc      좌석예약하기
// @route     POST /api/v1/reservation
// @request   movie_id, seat_number_arr[], start_time, user_id(auth)
// @response  success
exports.reservation = async (req, res, next) => {
  let movie_id = req.body.movie_id;
  let start_time = req.body.start_time;
  let seat_number_arr = req.body.seat_number_arr;
  let user_id = req.user.id;

  if (!movie_id || !seat_number_arr || !start_time || !user_id) {
    res.status(400).json({ message: "뭐 하나 없는거 같지 않니...?" });
    return;
  }

  // 첫번째방법 : select 해서, 해당 좌석 정보가 있는지 확인 => rows.length == 1
  // 두번째방법 : 테이블에, start_time, movie_id, seat_number 순으로 3개를 unique하게 설정.

  let query = `insert into reservation (movie_id, start_time, seat_number, user_id) values ? `;
  let data = [];
  for (let i = 0; i < seat_number_arr.length; i++) {
    data.push([movie_id, start_time, seat_number_arr[i], user_id]);
  }
  console.log(data);

  try {
    [result] = await connection.query(query, [data]);
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

// @desc      특정영화, 특정 날짜의 좌석 정보 불러오기
// @route     GET /api/v1/reservation?start_time=&movie_id=
// @request   start_time, movie_id
// @response  success, items[], cnt
exports.getSeat = async (req, res, next) => {
  let movie_id = req.query.movie_id;
  let start_time = req.query.start_time;

  if (!start_time || !movie_id) {
    res.status(400).json({ message: "뭐 하나 없는거 같지 않니...?" });
    return;
  }

  let query = `select id, movie_id, seat_number from reservation where movie_id = ${movie_id} and start_time = "${start_time}"`;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, items: result, cnt: result.length });
  } catch (e) {
    res.status(500).json({ error: e });
  }
};

// @desc      내가 예약한 좌석 정보 불러오기
// @route     GET /api/v1/reservation/me
// @request   user_id(auth)
// @response  success, items[], cnt
exports.getMySeat = async (req, res, next) => {
  let user_id = req.user.id;

  if (!user_id) {
    res.status(400).json({ message: "뭐 없는거 같지 않니...?" });
    return;
  }

  // 지금 현재 시간보다, 상영시간이 지난 시간의 예약은,
  // 가져 올 필요가 없습니다.

  // 현재 시간을, 밀리세컨즈 1970년1월1일 이후의 시간 => 숫자
  let currentTime = Date.now();
  // 위의 현재시간 숫자를 => 2020-07-31 12:03:32 식으로 바꿔준것.
  let compareTime = moment(currentTime).format("YYYY-MM-DD HH:mm:ss");
  // 예약시간이 현재 시간보다 이후의 시간으로 예약된 정보만 가져오는 쿼리
  let query = `select * from reservation where user_id = ${user_id} and start_time > "${compareTime}"`;
  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
    res.status(500).json({ error: e });
  }
};

// db직접 처리법
// select
// if(TIMESTAMPDIFF(MINUTE, DATE_ADD(NOW(), INTERVAL 9 HOUR),
// start_at) > 30, true, false)
// as possible_cancel
// from manage_reservation as m join reservation as r on m.reserve_id = r.reserve_id;

// @desc      예약취소하기 (시작시간 30분전에는 취소불가)
// @route     GET /api/v1/reservation/:reservation_id
// @request   user_id(auth)
// @response  success
exports.cancel = async (req, res, next) => {
  let reservation_id = req.params.reservation_id;
  let user_id = req.user.id;

  // 시작시간 30분 전에는 취소 불가.
  let currentTime = Date.now();
  let compareTime = currentTime + 1000 * 60 * 30; // 현재시간 + 30분

  let query = `select * from reservation where id = ${reservation_id}`;
  try {
    [rows] = await connection.query(query);
    // DB에 저장된 timestamp 형식을 => 밀리세컨즈로 바꾸는 방법
    let start_time = rows[0].start_time;
    let mili_start_time = new Date(start_time).getTime();
    if (mili_start_time < compareTime) {
      res
        .status(400)
        .json({ message: "상영시간 30분 이전에는 취소가 불가합니다." });
      return;
    }
  } catch (e) {
    res.status(500).json({ error: e });
  }

  query = `delete from reservation where id = ${reservation_id}`;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, message: "예매가 취소되었습니다." });
  } catch (e) {
    res.status(500).json({ success: false });
  }
};
