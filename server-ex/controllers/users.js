const connection = require("../db/mysql-connection");
const ErrorResponse = require("../utils/errorResponse");
const validator = require("validator");

// @desc    회원가입
// @route   POST /api/v1/users  => 나는 요고!
// @route   POST /api/v1/users/register
// @route   POST /api/v1/users/singup
// @parameters  email, passwd
exports.createUser = async (req, res, next) => {
  let email = req.body.email;
  let passwd = req.body.passwd;

  // 이메일 정상적인가 체크
  if (!validator.isEmail(email)) {
    res.status(500).json({ success: false });
    return;
  }
  // 이메일 중복체크(이미 존재하면 return)
  let query = `select * from user where email = "${email}"`;
  try {
    [rows] = await connection.query(query);
    if (rows.length >= 1) {
      res
        .status(200)
        .json({ success: false, code: 1, message: "이미 존재하는 이메일" });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }

  // 위에 다 정상이면, 이메일 insert
  query = `insert into user (email, passwd) values ("${email}","${passwd}")`;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
