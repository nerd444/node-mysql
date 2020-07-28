const connection = require("../db/mysql-connection");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var crypto = require("crypto");

// @desc    회원가입
// @route   POST /api/v1/users
// @request  email, passwd
exports.signupUser = async (req, res, next) => {
  let email = req.body.email;
  let passwd = req.body.passwd;

  // hash(암호화 할거, 암호화를 몇번 할거냐(saltround))
  const hashedPasswd = await bcrypt.hash(passwd, 8);

  // 이메일이 정상적인지 체크
  if (!validator.isEmail(email)) {
    res
      .status(400)
      .json({ success: false, message: "이메일 형식에 맞지 않습니다." });
    return;
  }

  // 위 모두 정상적이면 회원가입 (insert)
  let query = `insert into movie_user (email, passwd) values ("${email}", "${hashedPasswd}")`;
  let user_id;
  try {
    [result] = await connection.query(query);
    user_id = result.insertId;
  } catch (e) {
    // 이메일 중복 확인
    if (e.errno == 1062) {
      res
        .status(401)
        .json({ success: false, errno: 1, message: "이메일 중복" });
      return;
    } else {
      res.status(500).json({ success: false, message: "DB 에러" });
      return;
    }
  }

  // 회원가입한뒤 토큰 발급
  let token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);
  query = `insert into movie_token (token, user_id) values ("${token}", ${user_id})`;

  try {
    [result] = await connection.query(query);
    res
      .status(200)
      .json({ success: true, token: token, message: "회원가입을 환영합니다." });
  } catch (e) {
    res.status(500).json({ success: false, message: "DB 에러" });
  }
};

// @desc    로그인
// @route   POST api/v1/users/login
// @req     email, passwd
exports.login_user = async (req, res, next) => {
  let email = req.body.email;
  let passwd = req.body.passwd;

  let query = `select * from movie_user where email = "${email}"`;
  let user_id;
  try {
    [rows] = await connection.query(query);
    user_id = rows[0].id;
    // 디비에 저장된 비밀번호 가져와서
    let savedPasswd = rows[0].passwd;
    console.log(savedPasswd);
    // 비밀번호 체크 : 비밀번호가 서로 맞는지 확인
    let isMatch = await bcrypt.compare(passwd, savedPasswd);
    if (isMatch == false) {
      res.status(401).json({
        success: false,
        result: isMatch,
        message: "비밀번호가 틀립니다.",
      });
      return;
    }

    let token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);

    // 위가 맞으면 토큰발급
    query = `insert into movie_token (token, user_id) values ("${token}", ${user_id})`;
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

// @desc  회원 탈퇴 : 유저테이블 삭제 토큰 테이블에서 삭제
// @route DELETE api/v1/users
exports.deleteUser = async (req, res, next) => {
  let user_id = req.user.id;
  let query = `delete from movie_user where id = ${user_id}`;
  const conn = await connection.getConnection();
  try {
    await conn.beginTransaction();
    // 첫번째 테이블에서 정보 삭제
    [result] = await conn.query(query);
    // 두번째 테이블에서 정보 삭제
    query = `delete from movie_token where user_id = ${user_id}`;
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

// @desc    패스워드 변경
// @route   POST /api/v1/users/change
// @request  email, passwd, new_passwd
exports.changePasswd = async (req, res, next) => {
  let email = req.body.email;
  let passwd = req.body.passwd;
  let new_passwd = req.body.new_passwd;
  const hashedPasswd = await bcrypt.hash(new_passwd, 8);

  // 이 유저가, 맞는 유저인지 체크
  let query = `select passwd from movie_user where email = "${email}"`;
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
  query = `update movie_user set passwd = "${hashedPasswd}" where email = "${email}"`;
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
  let query = `update movie_user set reset_passwd_token = "${resetPasswdToken}" where id = ${user.id}`;

  try {
    [result] = await connection.query(query);
    user.reset_passwd_token = resetPasswdToken;
    res.status(200).json({ success: true, data: user });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc 리셋 패스워드 토큰을, 경로로 만들어서, 바꿀 비번과 함께 요청
//       비번 초기화 (reset passwd api)
// @route POST /api/v1/users/resetPasswd/:resetPasswdToken
// @req   passwd
exports.resetPasswd = async (req, res, next) => {
  const resetPasswdToken = req.params.resetPasswdToken;
  const user_id = req.user.id;

  let query = `select * from movie_user where id = ${user_id}`;

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

  query = `update movie_user set passwd = "${hashedPasswd}", reset_passwd_token = '' where id = ${user_id}`;

  delete req.user.reset_passwd_token;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, data: req.user });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    유저별 즐겨찾기 설정
// @route   POST /api/v1/users/likes
// @request  email, passwd, new_passwd
exports.likes = async (req, res, next) => {
  let user_id = req.movie_token.user_id;
  let movie_id = req.body.id;

  let query = `insert into favorite_movie (movie_id, user_id) values (${movie_id}, ${user_id})`;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    즐겨찾기 영화 가져오기(25개씩)
// @route   POST /api/v1/users/likes?offset=0&limit=25
// @request  email, passwd, new_passwd
exports.getLike = async (req, res, next) => {
  let user_id = req.movie_token.user_id;
  let offset = req.query.offset;
  let limit = req.query.limit;

  let query = `select * from movie as m left join favorite_movie as f 
  on m.id = f.movie_id where f.user_id = ${user_id} limit ${offset}, ${limit}`;
  try {
    [result] = await connection.query(query);
    let count = result.length;
    res.status(200).json({ success: true, result: result, count: count });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    즐겨찾기 삭제
// @route   POST /api/v1/users/likes
// @request  email, passwd, new_passwd
exports.deleteLike = async (req, res, next) => {
  let user_id = req.movie_token.user_id;
  let movie_id = req.body.id;

  let query = `delete from favorite_movie where user_id = ${user_id} and movie_id = ${movie_id}`;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
