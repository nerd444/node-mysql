const express = require("express");
const connection = require("./mysql-connection.js");
// @desc 모든 정보를 다 조회
// @route GET /api/v1/memos
// @access Public
exports.getMemo = (req, res, next) => {

  connection.query(`select * from memos`, function(error, results, fields){
    console.log(results);
  })

  res.status(200).json({success:true, type:"select", msg:results});

  connection.end();
};

// @desc 새로운 정보를 인서트
// @route POST /api/v1/title/memos/title/content
// @access Public
exports.createMemo = (req, res, next) => {
  res.status(200).json({
    success: true,
    title: connection.query(
      `insert into memo_api (title) values ("${req.params.title}")`,
      function (error, results, fields) {
        console.log(results);
      }
    ),
    memo: connection.query(
      `insert into memo_api (memo) values ("${req.params.memo}")`,
      function (error, results, fields) {
        console.log(results);
      }
    ),
  });
};

// @desc 기존 정보를 업데이트
// @route PUT /api/v1/bootcamps/id
// @access Public
exports.updateTitle = (req, res, next) => {
  res.status(200).json({
    success: true,
    id: connection.query(
      `${req.params.id}`,
      function (error, results, fields) {
        console.log(results);
      }
    ),
  res.status(200).json({
    success: true,
    title: connection.query(
      `update memos set title = "${req.params.reTitle}" where id = ${req.params.id}`,
      function (error, results, fields) {
        console.log(results);
      }
    ),
    memo: connection.query(
      `update memos set content = "${req.params.memo}" where id = ${req.params.id}`,
      function (error, results, fields) {
        console.log(results);
      }
    ),
  });
};

// exports.updateMemo = (req, res, next) => {
//     res.status(200).json({
//       success: true,
//       memo: connection.query(
//           `update memo_api set title = "${req.params.memo}" where id = `,
//           function (error, results, fields) {
//             console.log(results);
//           }
//         ),
//     });
//   };

// @desc 해당 정보를 삭제
// @route DELETE /api/v1/bootcamps/id
// @access Public
exports.deleteMemo = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: `Delete bootcamp ${req.params.id}`,
  });
};
