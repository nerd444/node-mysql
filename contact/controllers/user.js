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

  if (!name || !phone) {
    res.status(400).json({ message: "뭐 하나 없는거 같지 않니 아그야...?" });
    return;
  }

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
  if (!user_id || !token) {
    res.status(400).json({ message: "뭐 하나 없는거 같지 않니 아그야...?" });
    return;
  }

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

// @desc  유저별 주소록 생성
// @route POST /api/v1/users/add/:user_id
exports.addContact = async (req, res, next) => {
  // let user_name = req.body.name;
  let name = req.body.name;
  let phone = req.body.phone;
  let share_or_not = req.body.share_or_not;
  let user_id = req.user.id;
  if (!name || !phone || !share_or_not || !user_id) {
    res.status(400).json({ message: "뭐 하나 없는거 같지 않니 아그야...?" });
    return;
  }

  query = `insert into contact (name, phone, user_id, share_or_not) values ("${name}", "${phone}", ${user_id}, "${share_or_not}")`;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    if (e.rrno == 1062) {
      res.status(500).json({ message: "이미 주소록에 추가되었습니다." });
    } else {
      res.status(500).json({ error: e });
    }
  }
};

// @desc  유저별 주소록 보기
// @route GET /api/v1/users
exports.getUserContact = async (req, res, next) => {
  let user_id = req.user.id;
  if (!user_id) {
    res.status(400).json({ message: "뭐 하나 없는거 같지 않니 아그야...?" });
    return;
  }

  let query = `select * from contact where user_id = ${user_id}`;
  try {
    [result] = await connection.query(query);
    let cnt = result.length;
    res.status(200).json({ succese: true, result: result, cnt: cnt });
  } catch (e) {
    res.status(500).json({ error: e });
  }
};

// @desc  유저별 주소록 수정하기
// @route PUT /api/v1/users
exports.updateUserContact = async (req, res, next) => {
  let user_id = req.user.id;
  let rename = req.body.rename;
  let phone = req.body.phone;
  let name = req.body.name;
  if (!user_id || !rename || !phone || !name) {
    res.status(400).json({ message: "뭐 하나 없는거 같지 않니 아그야...?" });
    return;
  }
  let query = `update contact set name = "${rename}", phone = "${phone}" 
      where user_id = ${user_id} and name = "${name}"`;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ succese: true, result: result });
  } catch (e) {
    res.status(500).json({ error: e });
  }
};

// @desc  유저별 주소록 삭제하기
// @route DELETE /api/v1/users
exports.deleteUserContact = async (req, res, next) => {
  let contact_id = req.body.contact_id;
  let user_id = req.user.id;

  if (!contact_id || !user_id) {
    res.status(400).json({ message: "user_id가 없습니다." });
    return;
  }

  let query = `delete from contact where id = ${contact_id} and user_id = ${user_id}`;
  try {
    [result] = await connection.query(query);
    if (result.affectedRows == 1) {
      res
        .status(200)
        .json({ success: true, message: "연락처가 삭제되었습니다." });
    } else {
      res.status(400).json({ success: false });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false });
  }
};

// @desc  유저별 주소록 공유하기
// @route PUT /api/v1/users/share
exports.shareContact = async (req, res, next) => {
  let user_id = req.user.id;
  let name = req.body.name;
  let share_to = req.body.share_to;
  let share_or_not = req.body.share_or_not;

  if (!user_id || !name || !share_to || share_or_not === false) {
    res.status(400).json({ message: "뭐 하나 없는거 같지 않니...?" });
    return;
  }

  let query = `update contact set share_to = ${share_to} where user_id = ${user_id} and name = "${name}" and share_or_not = "${share_or_not}"`;

  try {
    [result] = await connection.query(query);
    res.status(200).json({
      success: true,
      result: result,
      message: "공유되었습니다",
    });
  } catch (e) {
    res.status(500).json({ error: e });
  }
};
