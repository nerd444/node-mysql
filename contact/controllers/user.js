const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const connection = require("../db/mysql-connection");

// @desc    회원가입
// @route   POST /api/v1/users
// @parameters  name, phone
exports.createUser = async (req, res, next) => {
  let name = req.body.name;
  let phone = req.body.phone;

  // npm validator
  if (!name || !phone) {
    res.status(400).json({ message: "뭐 하나 없는거 같지 않니 아그야...?" });
    return;
  }

  let query = `insert into contact_user (name, phone) values ( "${name}" , "${phone}" )`;
  let user_id;

  const conn = await connection.getConnection();
  await conn.beginTransaction();

  try {
    [result] = await conn.query(query);
    user_id = result.insertId;
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ message: "디비 에러" });
    return;
  }

  // 토큰 처리  npm jsonwebtoken
  // 토큰 생성 sign
  const token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);
  query = `insert into contact_token (token, user_id) values ("${token}", "${user_id}")`;

  try {
    [result] = await conn.query(query);
  } catch (e) {
    await conn.rollback();
    res.status(500).json();
    return;
  }

  await conn.commit();
  await conn.release();

  res.status(200).json({ success: true, token: token });
};

// @desc        로그인
// @route       POST  /api/v1/users/login
// @parameters  name, phone
exports.login = async (req, res, next) => {
  let name = req.body.name;
  let phone = req.body.phone;

  let query = `select * from contact_user where name = "${name}"`;

  let user_id;
  try {
    [rows] = await connection.query(query);
    let truePhone = rows[0].phone;
    user_id = rows[0].id;
    if (phone != truePhone) {
      res.status(401).json({ message: "어디서 수작질이여~?!" });
      return;
    }
  } catch (e) {
    res.status(500).json({ message: "select안됨" });
    return;
  }
  const token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);
  query = `insert into contact_token (token, user_id) values ("${token}", ${user_id})`;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, token: token });
  } catch (e) {
    res.status(500).json();
  }
};

// @desc  로그아웃 (현재의 기기 1개에 대한 로그아웃)
// @route DELETE  /api/v1/users/logout
exports.logout = async (req, res, next) => {
  // movie_token 테이블에서, 토큰 삭제해야 로그아웃이 되는 것이다.
  let user_id = req.user.id;
  let token = req.user.token;

  let query = `delete from contact_token where token = "${token}" and user_id = ${user_id}`;
  try {
    [result] = await connection.query(query);
    res
      .status(200)
      .json({ success: true, message: "이 기기에서 로그아웃되었습니다." });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
