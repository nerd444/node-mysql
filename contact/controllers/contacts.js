const connection = require("../db/mysql-connection");
const ErrorResponse = require("../utils/errorResponse ");

// @desc 모든 정보를 다 조회
// @route GET /api/v1/contacts
// @access Public
exports.getContacts = async (req, res, next) => {
  try {
    const [rows, fields] = await connection.query(`select * from contact`);
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    next(new ErrorResponse("주소록 전부 가져오는데 에러 발생", 400));
  }
};

// @desc 해당 아이디의 정보 조회
// @route GET /api/v1/contacts/id
// @access Public
exports.getContact = async (req, res, next) => {
  try {
    let id = req.params.id;
    const [rows, fields] = await connection.query(
      `select * from contact where id = ${id}`
    );
    if (rows.length != 0) {
      res.status(200).json({ success: true, items: rows });
    } else {
      return next(new ErrorResponse("아이디값 잘못 보냈음", 400));
    }
  } catch (e) {
    next(new ErrorResponse("주소록 가져오는데 DB에러 발생", 500));
  }
};

// @desc 새로운 정보를 인서트
// @route POST /api/v1/contacts
// @access Public
exports.createContact = async (req, res, next) => {
  let name = req.body.name;
  let phone_number = req.body.phone_number;
  try {
    const [rows, fields] = await connection.query(
      `insert into contact (name, phone_number) values ("${name}", "${phone_number}")`
    );
    res.status(200).json({ success: true, ret: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc 기존 정보를 업데이트
// @route PUT /api/v1/contacts/id
// @access Public
exports.updateContact = async (req, res, next) => {
  let id = req.params.id;
  let name = req.body.name;
  let phone_number = req.body.phone_number;
  try {
    const [rows, fields] = await connection.query(
      `update contact set name = "${name}",phone_number = "${phone_number}" where id = ${id}`
    );
    res.status(200).json({ success: true, ret: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc 해당 정보를 삭제
// @route DELETE /api/v1/contacts/id
// @access Public
exports.deleteContact = async (req, res, next) => {
  let id = req.params.id;
  try {
    const [rows, fields] = await connection.query(
      `delete from contact where id = ${id}`
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
