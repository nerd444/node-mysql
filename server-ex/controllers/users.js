const connection = require("../db/mysql-connection");
const ErrorResponse = require("../utils/errorResponse");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var crypto = require("crypto");

const { query } = require("../db/mysql-connection");
const sendEmail = require("../utils/sendMail");

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

    const message = "환영합니다.";
    try {
      await sendEmail({
        email: email,
        subject: "회원가입축하",
        message: message,
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e });
    }

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

// @desc  로그아웃 api
// @route POST api/v1/users/logout
// parameters no
// @response  DB에서 해당 유저의 토큰값을 삭제
exports.logout = async (req, res, next) => {
  // 토큰 테이블에서, 현재 이 헤더에 있는 토큰으로, 삭제한다.
  let token = req.user.token;
  let user_id = req.user.id;
  let query = `delete from token where user_id = ${user_id} and token = "${token}"`;

  try {
    [result] = await connection.query(query);
    // result를 res에 넣어서 클라이언트에 보낸다.
    // 포스트맨에서 삭제API 호출하여 무엇이 오는지 확인해본다.
    if (result.affectedRows == 1) {
      res.status(200).json({ success: true, result: result });
    } else {
      res.status(400).json({ success: false });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// 안드로이드 사용하고, 아이폰도 사용하고, 집 컴도 사용.
// 이 서비스를 각각의 디바이스마다 다 로그인하여 사용 중이었다.
// 전체 디바이스(기기) 전부 다 로그아웃을 시키게 하는 API

// @desc  전체 기기에서 모두 로그아웃 하기
// @route POST api/v1/users/logoutAll
exports.logoutAll = async (req, res, next) => {
  let user_id = req.user.id;
  let query = `delete from token where user_id = ${user_id}`;

  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// 회원탈퇴: 디비에서 해당 회원의 유저 테이블 정보 삭제
//  => 유저 정보가 있는 다른 테이블도 정보 삭제.

// @desc  회원 탈퇴 : 유저테이블 삭제 토큰 테이블에서 삭제
// @route DELETE api/v1/users
exports.deleteUser = async (req, res, next) => {
  let user_id = req.user.id;
  let query = `delete from token where user_id = ${user_id}`;
  const conn = await connection.getConnection();
  try {
    await conn.beginTransaction();
    // 첫번째 테이블에서 정보 삭제
    [result] = await conn.query(query);
    // 두번째 테이블에서 정보 삭제
    query = `delete from user where id = ${user_id}`;
    [result] = await conn.query(query);

    await conn.commit();
    res.status(200).json({ success: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ success: false, error: e });
  } finally {
    conn.release();
  }
};

// 유저가 패스워드를 분실!

// 1. 클라이언트가 패스워드 분실했다고 서버한테 요청
//    서버가 패스워드를 변경할 수 있는 URL을 클라이언트한테 보내준다.
//    (경로에 암호화된 문자열을 보내줍니다 - 토큰역할)

// @desc  패스워드 분실
// @route POST /api/v1/users/forgotpasswd
exports.forgotPasswd = async (req, res, next) => {
  let user = req.user;
  // 암호화된 문자열 만드는 방법
  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetPasswdToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // 유저 테이블에, reset_passwd_token 컬럼에 저장.
  let query = `update user set reset_passwd_token = "${resetPasswdToken}" where id = ${user.id}`;

  try {
    [result] = await connection.query(query);
    user.reset_passwd_token = resetPasswdToken;
    res.status(200).json({ success: true, data: user });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// 2. 클라이언트는 해당 암호화된 주소를 받아서, 새로운 비밀번호를 함께
//    서버로 보냅니다.
//    서버는, 이 주소가 진짜 유효한지 확인해서, 새로운 비밀번호로 셋팅.

// @desc 리셋 패스워드 토큰을, 경로로 만들어서, 바꿀 비번과 함께 요청
//       비번 초기화 (reset passwd api)
// @route POST /api/v1/users/resetPasswd/:resetPasswdToken
// @req   passwd
exports.resetPasswd = async (req, res, next) => {
  const resetPasswdToken = req.params.resetPasswdToken;
  const user_id = req.user.id;

  let query = `select * from user where id = ${user_id}`;

  try {
    [rows] = await connection.query(query);
    savedResetPasswdToken = rows[0].reset_passwd_token;
    if (savedResetPasswdToken !== resetPasswdToken) {
      res.status(400).json({ success: false });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }

  let passwd = req.body.passwd;

  const hashedPasswd = await bcrypt.hash(passwd, 8);

  query = `update user set passwd = "${hashedPasswd}", reset_passwd_token = '' where id = ${user_id}`;

  delete req.user.reset_passwd_token;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, data: req.user });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
