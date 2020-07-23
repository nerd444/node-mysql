const connection = require("../db/mysql-connection");
const ErrorResponse = require("../utils/errorResponse");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { query } = require("../db/mysql-connection");

// @desc    회원가입
// @route   POST /api/v1/users  => 나는 요고!
// @route   POST /api/v1/users/register
// @route   POST /api/v1/users/singup
// @parameters  email, passwd
exports.createUser = async (req, res, next) => {
  let email = req.body.email;
  let passwd = req.body.passwd;

  // 비밀번호와 같은 것은,
  // 단방향 암호화(복호화가 불가능)를 해야 한다.
  // 그래야, 복호화(암호화한거 원상태로 돌리는거)가 안되어서, 안전하다.
  // 1234(원문) => dskjflajfkdjlfadskf 암호화
  // dskjflajfkdjlfadskf => 1234(원문) 복호화
  // hash(암호화 할거, 암호화를 몇번 할거냐(saltround))
  const hashedPasswd = await bcrypt.hash(passwd, 8);

  // 이메일 정상적인가 체크
  if (!validator.isEmail(email)) {
    res.status(500).json({ success: false });
    return;
  }
  // 위에 다 정상이면, 유저 insert
  let query = `insert into user (email, passwd) values ("${email}","${hashedPasswd}")`;
  let user_id;
  try {
    [result] = await connection.query(query);
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

  let token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);
  query = `insert into token (token, user_id) values ("${token}", "${user_id}")`;

  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, token: token });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// 로그인 api를 개발하세요.
// @desc    로그인
// @route   POST /api/v1/users/login
// @parameters  {"email":"passwd@naver.com", "passwd":"dpqpqpfslkdj123"}
exports.loginUser = async (req, res, next) => {
  let email = req.body.email;
  let passwd = req.body.passwd;

  let query = `select * from user where email = "${email}"`;
  try {
    [rows] = await connection.query(query);
    // 디비에 저장된 비밀번호 가져와서
    let savedPasswd = rows[0].passwd;
    // 비밀번호 체크 : 비밀번호가 서로 맞는지 확인
    let isMatch = await bcrypt.compare(passwd, savedPasswd);
    // let isMatch = bcrypt.compareSync(passwd, savedPasswd); 위랑 같은거
    if (isMatch == false) {
      res.status(400).json({ success: false, result: isMatch });
      return;
    }
    let token = jwt.sign(
      { user_id: rows[0].id },
      process.env.ACCESS_TOKEN_SECRET
    );

    query = `insert into token (token, user_id) values ("${token}", "${rows[0].id}")`;
    try {
      [result] = await connection.query(query);
      res.status(200).json({ success: true, result: isMatch, token: token });
    } catch (e) {
      res.status(500).json({ success: false, error: e });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// 패스워드 변경 API를 설계 / 개발 하시오. (API에서 I가 인터페이스임.)
// 로그인 api를 개발하세요.
// @desc    패스워드 변경
// @route   POST /api/v1/users/change
// @parameters  email, passwd, new_passwd
exports.updatePasswd = async (req, res, next) => {
  let email = req.body.email;
  let passwd = req.body.passwd;
  let new_passwd = req.body.new_passwd;
  const hashedPasswd = await bcrypt.hash(new_passwd, 8);

  // 이 유저가, 맞는 유저인지 체크
  let query = `select passwd from user where email = "${email}"`;
  try {
    [rows] = await connection.query(query);
    let savedPasswd = rows[0].passwd;
    let isMatch = bcrypt.compareSync(passwd, savedPasswd);

    if (isMatch != true) {
      res.status(401).json({ success: false, result: isMatch });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }

  // 기존유저가 맞으면 패스워드 변경
  query = `update user set passwd = "${hashedPasswd}" where email = "${email}"`;
  try {
    [result] = await connection.query(query);
    if (result.affectedRows == 1) {
      res.status(200).json({ success: true });
    } else {
      res.status(200).json({ success: false });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// 유저의 id 값으로 내 정보를 가져오는 API개발
// @desc    내정보 가져오기
// @route   GET /api/v1/users
exports.getMyInfo = async (req, res, next) => {
  console.log("내 정보 가져오는 API", req.user);

  res.status(200).json({ success: true, result: req.user });
};
