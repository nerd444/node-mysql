// 데이터베이스 연결
const connection = require("../db/mysql-connection");
// Json Web Token
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validator = require("validator");

// @desc    회원가입
// @route   POST /api/v1/signUp
// @parameters  email, passwd
exports.createUser = async (req, res, next) => {
  // 클라이언트로부터 이메일, 비번 받아서 변수로 만들자
  let email = req.body.email;
  let passwd = req.body.passwd;

  if (validator.isEmail(email) == false) {
    res.status(400).json({ success: false });
    return;
  }

  const hashedPasswd = await bcrypt.hash(passwd, 8);

  let query = `insert into memo_user (email, passwd) values (?, ?)`;
  let data = [email, hashedPasswd];
  let user_id;
  try {
    [result] = await connection.query(query, data);
    user_id = result.insertId;
  } catch (e) {
    if (e.errno == 1062) {
      // 이메일 중복된것이다.
      res
        .status(401)
        .json({ success: false, errno: 1, message: "이메일 중복" });
      return;
    } else {
      res.status(500).json({ success: false, error: e });
      return;
    }
  }

  const token = jwt.sign({ user_id: user_id }, process.env.AUTH_TOKEN_SECRET);

  query = `insert into memo_token (token, user_id) values (?, ?)`;
  data = [token, user_id];
  try {
    [result] = await connection.query(query, data);
  } catch (e) {
    res.status(500).json({ success: false });
    return;
  }

  res.status(200).json({ success: true, token: token, result: "가입환영!" });
};

// @desc    로그인
// @route   POST /api/v1/users
// @parameters  email, passwd
exports.loginUser = async (req, res, next) => {
  let email = req.body.email;
  let passwd = req.body.passwd;

  let query = `select * from memo_user where email = "${email}"`;
  try {
    [rows] = await connection.query(query);
    // 디비에 저장된 비밀번호 가져와서
    let savedPasswd = rows[0].passwd;
    // 비밀번호 체크 : 비밀번호가 서로 맞는지 확인
    let isMatch = await bcrypt.compare(passwd, savedPasswd);
    // let isMatch = bcrypt.compareSync(passwd, savedPasswd); 위랑 같은거
    if (isMatch == false) {
      res
        .status(400)
        .json({ success: false, result: isMatch, message: "비밀번호가 틀림" });
      return;
    }
    let token = jwt.sign(
      { user_id: rows[0].id },
      process.env.AUTH_TOKEN_SECRET
    );

    query = `insert into memo_token (token, user_id) values ("${token}", "${rows[0].id}")`;
    try {
      [result] = await connection.query(query);
      res.status(200).json({
        success: true,
        result: isMatch,
        token: token,
        message: "로그인되었습니다",
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
