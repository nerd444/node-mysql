const connection = require("../db/mysql-connection");
const ErrorResponse = require("../utils/errorResponse");

// @desc 모든 정보를 다 조회
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = async (req, res, next) => {
  console.log("부트캠프 전부 가져오는 함수");
  try {
    const [rows, fields] = await connection.query(`select * from bootcamp`);
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    next(new ErrorResponse("부트캠프 전부 가져오는데 에러 발생", 400));
  }
};

// @desc 해당 아이디의 정보 조회
// @route GET /api/v1/bootcamps/id
// @access Public
exports.getBootcamp = async (req, res, next) => {
  try {
    let id = req.params.id;
    const [rows, fields] = await connection.query(
      `select * from bootcamp where id = ${id}`
    );
    if (rows.length != 0) {
      res.status(200).json({ success: true, items: rows });
    } else {
      return next(new ErrorResponse("아이디값 잘못 보냈음", 400));
    }
  } catch (e) {
    next(new ErrorResponse("부트캠프 가져오는데 DB에러 발생", 500));
  }
};

// @desc 새로운 정보를 인서트
// @route POST /api/v1/bootcamps
// @access Public
exports.createBootcamp = async (req, res, next) => {
  let title = req.body.title;
  let subject = req.body.subject;
  let teacher = req.body.teacher;
  let start_time = req.body.start_time;
  try {
    const [rows, fields] = await connection.query(
      `insert into bootcamp (title, subject, teacher, start_time) values ("${title}", "${subject}", "${teacher}", "${start_time}")`
    );
    res.status(200).json({ success: true, ret: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc 기존 정보를 업데이트
// @route PUT /api/v1/bootcamps/id
// @access Public
exports.updateBootcamp = async (req, res, next) => {
  let id = req.params.id;
  let title = req.body.title;
  let subject = req.body.subject;
  let teacher = req.body.teacher;
  let start_time = req.body.start_time;
  try {
    const [rows, fields] = await connection.query(
      `update bootcamp set title = "${title}",subject = "${subject}",teacher = "${teacher}", start_time = "${start_time}" where id = ${id}`
    );
    res.status(200).json({ success: true, ret: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc 해당 정보를 삭제
// @route DELETE /api/v1/bootcamps/id
// @access Public
exports.deleteBootcamp = async (req, res, next) => {
  let id = req.params.id;
  try {
    const [rows, fields] = await connection.query(
      `delete from bootcamp where id = ${id}`
    );
    res.status(200).json({ success: true, ret: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// exports.deleteBootcamp = async (req, res, next) => {
//   let id = req.params.id;
//   let query = `delete from bootcamp where id = ${id}`;
//   try {
//     [result] = await connection.query(query);
//     console.log(result);
//     if (result.affectedRows == 1) {
//       res.status(200).json({ success: true });
//     } else {
//       res.status(400).json({ success: false });
//     }
//   } catch (e) {
//     res.status(500).json({ success: false, error: e });
//   }
// };
