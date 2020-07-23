// 데이터베이스 연결(아래파일에서 mysql을 require해서 아래파일만 가져와도 됨.)
const connection = require("../db/mysql-connection");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// @desc    모든 메모 가져오기
// @route   GET /api/v1/memos
exports.getMemos = (req, res, next) => {
  // 1. 데이터베이스에 접속해서, 쿼리한다.
  // 2. 그 결과를 res에 담아서 보내준다.(클라이언트한테)

  let query = `select * from memo`;

  connection.query(query, (error, results, fields) => {
    console.log(error);
    res.status(200).json({ success: true, results: { items: results } });
    connection.end();
  });
};

// @desc    메모 생성하기
// @route   POST /api/v1/memos
// @body    {title:"안녕", comment:"좋다", user_id:"sara"}
exports.createMemos = async (req, res, next) => {
  let title = req.body.title;
  let comment = req.body.comment;
  let user = req.body.user;
  let name = req.body.name;

  let query = `insert into memo (title, comment, user_id) values ("${title}", "${comment}", "${user}")`;
  let user_id;
  try {
    [result] = await connection.query(query);
    user_id = result.insertId;
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
  // connection.query(query, (error, results, fields) => {
  //   console.log(results);
  //   res.status(200).json({ success: true, results: { items: results } });
  // });

  let token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);
  query = `insert into memo_token (token, user_id) values ("${token}", ${user_id})`;

  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, token: token });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }

  user_query = `insert into memo_user (user_name, user_id) values ("${name}", ${user_id})`;
  try {
    [result] = await connection.query(user_query);
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    메모 수정하기
// @route   PUT /api/v1/memos/:id
// @body    {title:"안녕", comment:"좋다"}
exports.updateMemos = (req, res, next) => {
  let id = req.params.id;
  let title = req.body.title;
  let comment = req.body.comment;
  let query = `update memo set title = "${title}", comment = "${comment}" where id = ${id}`;

  connection.query(query, (error, results, fields) => {
    console.log(results);
    res.status(200).json({ success: true, results: { items: results } });
  });
};

// @desc    메모 삭제하기
// @route   DELETE /api/v1/memos/:id
// @body    {id: 1}
exports.deleteMemos = (req, res, next) => {
  let id = req.params.id;
  let query = `delete from memo where id = ${id}`;

  connection.query(query, (error, results, fields) => {
    console.log(results);
    res.status(200).json({ success: true, results: { items: results } });
  });
};

// @desc    메모 생성하기
// @route   POST /api/v1/memos/signUp
// @body    {title:"안녕", comment:"좋다", user_id:"sara"}
exports.signUp = async (req, res, next) => {
  let title = req.body.title;
  let comment = req.body.comment;
  let user = req.body.user;
  let name = req.body.name;

  let query = `insert into memo (title, comment, user_id) values ("${title}", "${comment}", "${user}")`;
  let user_id;
  try {
    [result] = await connection.query(query);
    user_id = result.insertId;
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
  // connection.query(query, (error, results, fields) => {
  //   console.log(results);
  //   res.status(200).json({ success: true, results: { items: results } });
  // });

  let token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);
  query = `insert into memo_token (token, user_id) values ("${token}", ${user_id})`;

  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, token: token });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }

  user_query = `insert into memo_user (user_name, user_id) values ("${name}", ${user_id})`;
  try {
    [result] = await connection.query(user_query);
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
