// 데이터베이스 연결(아래파일에서 mysql을 require해서 아래파일만 가져와도 됨.)
const connection = require("../db/mysql-connection");

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
// @body    {title:"안녕", comment:"좋다"}
exports.createMemos = (req, res, next) => {
  let title = req.body.title;
  let comment = req.body.comment;
  let query = `insert into memo (title, comment) values ("${title}", "${comment}")`;

  connection.query(query, (error, results, fields) => {
    console.log(results);
    res.status(200).json({ success: true, results: { items: results } });
  });
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
