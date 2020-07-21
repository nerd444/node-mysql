const connection = require("../db/mysql-connection");
const ErrorResponse = require("../utils/errorResponse");

// 모든 주소록 데이터를 다 가져와서, 클라이언트한테 보내는것은 문제가 있습니다.
// 데이터를 모두 다 보내지 않고, 끊어서 보내야 함.
// 현업에서는 20~30개 사이로 끊어서 보냅니다.

// @desc 모든 주소록정보를 다 조회
// @route GET /api/v1/contacts?offset=0&limit=20
// @access Public
exports.getContacts = async (req, res, next) => {
  try {
    let offset = req.query.offset;
    let limit = req.query.limit;
    const [rows, fields] = await connection.query(
      `select * from contact limit ${offset}, ${limit}`
    );
    let count = rows.length;
    res.status(200).json({ success: true, items: rows, count: count });
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

// @desc 이름이나, 전화번호로 검색하는 API
// @route GET /api/v1/contacts/search?keyword=67
// @route GET /api/v1/contacts/search?keyword=길동
exports.searchContact = async (req, res, next) => {
  let keyword = req.query.keyword;
  try {
    const [rows, fields] = await connection.query(
      `select * from contact where name like "%${keyword}%" or phone like "%${keyword}%"`
    );
    res.status(200).json({ success: true, ret: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc 새로운 정보를 인서트
// @route POST /api/v1/contacts
// @access Public
exports.createContact = async (req, res, next) => {
  let name = req.body.name;
  let phone = req.body.phone;
  try {
    const [rows, fields] = await connection.query(
      `insert into contact (name, phone) values ("${name}", "${phone}")`
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
  let phone = req.body.phone;
  try {
    const [rows, fields] = await connection.query(
      `update contact set name = "${name}",phone = "${phone}" where id = ${id}`
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

// exports.deleteContact = async (req, res, next) => {
//   let id = req.params.id;
//   let query = `delete from contact where id = ${id}`;
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
